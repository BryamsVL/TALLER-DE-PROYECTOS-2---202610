# Guía de Pruebas (Testing) — Backend SGOHA
### Metodología: Test-Driven Development (TDD)

En este proyecto los tests se escriben **antes** del código de producción. El ciclo es siempre el mismo:

```
🔴 RED     → Escribir el test. Ejecutarlo. Debe fallar (el código aún no existe).
🟢 GREEN   → Escribir el mínimo código para que el test pase.
🔵 REFACTOR → Limpiar el código sin romper los tests.
```

> **Regla de oro:** Ningún archivo de producción se crea sin un test en rojo que lo justifique.

---

## Herramientas

| Módulo | Herramienta | Propósito |
|---|---|---|
| CSP FastAPI | `pytest` + `fastapi.testclient` | Tests sin levantar puerto real |
| CSP FastAPI | `pytest-cov` | Cobertura de código |
| API Express | `Jest` + `Supertest` + `ts-jest` | Tests HTTP en TypeScript |

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
    ├── test_api.py          ← escrito ANTES de main.py y schemas.py
    └── test_csp_solver.py   ← escrito ANTES de solver.py
```

---

## Microservicio CSP — FastAPI (Python)

### `conftest.py`

Se crea antes que cualquier test porque define el cliente HTTP compartido. `TestClient` simula peticiones a FastAPI sin levantar un puerto real, lo que hace los tests más rápidos y sin dependencias externas.

```python
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)
```

---

### `test_api.py`

#### 1. `test_health_endpoint`

Verifica que el servidor arrancó correctamente y que el endpoint `/health` responde con los tres campos del contrato: `status`, `service` y `timestamp`. En TDD, este es el primer test que se escribe: falla con `ImportError` porque `app/main.py` no existe todavía, y eso es exactamente lo que fuerza su creación.

```python
def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "sgoha-csp-service"
    assert "timestamp" in data
```

🔴 Falla: `ImportError — cannot import name 'app' from 'app.main'`
🟢 Fuerza crear `app/main.py` con el endpoint `GET /health`.

---

#### 2. `test_solve_endpoint_returns_valid_schema`

Verifica que `POST /solve` devuelve una respuesta con exactamente los cuatro campos del contrato `SolveResponse`: `status`, `assignments`, `elapsed_seconds` y `conflicts`, con los tipos correctos. Este test es el más importante del Sprint 1 porque fuerza la creación de tres archivos de una vez: `schemas.py` (el modelo Pydantic), `solver.py` (la función `solve`) y el endpoint en `main.py`.

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

🔴 Falla: `404 — /solve not found`
🟢 Fuerza crear `schemas.py`, `solver.py` y registrar `POST /solve` en `main.py`.

---

#### 3. `test_solve_endpoint_status_is_valid_value`

Verifica que el campo `status` de la respuesta siempre sea uno de los cuatro valores definidos en el dominio: `OPTIMAL`, `FEASIBLE`, `INFEASIBLE` o `TIMEOUT`. Este test protege contra errores como devolver `"ok"`, `"error"` u otro string arbitrario, y fuerza que `SolveStatus` sea un `Literal` con exactamente esos cuatro valores en `schemas.py`.

```python
def test_solve_endpoint_status_is_valid_value():
    payload = {"period_id": "2026-I", "courses": [], "timeout_seconds": 5}
    response = client.post("/solve", json=payload)
    assert response.status_code == 200
    assert response.json()["status"] in {"OPTIMAL", "FEASIBLE", "INFEASIBLE", "TIMEOUT"}
