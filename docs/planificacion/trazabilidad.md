# Matriz de Trazabilidad y Cobertura — SGOHA

**Proyecto:** Sistema de Generación Óptima de Horarios Académicos (SGOHA)
**Fecha:** Mayo 2026

Esta matriz asegura que cada requerimiento funcional (RF), restricción matemática y regla de negocio haya sido planificada como una Historia de Usuario (HU), codificada y probada.

---

## Matriz de Trazabilidad RWD (Requirement-Work-Deliverable)

| Requerimiento / Restricción (Spec v1.0) | Historia de Usuario | Sprint | Estado de Desarrollo | ID Commit / PR |
|---|---|---|---|---|
| **RF-01, RF-02** (Gestión usuarios) | HU-01, HU-02, HU-03, HU-04, HU-05 | Sprint 1 | ✅ Implementado | `PR #3 (7f8a9b2)` |
| **RF-06** (Disponibilidad docentes) | HU-06 | Sprint 1 | ✅ Implementado | `PR #4 (a1b2c3d)` |
| **RF-03, RF-05** (Cursos y componentes) | HU-07 | Sprint 1 | ✅ Implementado | `PR #5 (e4f5a6b)` |
| **RF-04** (Aulas) | HU-08 | Sprint 1 | ✅ Implementado | `PR #6 (c7d8e9f)` |
| **RF-08** (Ejecutar Etapa 1) | HU-09, HU-10 | Sprint 1 | ✅ Implementado | `PR #7 (b1a2c3d)` |
| **D1-D9** (Restricciones duras CSP) | HU-11 | Sprint 2 | ✅ Implementado | |
| **Regla 2** (No horarios silentes inválidos) | HU-12 | Sprint 2 | ✅ Implementado| |
| **RF-09** (Activar Horario Inst.) | HU-13 | Sprint 2 | ✅ Implementado |  |
| **RF-10, Regla 10** (Ajuste manual) | HU-14 | Sprint 2 | 🔄 En curso | `[En curso]` |
| **B1-B5** (Restricciones blandas) | HU-15 | Sprint 2 | ⬜ Pendiente | — |
| **RF-11, D10, D11** (Etapa 2 - Docentes) | HU-16, HU-17 | Sprint 2 | 🔄 En curso | `[En curso]` |
| **RF-07, D12, D18** (Prerrequisitos) | HU-18 | Sprint 3 | ⬜ Pendiente | — |
| **D13, D14** (Carga académica alumno) | HU-19 | Sprint 3 | ⬜ Pendiente | — |
| **RF-12, D15, D16, D19** (Etapa 3) | HU-20 | Sprint 3 | ⬜ Pendiente | — |
| **D17, Regla 6** (Atomicidad cursos) | HU-21 | Sprint 3 | ⬜ Pendiente | — |
| **RF-12** (Horario Estudiante) | HU-22 | Sprint 3 | ⬜ Pendiente | — |
| **RF-13** (Visualizar Grilla) | HU-23 | Sprint 3 | ⬜ Pendiente | — |
| **RF-14** (Exportar PDF/Excel) | HU-24, HU-25 | Sprint 3 | ⬜ Pendiente | — |
| **RNF-Seguridad** (OWASP) | HU-26 | Sprint 3 | ⬜ Pendiente | — |

---

## Trazabilidad de Roles (Access Matrix)

| Módulo / Endpoint | Rol Requerido | Historia Validante |
|---|---|---|
| `POST /api/auth/register` | Administrador | HU-01, HU-03 |
| `POST /api/auth/login` | Público (Cualquiera) | HU-02 |
| `CRUD /api/students` | Administrador | HU-03, HU-04 |
| `CRUD /api/teachers` | Administrador | HU-03, HU-05 |
| `CRUD /api/courses` | Administrador | HU-03, HU-07 |
| `CRUD /api/classrooms` | Administrador | HU-03, HU-08 |
| `POST /api/schedules/institutional/generate` | Administrador | HU-03, HU-12 |
| `GET /api/schedules/teachers/{id}` | Administrador, Docente (`{id}`) | HU-17 |
| `GET /api/schedules/students/{id}` | Administrador, Estudiante (`{id}`) | HU-22 |

*Cualquier intento de violación cruzada es bloqueado por el middleware (HTTP 403), testeado en las historias correspondientes.*
