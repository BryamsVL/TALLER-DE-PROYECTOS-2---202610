# Guía de Pruebas (Testing) — Backend SGOHA

Este documento explica todas las pruebas implementadas en el backend del proyecto SGOHA, cómo ejecutarlas, el estado actual y el plan de pruebas por sprint.

---

## 📋 Descripción General

El backend SGOHA tiene **dos módulos** que requieren pruebas independientes:

1. **API REST Express** (`Backend/`) — Servidor Node.js/TypeScript
2. **Microservicio CSP** (`Backend/csp-service/`) — Servidor FastAPI/Python

**Estado actual (Sprint 1):**

| Módulo | Tests | Estado |
|---|---|---|
| API REST Express | Base de estructura lista | ⚙️ En desarrollo |
| Microservicio CSP FastAPI | Base de estructura lista | ⚙️ En desarrollo |
| Solver OR-Tools | Pendiente hasta Sprint 2–3 | 🔲 Pendiente |

---

## 🧪 Pruebas del Microservicio CSP (`csp-service`)

### Herramientas de Testing

| Herramienta | Propósito |
|---|---|
| `pytest` | Framework de testing Python |
| `httpx` | Cliente HTTP para tests de FastAPI |
| `pytest-cov` | Cobertura de código |
| `fastapi.testclient` | Cliente de test que no levanta puerto real |

### Estructura de Tests

```
Backend/csp-service/
└── tests/
    ├── __init__.py                      ← Marca como paquete Python
    ├── conftest.py                      ← Fixtures compartidos
    ├── test_api.py                      ← Tests de endpoints HTTP
    └── test_csp_solver.py               ← Tests del motor OR-Tools (Sprint 2-3)
```

### Configuración Base (`conftest.py`)

```python
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)
```

`TestClient` simula peticiones HTTP al servidor FastAPI sin levantar un puerto real, lo que hace los tests más rápidos y reproducibles.

---

### Tests de API (`test_api.py`)

#### 1. `test_health_endpoint()`

**¿Qué prueba?** Que el endpoint `/health` responde correctamente.

```python
def test_health_endpoint():
    """Test que el healthcheck responde con status ok."""
    response = client.get("/health")
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "sgoha-csp-service"
    assert "timestamp" in data
```

**Lo que verifica:**
- ✅ Status HTTP 200
- ✅ Campo `status` es `"ok"`
- ✅ Campo `service` identifica correctamente el microservicio
- ✅ Campo `timestamp` existe en la respuesta

**Cuando falla:**
- El servidor no arrancó correctamente
- OR-Tools no está instalado (el import en `solver.py` falla al iniciar)
- El nombre del servicio fue modificado

---

#### 2. `test_solve_endpoint_returns_valid_schema()`

**¿Qué prueba?** Que el endpoint `POST /solve` responde con un schema válido de `SolveResponse`.

```python
def test_solve_endpoint_returns_valid_schema():
    """Test que el endpoint /solve retorna un SolveResponse válido."""
    payload = {
        "period_id": "2026-I",
        "courses": [
            {
                "id": "MAT101",
                "name": "Matemática I",
                "credits": 4,
                "teacher_ids": ["T001"],
                "classroom_ids": ["A101"],
                "available_slots": [
                    {"day": 1, "start_minute": 480, "end_minute": 600}
                ]
            }
        ],
        "timeout_seconds": 10
    }
    response = client.post("/solve", json=payload)
    assert response.status_code == 200

    data = response.json()
    assert "status" in data
    assert "assignments" in data
    assert "elapsed_seconds" in data
    assert "conflicts" in data
    assert isinstance(data["assignments"], list)
    assert isinstance(data["conflicts"], list)
    assert isinstance(data["elapsed_seconds"], float)
```

**Lo que verifica:**
- ✅ Status HTTP 200
- ✅ Respuesta contiene los 4 campos del schema `SolveResponse`
- ✅ `assignments` es lista
- ✅ `conflicts` es lista
- ✅ `elapsed_seconds` es número flotante

**Campos validados:**

| Campo | Tipo | Significado |
|---|---|---|
| `status` | str | `OPTIMAL` / `FEASIBLE` / `INFEASIBLE` / `TIMEOUT` |
| `assignments` | list | Asignaciones curso-docente-aula-franja |
| `elapsed_seconds` | float | Tiempo de ejecución del solver |
| `conflicts` | list | Mensajes de conflicto si no hay solución |

---

#### 3. `test_solve_endpoint_status_is_valid_value()`

