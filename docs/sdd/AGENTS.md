# AGENTS.md (Constitución para Agentes IA)

## Propósito

Este archivo es una guía compacta de Spec-Driven Development para los desarrolladores y agentes IA que trabajan en este repositorio.
Debe leerse antes de realizar cualquier cambio en el código fuente.

---

## Resumen del Proyecto

**SGOHA** (Sistema de Generación Óptima de Horarios Académicos) automatiza la generación de horarios para universidades con currículo flexible mediante optimización y satisfacción de restricciones (CSP).

Stack actual:

- `Frontend/`: React 18 + TypeScript + Vite + TanStack Router + shadcn/ui
- `Backend/`: Node.js 20 + TypeScript + Express 4 + Prisma 5 + Supabase
- `Backend/csp-service/`: FastAPI + Python 3.11 + OR-Tools CP-SAT

Estado actual: **Sprint 1 Completado / Sprint 2 En curso**

- El backend expone `/health` y las rutas base de entidades.
- El solver CSP (`Backend/csp-service/app/solver.py`) está en desarrollo.
- El frontend tiene las rutas generadas y datos simulados; pendiente la integración total de API.

---

## Estructura Actual

```
SGOHA/
├── Backend/
│   ├── src/
│   │   ├── index.ts              # Arranque de la app Express
│   │   ├── routes/health.ts      # GET /health
│   │   ├── middleware/auth.ts    # requireAuth, requireRole (JWT)
│   │   └── lib/prisma.ts         # Singleton de PrismaClient
│   ├── prisma/schema.prisma      # User, Period, Course, Classroom
│   ├── csp-service/              # Microservicio FastAPI
│   │   └── app/
│   │       ├── main.py           # Entrypoint de FastAPI, POST /solve
│   │       ├── solver.py         # Motor CP-SAT (Sprint 2)
│   │       └── schemas.py        # SolveRequest / SolveResponse
│   └── README.md
├── Frontend/
│   └── src/
│       ├── routes/               # Rutas basadas en archivos (TanStack Router)
│       │   ├── index.tsx         # Dashboard
│       │   ├── scheduler.tsx     # Interfaz del generador de horarios
│       │   ├── calendar.tsx      # Vista de calendario semanal
│       │   ├── enrollment.tsx    # Módulo de matrícula
│       │   ├── courses.tsx       # CRUD de Cursos
│       │   ├── classrooms.tsx    # CRUD de Aulas
│       │   ├── periods.tsx       # Períodos académicos
│       │   ├── reports.tsx       # Reportes / exportación
│       │   ├── audit.tsx         # Log de auditoría
│       │   └── login.tsx         # Autenticación
│       └── components/
│           ├── layout/           # AppLayout, PageHeader
│           └── ui/               # shadcn/ui + custom (StatCard, SectionCard)
├── docs/                         # Toda la documentación de la Rúbrica
├── scripts/                      # Scripts de utilidad
└── otros/
```

No inventar una nueva estructura raíz a menos que se solicite explícitamente.

---

## Fuente de la Verdad

Al trabajar en este proyecto, priorizar estos archivos:

- `Backend/src/index.ts` — Bootstrap de Express y configuración de middleware.
- `Backend/prisma/schema.prisma` — Esquema de la base de datos (fuente de verdad para modelos).
- `Backend/csp-service/app/schemas.py` — Contrato API del CSP (SolveRequest/SolveResponse).
- `Backend/csp-service/app/solver.py` — Motor CSP.
- `Frontend/src/routes/__root.tsx` — Layout raíz y enrutamiento.
- `docs/arquitectura/ARC42.md` — Decisiones de arquitectura.

---

## Alcance Funcional

**Planeado e Implementado (Sprint 1 - 3):**