```

🔴 Falla si `status` devuelve un valor no definido en el dominio.
🟢 Fuerza `SolveStatus = Literal["OPTIMAL", "FEASIBLE", "INFEASIBLE", "TIMEOUT"]` en `schemas.py`.

---

#### 4. `test_solve_endpoint_validates_invalid_input`

Verifica que Pydantic rechaza automáticamente datos mal formados antes de que lleguen al solver. En este caso, un `day=9` es inválido porque el rango permitido es 1–7 (ISO 8601). Sin este test, el código podría aceptar días inexistentes y producir asignaciones corruptas. Fuerza que `TimeSlot.day` tenga la restricción `Field(ge=1, le=7)`.

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

🔴 Falla con `200` si no hay validación en el schema.
🟢 Fuerza agregar `Field(ge=1, le=7)` en `TimeSlot.day` dentro de `schemas.py`.

---

### `test_csp_solver.py`

#### 5. `test_solver_stub_returns_infeasible` — Sprint 1 ✅

Verifica que la función `solve` existe, retorna un `SolveResponse` válido y que el stub del Sprint 1 se comporta exactamente como está documentado: devuelve `INFEASIBLE` con al menos un mensaje de conflicto explicando que el solver real aún no está implementado. Este test también valida que `elapsed_seconds` es un número no negativo, lo que confirma que el cronómetro interno funciona.

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

🔴 Falla: `ImportError — cannot import name 'solve' from 'app.solver'`
🟢 Fuerza crear `solver.py` con la función `solve` que retorna el stub documentado.

---

#### 6–9. Tests del solver real — Sprint 2–3 🔴 (escritos ahora, en rojo a propósito)

Estos tests se escriben **ahora** durante el Sprint 1 aunque todavía fallen. En TDD, un test en rojo pendiente no es un error, es una especificación comprometida: define exactamente qué debe hacer el solver real antes de escribir una sola línea de OR-Tools.

**`test_solver_finds_feasible_solution`** — Verifica que el solver implementado es capaz de encontrar al menos una solución válida para una instancia sencilla de dos cursos con recursos distintos y franjas distintas. Si este test pasa, el solver básico funciona.

**`test_solver_no_teacher_overlap`** — Verifica la restricción dura más importante: ningún docente puede estar asignado a dos cursos al mismo tiempo. Recorre todas las asignaciones y construye un mapa `(docente, día, franja) → cursos` para detectar colisiones.

**`test_solver_no_classroom_overlap`** — Igual que el anterior pero para aulas: ninguna aula puede tener dos cursos en la misma franja horaria.

**`test_solver_infeasible_returns_conflicts`** — Verifica que cuando no existe solución posible (por ejemplo, dos cursos que necesitan el mismo docente en la misma franja), el campo `conflicts` contiene mensajes descriptivos y legibles para el coordinador, no solo un código de error.

```python
def test_solver_finds_feasible_solution():
    result = solve(request_2_cursos_recursos_distintos)
    assert result.status in ("OPTIMAL", "FEASIBLE")
    assert len(result.assignments) == 2
    assert result.elapsed_seconds < 30

def test_solver_no_teacher_overlap():
    result = solve(request_multiples_cursos)
    teacher_slot_map = {}
    for a in result.assignments:
        key = (a.teacher_id, a.slot.day, a.slot.start_minute)
        teacher_slot_map.setdefault(key, []).append(a.course_id)
    for key, courses in teacher_slot_map.items():
        assert len(courses) == 1, f"Docente {key[0]} en conflicto: {courses}"

def test_solver_no_classroom_overlap():
    result = solve(request_multiples_cursos)
    classroom_slot_map = {}
    for a in result.assignments:
        key = (a.classroom_id, a.slot.day, a.slot.start_minute)
        classroom_slot_map.setdefault(key, []).append(a.course_id)
    for key, courses in classroom_slot_map.items():
        assert len(courses) == 1, f"Aula {key[0]} en conflicto: {courses}"

def test_solver_infeasible_returns_conflicts():
    result = solve(request_imposible_mismo_docente_aula_franja)
    assert result.status == "INFEASIBLE"
    assert len(result.conflicts) > 0
    for msg in result.conflicts:
        assert isinstance(msg, str) and len(msg) > 10