**¿Qué prueba?** Que el campo `status` tiene un valor dentro del conjunto permitido.

```python
def test_solve_endpoint_status_is_valid_value():
    """Test que el status de respuesta es uno de los valores válidos."""
    payload = {
        "period_id": "2026-I",
        "courses": [],
        "timeout_seconds": 5
    }
    response = client.post("/solve", json=payload)
    assert response.status_code == 200

    data = response.json()
    valid_statuses = {"OPTIMAL", "FEASIBLE", "INFEASIBLE", "TIMEOUT"}
    assert data["status"] in valid_statuses
```

**Lo que verifica:**
- ✅ `status` es uno de: `OPTIMAL`, `FEASIBLE`, `INFEASIBLE`, `TIMEOUT`

---

#### 4. `test_solve_endpoint_validates_invalid_input()`

**¿Qué prueba?** Que Pydantic rechaza correctamente inputs mal formados.

```python
def test_solve_endpoint_validates_invalid_input():
    """Test que inputs inválidos retornan error de validación 422."""
    # day fuera de rango (debe ser 1-7)
    payload = {
        "period_id": "2026-I",
        "courses": [
            {
                "id": "MAT101",
                "name": "Matemática I",
                "credits": 4,
                "teacher_ids": ["T001"],
                "classroom_ids": ["A101"],
                "available_slots": [
                    {"day": 9, "start_minute": 480, "end_minute": 600}  # day=9 inválido
                ]
            }
        ]
    }
    response = client.post("/solve", json=payload)
    assert response.status_code == 422  # Unprocessable Entity
```

**Lo que verifica:**
- ✅ Un `day=9` (fuera del rango 1–7) genera un 422
- ✅ Pydantic valida correctamente el schema de entrada

---

### Tests del Solver OR-Tools (`test_csp_solver.py`) — Sprint 2–3

> ⚠️ Estos tests se activarán cuando el solver esté implementado en Sprint 2–3.

#### 5. `test_solver_stub_returns_infeasible()` (Sprint 1 — Activo)

**¿Qué prueba?** Que el stub actual devuelve `INFEASIBLE` como está documentado.

```python
def test_solver_stub_returns_infeasible():
    """Test que el stub del solver devuelve INFEASIBLE con mensaje informativo."""
    from app.schemas import SolveRequest, CourseRequest, TimeSlot
    from app.solver import solve

    request = SolveRequest(
        period_id="2026-I",
        courses=[
            CourseRequest(
                id="MAT101",
                name="Matemática I",
                credits=4,
                teacher_ids=["T001"],
                classroom_ids=["A101"],
                available_slots=[TimeSlot(day=1, start_minute=480, end_minute=600)]
            )
        ],
        timeout_seconds=10
    )
    result = solve(request)

    assert result.status == "INFEASIBLE"
    assert len(result.conflicts) > 0
    assert result.elapsed_seconds >= 0
```

---

#### 6. `test_solver_finds_feasible_solution()` (Sprint 2–3)

**¿Qué prueba?** Que el solver implementado encuentra una solución para una instancia simple.

```python
def test_solver_finds_feasible_solution():
    """Test que el solver encuentra solución factible para una instancia sencilla."""
    # 2 cursos, 2 docentes diferentes, 2 aulas, franjas distintas
    result = solve(simple_request_fixture)

    assert result.status in ("OPTIMAL", "FEASIBLE")
    assert len(result.assignments) == 2
    assert result.elapsed_seconds < 30
```

---

#### 7. `test_solver_no_teacher_overlap()` (Sprint 2–3)

**¿Qué prueba?** Que ningún docente aparece asignado a dos cursos en la misma franja.

```python
def test_solver_no_teacher_overlap():
    """Test que no hay solapamiento de docentes en la solución."""
    result = solve(multi_course_request)

    assert result.status in ("OPTIMAL", "FEASIBLE")

    # Construir mapa (docente, franja) → [cursos]
    teacher_slot_map = {}
    for assignment in result.assignments:
        key = (assignment.teacher_id, assignment.slot.day,
               assignment.slot.start_minute)
        teacher_slot_map.setdefault(key, []).append(assignment.course_id)

    for key, courses in teacher_slot_map.items():
        assert len(courses) == 1, (
            f"Docente {key[0]} asignado a múltiples cursos en franja {key[1]}:{key[2]}: {courses}"
        )
```

---

#### 8. `test_solver_no_classroom_overlap()` (Sprint 2–3)

