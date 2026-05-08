# Guía de Pruebas (Testing) - Backend SGOHA
### Metodología: Test-Driven Development (TDD)

Esta guía sigue el mismo enfoque del archivo de referencia, pero aterrizado al proyecto actual.

La idea central es que los tests se escriben **antes** del código o antes de modificar el comportamiento existente.  
El ciclo TDD que debe seguir el equipo es:

```text
RED      -> Escribir el test primero. Ejecutarlo. Debe fallar.
GREEN    -> Escribir el mínimo código necesario para que pase.
REFACTOR -> Limpiar, ordenar o extraer lógica sin romper los tests.
```

> Regla de trabajo: si una ruta, middleware o comportamiento del solver cambia, primero se expresa en un test rojo.

---

## Objetivo de esta guía

Aplicar TDD al proyecto real:

- **API Express** en `src/`
- **Microservicio CSP FastAPI** en `csp-service/app/`
- **Integración Backend -> CSP Service**
- **Restricciones principales del solver OR-Tools**

No es una guía genérica. Los ejemplos están basados en los archivos que hoy existen en el repositorio:

- `src/index.ts`
- `src/routes/health.ts`
- `src/middleware/auth.ts`
- `src/routes/api/v1/courses.ts`
- `src/routes/api/v1/solver.ts`
- `src/routes/api/v1/test.ts`
- `csp-service/app/main.py`
- `csp-service/app/schemas.py`
- `csp-service/app/solver.py`

---

## Herramientas recomendadas

### API Express (TypeScript)

El proyecto todavía no tiene librerías de testing configuradas en `package.json`, pero para hacer TDD similar al archivo de referencia se recomienda:

| Módulo | Herramienta | Propósito |
|---|---|---|
| API Express | `Jest` + `Supertest` + `ts-jest` | Probar endpoints y middlewares |
| API Express | `jest-mock-extended` o mocks manuales | Mockear Prisma y `fetch` |
| API Express | `coverage` de Jest | Medir cobertura de rutas y auth |

### Microservicio CSP (Python)

Estas herramientas ya encajan bien con el `pyproject.toml` actual:

| Módulo | Herramienta | Propósito |
|---|---|---|
| CSP FastAPI | `pytest` + `httpx` / `TestClient` | Probar endpoints sin levantar puerto real |
| CSP FastAPI | `pytest` | Probar el solver directamente |
| CSP FastAPI | `pytest-cov` | Cobertura del solver y API |

---

## Estructura sugerida de tests

```text
Backend/
├── tests/
│   ├── health.test.ts
│   ├── auth.test.ts
│   ├── courses.test.ts
│   ├── solver-route.test.ts
│   └── test-seed-and-run.test.ts
│
└── csp-service/
    └── tests/
        ├── conftest.py
        ├── test_api.py
        └── test_solver.py
```

---

## Parte 1. Microservicio CSP - FastAPI + OR-Tools

Esta parte del sistema es el corazón algorítmico del proyecto.  
El TDD aquí debe proteger tres cosas:

1. el contrato HTTP
2. la validación de entrada
3. las restricciones del solver

---

### `conftest.py`

Este archivo se crea primero porque da un cliente reutilizable para todos los tests HTTP del microservicio.

```python
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)
```

Si este archivo falla al importar, ya nos está diciendo que `app.main` todavía no está bien definido.

---

### `test_api.py`

## 1. `test_health_endpoint_returns_ok`

Verifica que el endpoint `/health` del microservicio responde correctamente.

```python
def test_health_endpoint_returns_ok():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "sgoha-csp-service"
    assert "timestamp" in data
```

`RED` esperado:

- falla si `app.main` no existe
- falla si `/health` no está registrado
- falla si cambia el contrato de salida

`GREEN` que fuerza:

- crear o mantener `csp-service/app/main.py`
- asegurar el contrato `{ status, service, timestamp }`

---

## 2. `test_solve_endpoint_returns_valid_schema`

Verifica que `POST /solve` devuelve el contrato `SolveResponse`.

```python
def test_solve_endpoint_returns_valid_schema():
    payload = {
        "period_id": "2026-I",
        "courses": [{
            "id": "MAT101",
            "name": "Matematica I",
            "credits": 4,
            "teacher_ids": ["T001"],
            "classroom_ids": ["A101"],
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
```

`RED` esperado:

- `404` si `/solve` no existe
- `500` si `solve()` no está implementado correctamente

`GREEN` que fuerza:

- `schemas.py`
- `SolveRequest`
- `SolveResponse`
- `solve_endpoint`

---

## 3. `test_solve_rejects_invalid_day`

Protege la validación de Pydantic.

```python
def test_solve_rejects_invalid_day():
    payload = {
        "period_id": "2026-I",
        "courses": [{
            "id": "MAT101",
            "name": "Matematica I",
            "credits": 4,
            "teacher_ids": ["T001"],
            "classroom_ids": ["A101"],
            "available_slots": [{"day": 9, "start_minute": 480, "end_minute": 600}]
        }]
    }
    response = client.post("/solve", json=payload)
    assert response.status_code == 422
```

`RED` esperado:

- falla con `200` si el schema acepta datos inválidos

`GREEN` que fuerza:

- `TimeSlot.day = Field(ge=1, le=7)`

---

### `test_solver.py`

## 4. `test_solver_empty_courses_returns_optimal`

Este test protege el caso base del solver actual.

```python
def test_solver_empty_courses_returns_optimal():
    from app.schemas import SolveRequest
    from app.solver import solve

    request = SolveRequest(period_id="2026-I", courses=[], timeout_seconds=5)
    result = solve(request)

    assert result.status == "OPTIMAL"
    assert result.assignments == []
    assert result.elapsed_seconds >= 0
```

`RED` esperado:

- falla si el solver no contempla la lista vacía

`GREEN` que fuerza:

- mantener el early return de `solve()`

---

## 5. `test_solver_finds_feasible_solution`

Este es el test más importante del solver real.

```python
def test_solver_finds_feasible_solution():
    from app.schemas import SolveRequest, CourseRequest, TimeSlot
    from app.solver import solve

    request = SolveRequest(
        period_id="2026-I",
        courses=[
            CourseRequest(
                id="C1",
                name="Matematica I",
                credits=4,
                teacher_ids=["T1"],
                classroom_ids=["A1"],
                available_slots=[TimeSlot(day=1, start_minute=420, end_minute=510)]
            )
        ],
        teacher_availabilities={
            "T1": [TimeSlot(day=1, start_minute=420, end_minute=510)]
        },
        timeout_seconds=10
    )

    result = solve(request)
    assert result.status in ("OPTIMAL", "FEASIBLE")
    assert len(result.assignments) == 1
```

`RED` esperado:

- falla si el solver no crea variables válidas
- falla si no reconstruye bien la asignación

`GREEN` que fuerza:

- modelado con `CpModel`
- variables booleanas
- extracción correcta de solución

---

## 6. `test_solver_no_teacher_overlap`

Protege una de las restricciones más importantes del proyecto.

```python
def test_solver_no_teacher_overlap():
    result = solve(request_multiples_cursos)
    teacher_slot_map = {}
    for a in result.assignments:
        key = (a.teacher_id, a.slot.day, a.slot.start_minute)
        teacher_slot_map.setdefault(key, []).append(a.course_id)
    for key, courses in teacher_slot_map.items():
        assert len(courses) == 1, f"Docente en conflicto: {key} -> {courses}"
```

`GREEN` que fuerza:

- `model.add_at_most_one(vars_list)` sobre `vars_by_teacher_slot`

---

## 7. `test_solver_no_classroom_overlap`

Protege la restricción de no solapamiento de aula.

```python
def test_solver_no_classroom_overlap():
    result = solve(request_multiples_cursos)
    classroom_slot_map = {}
    for a in result.assignments:
        key = (a.classroom_id, a.slot.day, a.slot.start_minute)
        classroom_slot_map.setdefault(key, []).append(a.course_id)
    for key, courses in classroom_slot_map.items():
        assert len(courses) == 1, f"Aula en conflicto: {key} -> {courses}"
```

`GREEN` que fuerza:

- `model.add_at_most_one(vars_list)` sobre `vars_by_classroom_slot`

---

## 8. `test_solver_returns_infeasible_with_conflicts`

Protege los mensajes de conflicto del solver.

```python
def test_solver_returns_infeasible_with_conflicts():
    result = solve(request_imposible)
    assert result.status == "INFEASIBLE"
    assert len(result.conflicts) > 0
    for msg in result.conflicts:
        assert isinstance(msg, str)
        assert len(msg) > 10
```

`GREEN` que fuerza:

- mensajes descriptivos en `conflicts`
- no devolver solo una respuesta vacía

---

## Parte 2. API Express - rutas y middlewares

En el backend principal, TDD debe cubrir:

1. endpoints básicos
2. autenticación y autorización
3. integración con Prisma
4. integración con el CSP service

