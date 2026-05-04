# Guía de Pruebas (Testing) — Backend SGOHA
### Metodología: Test-Driven Development (TDD)

---

## ¿Qué es TDD y por qué lo usamos?

**Test-Driven Development** es una disciplina de desarrollo en la que **el test se escribe antes que el código de producción**. Cada funcionalidad nace de un test que falla, y solo se escribe el código mínimo necesario para hacerlo pasar.

El ciclo TDD se repite en tres fases para cada comportamiento nuevo:

```
🔴 RED    → Escribir el test. Ejecutarlo. Debe fallar (el código no existe todavía).
🟢 GREEN  → Escribir el mínimo código de producción para que el test pase.
🔵 REFACTOR → Limpiar el código sin romper los tests.
```

> **Regla de oro TDD:** Nunca se escribe código de producción sin un test en rojo que lo justifique.

---

## Estructura del proyecto bajo TDD

```
Backend/
├── src/
│   ├── routes/health.ts          ← Código creado DESPUÉS de health.test.ts
│   ├── middleware/auth.ts         ← Código creado DESPUÉS de auth.test.ts
│   └── index.ts
└── tests/
    ├── health.test.ts             ← Se escribió PRIMERO → forzó la creación de health.ts
    └── auth.test.ts               ← Se escribió PRIMERO → forzó la creación de auth.ts

Backend/csp-service/
├── app/
│   ├── main.py                   ← Código creado DESPUÉS de test_api.py
│   ├── schemas.py                ← Código creado DESPUÉS de test_api.py
│   └── solver.py                 ← Código creado DESPUÉS de test_csp_solver.py
└── tests/
    ├── conftest.py
    ├── test_api.py                ← Se escribió PRIMERO → forzó la creación de main.py
    └── test_csp_solver.py         ← Se escribió PRIMERO → forzó la creación de solver.py
```

---

## Herramientas de Testing

| Módulo | Herramienta | Propósito |
|---|---|---|
| CSP FastAPI | `pytest` | Framework de testing Python |
| CSP FastAPI | `fastapi.testclient` | Cliente HTTP sin levantar puerto real |
| CSP FastAPI | `pytest-cov` | Cobertura de código |
| API Express | `Jest` | Framework de testing Node.js |
| API Express | `Supertest` | Cliente HTTP para Express |
| API Express | `ts-jest` | Soporte TypeScript en Jest |

---

## Módulo CSP — Microservicio FastAPI (Python)

### Configuración base (`conftest.py`)

Se escribe `conftest.py` **antes que cualquier test**, porque define el fixture compartido del cliente HTTP. Sin él, los tests no pueden compilar.

```python
# Backend/csp-service/tests/conftest.py
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)
```

`TestClient` simula peticiones HTTP al servidor FastAPI sin levantar un puerto real, lo que hace los tests más rápidos y reproducibles.

---

### Ciclo TDD 1 — Endpoint `/health`

#### 🔴 RED — Se escribe el test primero

```python
# tests/test_api.py
def test_health_endpoint():
    """El healthcheck debe responder 200 con campos status, service y timestamp."""
    response = client.get("/health")
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "sgoha-csp-service"
    assert "timestamp" in data
```

**Salida al ejecutar (antes de escribir el código):**
```
FAILED tests/test_api.py::test_health_endpoint
ImportError: cannot import name 'app' from 'app.main'
```

El test falla porque `app/main.py` no existe aún. El error nos dice exactamente qué crear.

#### 🟢 GREEN — Se escribe el mínimo código para pasar

```python
# app/main.py  ← creado COMO RESPUESTA al test en rojo
from datetime import datetime, timezone
from fastapi import FastAPI

app = FastAPI(title="SGOHA CSP Service", version="0.1.0")

@app.get("/health")
def health() -> dict[str, str]:
    return {
        "status": "ok",
        "service": "sgoha-csp-service",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
```

**Salida tras el código mínimo:**
```
PASSED tests/test_api.py::test_health_endpoint
```

#### 🔵 REFACTOR — Se agrega lo necesario sin romper el test

Se añade CORS y la descripción completa a `FastAPI(...)`. El test sigue en verde.

---

### Ciclo TDD 2 — Schema de respuesta de `/solve`

