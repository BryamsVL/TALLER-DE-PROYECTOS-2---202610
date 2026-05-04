# Guía de Pruebas (Testing) — Backend SGOHA
### Metodología: Test-Driven Development (TDD)

El ciclo TDD se aplica en tres fases para cada funcionalidad:

```
🔴 RED     → Escribir el test primero. Ejecutarlo. Debe fallar.
🟢 GREEN   → Escribir el mínimo código de producción para que pase.
🔵 REFACTOR → Limpiar sin romper los tests.
```

> **Regla:** Nunca se escribe código de producción sin un test en rojo que lo justifique.

---

## Herramientas

| Módulo | Herramienta | Propósito |
|---|---|---|
| CSP FastAPI | `pytest` + `fastapi.testclient` | Tests sin levantar puerto real |
| CSP FastAPI | `pytest-cov` | Cobertura de código |
| API Express | `Jest` + `Supertest` + `ts-jest` | Tests HTTP TypeScript |

---

## Estructura de tests

```
Backend/
└── tests/
    ├── health.test.ts       ← escrito ANTES de health.ts
    └── auth.test.ts         ← escrito ANTES de auth.ts

Backend/csp-service/
└── tests/
    ├── conftest.py
    ├── test_api.py          ← escrito ANTES de main.py / schemas.py
    └── test_csp_solver.py   ← escrito ANTES de solver.py
```

---

## Microservicio CSP — FastAPI (Python)

### `conftest.py`

```python
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)
```

---

### `test_api.py`

#### 1. `test_health_endpoint`

🔴 Se escribe primero. Falla con `ImportError` porque `app/main.py` no existe.
🟢 Fuerza la creación de `app/main.py` con el endpoint `GET /health`.

```python
def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "sgoha-csp-service"
    assert "timestamp" in data
```

---

#### 2. `test_solve_endpoint_returns_valid_schema`

🔴 Falla con `404`. Fuerza la creación de `schemas.py`, `solver.py` y el endpoint `POST /solve`.
🟢 El contrato `SolveResponse` debe tener exactamente estos 4 campos.

```python
def test_solve_endpoint_returns_valid_schema():
    payload = {
        "period_id": "2026-I",
        "courses": [{
            "id": "MAT101", "name": "Matemática I", "credits": 4,
            "teacher_ids": ["T001"], "classroom_ids": ["A101"],
            "available_slots": [{"day": 1, "start_minute": 480, "end_minute": 600}]
        }],
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

---

#### 3. `test_solve_endpoint_status_is_valid_value`

🔴 Falla si `status` devuelve cualquier valor fuera del conjunto permitido.
🟢 Fuerza que `SolveStatus` sea `Literal["OPTIMAL", "FEASIBLE", "INFEASIBLE", "TIMEOUT"]`.

```python
def test_solve_endpoint_status_is_valid_value():
    payload = {"period_id": "2026-I", "courses": [], "timeout_seconds": 5}
    response = client.post("/solve", json=payload)
    assert response.status_code == 200
    assert response.json()["status"] in {"OPTIMAL", "FEASIBLE", "INFEASIBLE", "TIMEOUT"}
```

---

#### 4. `test_solve_endpoint_validates_invalid_input`

🔴 Falla con `200` si no hay validación. Fuerza `Field(ge=1, le=7)` en `TimeSlot.day`.
🟢 Pydantic rechaza `day=9` automáticamente con `422 Unprocessable Entity`.

```python
def test_solve_endpoint_validates_invalid_input():
    payload = {
        "period_id": "2026-I",
        "courses": [{
            "id": "MAT101", "name": "Matemática I", "credits": 4,
            "teacher_ids": ["T001"], "classroom_ids": ["A101"],
            "available_slots": [{"day": 9, "start_minute": 480, "end_minute": 600}]
        }]
    }
    response = client.post("/solve", json=payload)
    assert response.status_code == 422
```

---

### `test_csp_solver.py`

#### 5. `test_solver_stub_returns_infeasible` — Sprint 1 ✅

🔴 Falla con `ImportError`. Fuerza la creación de `solver.py` con la función `solve`.
🟢 El stub retorna `INFEASIBLE` con al menos un mensaje de conflicto.

```python
def test_solver_stub_returns_infeasible():
    from app.schemas import SolveRequest, CourseRequest, TimeSlot
    from app.solver import solve

    request = SolveRequest(
        period_id="2026-I",
        courses=[CourseRequest(
            id="MAT101", name="Matemática I", credits=4,
            teacher_ids=["T001"], classroom_ids=["A101"],
            available_slots=[TimeSlot(day=1, start_minute=480, end_minute=600)]
        )],
        timeout_seconds=10
    )
    result = solve(request)
    assert result.status == "INFEASIBLE"
    assert len(result.conflicts) > 0
    assert result.elapsed_seconds >= 0
```

---

#### 6–9. Tests del solver real — Sprint 2–3 🔴 (pendientes)

> Estos tests se escriben ahora y quedan en rojo. Guían la implementación OR-Tools del Sprint 2–3.

```python
def test_solver_finds_feasible_solution():
    # Fuerza que el solver real resuelva una instancia sencilla
    result = solve(request_2_cursos_recursos_distintos)
    assert result.status in ("OPTIMAL", "FEASIBLE")
    assert len(result.assignments) == 2
    assert result.elapsed_seconds < 30