```

---

## API REST — Express (TypeScript)

### `health.test.ts`

#### 1. `GET /health` responde correctamente

Verifica que el servidor Express levanta bien y que el endpoint `/health` devuelve los tres campos esperados con sus valores correctos. Este test también fuerza una decisión de arquitectura importante: `app` debe estar exportado en un archivo separado (`src/app.ts`) para que Supertest pueda importarlo sin ejecutar `app.listen()`.

#### 2. Ruta inexistente devuelve 404

Verifica que cualquier ruta no registrada responde con `404` y el campo `error: "Not Found"`. Sin este test, Express devolvería respuestas vacías o inconsistentes para rutas inválidas.

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

🔴 Fallan: `Cannot find module '../src/app'`
🟢 Fuerzan crear `src/routes/health.ts` y exportar `app` como módulo separado de `index.ts`.

---

### `auth.test.ts`

#### 3. Petición sin token → 401

Verifica que una ruta protegida rechaza inmediatamente cualquier petición que no incluya el header `Authorization`. Es el caso más común de error del cliente y debe ser explícito en el mensaje de respuesta.

#### 4. Token mal formado → 401

Verifica que un JWT corrupto o firmado con un secret incorrecto también es rechazado. Esto fuerza que el middleware use `jwt.verify()` con manejo de excepciones, no solo que compruebe si el header existe.

#### 5. Rol insuficiente → 403

Verifica que un usuario autenticado pero con un rol no autorizado (por ejemplo, un `DOCENTE` intentando acceder a una ruta de `ADMIN`) recibe `403 Forbidden` y no `401`. La diferencia importa: `401` es "no sé quién eres", `403` es "sé quién eres pero no tienes permiso". Este test fuerza la existencia de `requireRole` como middleware separado de `requireAuth`.

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

🔴 Fallan: `404` porque `/api/users` no existe ni el middleware está registrado.
🟢 Fuerzan crear `src/middleware/auth.ts` con `requireAuth` y `requireRole`.

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
tests/test_api.py::test_health_endpoint                        PASSED  🟢
tests/test_api.py::test_solve_endpoint_returns_valid_schema    PASSED  🟢
tests/test_api.py::test_solve_endpoint_status_is_valid_value   PASSED  🟢
tests/test_api.py::test_solve_endpoint_validates_invalid_input PASSED  🟢
tests/test_csp_solver.py::test_solver_stub_returns_infeasible  PASSED  🟢

====== 5 passed in 0.8s ======
```

---

## Estado por Sprint

| Test | Sprint 1 | Sprint 2–3 |
|---|---|---|
| CSP API — 4 tests | ✅ | ✅ |
| Solver stub INFEASIBLE | ✅ | ✅ |
| Solver real OR-Tools — 4 tests | 🔴 pendiente | ✅ |
| Express health + 404 | ✅ | ✅ |
| Express auth JWT — 3 tests | ✅ | ✅ |
| Rutas CRUD completas | 🔴 pendiente | ✅ |

| Métrica | Sprint 1 | Objetivo Sprint 2–3 |
|---|---|---|
| Tests pasando | 100% | 100% |
| Cobertura CSP | ~60% | >80% |
| Cobertura Express | ~40% | >70% |
| Tiempo total tests | < 5 s | < 30 s |

---

## Troubleshooting

**`ModuleNotFoundError: No module named 'ortools'`** → Ejecutar `pip install -e ".[dev]"` dentro del entorno virtual del `csp-service`.

**`Cannot find module '../src/app'`** → `app` debe exportarse desde `src/app.ts` separado de `src/index.ts`. Supertest importa la instancia Express sin ejecutar `listen()`.

**Solver siempre retorna INFEASIBLE** → Comportamiento esperado en Sprint 1. El stub es correcto. Los tests `test_solver_finds_feasible_solution` y los demás en rojo son la especificación que guía el Sprint 2.

---

**Última actualización:** Mayo 2026 · **Sprint actual:** 1  
**Equipo SGOHA — Universidad Continental, Huancayo, Perú — 2026-I**
