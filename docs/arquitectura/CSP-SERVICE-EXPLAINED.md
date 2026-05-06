# Explicación Detallada: Microservicio CSP con OR-Tools

Este documento explica el microservicio CSP del proyecto SGOHA (Sistema de Generación Óptima de Horarios Académicos), desglosando:

- Qué hace cada componente del servicio
- Qué parte de OR-Tools se usa en cada paso
- Qué algoritmo o técnica está en juego
- Por qué se diseñó así
- Cómo se relaciona con los requerimientos RF-07 y RF-08

> **Estado actual (Sprint 1):** El solver está en modo stub — devuelve `INFEASIBLE` para toda entrada. La implementación completa del motor CP-SAT está planificada para Sprint 2–3. Este documento describe tanto la arquitectura actual como el diseño objetivo.

---

## Estructura del Microservicio

El microservicio está compuesto por 3 archivos principales:

```
csp-service/app/
├── main.py       ← Servidor FastAPI (endpoints HTTP)
├── schemas.py    ← Contratos Pydantic (SolveRequest / SolveResponse)
└── solver.py     ← Motor OR-Tools CP-SAT (stub → implementación Sprint 2-3)
```

---

## Sección 1: Contrato HTTP (`main.py`)

### Código Actual

```python
app = FastAPI(
    title="SGOHA CSP Service",
    version="0.1.0",
    description="Microservicio CSP para horarios académicos sin conflictos."
)

@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "sgoha-csp-service", "timestamp": ...}

@app.post("/solve", response_model=SolveResponse)
def solve_endpoint(request: SolveRequest) -> SolveResponse:
    return solve(request)
```

### ¿Qué hace FastAPI aquí?

FastAPI se encarga de:
1. **Serialización automática:** Convierte el JSON de entrada en un objeto `SolveRequest` de Pydantic
2. **Validación:** Si el JSON no cumple el schema, devuelve 422 Unprocessable Entity automáticamente
3. **Swagger UI:** Genera `/docs` con documentación interactiva sin código adicional
4. **Tipado:** El tipo de retorno `SolveResponse` garantiza que la respuesta siempre tiene el formato correcto

### ¿Por qué FastAPI y no Express/Flask?

| Criterio | FastAPI | Flask |
|---|---|---|
| Validación | Automática (Pydantic) | Manual |
| Tipado | Nativo Python 3.10+ | Limitado |
| Docs Swagger | Auto-generadas | Plugin externo |
| Performance async | Nativo (ASGI) | Requiere config |
| OR-Tools | Integración directa | Integración directa |

FastAPI fue elegido para el microservicio porque OR-Tools es una biblioteca Python y FastAPI permite integrarla sin fricción.

---

## Sección 2: Schemas Pydantic (`schemas.py`)

### Código

```python
class TimeSlot(BaseModel):
    day: int = Field(ge=1, le=7)        # ISO 8601: 1=Lunes, 7=Domingo
    start_minute: int = Field(ge=0, le=1440)
    end_minute: int = Field(ge=0, le=1440)

class CourseRequest(BaseModel):
    id: str
    name: str
    credits: int = Field(ge=1, le=10)
    teacher_ids: list[str]
    classroom_ids: list[str]
    available_slots: list[TimeSlot]

class SolveRequest(BaseModel):
    period_id: str
    courses: list[CourseRequest]
    timeout_seconds: int = Field(default=30, ge=1, le=120)

class Assignment(BaseModel):
    course_id: str
    teacher_id: str
    classroom_id: str
    slot: TimeSlot

class SolveResponse(BaseModel):
    status: SolveStatus          # "OPTIMAL" | "FEASIBLE" | "INFEASIBLE" | "TIMEOUT"
    assignments: list[Assignment]
    elapsed_seconds: float
    conflicts: list[str] = []
```

### ¿Qué es `TimeSlot` y por qué en minutos?

Representar las franjas como `start_minute`/`end_minute` (0–1440) en lugar de strings como `"08:40-10:20"` tiene ventajas concretas para OR-Tools:

```
08:40 → 520 minutos desde medianoche
10:20 → 620 minutos desde medianoche

Verificar solapamiento entre dos franjas A y B:
  NO solapan si: A.end_minute <= B.start_minute OR B.end_minute <= A.start_minute
  Solapan si:    A.start_minute < B.end_minute AND B.start_minute < A.end_minute
```

Esta representación permite hacer comparaciones aritméticas directamente en las restricciones CP-SAT, sin parsear strings.

### ¿Qué son los `SolveStatus`?

| Status | Significado |
|---|---|
| `OPTIMAL` | Solver encontró la mejor solución posible |
| `FEASIBLE` | Solver encontró una solución válida (no necesariamente óptima) |
| `INFEASIBLE` | No existe solución que satisfaga todas las restricciones |
| `TIMEOUT` | El solver agotó el tiempo (`timeout_seconds`) sin completar |

---

## Sección 3: Motor Solver (`solver.py`)

### Estado Actual — Sprint 0 (Stub)

