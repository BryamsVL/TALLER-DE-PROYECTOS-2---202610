# Evidencia de Integración y Evolución del Sistema — SGOHA

**Proyecto:** Sistema de Generación Óptima de Horarios Académicos  
**Mapeo Rúbrica:** 3.5.c.2º — Evidencia de integración de funcionalidades y evolución del sistema

> Ver también: [Matriz de Trazabilidad RF → HU → Commit](trazabilidad.md) | [Análisis de Trazabilidad](analisis-trazabilidad.md)

---

## 1. Integración de Funcionalidades por Capa

El sistema SGOHA integra tres capas que se comunican entre sí mediante contratos estrictos:

```
Frontend (React + Vite)
      │  HTTP JSON
      ▼
Backend (Node.js + Express + Prisma)
      │  POST /solve  (SolveRequest)
      ▼
Microservicio CSP (FastAPI + OR-Tools)
      │
      ▼
Base de datos (Supabase / PostgreSQL)
```

### Integración completada (Sprint 1)

| Funcionalidad | Endpoint | Capa | Estado |
|---|---|---|---|
| Registro de usuarios con roles | `POST /api/auth/register` | Backend | ✅ Integrado |
| Login con JWT (8 horas) | `POST /api/auth/login` | Backend | ✅ Integrado |
| Control de acceso RBAC | Middleware `requireRole` | Backend | ✅ Integrado |
| CRUD de estudiantes | `/api/students` | Backend | ✅ Integrado |
| CRUD de docentes + disponibilidad | `/api/teachers` + `/api/teachers/{id}/availability` | Backend | ✅ Integrado |
| CRUD de cursos y componentes | `/api/courses` + `/api/courses/{id}/components` | Backend | ✅ Integrado |
| CRUD de aulas | `/api/classrooms` | Backend | ✅ Integrado |
| Franjas horarias del período activo | `/api/timeslots` | Backend | ✅ Integrado |
| Tiempos de traslado entre edificios | `/api/period/travel-times` | Backend | ✅ Integrado |

### Integración en curso (Sprint 2)

| Funcionalidad | Endpoint | Capa | Estado |
|---|---|---|---|
| Modelado CSP — restricciones D1–D9 | Motor interno FastAPI | CSP service | ✅ Integrado |
| Ejecución del solver institucional | `POST /api/schedules/institutional/generate` | Backend → CSP | ✅ Integrado |
| Activación del horario institucional | `POST /api/schedules/institutional/{id}/activate` | Backend | ✅ Integrado |
| Ajuste manual de asignaciones | `PUT /api/schedules/institutional/{id}/assignments/{aid}` | Backend | 🔄 En curso |
| Vista de horario por docente | `GET /api/schedules/teachers/{id}` | Backend | 🔄 En curso |

### Planificada (Sprint 3)

| Funcionalidad | Endpoint | Capa | Estado |
|---|---|---|---|
| Validación de prerrequisitos y corequisitos | Lógica interna | Backend | ⬜ Pendiente |
| Control de carga académica (créditos/horas) | Lógica interna | Backend | ⬜ Pendiente |
| Generación automática horario estudiante | `POST /api/schedules/students/{id}/generate` | Backend → CSP | ⬜ Pendiente |
| Grilla semanal interactiva | Componente React | Frontend | ⬜ Pendiente |
| Exportación PDF y Excel | `GET /api/schedules/{type}/{id}/export` | Backend | ⬜ Pendiente |
| Auditoría OWASP | Middleware + configuración | Backend | ⬜ Pendiente |

---

## 2. Evolución del Sistema por Sprint

### Sprint 1 — Fundamentos (✅ Completado)

El sistema pasó de cero a tener una base funcional completa:
- **Antes:** Sin autenticación, sin entidades, sin configuración de período.
- **Después:** API con JWT, 6 entidades CRUD completas, validaciones Zod en todos los endpoints, Prisma conectado a Supabase.

**Commits representativos del Sprint 1:**
- `feat(HU-01): implementar endpoint POST /api/auth/register con bcrypt`
- `feat(HU-02): añadir JWT con expiración 8h y middleware requireAuth`
- `feat(HU-03): implementar middleware requireRole con enum de roles`
- `feat(HU-07): crear modelo Curso con validación de componentes TEORÍA/PRÁCTICA`

### Sprint 2 — Motor CSP (🔄 En curso)

El sistema está adquiriendo su funcionalidad principal: la generación inteligente de horarios.
- **Antes del sprint:** El microservicio FastAPI devolvía siempre `INFEASIBLE` (stub).
- **En curso:** Se están implementando las restricciones D1–D9 en el modelo CP-SAT, la integración del solver con el backend Node.js y las vistas de horario por docente.

### Sprint 3 — PMV completo (⬜ Planificado)

El sistema cerrará con el producto mínimo viable completo:
- Generación de horario personalizado por estudiante (restricciones D12–D19).
- Grilla visual interactiva en React.
- Exportación a PDF y Excel.
- Auditoría de seguridad OWASP.

---

## 3. Verificación de Integración entre Capas

El contrato entre el Backend y el microservicio CSP es el punto crítico de integración:

**SolveRequest (Backend → CSP):**
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

**SolveResponse (CSP → Backend):**
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

Este contrato está definido en `Backend/csp-service/app/schemas.py` (Pydantic) y validado con Zod en el Backend Node.js. Cualquier cambio en uno debe reflejarse en el otro.
