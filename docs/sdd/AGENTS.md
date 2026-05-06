# AGENT.md

## Purpose

This file is a compact Spec-Driven Development guide for agents working on this repository.
Read it before making any change to the codebase.

---

## Project Overview

**SGOHA** (Sistema de Generación Óptima de Horarios Académicos) automates academic schedule generation for universities with flexible curricula using constraint satisfaction optimization.

Current stack:

- `Frontend/`: React 18 + TypeScript + Vite + TanStack Router + shadcn/ui
- `Backend/`: Node.js 20 + TypeScript + Express 4 + Prisma 5 + Supabase
- `Backend/csp-service/`: FastAPI + Python 3.11 + OR-Tools CP-SAT

Current status: **Sprint 0 / Sprint 1**

- Backend exposes only `/health` — business routes are pending (Sprint 1+)
- CSP solver (`Backend/csp-service/app/solver.py`) is a stub that returns `INFEASIBLE`
- Frontend has all routes scaffolded with mock data; real API calls are pending

---

## Current Structure

```
SGOHA/
├── Backend/
│   ├── src/
│   │   ├── index.ts              # Express app bootstrap
│   │   ├── routes/health.ts      # GET /health (only route implemented)
│   │   ├── middleware/auth.ts    # requireAuth, requireRole (JWT)
│   │   └── lib/prisma.ts        # singleton PrismaClient
│   ├── prisma/schema.prisma      # User, Period, Course, Classroom
│   ├── csp-service/              # FastAPI microservice
│   │   └── app/
│   │       ├── main.py           # FastAPI entrypoint, POST /solve
│   │       ├── solver.py         # CP-SAT stub (implement Sprint 2-3)
│   │       └── schemas.py        # SolveRequest / SolveResponse
│   └── README.md
├── Frontend/
│   └── src/
│       ├── routes/               # TanStack Router file-based routes
│       │   ├── index.tsx         # Dashboard (mock data)
│       │   ├── scheduler.tsx     # Schedule generator UI
│       │   ├── calendar.tsx      # Weekly calendar view
│       │   ├── enrollment.tsx    # Enrollment module
│       │   ├── courses.tsx       # Courses CRUD
│       │   ├── classrooms.tsx    # Classrooms CRUD
│       │   ├── periods.tsx       # Academic periods
│       │   ├── reports.tsx       # Reports / export
│       │   ├── audit.tsx         # Audit log
│       │   └── login.tsx         # Auth
│       └── components/
│           ├── layout/           # AppLayout, PageHeader
│           └── ui/               # shadcn/ui + custom (StatCard, SectionCard)
├── docs/
│   ├── inicio/                   # Charter, vision, requirements, team
│   ├── planificacion/            # Backlogs, costs, risk register
│   ├── seguimiento_control/      # ARC42.md
│   ├── ejecucion/                # Technical execution docs
│   └── cierre/                   # Closure documents
├── scripts/                      # Utility scripts (seed, etc.)
└── otros/
```

Do not invent a new root structure unless explicitly requested.

---

## Source of Truth

When working on this project, prioritize these files:

- `Backend/src/index.ts` — Express bootstrap and middleware setup
- `Backend/prisma/schema.prisma` — database schema (source of truth for models)
- `Backend/csp-service/app/schemas.py` — CSP API contract (SolveRequest/SolveResponse)
- `Backend/csp-service/app/solver.py` — CSP solver (stub → implement in Sprint 2-3)
- `Frontend/src/routes/__root.tsx` — root layout and routing
- `docs/seguimiento_control/ARC42.md` — architecture decisions

---

## Functional Scope

**Implemented (Sprint 0):**

- Express server with CORS, helmet, JSON body parsing
- `GET /health` returns `{ status, service, timestamp }`
- Prisma schema: `User` (4 roles), `Period`, `Course`, `Classroom`
- JWT middleware (`requireAuth`, `requireRole`) — wired but no routes use it yet
- FastAPI CSP service with `/health` and `/solve` (stub)
- Frontend scaffolded with all routes, mock data in Dashboard

**Planned (Sprint 1+):**

- `POST /auth/login`, `POST /auth/register` (RF-02)
- CRUD routes: courses, classrooms, teachers, periods (RF-01, RF-03, RF-13)
- Enrollment logic with credit validation (RF-04, RF-05, RF-06)
- CP-SAT solver implementation (RF-07, RF-08) — Sprint 2-3
- Conflict detection and audit log (RF-08, RF-15)
- PDF/Excel report export (RF-09, RF-10)

**Out of scope unless explicitly requested:**

- Real-time updates (WebSockets)
- Student self-service portal
- Production deployment (CI/CD is configured but not production-ready)
- Dynamic solver configuration from UI

---

## System Behavior

**Express backend (port 3001):**

- validates requests with `zod`
- delegates schedule generation to CSP service via HTTP (`CSP_SERVICE_URL`)
- handles auth with JWT (`requireAuth` middleware)
- persists data to Supabase

**CSP microservice (port 8000):**