Para hacer testing correctamente aquí conviene extraer `app` desde `src/index.ts` a un `src/app.ts`, para que Supertest pueda importarlo sin abrir el puerto real.

---

### `health.test.ts`

## 1. `GET /health responde correctamente`

Este test debe escribirse antes o durante el refactor para separar `app` de `listen()`.

```ts
describe("GET /health", () => {
  it("responde 200 con status, service y timestamp", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.service).toBe("sgoha-backend");
    expect(res.body).toHaveProperty("timestamp");
  });
});
```

`RED` esperado:

- falla si `app` no es importable
- falla si `/health` cambia su contrato

`GREEN` que fuerza:

- separar `app` de `index.ts`
- mantener el contrato del healthcheck

---

## 2. `ruta inexistente devuelve 404`

```ts
it("devuelve 404 para rutas no registradas", async () => {
  const res = await request(app).get("/ruta-inexistente");
  expect(res.status).toBe(404);
  expect(res.body.error).toBe("Not Found");
});
```

`GREEN` que fuerza:

- conservar el middleware 404 final de `src/index.ts`

---

### `auth.test.ts`

Los middlewares actuales en `src/middleware/auth.ts` ya tienen un contrato claro y perfecto para TDD.

## 3. `sin token -> 401`

```ts
it("rechaza sin token", async () => {
  const res = await request(app).get("/api/admin/periods");
  expect(res.status).toBe(401);
  expect(res.body.error).toBe("Missing bearer token");
});
```

## 4. `token inválido -> 401`

```ts
it("rechaza token invalido", async () => {
  const res = await request(app)
    .get("/api/admin/periods")
    .set("Authorization", "Bearer token.invalido");

  expect(res.status).toBe(401);
  expect(res.body.error).toBe("Invalid token");
});
```

## 5. `rol insuficiente -> 403`

```ts
it("rechaza rol sin permisos", async () => {
  process.env.JWT_SECRET = "test-secret";
  const token = jwt.sign({ userId: "u1", role: "DOCENTE" }, "test-secret");

  const res = await request(app)
    .get("/api/admin/periods")
    .set("Authorization", `Bearer ${token}`);

  expect(res.status).toBe(403);
  expect(res.body.error).toBe("Forbidden");
});
```

`GREEN` que fuerza:

- `requireAuth`
- `requireRole`
- diferenciación correcta entre `401` y `403`

---

### `courses.test.ts`

La ruta `src/routes/api/v1/courses.ts` merece TDD porque toca base de datos.

## 6. `GET /api/v1/courses devuelve lista`

```ts
it("devuelve la lista de cursos", async () => {
  prisma.course.findMany = jest.fn().mockResolvedValue([{ id: "c1", name: "Matematica I" }]);

  const res = await request(app).get("/api/v1/courses");

  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
  expect(res.body[0].id).toBe("c1");
});
```

## 7. `POST /api/v1/courses crea curso`

```ts
it("crea un curso", async () => {
  prisma.course.create = jest.fn().mockResolvedValue({
    id: "c1",
    code: "MAT101",
    name: "Matematica I"
  });

  const res = await request(app).post("/api/v1/courses").send({
    code: "MAT101",
    name: "Matematica I",
    credits: 4,
    cycle: 1,
    weeklyHours: 4,
    requiredRoomType: "GENERAL"
  });

  expect(res.status).toBe(201);
  expect(res.body.code).toBe("MAT101");
});
```

`GREEN` que fuerza:

- que la ruta responda con `200/201`
- que Prisma sea invocado con la forma correcta
- que los errores se manejen como `500`

---

### `solver-route.test.ts`

Esta es una de las rutas más importantes del backend principal porque orquesta toda la integración con el microservicio CSP.

## 8. `POST /api/v1/solver/generate devuelve horario enriquecido`

```ts
it("devuelve asignaciones enriquecidas", async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      status: "FEASIBLE",
      assignments: [
        {
          course_id: "c1",
          teacher_id: "t1",
          classroom_id: "a1",
          slot: { day: 1, start_minute: 420, end_minute: 510 }
        }
      ],
      elapsed_seconds: 0.02,
      conflicts: []
    })
  });

  const res = await request(app).post("/api/v1/solver/generate").send({});

  expect(res.status).toBe(200);
  expect(res.body.success).toBe(true);
  expect(res.body.assignments[0]).toHaveProperty("course_name");
  expect(res.body.assignments[0]).toHaveProperty("teacher_name");
  expect(res.body.assignments[0]).toHaveProperty("classroom_name");
});
```