**¿Qué prueba?** Que ninguna aula tiene dos cursos al mismo tiempo.

```python
def test_solver_no_classroom_overlap():
    """Test que no hay solapamiento de aulas en la solución."""
    result = solve(multi_course_request)

    classroom_slot_map = {}
    for assignment in result.assignments:
        key = (assignment.classroom_id, assignment.slot.day,
               assignment.slot.start_minute)
        classroom_slot_map.setdefault(key, []).append(assignment.course_id)

    for key, courses in classroom_slot_map.items():
        assert len(courses) == 1, (
            f"Aula {key[0]} con múltiples cursos en franja {key[1]}:{key[2]}: {courses}"
        )
```

---

#### 9. `test_solver_infeasible_returns_conflicts()` (Sprint 2–3)

**¿Qué prueba?** Que cuando no hay solución, el campo `conflicts` tiene mensajes descriptivos.

```python
def test_solver_infeasible_returns_conflicts():
    """Test que INFEASIBLE viene acompañado de mensajes de conflicto."""
    # Forzar infeasibility: 2 cursos, 1 docente, misma franja
    result = solve(impossible_request_fixture)

    assert result.status == "INFEASIBLE"
    assert len(result.conflicts) > 0
    # Los mensajes deben ser legibles por el coordinador
    for msg in result.conflicts:
        assert isinstance(msg, str)
        assert len(msg) > 10
```

---

## 🧪 Pruebas de la API REST Express

### Herramientas

| Herramienta | Propósito |
|---|---|
| **Jest** | Framework de testing Node.js |
| **Supertest** | Cliente HTTP para tests de Express |
| **ts-jest** | Soporte TypeScript en Jest |

### Tests Planificados (Sprint 1)

#### 1. `GET /health` debe responder 200

```typescript
describe("GET /health", () => {
  it("responde con status 200 y campo status ok", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });
});
```

#### 2. Rutas no existentes deben devolver 404

```typescript
describe("Ruta inexistente", () => {
  it("devuelve 404 para rutas no registradas", async () => {
    const response = await request(app).get("/ruta-inexistente");
    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Not Found");
  });
});
```

#### 3. JWT: ruta protegida sin token debe devolver 401 (Sprint 1)

```typescript
describe("Auth middleware", () => {
  it("rechaza petición sin token JWT", async () => {
    const response = await request(app).get("/api/users");
    expect(response.status).toBe(401);
  });
});
```

---

## 🏃 Cómo Ejecutar las Pruebas

### Microservicio CSP (Python)

```bash
cd Backend/csp-service

# Activar entorno virtual
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -e ".[dev]"

# Ejecutar todos los tests
pytest tests/ -v

# Solo tests de API
pytest tests/test_api.py -v

# Solo tests del solver
pytest tests/test_csp_solver.py -v

# Con cobertura
pytest tests/ --cov=app --cov-report=html
# Abre htmlcov/index.html en el navegador
```

**Output esperado (Sprint 1):**

```
tests/test_api.py::test_health_endpoint PASSED
tests/test_api.py::test_solve_endpoint_returns_valid_schema PASSED
tests/test_api.py::test_solve_endpoint_status_is_valid_value PASSED
tests/test_api.py::test_solve_endpoint_validates_invalid_input PASSED
tests/test_csp_solver.py::test_solver_stub_returns_infeasible PASSED

====== 5 passed in 0.8s ======
```

### API REST Express (Node.js)

```bash
cd Backend
npm install

# Ejecutar tests
npm test

# Con cobertura
npm run test:coverage

# Un test específico
npx jest health.test.ts
```

---

## 📊 Cobertura Actual

### Microservicio CSP

| Módulo | Cobertura estimada | Estado |
|---|---|---|
| `app/main.py` — Endpoints | ~90% | ✅ |
| `app/schemas.py` — Pydantic | ~80% | ✅ |
| `app/solver.py` — Solver stub | ~50% | ⚙️ |

**Áreas sin cobertura actualmente:**
- Casos de timeout del solver
- Edge cases con 0 cursos
- Franjas solapadas en la entrada

### API REST Express

| Módulo | Cobertura estimada | Estado |
|---|---|---|
| `src/routes/health.ts` | ~100% | ✅ (Sprint 1) |
| `src/middleware/auth.ts` | ~60% | ⚙️ (Sprint 1) |
| Rutas CRUD | 0% | 🔲 (Sprint 1–2) |

---

## 🐛 Troubleshooting