def test_solver_no_teacher_overlap():
    # Fuerza la restricción: ningún docente en dos cursos a la vez
    result = solve(request_multiples_cursos)
    teacher_slot_map = {}
    for a in result.assignments:
        key = (a.teacher_id, a.slot.day, a.slot.start_minute)
        teacher_slot_map.setdefault(key, []).append(a.course_id)
    for key, courses in teacher_slot_map.items():
        assert len(courses) == 1

def test_solver_no_classroom_overlap():
    # Fuerza la restricción: ninguna aula con dos cursos a la vez
    result = solve(request_multiples_cursos)
    classroom_slot_map = {}
    for a in result.assignments:
        key = (a.classroom_id, a.slot.day, a.slot.start_minute)
        classroom_slot_map.setdefault(key, []).append(a.course_id)
    for key, courses in classroom_slot_map.items():
        assert len(courses) == 1

def test_solver_infeasible_returns_conflicts():
    # Fuerza que INFEASIBLE incluya mensajes descriptivos para el coordinador
    result = solve(request_imposible_mismo_docente_aula_franja)
    assert result.status == "INFEASIBLE"
    assert len(result.conflicts) > 0
    for msg in result.conflicts:
        assert isinstance(msg, str) and len(msg) > 10
```

---

## API REST — Express (TypeScript)

### `health.test.ts`

🔴 Ambos tests fallan con `Cannot find module '../src/app'`. Fuerzan separar `app` de `index.ts`.
🟢 Se crea `src/routes/health.ts` y se exporta `app` como módulo independiente.

```typescript
describe("GET /health", () => {
  it("responde 200 con status, service y timestamp", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.service).toBe("sgoha-backend");
    expect(res.body).toHaveProperty("timestamp");
  });

  it("devuelve 404 para rutas no registradas", async () => {
    const res = await request(app).get("/ruta-inexistente");
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Not Found");
  });
});
```

---

### `auth.test.ts`

🔴 Fallan con `404`. Fuerzan la creación de `src/middleware/auth.ts` con `requireAuth` y `requireRole`.

```typescript
describe("Auth middleware", () => {
  it("rechaza sin token → 401 Missing bearer token", async () => {
    const res = await request(app).get("/api/users");
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Missing bearer token");
  });

  it("rechaza token inválido → 401 Invalid token", async () => {
    const res = await request(app)
      .get("/api/users")
      .set("Authorization", "Bearer token.invalido");
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid token");
  });

  it("rechaza DOCENTE en ruta de ADMIN → 403 Forbidden", async () => {
    process.env.JWT_SECRET = "test-secret";
    const token = jwt.sign({ userId: "u1", role: "DOCENTE" }, "test-secret");
    const res = await request(app)
      .get("/api/admin/periods")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
    expect(res.body.error).toBe("Forbidden");
  });
});
```

---

## Cómo ejecutar

```bash
# CSP Service (Python)
cd Backend/csp-service
pip install -e ".[dev]"

pytest tests/ -v                           # Todos los tests
pytest tests/ -x                           # Detener en primer fallo (útil en TDD)
pytest tests/ --cov=app --cov-report=html  # Con cobertura

# API Express (Node.js)
cd Backend
npm install

npm test                   # Todos los tests
npx jest --watch           # Modo watch (ideal para ciclo TDD)
npm run test:coverage      # Con cobertura
```

**Output esperado Sprint 1:**
```
tests/test_api.py::test_health_endpoint                       PASSED  🟢
tests/test_api.py::test_solve_endpoint_returns_valid_schema   PASSED  🟢
tests/test_api.py::test_solve_endpoint_status_is_valid_value  PASSED  🟢
tests/test_api.py::test_solve_endpoint_validates_invalid_input PASSED 🟢
tests/test_csp_solver.py::test_solver_stub_returns_infeasible  PASSED 🟢

====== 5 passed in 0.8s ======
```

---

## Estado por Sprint

| Test | Sprint 1 | Sprint 2–3 |
|---|---|---|
| CSP API (4 tests) | ✅ | ✅ |
| Solver stub INFEASIBLE | ✅ | ✅ |
| Solver real OR-Tools (4 tests) | 🔴 pendiente | ✅ |
| Express health + 404 | ✅ | ✅ |
| Express auth JWT (3 tests) | ✅ | ✅ |
| Rutas CRUD completas | 🔴 pendiente | ✅ |

| Métrica | Sprint 1 | Objetivo Sprint 2–3 |
|---|---|---|
| Tests pasando | 100% | 100% |
| Cobertura CSP | ~60% | >80% |
| Cobertura Express | ~40% | >70% |
| Tiempo total tests | < 5 s | < 30 s |

---

## Troubleshooting

**`ModuleNotFoundError: No module named 'ortools'`** → `pip install -e ".[dev]"` dentro del entorno virtual.

**`Cannot find module '../src/app'`** → Separar la instancia Express de `app.listen()` en un archivo `src/app.ts` exportable.

**Solver siempre retorna INFEASIBLE** → Comportamiento **esperado** en Sprint 1. El test `test_solver_finds_feasible_solution` en rojo es la especificación para Sprint 2.

---

**Última actualización:** Mayo 2026 · **Sprint actual:** 1  
**Equipo SGOHA — Universidad Continental, Huancayo, Perú — 2026-I**