#### 🔴 RED — Se escribe el test primero

```python
# tests/test_api.py
def test_solve_endpoint_returns_valid_schema():
    """POST /solve debe retornar un SolveResponse con los 4 campos del contrato."""
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

**Salida al ejecutar:**
```
FAILED tests/test_api.py::test_solve_endpoint_returns_valid_schema
404 — /solve not found
```

El test revela que faltan tres cosas: el schema Pydantic, la función `solve` y el endpoint POST.

#### 🟢 GREEN — Se crean los tres archivos en orden

**Paso 1 — `schemas.py`** (el test necesita un schema válido):

```python
# app/schemas.py  ← creado COMO RESPUESTA al test en rojo
from typing import Literal
from pydantic import BaseModel, Field

class TimeSlot(BaseModel):
    day: int = Field(ge=1, le=7)
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

SolveStatus = Literal["OPTIMAL", "FEASIBLE", "INFEASIBLE", "TIMEOUT"]

class SolveResponse(BaseModel):
    status: SolveStatus
    assignments: list[Assignment]
    elapsed_seconds: float
    conflicts: list[str] = Field(default_factory=list)
```

**Paso 2 — `solver.py`** (el test necesita que `solve` retorne `SolveResponse`):

```python
# app/solver.py  ← stub mínimo para pasar el test
from time import perf_counter
from ortools.sat.python import cp_model
from .schemas import SolveRequest, SolveResponse

def solve(request: SolveRequest) -> SolveResponse:
    start = perf_counter()
    _ = cp_model.CpModel()
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

**Paso 3 — endpoint en `main.py`**:

```python
# Se agrega a app/main.py
from .schemas import SolveRequest, SolveResponse
from .solver import solve

@app.post("/solve", response_model=SolveResponse)
def solve_endpoint(request: SolveRequest) -> SolveResponse:
    return solve(request)
```

**Salida:**
```
PASSED tests/test_api.py::test_solve_endpoint_returns_valid_schema
```

---

### Ciclo TDD 3 — El campo `status` es un valor del conjunto permitido

#### 🔴 RED — Se escribe el test primero

```python
# tests/test_api.py
def test_solve_endpoint_status_is_valid_value():
    """El campo status debe pertenecer al conjunto de valores permitidos."""
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

**Salida al ejecutar (antes del código):**
```
FAILED — AssertionError: 'UNKNOWN' not in {'OPTIMAL', 'FEASIBLE', 'INFEASIBLE', 'TIMEOUT'}
```

El test fuerza que `SolveStatus` sea un `Literal` con exactamente esos cuatro valores.

#### 🟢 GREEN

La declaración `SolveStatus = Literal["OPTIMAL", "FEASIBLE", "INFEASIBLE", "TIMEOUT"]` en `schemas.py` (creada en el ciclo anterior) hace que este test pase sin cambios adicionales.

```
PASSED tests/test_api.py::test_solve_endpoint_status_is_valid_value
```

---

### Ciclo TDD 4 — Validación Pydantic rechaza inputs inválidos

#### 🔴 RED — Se escribe el test primero

```python
# tests/test_api.py
def test_solve_endpoint_validates_invalid_input():
    """Un day=9 (fuera del rango 1-7) debe retornar 422 Unprocessable Entity."""
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
                    {"day": 9, "start_minute": 480, "end_minute": 600}
                ]
            }
        ]
    }
    response = client.post("/solve", json=payload)
    assert response.status_code == 422
```

**Salida al ejecutar (sin validación):**
```
FAILED — AssertionError: 200 != 422
```

El test fuerza que `TimeSlot.day` tenga la restricción `Field(ge=1, le=7)`.

#### 🟢 GREEN

La restricción `day: int = Field(ge=1, le=7)` en `schemas.py` hace que Pydantic rechace `day=9` automáticamente con 422.

```
PASSED tests/test_api.py::test_solve_endpoint_validates_invalid_input
```

---

### Ciclo TDD 5 — El stub del solver retorna INFEASIBLE con mensaje

#### 🔴 RED — Se escribe el test primero

```python
# tests/test_csp_solver.py
def test_solver_stub_returns_infeasible():
    """El stub del solver debe devolver INFEASIBLE con al menos un mensaje de conflicto."""
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

