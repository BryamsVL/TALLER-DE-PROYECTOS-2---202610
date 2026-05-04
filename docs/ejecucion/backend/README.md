
# Backend — Documentación

Backend del proyecto **SGOHA** (Sistema de Generación Óptima de Horarios Académicos) que automatiza la asignación de cursos, docentes y aulas sin conflictos mediante satisfacción de restricciones.

## 📖 Documentos

Este directorio contiene 3 documentos:

1. **README.md** (este archivo) — Información general del backend
2. **[CSP_SERVICE_EXPLAINED.md](CSP_SERVICE_EXPLAINED.md)** — Explicación detallada del microservicio CSP y su integración con OR-Tools
3. **[TESTING.md](TESTING.md)** — Guía de pruebas implementadas

---

## 🎯 ¿Qué Hace el Backend?

El sistema SGOHA se compone de **dos servicios backend** que trabajan en conjunto:

### 1. API REST Principal (`Express + Node.js`)
Servidor principal que gestiona autenticación, entidades del sistema y coordinación entre módulos.

**Funcionalidades:**
- Autenticación con JWT (4 roles: Admin, Coordinador, Docente, Estudiante)
- Registro y gestión de usuarios, periodos, cursos y aulas
- Validación de matrícula
- Proxy de delegación al microservicio CSP
- Auditoría de acciones con hash SHA-256

### 2. Microservicio CSP (`FastAPI + OR-Tools`)
Motor de satisfacción de restricciones que genera asignaciones curso-docente-aula-franja sin conflictos.

**Funcionalidades:**
- Recibe cursos con docentes, aulas y franjas disponibles
- Resuelve el problema de asignación via CP-SAT (OR-Tools)
- Devuelve una solución `OPTIMAL`, `FEASIBLE`, `INFEASIBLE` o `TIMEOUT`
- Detecta y reporta conflictos si no hay solución factible

---

## 🛠️ Tecnologías Utilizadas

### API REST Principal

| Tecnología | Versión | Propósito |
|---|---|---|
| **Node.js** | 20+ | Runtime JavaScript del servidor |
| **TypeScript** | 5+ | Tipado estático |
| **Express** | 4 | Framework HTTP |
| **Prisma** | 5 | ORM con tipado nativo TypeScript |
| **PostgreSQL** | 16 | Base de datos relacional principal |
| **jsonwebtoken** | — | Tokens JWT (RF-02) |
| **bcrypt** | — | Hash de contraseñas (cost ≥ 12, RNF-04) |
| **zod** | — | Validación de inputs |
| **helmet + cors** | — | Cabeceras de seguridad (OWASP) |
| **node-cache** | — | Caché en memoria (TTL 24 h) |

### Microservicio CSP

| Tecnología | Versión | Propósito |
|---|---|---|
| **Python** | 3.11+ | Runtime del microservicio |
| **FastAPI** | ≥ 0.100 | Framework web asíncrono |
| **OR-Tools CP-SAT** | ≥ 9.x | Solver de satisfacción de restricciones |
| **Pydantic v2** | — | Validación de schemas HTTP |
| **uvicorn** | — | Servidor ASGI |
| **pytest + httpx** | — | Testing |

---

## ⚙️ Algoritmos del Microservicio CSP

El motor CSP utiliza **OR-Tools CP-SAT** (Constraint Programming — Satisfiability):

| Algoritmo | Función |
|---|---|
| **SAT Solving** | Decisiones booleanas por cada asignación posible curso-docente-aula-franja |
| **Constraint Propagation** | Elimina combinaciones inválidas sin explorarlas |
| **Branch and Bound** | Árbol de decisiones con poda de ramas infactibles |
| **MRV Heuristic** | Asigna primero las variables con menos opciones restantes |
| **Parallel Search** | Múltiples hilos explorando simultáneamente |

### Restricciones Implementadas (Sprint 0 — Stub)

> ⚠️ **Estado Sprint 1:** El solver devuelve `INFEASIBLE` mientras se completa la implementación en Sprint 2–3. El contrato HTTP ya está definido.

Restricciones planeadas para Sprint 2–3:

- ✅ No solapamiento de docente (un docente no puede estar en dos aulas a la vez)
- ✅ No solapamiento de aula (una aula no puede tener dos cursos a la vez)
- ✅ Disponibilidad horaria de docentes
- ✅ Capacidad máxima de aulas vs matriculados
- ✅ Franjas configuradas por periodo académico

### Función Objetivo (Sprint 2–3)

```
Minimizar = penalización_docente_solapado
          + penalización_aula_solapada
          + preferencia_horaria_incumplida
          - asignaciones_óptimas
```

---

## 📊 Estado del Proyecto

| Componente | Estado | Sprint |
|---|---|---|
| **API REST Express** | ✅ Funcional (healthcheck) | Sprint 0 |
| **Microservicio CSP** | ⚙️ Stub (INFEASIBLE) | Sprint 0 |
| **Autenticación JWT** | ⚙️ Middleware base listo | Sprint 0 |
| **CRUD Entidades** | 🔲 Pendiente | Sprint 1 |
| **Solver CSP completo** | 🔲 Pendiente | Sprint 2–3 |
| **Integración Express↔CSP** | 🔲 Pendiente | Sprint 2–3 |
| **Exportación PDF/Excel** | 🔲 Pendiente | Sprint 3–4 |
| **Pruebas automatizadas** | ⚙️ Base lista | Sprint 1+ |

---

## 🧪 Pruebas Implementadas

Detalles completos en [TESTING.md](TESTING.md).

| Módulo | Tests | Estado |
|---|---|---|
| API REST Express (`/health`) | Por implementar Sprint 1 | 🔲 |
| Microservicio CSP (`/health`, `/solve`) | Por implementar Sprint 1 | 🔲 |
| Solver OR-Tools | Por implementar Sprint 2–3 | 🔲 |

---

## 🚀 Cómo Levantar el Backend

### Requisitos Previos

- Node.js 20+ y npm
- Python 3.11+ y pip
- Docker y Docker Compose (recomendado)
- PostgreSQL 16 (o usar el contenedor Docker)

### Con Docker Compose (Recomendado)

```bash
# Desde la raíz del proyecto
cp Backend/.env.example Backend/.env
# Editar Backend/.env con las variables reales

docker compose up --build
```

Servicios disponibles:
- API REST: `http://localhost:3001`
- Microservicio CSP: `http://localhost:8000`
- Swagger CSP: `http://localhost:8000/docs`

### API REST Express (Manual)

```bash
cd Backend
npm install
cp .env.example .env
# Completar DATABASE_URL, JWT_SECRET, etc.

npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Healthcheck: `http://localhost:3001/health`

### Microservicio CSP FastAPI (Manual)

```bash
cd Backend/csp-service
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -e ".[dev]"
uvicorn app.main:app --reload --port 8000
```

Healthcheck: `http://localhost:8000/health`  
Docs Swagger: `http://localhost:8000/docs`

### Docker — Solo CSP Service

```bash
cd Backend/csp-service
docker build -t sgoha-csp-service .
docker run --rm -p 8000:8000 sgoha-csp-service
```

---

## 📁 Estructura del Backend

```
Backend/
├── src/
│   ├── index.ts                   ← Bootstrap Express + middlewares
│   ├── routes/
│   │   └── health.ts              ← GET /health
│   ├── middleware/
│   │   └── auth.ts                ← requireAuth, requireRole (JWT)
│   └── lib/
│       └── prisma.ts              ← Singleton PrismaClient
├── prisma/
│   └── schema.prisma              ← Modelos: User, Period, Course, Classroom
├── csp-service/
│   ├── app/
│   │   ├── main.py                ← FastAPI app (GET /health, POST /solve)
│   │   ├── schemas.py             ← Pydantic: SolveRequest, SolveResponse
│   │   └── solver.py              ← Motor CP-SAT (stub Sprint 0)
│   ├── Dockerfile
│   └── pyproject.toml
├── .env.example
├── package.json
└── tsconfig.json
```

---

## 🔑 Variables de Entorno