```python
from ortools.sat.python import cp_model
from time import perf_counter

def solve(request: SolveRequest) -> SolveResponse:
    start = perf_counter()
    _ = cp_model.CpModel()    # Se instancia pero no se usa aún
    return SolveResponse(
        status="INFEASIBLE",
        assignments=[],
        elapsed_seconds=perf_counter() - start,
        conflicts=[
            f"Solver no implementado todavía (Sprint 2-3). "
            f"Recibidos {len(request.courses)} cursos."
        ],
    )
```

El stub verifica que:
1. OR-Tools está instalado correctamente (`import cp_model` no falla)
2. El contrato HTTP funciona de extremo a extremo
3. El tiempo de respuesta base es medible

---

## Sección 4: Implementación Objetivo — Sprint 2–3

A continuación se describe el diseño completo del motor CSP que se implementará en Sprint 2–3 como guía de referencia.

### 4.1 Construcción del Modelo CP-SAT

```python
model = cp_model.CpModel()
```

`CpModel` es el objeto central de OR-Tools CP-SAT. A él se le agregan:
- **Variables:** qué puede cambiar (qué asignación se elige)
- **Restricciones:** qué combinaciones son inválidas
- **Función objetivo:** qué queremos minimizar/maximizar

### 4.2 Variables de Decisión

Para cada combinación posible `(curso, docente, aula, franja)` se crea una **variable booleana:**

```python
# x[(c, t, r, s)] = 1 si el curso c es asignado al docente t,
#                       aula r, en la franja s
x = {}
for course in request.courses:
    for teacher_id in course.teacher_ids:
        for classroom_id in course.classroom_ids:
            for slot in course.available_slots:
                key = (course.id, teacher_id, classroom_id, slot_index)
                x[key] = model.NewBoolVar(f"x_{course.id}_{teacher_id}_{classroom_id}_{slot_index}")
```

**¿Por qué booleanas?**  
Cada combinación es una decisión binaria: se asigna (1) o no (0). OR-Tools CP-SAT es especialmente eficiente con variables booleanas gracias a SAT solving subyacente.

**Complejidad del espacio:**  
Si hay N cursos, T docentes por curso, R aulas por curso y S franjas disponibles, el número de variables es O(N × T × R × S). Para instancias reales (50 cursos, 3 docentes, 5 aulas, 20 franjas) = 15,000 variables booleanas — manejable por CP-SAT.

### 4.3 Restricción: Cada Curso Se Asigna Exactamente Una Vez

```python
for course in request.courses:
    model.AddExactlyOne([
        x[(course.id, t, r, s)]
        for t in course.teacher_ids
        for r in course.classroom_ids
        for s in range(len(course.available_slots))
    ])
```

**Algoritmo involucrado:** `AddExactlyOne` internamente usa **clauses SAT** del tipo `at-least-one` y `at-most-one`. OR-Tools las propaga eficientemente sin explorar todas las combinaciones.

### 4.4 Restricción Dura: No Solapamiento de Docente

Un docente no puede estar asignado a dos cursos simultáneos:

```python
for teacher_id in all_teachers:
    for slot_idx, slot in enumerate(all_slots):
        # Todos los cursos que podría dictar este docente en esta franja
        conflicting = [
            x[(c.id, teacher_id, r, slot_idx)]
            for c in request.courses
            if teacher_id in c.teacher_ids
            for r in c.classroom_ids
            if slot_overlaps(slot, c.available_slots[slot_idx])
        ]
        if len(conflicting) > 1:
            model.AddAtMostOne(conflicting)
```

**Algoritmo:** `AddAtMostOne` implementa **Constraint Propagation** — elimina del dominio de búsqueda todas las asignaciones que violarían esta restricción, sin necesidad de explorarlas.

### 4.5 Restricción Dura: No Solapamiento de Aula

Una aula no puede tener dos cursos al mismo tiempo:

```python
for classroom_id in all_classrooms:
    for slot_idx in range(len(all_slots)):
        conflicting = [
            x[(c.id, t, classroom_id, slot_idx)]
            for c in request.courses
            if classroom_id in c.classroom_ids
            for t in c.teacher_ids
        ]
        if len(conflicting) > 1:
            model.AddAtMostOne(conflicting)
```

Este es el mismo patrón que el no solapamiento de docente, pero sobre la dimensión de aulas.

### 4.6 Función Objetivo

```python
# Maximizar asignaciones completadas - penalizar franjas no preferidas
objective_terms = []

for key, var in x.items():
    course_id, teacher_id, classroom_id, slot_idx = key
    slot = slot_lookup[slot_idx]
    # Peso positivo por asignar el curso
    objective_terms.append(100 * var)
    # Penalización si la franja no es preferida (e.g., antes de 8 AM)
    if slot.start_minute < 480:  # antes de 08:00
        objective_terms.append(-5 * var)

model.Maximize(sum(objective_terms))
```

**Algoritmo:** OR-Tools usa **Weighted Multi-Objective Optimization** internamente mediante Branch and Bound — explora el árbol de asignaciones podando ramas cuya cota superior no puede superar la mejor solución encontrada hasta el momento.

### 4.7 Resolución y Extracción de Resultados

