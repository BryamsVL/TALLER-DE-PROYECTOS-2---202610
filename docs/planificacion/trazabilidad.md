# Trazabilidad — SGOHA

**Proyecto:** Sistema de Generación Óptima de Horarios Académicos

---

## 1. Responsables por Módulo

| Módulo | Responsable Principal | HUs Relacionadas |
|---|---|---|
| Auth y Usuarios | Edward Flores | HU-01, 02, 03 |
| Entidades (CRUD) | Edward / Alberto | HU-04, 05, 06, 07, 08 |
| Config Período | Andre De La Torre | HU-09, 10 |
| Backend CSP / OR-Tools | Alberto Patiño | HU-11, 12, 13, 14, 15 |
| Horario Docentes | Alberto / Edward | HU-16, 17 |
| Horario Estudiantes | Alberto Patiño | HU-18, 19, 20, 21, 22 |
| Frontend UI Visual | Bryams Vilchez | HU-23, Grillas visuales |
| Exportación / Archivos | Bryams / Jack | HU-24, 25 |
| Seguridad / DevOps | Jack Perez | HU-26, CI/CD |
| Documentación / PO | Brianna Cortez | General, Trazabilidad, QA |

---

## 2. Matriz de Trazabilidad (26 Historias de Usuario)

| HU | Funcionalidad | Rama | Commit | PR | Responsable | Estado | Restricción CSP |
|---|---|---|---|---|---|---|---|
| **SPRINT 1 (Completado)** | | | | | | | |
| HU-01 | Registro Usuarios | `feature/HU-01` | `[Pendiente]` | `[Pendiente]` | Edward | ✅ Terminado | - |
| HU-02 | Inicio Sesión | `feature/HU-02` | `[Pendiente]` | `[Pendiente]` | Edward | ✅ Terminado | - |
| HU-03 | Control Acceso | `feature/HU-03` | `[Pendiente]` | `[Pendiente]` | Edward | ✅ Terminado | - |
| HU-04 | Gestión Estudiantes| `feature/HU-04` | `[Pendiente]` | `[Pendiente]` | Alberto | ✅ Terminado | - |
| HU-05 | Gestión Docentes | `feature/HU-05` | `[Pendiente]` | `[Pendiente]` | Alberto | ✅ Terminado | - |
| HU-06 | Disp. Docente | `feature/HU-06` | `[Pendiente]` | `[Pendiente]` | Edward | ✅ Terminado | B1-B3 |
| HU-07 | Gestión Cursos | `feature/HU-07` | `[Pendiente]` | `[Pendiente]` | Alberto | ✅ Terminado | - |
| HU-08 | Gestión Aulas | `feature/HU-08` | `[Pendiente]` | `[Pendiente]` | Alberto | ✅ Terminado | D3 |
| HU-09 | Config Franjas | `feature/HU-09` | `[Pendiente]` | `[Pendiente]` | Andre | ✅ Terminado | - |
| HU-10 | Tiempos/Parámetros| `feature/HU-10` | `[Pendiente]` | `[Pendiente]` | Andre | ✅ Terminado | - |
| **SPRINT 2 (En curso)** | | | | | | | |
| HU-11 | Restricciones Duras| `feature/HU-11` | `[En curso]` | `[En curso]` | Alberto | 🔄 En curso | D1-D9 |
| HU-12 | Generación Horario | `feature/HU-12` | `[En curso]` | `[En curso]` | Alberto | 🔄 En curso | - |
| HU-13 | Activar Horario | `feature/HU-13` | `[En curso]` | `[En curso]` | Andre | 🔄 En curso | - |
| HU-14 | Ajuste Manual | `feature/HU-14` | `[En curso]` | `[En curso]` | Edward | 🔄 En curso | - |
| HU-15 | Restric. Blandas | `feature/HU-15` | `[En curso]` | `[En curso]` | Alberto | 🔄 En curso | B1-B5 |
| HU-16 | Vista Horario Doc | `feature/HU-16` | `[En curso]` | `[En curso]` | Edward | 🔄 En curso | D10, D11 |
| HU-17 | Consulta Horario | `feature/HU-17` | `[En curso]` | `[En curso]` | Edward | 🔄 En curso | - |
| **SPRINT 3 (Planificado)**| | | | | | | |
| HU-18 | Valid. Prerreq | `feature/HU-18` | `[Pendiente]` | `[Pendiente]` | Alberto | ⬜ Pendiente | D12, D13 |
| HU-19 | Control Carga (20-22)|`feature/HU-19` | `[Pendiente]` | `[Pendiente]` | Alberto | ⬜ Pendiente | D14 |
| HU-20 | Horario Estudiante | `feature/HU-20` | `[Pendiente]` | `[Pendiente]` | Alberto | ⬜ Pendiente | D18 |
| HU-21 | Atomicidad Cursos | `feature/HU-21` | `[Pendiente]` | `[Pendiente]` | Alberto | ⬜ Pendiente | D19 |
| HU-22 | Consulta Estudiante| `feature/HU-22` | `[Pendiente]` | `[Pendiente]` | Alberto | ⬜ Pendiente | - |
| HU-23 | Grilla Semanal | `feature/HU-23` | `[Pendiente]` | `[Pendiente]` | Bryams | ⬜ Pendiente | - |
| HU-24 | Exportación PDF | `feature/HU-24` | `[Pendiente]` | `[Pendiente]` | Jack | ⬜ Pendiente | - |
| HU-25 | Exportación Excel | `feature/HU-25` | `[Pendiente]` | `[Pendiente]` | Jack | ⬜ Pendiente | - |
| HU-26 | Protección OWASP | `feature/HU-26` | `[Pendiente]` | `[Pendiente]` | Jack | ⬜ Pendiente | - |

> *Nota: Reemplazar `[Pendiente]` con los Hashes y #PRs de GitHub reales durante la retrospectiva del sprint.*

---

## 3. Checklist de Evidencias

### Sprint 1
- [x] HU-01 a HU-10 Completadas.
- [x] Documentos de planificación inicial y Sprint 1 en `docs/Sprint_1`.
- [x] Diagramas de BD finalizados.

### Sprint 2
- [ ] Modelado Matemático CSP funcional en Python.
- [ ] Endpoints de generación conectando Express y FastAPI.
- [ ] Vistas UI de horario de docentes.

### Sprint 3
- [ ] Módulo completo de estudiantes.
- [ ] Exportaciones PDF/Excel operativas.
- [ ] Tests End-to-End completos.