Ver `.env.example` completo en `Backend/.env.example`.

| Variable | Default | Propósito |
|---|---|---|
| `DATABASE_URL` | — | Conexión PostgreSQL |
| `JWT_SECRET` | — | Secreto JWT (nunca hardcodear) |
| `JWT_EXPIRES_IN` | `8h` | Duración del token (RF-02) |
| `BCRYPT_ROUNDS` | `12` | Cost factor bcrypt (RNF-04) |
| `CORS_ORIGIN` | `http://localhost:5173` | URL del frontend React |
| `CSP_SERVICE_URL` | `http://localhost:8000` | URL del microservicio CSP |
| `PORT` | `3001` | Puerto Express |

Variables del microservicio CSP (`csp-service/.env.example`):

| Variable | Default | Propósito |
|---|---|---|
| `PORT` | `8000` | Puerto uvicorn |
| `LOG_LEVEL` | `INFO` | Nivel de logging |
| `SOLVER_TIMEOUT_SECONDS` | `30` | Límite del solver (RNF-01) |

---

## 📡 Endpoints Disponibles

### API REST Express (`localhost:3001`)

| Método | Ruta | Estado | Descripción |
|---|---|---|---|
| GET | `/health` | ✅ Sprint 0 | Healthcheck del servidor |
| POST | `/auth/login` | 🔲 Sprint 1 | Login JWT |
| GET | `/users` | 🔲 Sprint 1 | Listado de usuarios |
| POST | `/courses` | 🔲 Sprint 1 | Crear curso |
| POST | `/schedule/generate` | 🔲 Sprint 2 | Generar horario (delega al CSP) |

### Microservicio CSP (`localhost:8000`)

| Método | Ruta | Estado | Descripción |
|---|---|---|---|
| GET | `/health` | ✅ Sprint 0 | Healthcheck del microservicio |
| POST | `/solve` | ⚙️ Sprint 0 (stub) | Resolver asignación CSP (RF-07) |
| GET | `/docs` | ✅ Sprint 0 | Swagger UI auto-generado |

#### Contrato `POST /solve`

**Request:**
```json
{
  "period_id": "2026-I",
  "courses": [
    {
      "id": "MAT101",
      "name": "Matemática I",
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

**Response:**
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

`status` puede ser: `OPTIMAL` | `FEASIBLE` | `INFEASIBLE` | `TIMEOUT`

---

## 📚 Documentación Completa

- **[CSP_SERVICE_EXPLAINED.md](CSP_SERVICE_EXPLAINED.md)** — Explicación del microservicio CSP: schemas, solver, algoritmos OR-Tools, restricciones y función objetivo
- **[TESTING.md](TESTING.md)** — Descripción de cada test, cómo ejecutarlos y troubleshooting

---

## 🔗 Requerimientos Relacionados

| RF / RNF | Módulo | Sprint |
|---|---|---|
| RF-01 (Registro de entidades) | `src/routes/*` | Sprint 1 |
| RF-02 (JWT, 4 roles) | `src/middleware/auth.ts` | Sprint 0 |
| RF-07 (Motor CSP) | `csp-service/app/solver.py` | Sprint 2–3 |
| RF-08 (Detección de conflictos) | Respuesta `conflicts[]` | Sprint 2–3 |
| RF-13 (Periodos académicos) | `prisma/schema.prisma` → `Period` | Sprint 0 |
| RF-15 (Logs SHA-256) | A implementar | Sprint 4 |
| RNF-01 (Timeout CSP ≤ 30 s) | `SOLVER_TIMEOUT_SECONDS` | Sprint 0 |
| RNF-04 (OWASP, bcrypt ≥ 12) | `src/index.ts`, `auth.ts` | Sprint 0 |
| RNF-06 (Caché TTL 24 h) | `node-cache` | Sprint 3 |
| RNF-09 (Docker, `.env.example`) | `csp-service/Dockerfile` | Sprint 0 |

---

**Última actualización:** Mayo 2026  
**Versión:** 0.1.0 (Sprint 0)  
**Equipo SGOHA — Universidad Continental, Huancayo, Perú — 2026-I**