```python
solver = cp_model.CpSolver()
solver.parameters.max_time_in_seconds = request.timeout_seconds
solver.parameters.num_search_workers = 8   # Búsqueda paralela

status_code = solver.Solve(model)

STATUS_MAP = {
    cp_model.OPTIMAL:    "OPTIMAL",
    cp_model.FEASIBLE:   "FEASIBLE",
    cp_model.INFEASIBLE: "INFEASIBLE",
    cp_model.UNKNOWN:    "TIMEOUT",
}

status = STATUS_MAP.get(status_code, "INFEASIBLE")
assignments = []

if status_code in (cp_model.OPTIMAL, cp_model.FEASIBLE):
    for (c_id, t_id, r_id, s_idx), var in x.items():
        if solver.Value(var) == 1:
            assignments.append(Assignment(
                course_id=c_id,
                teacher_id=t_id,
                classroom_id=r_id,
                slot=slot_lookup[s_idx]
            ))
```

**`solver.parameters.num_search_workers = 8`:** OR-Tools lanza 8 hilos de búsqueda independientes con diferentes estrategias de ramificación, compartiendo la mejor solución encontrada. Esto reduce el tiempo de convergencia en instancias grandes.

---

## Sección 5: Flujo Completo de Ejecución

```
Frontend (React)
     │
     │ POST /schedule/generate
     ▼
API REST Express (puerto 3001)
     │ Valida JWT + permisos (Coordinador)
     │
     │ POST /solve  →  { period_id, courses[], timeout_seconds }
     ▼
Microservicio CSP FastAPI (puerto 8000)
     │
     ├── Pydantic valida el body (SolveRequest)
     │
     ├── solver.py construye el CpModel:
     │     ├── Variables booleanas x[(c, t, r, s)]
     │     ├── Restricción: cada curso asignado exactamente 1 vez
     │     ├── Restricción: no solapamiento docente
     │     ├── Restricción: no solapamiento aula
     │     └── Función objetivo: maximizar asignaciones - penalizaciones
     │
     ├── CpSolver.Solve(model)
     │     └── OR-Tools CP-SAT: SAT Solving + Constraint Propagation
     │                        + Branch & Bound + Parallel Search (8 hilos)
     │
     └── Devuelve SolveResponse { status, assignments[], elapsed_seconds, conflicts[] }
          │
          ▼
API REST Express
     │ Almacena resultado en SupaBase
     │ Registra en log de auditoría (SHA-256)
     │
     ▼
Frontend (React)
     Muestra horario en vista de calendario interactivo
```

---

## Sección 6: Manejo de Casos Especiales

### ¿Qué pasa si es INFEASIBLE?

El sistema devuelve la lista `conflicts` con mensajes descriptivos:

```json
{
  "status": "INFEASIBLE",
  "assignments": [],
  "conflicts": [
    "Docente T001 no tiene disponibilidad los Lunes",
    "No hay aulas con capacidad suficiente para curso MAT301 (80 estudiantes)"
  ]
}
```

El frontend muestra estos mensajes al coordinador para que corrija los datos.

### ¿Qué pasa en TIMEOUT?

Si el solver alcanza `timeout_seconds` sin completar, devuelve `FEASIBLE` si encontró alguna solución parcial, o `TIMEOUT` si no encontró ninguna. El coordinador puede optar por aceptar la solución parcial o ajustar las restricciones.

---

## Sección 7: Relación con los Requerimientos

| RF / RNF | Cómo lo implementa el microservicio |
|---|---|
| **RF-07** (Motor CSP) | `solver.py` — Variables booleanas + restricciones CP-SAT |
| **RF-08** (Detección de conflictos) | Campo `conflicts[]` en `SolveResponse` |
| **RNF-01** (Timeout ≤ 30 s) | `solver.parameters.max_time_in_seconds = timeout_seconds` |
| **RNF-06** (Caché TTL 24 h) | `node-cache` en Express — evita re-ejecutar el solver para el mismo input (Sprint 3) |

---

## Glosario Técnico

| Término | Definición |
|---|---|
| **CP-SAT** | Constraint Programming — Satisfiability: motor de OR-Tools que combina técnicas de programación por restricciones con resolución SAT |
| **Variable booleana** | Variable que solo puede valer 0 (no asignado) o 1 (asignado) |
| **Constraint Propagation** | Técnica que elimina valores imposibles del dominio de búsqueda antes de explorarlos |
| **Branch and Bound** | Algoritmo que explora un árbol de decisiones podando ramas infactibles o subóptimas |
| **MRV (Minimum Remaining Values)** | Heurística que asigna primero las variables con menos opciones restantes |
| **INFEASIBLE** | No existe ninguna combinación de asignaciones que satisfaga todas las restricciones duras |
| **Franja horaria (TimeSlot)** | Bloque de tiempo definido por día ISO, minuto de inicio y minuto de fin |

---

**Última actualización:** Mayo 2026  
**Sprint actual:** 1 — Solver en stub, implementación completa en Sprint 2–3  
**Equipo SGOHA — Universidad Continental, Huancayo, Perú — 2026-I**