- receives `SolveRequest` (period_id, courses with teacher_ids/classroom_ids/slots, timeout)
- runs CP-SAT model with boolean variables per (course, teacher, classroom, timeslot)
- returns `SolveResponse` with status (`OPTIMAL|FEASIBLE|INFEASIBLE|TIMEOUT`), assignments, elapsed time
- target: 50 courses resolved in ≤ 30 seconds (RNF-01)

**Frontend (port 5173):**

- calls backend API endpoints (not CSP service directly)
- renders weekly calendar grid from schedule assignments
- provides filters by teacher, room, course, period

---

## API Contract (CSP Microservice)

`POST /solve` — do not change without updating both `solver.py` and `schemas.py`:

```json
// Request
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

// Response
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

---

## Development Strategy

Work incrementally.

Rules:

- implement one meaningful change at a time
- verify each change before moving on
- prefer small safe edits over broad rewrites
- do not mix backend and frontend refactors in one step

---

## Backend Rules (Node.js / Express)

Use and preserve:

- `Express` with modular route files under `src/routes/`
- Prisma for all database access — no raw SQL unless justified
- `zod` for input validation in every route handler
- JWT auth via `requireAuth` / `requireRole` middleware
- `helmet` + `cors` already configured in `src/index.ts` — do not remove

When adding a new route:

1. Create `src/routes/<module>.ts`
2. Export a `Router`
3. Mount it in `src/index.ts` with a versioned prefix (e.g. `/api/v1/courses`)
4. Add corresponding Prisma model if needed

Do not hardcode CSP service URL — always use `process.env.CSP_SERVICE_URL`.

---

## CSP Microservice Rules (FastAPI + OR-Tools)

Use and preserve:

- `FastAPI` for API exposure
- `CP-SAT` as the only solver — do not replace with heuristics
- Pydantic schemas in `schemas.py` as the single contract definition
- modular structure: `main.py` (routing) / `solver.py` (model) / `schemas.py` (types)

When implementing the solver (Sprint 2-3):

- use boolean decision variables: `x[course, teacher, classroom, slot]`
- model hard constraints explicitly with comments referencing the RF
- keep objective terms readable and named
- add early-exit on `TIMEOUT` status
- target: ≤ 30 seconds for 50 courses, 30 teachers, 20 classrooms (RNF-01)

---

## Frontend Rules (React + TypeScript + TanStack Router)

Use and preserve:

- file-based routing under `src/routes/` (TanStack Router convention)
- `PascalCase` for components, `camelCase` for variables and hooks
- shadcn/ui components for all UI primitives — do not add new component libraries
- `StatCard` and `SectionCard` custom components for dashboard blocks
- explicit TypeScript types for all API response shapes

Avoid:

- embedding business logic inside visual components
- changing route file names without updating `routeTree.gen.ts`
- bypassing the TanStack Router `createFileRoute` pattern

---

## Documentation Rules

When behavior changes, update the relevant doc:

- `Backend/README.md` — backend commands, env vars, implemented routes
- `Backend/csp-service/README.md` — CSP solver contract, status, examples
- `docs/ejecucion/CSP_ORTOOLS.md` — solver design and constraint explanation
- `docs/ejecucion/TESTING.md` — how to run tests

---

## Coding Standards

Python (CSP service):

- follow simple, explicit function design
- keep model-building code easy to explain to non-CS audience
- comment each constraint with its RF reference

TypeScript / React:

- `camelCase` for variables and functions
- `PascalCase` for components and types
- keep types explicit when they improve clarity
- prefer `const` over `let`

---

## Safety Boundaries

Do not:

- remove the `/health` route from either service
- modify `prisma/schema.prisma` without creating a migration
- change the `SolveRequest` / `SolveResponse` contract without updating both services
- replace `CP-SAT` with ad-hoc heuristics unless explicitly requested
- break the frontend ↔ backend ↔ CSP service connection chain
- commit `.env` files — only `.env.example`

---

## Validation Checklist

Before finishing any task, verify:

- [ ] Backend starts: `npm run dev` in `Backend/` → `http://localhost:3001/health` responds
- [ ] CSP service starts: `uvicorn app.main:app` in `Backend/csp-service/` → `http://localhost:8000/health` responds
- [ ] Frontend starts: `npm run dev` in `Frontend/` → `http://localhost:5173` renders
- [ ] No TypeScript errors: `npm run build` in `Backend/` and `Frontend/`
- [ ] Affected docs updated

---

## Prompt Template for Another Agent

> You are working on SGOHA (Sistema de Generación Óptima de Horarios Académicos).
> The architecture has three layers: `Frontend/` (React + Vite + TanStack Router),
> `Backend/` (Express + TypeScript + Prisma + Supabase), and
> `Backend/csp-service/` (FastAPI + OR-Tools CP-SAT).
> The project is in Sprint 0-1: only `/health` is implemented in the backend and the
> CSP solver is a stub returning INFEASIBLE.
> Make the smallest safe change that solves the task.
> Preserve the CP-SAT modeling style, the Prisma schema, and the SolveRequest/SolveResponse contract.
> Do not break existing routes or the frontend rendering.
> Update affected docs when behavior changes.

---

## Definition of Done

A task is done when:

- the requested change is implemented and working
- behavior outside the task scope is preserved
- TypeScript and Python code have no errors
- affected docs are updated
- no `.env` files are committed
