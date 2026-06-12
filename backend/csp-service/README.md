# SGOHA CSP Service

Microservicio de Satisfaccion de Restricciones (CSP) que genera asignaciones
curso-docente-aula-franja sin conflictos para el Sistema de Generacion Optima
de Horarios Academicos.

## Stack

- **Python 3.11+**
- **FastAPI** + **uvicorn** (HTTP server)
- **Google OR-Tools** (`cp_model`, motor CP-SAT)
- **Pydantic v2** (validacion de schemas)
- **pytest** + **httpx** (testing)

## Setup local (sin Docker)

```bash
cd Backend/csp-service
python -m venv .venv
source .venv/bin/activate    # Windows: .venv\Scripts\activate
pip install -e ".[dev]"
uvicorn app.main:app --reload --port 8000
```

Healthcheck: http://localhost:8000/health
Docs interactivas: http://localhost:8000/docs

## Setup con Docker

```bash
cd Backend/csp-service
docker build -t sgoha-csp-service .
docker run --rm -p 8000:8000 sgoha-csp-service
```

## Endpoints

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/health` | Healthcheck |
| POST | `/solve` | Resuelve la asignacion CSP (RF-07) |
| GET | `/docs` | Swagger UI auto-generado |

### `POST /solve` — contrato

**Request** (`SolveRequest`):
```json
{
  "period_id": "2026-I",
  "courses": [
    {
      "id": "MAT101",
      "name": "Matematica I",
      "credits": 4,
      "teacher_ids": ["T001", "T002"],
      "classroom_ids": ["A101", "A102"],
      "available_slots": [
        { "day": 1, "start_minute": 480, "end_minute": 600 }
      ]
    }
  ],
  "timeout_seconds": 30
}
```

**Response** (`SolveResponse`):
```json
{
  "status": "OPTIMAL",
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

`status` puede ser: `OPTIMAL`, `FEASIBLE`, `INFEASIBLE`, `TIMEOUT`.

## Estado del solver

**Sprint 0**: stub que devuelve `INFEASIBLE` con un mensaje informativo.
**Sprint 2-3**: implementacion completa con `cp_model.CpModel`, variables
booleanas curso-docente-aula-franja y restricciones duras (no solapamiento
docente, no solapamiento aula, disponibilidad de docente/estudiante).

Ver `app/solver.py`.

## Estructura

```
Backend/csp-service/
|-- pyproject.toml          # PEP 621
|-- Dockerfile
|-- .env.example
`-- app/
    |-- __init__.py
    |-- main.py             # FastAPI app
    |-- schemas.py          # Pydantic models
    `-- solver.py           # cp_model (stub)
```

## Variables de entorno

| Variable | Default | Proposito |
|----------|---------|-----------|
| `PORT` | `8000` | Puerto de uvicorn |
| `LOG_LEVEL` | `INFO` | Nivel de logging |
| `SOLVER_TIMEOUT_SECONDS` | `30` | RNF-01: limite del CSP |

## Requerimientos relacionados

| RF / RNF | Implementacion |
|----------|----------------|
| RF-07 | `app/solver.py` (motor CP-SAT) |
| RF-08 | deteccion de conflictos en respuesta |
| RNF-01 | `SOLVER_TIMEOUT_SECONDS` + early exit |
| RNF-06 | cache (a implementar Sprint 3) |