### `ModuleNotFoundError: No module named 'ortools'`

```bash
# Instalar dependencias dentro del entorno virtual
cd Backend/csp-service
pip install -e ".[dev]"
```

### `ConnectionRefusedError` en tests de Express

```bash
# Asegúrate de que el test levanta el servidor correctamente
# Usa supertest que no requiere servidor levantado en un puerto real
npm install --save-dev supertest @types/supertest
```

### Solver devuelve siempre INFEASIBLE

En Sprint 1 esto es **esperado** — el solver es un stub. La implementación completa es Sprint 2–3. Si falla es porque:
- El stub fue modificado accidentalmente
- Las dependencias de OR-Tools no están instaladas

### Tests lentos en pytest

El stub del solver es muy rápido (~0.001 s). Si los tests tardan más de 5 s, revisar si:
- Se está ejecutando el solver real accidentalmente
- Hay imports costosos al inicio

---

## ✅ Checklist de Testing por Sprint

### Sprint 1 — Checklist

```
[ ] pytest tests/ -v pasa sin errores (5 tests)
[ ] npm test pasa sin errores
[ ] /health de ambos servicios responde 200
[ ] /solve responde con schema válido (status en INFEASIBLE esperado)
[ ] Validación Pydantic rechaza inputs inválidos (422)
[ ] JWT middleware rechaza rutas sin token (401)
```

### Sprint 2–3 — Checklist adicional

```
[ ] test_solver_finds_feasible_solution pasa
[ ] test_solver_no_teacher_overlap pasa
[ ] test_solver_no_classroom_overlap pasa
[ ] test_solver_infeasible_returns_conflicts pasa
[ ] Cobertura total > 70%
[ ] Tiempo promedio de solver < 10 s para instancias de demo
```

---

## 📈 Métricas de Calidad

| Métrica | Objetivo | Sprint 1 | Sprint 2–3 |
|---|---|---|---|
| Tests pasando | 100% | ✅ 5/5 | 🔲 9/9 |
| Cobertura CSP Service | > 70% | ~60% | > 80% |
| Cobertura Express API | > 70% | ~40% | > 70% |
| Tiempo total de tests | < 30 s | < 5 s | < 30 s |
| Solver exitoso (OPTIMAL/FEASIBLE) | 100% demo | N/A | ✅ 100% |

---

## 🔮 Tests Futuros (Sprint 3–4)

- [ ] Tests de integración Express ↔ CSP Service completos
- [ ] Tests de stress (50 cursos, 20 docentes, 10 aulas)
- [ ] Tests de performance (benchmark tiempo de solver)
- [ ] Tests de exportación PDF/Excel
- [ ] Tests de auditoría (log SHA-256 inmutable)
- [ ] Tests de autenticación JWT — expiración y renovación
- [ ] Tests E2E con Playwright (Frontend ↔ Backend)

---

## 📚 Referencia Rápida de Comandos

```bash
# CSP Service (Python)
cd Backend/csp-service

pytest tests/ -v                                    # Todos los tests
pytest tests/test_api.py -v                         # Solo API
pytest tests/test_csp_solver.py -v                  # Solo solver
pytest tests/ --cov=app --cov-report=html           # Con cobertura
pytest tests/ -k "health" -v                        # Tests que coincidan con "health"
pytest tests/ -v -s                                 # Con output de print()
pytest tests/ -x                                    # Detener en primer fallo
pytest tests/ --lf                                  # Último test que falló

# API REST Express (Node.js)
cd Backend

npm test                                            # Todos los tests
npm run test:coverage                               # Con cobertura
npx jest --testPathPattern health                   # Tests de health
npx jest --watch                                    # Modo watch
```

---

## 🎯 Resumen

| Aspecto | Sprint 1 | Sprint 2–3 | Sprint 4 |
|---|---|---|---|
| Tests CSP API | ✅ 5 tests | ✅ +4 solver | ✅ +stress |
| Tests Express API | ⚙️ Base | ✅ CRUD completo | ✅ E2E |
| Tests Solver OR-Tools | 🔲 Stub | ✅ Completo | ✅ Performance |
| Cobertura CSP | ~60% | >80% | >85% |
| Cobertura Express | ~40% | >70% | >80% |

---

**Última actualización:** Mayo 2026  
**Sprint actual:** 1  
**Herramientas:** pytest 7+, Jest, httpx, Supertest  
**Equipo SGOHA — Universidad Continental, Huancayo, Perú — 2026-I**