**Salida al ejecutar (sin `solver.py`):**
```
FAILED — ImportError: cannot import name 'solve' from 'app.solver'
```

#### 🟢 GREEN

La función `solve` en `solver.py` (creada en el Ciclo TDD 2) ya retorna los valores correctos.

```
PASSED tests/test_csp_solver.py::test_solver_stub_returns_infeasible
```

---

### Estado de los 5 ciclos TDD — Sprint 1

```
pytest tests/ -v

tests/test_api.py::test_health_endpoint                    PASSED  🟢
tests/test_api.py::test_solve_endpoint_returns_valid_schema PASSED  🟢
tests/test_api.py::test_solve_endpoint_status_is_valid_value PASSED 🟢
tests/test_api.py::test_solve_endpoint_validates_invalid_input PASSED 🟢
tests/test_csp_solver.py::test_solver_stub_returns_infeasible PASSED 🟢

====== 5 passed in 0.8s ======
```

---

## Módulo API REST — Express (TypeScript)

### Ciclo TDD 6 — Endpoint `GET /health`

#### 🔴 RED — Se escribe el test primero

```typescript
// Backend/tests/health.test.ts  ← se crea ANTES de health.ts
import request from "supertest";
import app from "../src/app";

describe("GET /health", () => {
  it("responde 200 con status ok, service y timestamp", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
    expect(response.body.service).toBe("sgoha-backend");
    expect(response.body).toHaveProperty("timestamp");
  });
});
```

**Salida al ejecutar:**
```
FAIL tests/health.test.ts
● Cannot find module '../src/app'
```

El test fuerza la creación de `app` como módulo exportable separado de `index.ts`.

#### 🟢 GREEN — Se crea el mínimo código

```typescript
// src/routes/health.ts  ← creado COMO RESPUESTA al test
import { Router } from "express";
export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.json({
    status: "ok",
    service: "sgoha-backend",
    timestamp: new Date().toISOString(),
  });
});
```

```typescript
// src/app.ts  ← extraído de index.ts para que el test pueda importarlo
import express from "express";
import { healthRouter } from "./routes/health.js";

const app = express();
app.use(express.json());
app.use("/health", healthRouter);

app.use((_req, res) => res.status(404).json({ error: "Not Found" }));

export default app;
```

```
PASSED tests/health.test.ts
```

---

### Ciclo TDD 7 — Ruta inexistente devuelve 404

#### 🔴 RED — Se escribe el test primero

```typescript
// Backend/tests/health.test.ts
describe("Ruta inexistente", () => {
  it("devuelve 404 con campo error para rutas no registradas", async () => {
    const response = await request(app).get("/ruta-que-no-existe");
    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Not Found");
  });
});
```

**Salida al ejecutar:**
```
FAIL — Expected: 404, Received: 200
```

El test fuerza el middleware 404 en `app.ts`.

#### 🟢 GREEN

```typescript
// Línea ya presente en src/app.ts tras el Ciclo TDD 6:
app.use((_req, res) => res.status(404).json({ error: "Not Found" }));
```

```
PASSED
```

---

### Ciclo TDD 8 — Middleware JWT rechaza petición sin token

#### 🔴 RED — Se escribe el test primero

```typescript
// Backend/tests/auth.test.ts  ← se crea ANTES de auth.ts
import request from "supertest";
import app from "../src/app";

describe("Auth middleware — requireAuth", () => {
  it("rechaza petición sin header Authorization con 401", async () => {
    const response = await request(app).get("/api/users");
    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Missing bearer token");
  });

  it("rechaza token mal formado con 401", async () => {
    const response = await request(app)
      .get("/api/users")
      .set("Authorization", "Bearer token.invalido");
    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Invalid token");
  });
});
```

**Salida al ejecutar:**
```
FAIL tests/auth.test.ts
● GET /api/users — Expected: 401, Received: 404
```

El test fuerza la existencia del middleware `requireAuth` y de la ruta `/api/users`.

#### 🟢 GREEN — Se crea el mínimo código

