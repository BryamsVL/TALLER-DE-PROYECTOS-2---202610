# Análisis de Trazabilidad — SGOHA

**Proyecto:** Sistema de Generación Óptima de Horarios Académicos  
**Mapeo Rúbrica:** 3.5.d — Análisis esperado: trazabilidad y trabajo colaborativo

> Ver también: [Matriz RWD completa](trazabilidad.md) | [Evidencia de integración](evolucion-sistema.md)

---

## 1. Trazabilidad Backlog (Jira) ↔ Commits ↔ Funcionalidades

La siguiente tabla muestra la trazabilidad directa entre cada requerimiento funcional, la historia de usuario que lo implementa y el estado en el repositorio:

| RF / Restricción | Historia de Usuario | Sprint | Estado | Tipo de evidencia |
|---|---|---|---|---|
| RF-01, RF-02 (Gestión usuarios) | HU-01, HU-02, HU-03, HU-04, HU-05 | S1 | ✅ Implementado | Commits `feat(HU-01)` a `feat(HU-05)` |
| RF-06 (Disponibilidad docentes) | HU-06 | S1 | ✅ Implementado | Commit `feat(HU-06)` |
| RF-03, RF-05 (Cursos y componentes) | HU-07 | S1 | ✅ Implementado | Commit `feat(HU-07)` |
| RF-04 (Aulas) | HU-08 | S1 | ✅ Implementado | Commit `feat(HU-08)` |
| RF-08 (Etapa 1 — franjas y traslados) | HU-09, HU-10 | S1 | ✅ Implementado | Commits `feat(HU-09)`, `feat(HU-10)` |
| D1–D9 (Restricciones duras CSP) | HU-11 | S2 | 🔄 En curso | Branch `feature/HU-11-solver-duras` |
| Regla 2 (Sin horarios inválidos silenciosos) | HU-12 | S2 | 🔄 En curso | Branch `feature/HU-12-ejecutar-csp` |
| RF-09 (Activar horario institucional) | HU-13 | S2 | 🔄 En curso | Branch `feature/HU-13-activar-horario` |
| RF-10 (Ajuste manual validado) | HU-14 | S2 | 🔄 En curso | Branch `feature/HU-14-ajuste-manual` |
| B1–B5 (Restricciones blandas) | HU-15 | S2 | ⬜ Pendiente | — |
| RF-11, D10, D11 (Horario docente) | HU-16, HU-17 | S2 | 🔄 En curso | Branch `feature/HU-16-vista-docente` |
| RF-07, D12, D18 (Prerrequisitos) | HU-18 | S3 | ⬜ Pendiente | — |
| D13, D14 (Carga créditos/horas alumno) | HU-19 | S3 | ⬜ Pendiente | — |
| RF-12, D15–D19 (Etapa 3 estudiante) | HU-20, HU-21, HU-22 | S3 | ⬜ Pendiente | — |
| RF-13 (Grilla semanal) | HU-23 | S3 | ⬜ Pendiente | — |
| RF-14 (PDF / Excel) | HU-24, HU-25 | S3 | ⬜ Pendiente | — |
| RNF-Seguridad (OWASP) | HU-26 | S3 | ⬜ Pendiente | — |

---

## 2. Trazabilidad de Control de Acceso (Access Matrix)

Cada endpoint del sistema está protegido según el rol del usuario autenticado, garantizando que la trazabilidad de seguridad es completa:

| Endpoint | Rol requerido | HU que lo valida |
|---|---|---|
| `POST /api/auth/register` | Administrador | HU-01, HU-03 |
| `POST /api/auth/login` | Público | HU-02 |
| `CRUD /api/students` | Administrador | HU-03, HU-04 |
| `CRUD /api/teachers` | Administrador | HU-03, HU-05 |
| `CRUD /api/courses` | Administrador | HU-03, HU-07 |
| `CRUD /api/classrooms` | Administrador | HU-03, HU-08 |
| `POST /api/schedules/institutional/generate` | Administrador | HU-03, HU-12 |
| `GET /api/schedules/teachers/{id}` | Administrador, Docente propio | HU-17 |
| `GET /api/schedules/students/{id}` | Administrador, Estudiante propio | HU-22 |

*Cualquier violación de rol es bloqueada por el middleware `requireRole` con HTTP 403.*

---

## 3. Evidencia de Trabajo Colaborativo Real

El trabajo colaborativo se evidencia a través de los siguientes mecanismos del repositorio:

### Distribución de responsabilidades por integrante

| Integrante | Rol | HUs asignadas | Pts totales |
|---|---|---|---|
| Alberto Patiño | Dev CSP/Backend | HU-04, HU-05, HU-07, HU-08, HU-11, HU-12, HU-15, HU-18, HU-19, HU-20, HU-21 | 45 pts |
| Brianna Cortez | Dev Backend/Auth | HU-01, HU-02, HU-03, HU-06, HU-14, HU-16, HU-17, HU-22 | 32 pts |
| Bryams Vilchez | Dev Frontend/UI | HU-23, HU-24, HU-25 | 11 pts |
| Andre De La Torre | Scrum Master/Dev | HU-09, HU-10, HU-13 | 8 pts |
| Jack Perez | Dev QA/DevOps | HU-26 | 5 pts |
| Edward Flores | Product Owner | Validación y backlog | — |

### Verificación en GitHub
- **Commits por integrante:** Ver [Contributors](https://github.com/BryamsVL/TALLER-DE-PROYECTOS-2---202610/graphs/contributors)
- **Historial de cambios:** Ver [Commits main](https://github.com/BryamsVL/TALLER-DE-PROYECTOS-2---202610/commits/main)
- **Pull Requests revisados:** Ver [Pull Requests](https://github.com/BryamsVL/TALLER-DE-PROYECTOS-2---202610/pulls)
- **Ramas activas:** Ver [Branches](https://github.com/BryamsVL/TALLER-DE-PROYECTOS-2---202610/branches)

---

## 4. Coherencia entre Artefactos

| Artefacto | Referencia cruzada | Estado |
|---|---|---|
| Backlog (`backlog-producto.md`) | HU-01 a HU-26 | ✅ Completo |
| Planificación Jira (`planificacion-jira.md`) | Épicas EP-01 a EP-07 | ✅ Completo |
| Spec (`spec.md`) | Entradas, salidas, RN, edge cases | ✅ Completo |
| AGENTS.md | Restricciones D1–D7, reglas globales | ✅ Completo |
| Trazabilidad RWD | RF → HU → commit | ✅ / 🔄 parcial (commits S1 pendientes de hash) |
| ARC42 | Decisiones de arquitectura | ✅ Completo |