- `POST /auth/login`, `POST /auth/register` (Seguridad JWT).
- Rutas CRUD: cursos, aulas, docentes, períodos.
- Lógica de matrícula con validación de créditos (20-22).
- Implementación del motor CP-SAT (Algoritmo CSP).
- Detección de conflictos y log de auditoría.
- Exportación de reportes PDF/Excel.

**Fuera del alcance (A menos que se solicite expresamente):**

- Actualizaciones en tiempo real (WebSockets).
- Portal de autogestión de pagos para estudiantes.
- Configuración dinámica del motor desde la interfaz de usuario.

---

## Comportamiento del Sistema

**Backend Express (puerto 3001):**
- Valida peticiones con `zod`.
- Delega la generación de horarios al servicio CSP vía HTTP (`CSP_SERVICE_URL`).
- Maneja la autenticación con JWT (`requireAuth`).
- Persiste los datos en PostgreSQL (Supabase).

**Microservicio CSP (puerto 8000):**
- Recibe un `SolveRequest` (period_id, cursos con teacher_ids/classroom_ids/slots, timeout).
- Ejecuta el modelo CP-SAT con variables booleanas por (curso, docente, aula, franja).
- Retorna un `SolveResponse` con estado (`OPTIMAL|FEASIBLE|INFEASIBLE|TIMEOUT`), asignaciones y tiempo transcurrido.
- Objetivo de rendimiento: Resolver 50 cursos en ≤ 30 segundos.

**Frontend (puerto 5173):**
- Llama a los endpoints del API del backend (nunca al servicio CSP directamente).
- Renderiza la grilla de calendario semanal basándose en las asignaciones.

---

## Contrato API (Microservicio CSP)

`POST /solve` — No cambiar sin actualizar tanto `solver.py` como `schemas.py`:

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

## Estrategia de Desarrollo

Reglas estrictas de desarrollo:
- Implementar un solo cambio significativo a la vez.
- Verificar cada cambio antes de continuar.
- Preferir ediciones pequeñas y seguras sobre reescrituras masivas.
- No mezclar refactorizaciones de backend y frontend en un solo paso.

---

## Reglas del Backend (Node.js / Express)

- Usar `Express` con archivos de ruta modulares bajo `src/routes/`.
- Usar Prisma para todo el acceso a base de datos — nada de SQL crudo sin justificación.
- Usar `zod` para la validación de entradas en cada manejador de rutas.
- Usar middleware de autenticación JWT (`requireAuth` / `requireRole`).
- No codificar de forma rígida (hardcode) la URL del servicio CSP — siempre usar `process.env.CSP_SERVICE_URL`.

---

## Reglas del Microservicio CSP (FastAPI + OR-Tools)

- Usar `FastAPI` para la exposición de la API.
- Usar `CP-SAT` como el único motor de resolución — no reemplazar con heurísticas ad-hoc.
- Mantener la estructura modular: `main.py` (enrutamiento) / `solver.py` (modelo) / `schemas.py` (tipos Pydantic).
- Modelar las restricciones duras (Hard Constraints) explícitamente con comentarios que referencien la especificación oficial.
- Añadir salida temprana en estado de `TIMEOUT` (30s).

---

## Límites de Seguridad

Bajo ninguna circunstancia:
- Eliminar la ruta `/health` de ningún servicio.
- Modificar `prisma/schema.prisma` sin crear una migración de base de datos.
- Romper el contrato `SolveRequest` / `SolveResponse`.
- Romper la cadena de conexión Frontend ↔ Backend ↔ Servicio CSP.
- Comprometer archivos `.env` (solo usar `.env.example`).

---

## Definición de "Hecho" (Definition of Done)

Una tarea está terminada cuando:
- El cambio solicitado está implementado y funciona.
- El comportamiento fuera del alcance de la tarea se mantiene inalterado.
- El código TypeScript y Python no tiene errores (Build exitoso).
- La documentación afectada (Rúbrica, Spec) ha sido actualizada.
- No se han subido archivos de variables de entorno con credenciales reales al repositorio.