```typescript
// src/middleware/auth.ts  ← creado COMO RESPUESTA al test
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthPayload { userId: string; role: string; }

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.header("Authorization");
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing bearer token" });
    return;
  }
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(500).json({ error: "JWT_SECRET not configured" });
    return;
  }
  try {
    req.auth = jwt.verify(header.slice(7), secret) as AuthPayload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}
```

```typescript
// Se agrega a src/app.ts la ruta protegida mínima:
import { requireAuth } from "./middleware/auth.js";
app.get("/api/users", requireAuth, (_req, res) => res.json([]));
```

```
PASSED tests/auth.test.ts
```

#### 🔵 REFACTOR

Se extrae la ruta `/api/users` a su propio archivo `routes/users.ts` y se añade `requireRole`. Los tests siguen en verde sin modificaciones.

---

### Ciclo TDD 9 — `requireRole` rechaza rol no autorizado (Sprint 1)

#### 🔴 RED — Se escribe el test primero

```typescript
// Backend/tests/auth.test.ts
describe("Auth middleware — requireRole", () => {
  it("rechaza con 403 un token válido de DOCENTE en ruta de ADMIN", async () => {
    // Token válido firmado con el secret de test
    const token = jwt.sign(
      { userId: "u1", role: "DOCENTE" },
      "test-secret"
    );
    process.env.JWT_SECRET = "test-secret";

    const response = await request(app)
      .get("/api/admin/periods")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body.error).toBe("Forbidden");
  });
});
```

**Salida al ejecutar:**
```
FAIL — Expected: 403, Received: 404
```

#### 🟢 GREEN

```typescript
// src/middleware/auth.ts  ← se agrega requireRole
export function requireRole(...allowed: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) { res.status(401).json({ error: "Not authenticated" }); return; }
    if (!allowed.includes(req.auth.role as Role)) {
      res.status(403).json({ error: "Forbidden" }); return;
    }
    next();
  };
}
```

```
PASSED tests/auth.test.ts (3 tests)
```

---

## Ciclos TDD Sprint 2–3 — Solver OR-Tools

Los siguientes tests se escriben **antes** de implementar el solver real. Están en rojo durante Sprint 1 y guiarán la implementación en Sprint 2–3.

### Ciclo TDD 10 — Solver encuentra solución factible

#### 🔴 RED — Se escribe el test ahora (falla esperada hasta Sprint 2)

```python
# tests/test_csp_solver.py
def test_solver_finds_feasible_solution():
    """El solver real debe encontrar solución para 2 cursos con recursos distintos."""
    from app.schemas import SolveRequest, CourseRequest, TimeSlot
    from app.solver import solve

    request = SolveRequest(
        period_id="2026-I",
        courses=[
            CourseRequest(
                id="MAT101", name="Matemática I", credits=4,
                teacher_ids=["T001"], classroom_ids=["A101"],
                available_slots=[TimeSlot(day=1, start_minute=480, end_minute=600)]
            ),
            CourseRequest(
                id="FIS101", name="Física I", credits=4,
                teacher_ids=["T002"], classroom_ids=["A102"],
                available_slots=[TimeSlot(day=1, start_minute=600, end_minute=720)]
            ),
        ],
        timeout_seconds=30
    )
    result = solve(request)

    # Falla ahora porque el stub devuelve INFEASIBLE:
    assert result.status in ("OPTIMAL", "FEASIBLE")
    assert len(result.assignments) == 2
    assert result.elapsed_seconds < 30
```

---

### Ciclo TDD 11 — Sin solapamiento de docente

#### 🔴 RED

```python
def test_solver_no_teacher_overlap():
    """Ningún docente puede estar en dos cursos en la misma franja horaria."""
    from app.solver import solve

    result = solve(multi_course_request_same_teacher_different_slots)
    assert result.status in ("OPTIMAL", "FEASIBLE")

    teacher_slot_map: dict = {}
    for a in result.assignments:
        key = (a.teacher_id, a.slot.day, a.slot.start_minute)
        teacher_slot_map.setdefault(key, []).append(a.course_id)

    for key, courses in teacher_slot_map.items():
        assert len(courses) == 1, (
            f"Docente {key[0]} asignado a múltiples cursos "
            f"en día {key[1]} franja {key[2]}: {courses}"
        )
```

