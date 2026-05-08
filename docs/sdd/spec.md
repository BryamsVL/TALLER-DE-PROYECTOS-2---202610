# Especificación del Sistema — SGOHA

**Proyecto:** Sistema de Generación Óptima de Horarios Académicos  
**Versión:** 1.0 (Spec-Driven Development)  

---

## 1. Propósito y Alcance

**Propósito:** SGOHA automatiza la creación de horarios académicos mediante el motor CP-SAT de OR-Tools. Resuelve conflictos complejos como cruces de aulas, solapamiento de docentes y restricciones de estudiantes de manera óptima.

**Alcance de la v1.0:**
- Autenticación JWT y roles (ADMIN, COORDINATOR, TEACHER, STUDENT).
- CRUD completo de dependencias académicas.
- Motor CSP para generar asignaciones válidas (OPTIMAL o FEASIBLE).
- Validación de matrícula (Prerrequisitos, Créditos 20-22).
- Exportación del horario a Excel y PDF.

**Excluido:**
- Aplicación Móvil nativa.
- Integración en tiempo real (WebSockets) para los cruces.
- Portales de autoservicio de pagos.

---

## 2. Entradas del Sistema

### 2.1 API Node.js (Frontend -> Backend)
- **Docentes:** ID, Disponibilidad (Matriz de días y horas).
- **Cursos:** Créditos (1-6), Tipo (Teoría, Práctica, Lab), Aforo esperado.
- **Aulas:** Capacidad real, Tipo.
- **Estudiantes:** Historial académico (para prerrequisitos).

### 2.2 Microservicio FastAPI (Backend -> CSP)
El contrato JSON estricto (`POST /solve`) incluye:
```json
{
  "period_id": "2026-I",
  "courses": [
    {
      "id": "MAT101",
      "credits": 4,
      "teacher_ids": ["T001"],
      "classroom_ids": ["A101"],
      "available_slots": [{ "day": 1, "start_minute": 480, "end_minute": 600 }]
    }
  ],
  "timeout_seconds": 30
}
```

---

## 3. Salidas del Sistema

**Salidas del Solver CSP:**
```json
{
  "status": "OPTIMAL", // u OPTIMAL | FEASIBLE | INFEASIBLE | TIMEOUT
  "assignments": [
    {
      "course_id": "MAT101",
      "teacher_id": "T001",
      "classroom_id": "A101",
      "slot": { "day": 1, "start_minute": 480, "end_minute": 600 }
    }
  ],
  "elapsed_seconds": 4.7,
  "conflicts": []
}
```

**Salidas al Usuario:**
- Grillas visuales de calendario (React/shadcn).
- Archivos PDF (React-PDF o PDFKit) y XLSX.
- Mensajes HTTP (200 OK, 400 Bad Request, 403 Forbidden, 409 Conflict).

---

## 4. Reglas de Negocio (RN)

| ID | Regla | Impacto |
|---|---|---|
| **RN-01** | Solo hay un período activo a la vez en el sistema. | API Backend (Períodos) |
| **RN-02** | Un docente no puede estar en 2 lugares a la vez. | Solver (C1) |
| **RN-03** | Un aula no puede dictar 2 cursos simultáneos. | Solver (C2) |
| **RN-04** | Aforo Curso <= Capacidad Aula. | API / Solver (C3) |
| **RN-05** | Créditos por matrícula: entre 20 y 22. | API Backend (Matrícula) |
| **RN-06** | Cursos con prerrequisitos desaprobados son bloqueados. | API Backend (Matrícula) |
| **RN-07** | Logs inmutables para ediciones manuales del horario. | API Backend (Auditoría) |

---

## 5. Restricciones Formalizadas (CSP)

### 5.1 Restricciones Duras (Inviolables)
- **D1 (Unicidad Docente):** `Sum(x[c,t,a,f]) <= 1` por cada docente `t` y franja `f`.
- **D2 (Unicidad Aula):** `Sum(x[c,t,a,f]) <= 1` por aula `a` y franja `f`.
- **D3 (Capacidad):** `Estudiantes(c) <= Capacidad(a)`.
- **D4 (Sin Cruces Estudiante):** Validación algorítmica para evitar superposiciones en el horario del alumno.

### 5.2 Restricciones Blandas (Deseables)
- **B1 (Preferencias):** Priorizar horarios matutinos si el docente lo prefiere.
- **B2 (Huecos):** Minimizar horas muertas entre clases del mismo día.
- **B3 (Agrupación):** Distribuir las clases uniformemente en la semana (no todo el lunes).

---

## 6. Casos Límite Críticos (Edge Cases)

| Caso Límite | Comportamiento del Sistema |
|---|---|
| **TIMEOUT (30s)** | OR-Tools se detiene. Retorna la mejor solución parcial encontrada o error si no hay ninguna. |
| **INFEASIBLE** | Conflicto matemático inevitable. Retorna array `conflicts` detallando por qué falló (ej. "Aulas insuficientes"). |
| **Cruce de Matrícula** | El alumno intenta forzar dos clases en la misma hora. API retorna `409 Conflict`. |
| **Período Inactivo** | Intento de matricular fuera de fecha. API retorna `403 Forbidden`. |

---

## 7. Métricas de Calidad (NFRs)

- **Performance (Solver):** ≤ 30 segundos para resolver una instancia de 50 cursos y 30 docentes.
- **Latencia (API Node.js):** P95 < 500ms para todos los endpoints CRUD.
- **Carga de UI:** Renderizado de la grilla semanal < 3 segundos.
- **Validación de Entradas:** 100% de los endpoints protegidos con **Zod**.
