# SGOHA Backend

API REST principal del Sistema de Generacion Optima de Horarios Academicos.

## Stack

- **Node.js 20+** + **TypeScript** (ESM)
- **Express 4** (HTTP server)
- **Prisma 5** + **PostgreSQL 16**
- **bcrypt** (passwords - RNF-04 cost factor >= 12)
- **jsonwebtoken** (JWT - RF-02)
- **zod** (validacion de inputs)
- **helmet** + **cors** (cabeceras de seguridad)

## Setup

```bash
cd Backend
npm install
cp .env.example .env
# editar .env y completar DATABASE_URL, JWT_SECRET, etc.

npm run prisma:generate
npm run prisma:migrate     # crea las tablas en Postgres
npm run dev
```

Servidor en http://localhost:3001 — healthcheck en `/health`.

## Scripts

| Comando | Descripcion |
|---------|-------------|
| `npm run dev` | tsx watch (recarga automatica) |
| `npm run build` | tsc → carpeta `dist/` |
| `npm run start` | ejecuta `dist/index.js` |
| `npm run prisma:generate` | regenera Prisma Client |
| `npm run prisma:migrate` | nueva migracion en desarrollo |
| `npm run prisma:studio` | UI para inspeccionar la BD |
| `npm run lint` | ESLint |

## Estructura

```
Backend/
|-- src/
|   |-- index.ts                # bootstrap Express + middlewares
|   |-- routes/
|   |   `-- health.ts           # GET /health
|   |-- middleware/
|   |   `-- auth.ts             # requireAuth, requireRole (JWT)
|   `-- lib/
|       `-- prisma.ts           # singleton PrismaClient
|-- prisma/
|   `-- schema.prisma           # User, Period, Course, Classroom
|-- .env.example
|-- tsconfig.json
`-- package.json
```

## Variables de entorno

Ver `.env.example`. Variables criticas:

- `DATABASE_URL` — conexion PostgreSQL (`postgresql://user:pass@host:5432/db`).
- `JWT_SECRET` — secreto JWT (generar aleatoriamente, NUNCA hardcodear).
- `JWT_EXPIRES_IN` — duracion de token (default `8h`, RF-02).
- `BCRYPT_ROUNDS` — cost factor bcrypt (>= 12, RNF-04).
- `CORS_ORIGIN` — URL del frontend (default `http://localhost:5173`).
- `CSP_SERVICE_URL` — URL del microservicio CSP (default `http://localhost:8000`).

## Endpoints implementados (Sprint 0)

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/health` | Healthcheck |

Endpoints planeados (Sprint 1+): ver `docs/ejecucion/REQUERIMIENTOS.md`.

## Microservicio CSP

El motor de Satisfaccion de Restricciones esta en una carpeta hermana
(`Backend/csp-service/`) como microservicio FastAPI + OR-Tools. El backend
Express delega la generacion de horarios a ese servicio via HTTP.

## Requerimientos relacionados

| RF / RNF | Implementacion |
|----------|----------------|
| RF-01 (Registro) | rutas CRUD en `src/routes/*` |
| RF-02 (JWT, 4 roles) | `src/middleware/auth.ts` |
| RF-03 (Disponibilidad) | a implementar Sprint 1 |
| RF-04, RF-05, RF-06 (Matricula) | a implementar Sprint 2 |
| RF-13 (Periodos) | `prisma/schema.prisma` modelo `Period` |
| RF-15 (Logs SHA-256) | a implementar Sprint 4 |
| RNF-04 (OWASP, bcrypt >= 12, helmet) | `src/index.ts`, `src/middleware/auth.ts` |
| RNF-09 (Docker, .env.example) | `.env.example` |