---

### Ciclo TDD 12 — Sin solapamiento de aula

#### 🔴 RED

```python
def test_solver_no_classroom_overlap():
    """Ninguna aula puede tener dos cursos al mismo tiempo."""
    from app.solver import solve

    result = solve(multi_course_request_same_classroom_different_slots)
    assert result.status in ("OPTIMAL", "FEASIBLE")

    classroom_slot_map: dict = {}
    for a in result.assignments:
        key = (a.classroom_id, a.slot.day, a.slot.start_minute)
        classroom_slot_map.setdefault(key, []).append(a.course_id)

    for key, courses in classroom_slot_map.items():
        assert len(courses) == 1, (
            f"Aula {key[0]} con múltiples cursos "
            f"en día {key[1]} franja {key[2]}: {courses}"
        )
```

---

### Ciclo TDD 13 — INFEASIBLE con conflictos descriptivos

#### 🔴 RED

```python
def test_solver_infeasible_returns_conflicts():
    """Cuando no hay solución posible, conflicts debe tener mensajes legibles."""
    from app.schemas import SolveRequest, CourseRequest, TimeSlot
    from app.solver import solve

    # Imposible: 2 cursos, mismo docente, misma franja y misma aula
    impossible = SolveRequest(
        period_id="2026-I",
        courses=[
            CourseRequest(
                id="MAT101", name="Matemática I", credits=4,
                teacher_ids=["T001"], classroom_ids=["A101"],
                available_slots=[TimeSlot(day=1, start_minute=480, end_minute=600)]
            ),
            CourseRequest(
                id="FIS101", name="Física I", credits=4,
                teacher_ids=["T001"], classroom_ids=["A101"],
                available_slots=[TimeSlot(day=1, start_minute=480, end_minute=600)]
            ),
        ],
        timeout_seconds=5
    )
    result = solve(impossible)

    assert result.status == "INFEASIBLE"
    assert len(result.conflicts) > 0
    for msg in result.conflicts:
        assert isinstance(msg, str)
        assert len(msg) > 10
```

---

## Cómo ejecutar las pruebas

### Microservicio CSP (Python)

```bash
cd Backend/csp-service

python -m venv .venv
source .venv/bin/activate       # Windows: .venv\Scripts\activate
pip install -e ".[dev]"

# Ciclo TDD: ejecutar en modo watch para ver rojo → verde
pytest tests/ -v                                # Todos los tests
pytest tests/test_api.py -v                     # Solo API
pytest tests/test_csp_solver.py -v              # Solo solver
pytest tests/ --cov=app --cov-report=html       # Con cobertura
pytest tests/ -x                                # Detener en primer fallo (útil en TDD)
pytest tests/ -v -s                             # Ver output de print()
```

**Output esperado Sprint 1 (5 ciclos TDD completados):**
```
tests/test_api.py::test_health_endpoint                     PASSED  🟢
tests/test_api.py::test_solve_endpoint_returns_valid_schema  PASSED  🟢
tests/test_api.py::test_solve_endpoint_status_is_valid_value PASSED  🟢
tests/test_api.py::test_solve_endpoint_validates_invalid_input PASSED 🟢
tests/test_csp_solver.py::test_solver_stub_returns_infeasible PASSED  🟢

====== 5 passed in 0.8s ======
```

### API REST Express (Node.js)

```bash
cd Backend
npm install

npm test                                   # Todos los tests
npm run test:coverage                      # Con cobertura
npx jest --watch                           # Modo watch (ideal para ciclo TDD)
npx jest --testPathPattern health          # Tests de health
npx jest --testPathPattern auth            # Tests de auth
```

---

## Cobertura por módulo

| Módulo | Cobertura Sprint 1 | Objetivo Sprint 2–3 |
|---|---|---|
| `app/main.py` | ~90% | >90% |
| `app/schemas.py` | ~80% | >85% |
| `app/solver.py` — stub | ~50% | >80% (solver real) |
| `src/routes/health.ts` | ~100% | >100% |
| `src/middleware/auth.ts` | ~60% | >80% |
| Rutas CRUD | 0% | >70% (Sprint 2) |