## 9. `periodo inexistente -> 404`

```ts
it("devuelve 404 si no existe periodo activo ni enviado", async () => {
  prisma.academicPeriod.findFirst = jest.fn().mockResolvedValue(null);

  const res = await request(app).post("/api/v1/solver/generate").send({});

  expect(res.status).toBe(404);
  expect(res.body.error).toBe("Academic period not found");
});
```

## 10. `error del CSP service -> 500`

```ts
it("devuelve 500 si el microservicio CSP falla", async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: false,
    text: async () => "solver exploded"
  });

  const res = await request(app).post("/api/v1/solver/generate").send({});

  expect(res.status).toBe(500);
  expect(res.body.error).toBe("CSP Service Error");
});
```

`GREEN` que fuerza:

- construcción correcta del payload
- manejo correcto de periodo inexistente
- manejo correcto de error remoto
- enriquecimiento final de asignaciones

---

### `test-seed-and-run.test.ts`

La ruta `src/routes/api/v1/test.ts` es una ruta utilitaria de integración.

## 11. `POST /api/v1/test-seed-and-run inserta datos y llama al solver`

```ts
it("siembra datos de prueba y devuelve resultado del CSP", async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ status: "FEASIBLE", assignments: [], elapsed_seconds: 0.01, conflicts: [] })
  });

  const res = await request(app).post("/api/v1/test-seed-and-run");

  expect(res.status).toBe(200);
  expect(res.body.status).toBe("FEASIBLE");
});
```

`GREEN` que fuerza:

- el flujo de seed de prueba
- la llamada remota al motor Python
- el contrato mínimo de integración

---

## Orden sugerido para aplicar TDD en este proyecto

Si el equipo quiere avanzar de forma ordenada, esta es una secuencia sana:

1. `csp-service/tests/test_api.py`
2. `csp-service/tests/test_solver.py`
3. `tests/health.test.ts`
4. `tests/auth.test.ts`
5. `tests/courses.test.ts`
6. `tests/solver-route.test.ts`
7. `tests/test-seed-and-run.test.ts`

La razón es simple:

- primero se asegura el contrato del solver
- luego sus restricciones
- después se protege el backend principal
- al final se prueba la integración

---

## Cómo ejecutar

### CSP Service

```bash
cd Backend/csp-service
pip install -e ".[dev]"
pytest tests/ -v
pytest tests/ -x
pytest tests/ --cov=app --cov-report=html
```

### Backend Express

Antes de ejecutar esta parte habría que agregar dependencias de testing al `package.json`, por ejemplo:

```bash
npm install -D jest supertest ts-jest @types/jest @types/supertest
```

Luego:

```bash
cd Backend
npm test
npx jest --watch
```

---

## Estado TDD sugerido por fases

| Fase | Estado esperado |
|---|---|
| Health FastAPI | Verde |
| Solve schema FastAPI | Verde |
| Validación Pydantic | Verde |
| Solver base | Verde |
| Restricciones OR-Tools | Verde |
| Health Express | Verde |
| Auth middleware | Verde |
| Courses route | Verde |
| Solver integration route | Verde |
| Test seed route | Verde |

---

## Troubleshooting

**`ModuleNotFoundError: No module named 'ortools'`**  
Instalar dependencias del microservicio:

```bash
cd Backend/csp-service
pip install -e ".[dev]"
```

**`Cannot find module '../src/app'`**  
Extraer `app` desde `src/index.ts` a `src/app.ts` para que Supertest lo importe sin ejecutar `listen()`.

**`fetch is not defined` en tests de Node**  
Mockear `global.fetch` en los tests de integración de la ruta del solver.

**Tests del solver fallan con INFEASIBLE**  
Revisar si la disponibilidad del docente intersecta realmente con `available_slots`.

---

## Resumen final

Aplicar TDD en este proyecto significa usar tests para guiar tres capas al mismo tiempo:

1. la API Express
2. el microservicio FastAPI
3. el solver CSP con OR-Tools

La mayor ventaja aquí no es solo “probar código”, sino proteger el comportamiento más delicado del sistema:

- contratos HTTP
- autenticación
- transformación del payload
- restricciones del horario
- integración entre backend y solver

Si quieres una segunda versión, puedo convertir esta guía en una **versión por sprints**, por ejemplo:

- **Sprint 1:** health + auth + schemas
- **Sprint 2:** solver básico
- **Sprint 3:** restricciones OR-Tools + integración