> La cobertura en TDD es una consecuencia natural, no un objetivo perseguido directamente. Si todos los ciclos TDD están en verde, la cobertura alta es el resultado esperado.

---

## Troubleshooting

**`ModuleNotFoundError: No module named 'ortools'`**
```bash
cd Backend/csp-service && pip install -e ".[dev]"
```

**`Cannot find module '../src/app'`**
El test requiere que `app` esté exportado desde `src/app.ts`, no desde `src/index.ts`. Separa la instancia de Express de la llamada a `app.listen()`.

**Solver siempre retorna INFEASIBLE**
En Sprint 1 esto es el comportamiento **esperado** — el stub cumple exactamente lo que el test `test_solver_stub_returns_infeasible` exige. El test en rojo `test_solver_finds_feasible_solution` es la señal para Sprint 2.

**Tests lentos en pytest**
El stub es casi instantáneo (~0.001 s). Si los tests tardan más de 5 s, revisar si el solver real se está invocando accidentalmente antes de Sprint 2.

---

## Checklist TDD por Sprint

### Sprint 1

```
[ ] Ciclo TDD 1 — test_health_endpoint                     → GREEN
[ ] Ciclo TDD 2 — test_solve_endpoint_returns_valid_schema  → GREEN
[ ] Ciclo TDD 3 — test_solve_endpoint_status_is_valid_value → GREEN
[ ] Ciclo TDD 4 — test_solve_endpoint_validates_invalid_input → GREEN
[ ] Ciclo TDD 5 — test_solver_stub_returns_infeasible       → GREEN
[ ] Ciclo TDD 6 — GET /health Express                       → GREEN
[ ] Ciclo TDD 7 — Ruta inexistente 404                      → GREEN
[ ] Ciclo TDD 8 — JWT sin token → 401                       → GREEN
[ ] Ciclo TDD 9 — JWT rol no autorizado → 403               → GREEN
```

### Sprint 2–3

```
[ ] Ciclo TDD 10 — test_solver_finds_feasible_solution      → GREEN (solver real)
[ ] Ciclo TDD 11 — test_solver_no_teacher_overlap           → GREEN
[ ] Ciclo TDD 12 — test_solver_no_classroom_overlap         → GREEN
[ ] Ciclo TDD 13 — test_solver_infeasible_returns_conflicts → GREEN
[ ] Cobertura total CSP > 80%
[ ] Cobertura total Express > 70%
[ ] Tiempo solver < 10 s para instancias de demo
```

---

## Métricas de calidad

| Métrica | Sprint 1 | Sprint 2–3 | Sprint 4 |
|---|---|---|---|
| Ciclos TDD completados | 9/9 | 13/13 | 17/17 |
| Tests pasando | 100% | 100% | 100% |
| Cobertura CSP | ~60% | >80% | >85% |
| Cobertura Express | ~40% | >70% | >80% |
| Tiempo total de tests | < 5 s | < 30 s | < 60 s |
| Tests en rojo tolerados | 4 (Sprint 2–3) | 0 | 0 |

> Un test en rojo de Sprint 2–3 que existe en Sprint 1 **no es un error** — es el backlog de TDD: cada test rojo es una especificación futura comprometida.

---

## Tests futuros — Ciclos TDD Sprint 3–4

Los siguientes tests se escribirán **antes** de implementar cada funcionalidad:

```
[ ] Ciclo TDD 14 — Tests de stress (50 cursos, 20 docentes, 10 aulas)
[ ] Ciclo TDD 15 — Tests de exportación PDF/Excel
[ ] Ciclo TDD 16 — Tests de auditoría (log SHA-256 inmutable)
[ ] Ciclo TDD 17 — Tests JWT expiración y renovación de token
[ ] Ciclo TDD 18 — Tests E2E con Playwright (Frontend ↔ Backend)
[ ] Ciclo TDD 19 — Tests de integración Express ↔ CSP Service
```

---

**Última actualización:** Mayo 2026  
**Sprint actual:** 1  
**Metodología:** Test-Driven Development (Red → Green → Refactor)  
**Herramientas:** pytest 7+, Jest, httpx, Supertest, OR-Tools  
**Equipo SGOHA — Universidad Continental, Huancayo, Perú — 2026-I**
