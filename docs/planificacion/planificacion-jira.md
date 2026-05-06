# Planificación del Proyecto — SGOHA

**Proyecto:** Sistema de Generación Óptima de Horarios Académicos  
**Curso:** Taller de Proyectos 2 · Universidad Continental  
**Sprint actual:** Sprint 2 (en curso)  
**Fecha:** Mayo 2026

---

## 1. Épicas del Proyecto

| ID | Nombre | Descripción | Sprint |
|---|---|---|---|
| EP-01 | Gestión de Entidades Base | Estudiantes, docentes, cursos, aulas y componentes. | Sprint 1 |
| EP-02 | Autenticación y Control de Acceso | Sistema de login JWT y roles (ADMIN, COORDINATOR, etc.). | Sprint 1 |
| EP-03 | Configuración del Período Académico | Franjas horarias, tiempos de traslado y parámetros del ciclo. | Sprint 1 |
| EP-04 | Generación de Horario Institucional | Etapa 1: Solver CSP resolviendo restricciones duras (D1-D9). | Sprint 2 |
| EP-05 | Generación de Horario de Docentes | Etapa 2: Ajuste manual, activación y consideraciones blandas. | Sprint 2 |
| EP-06 | Generación de Horario de Estudiantes | Etapa 3: Matrícula, carga académica y prerrequisitos. | Sprint 3 |
| EP-07 | Visualización y Exportación | Vistas semanales, filtros y reportes en PDF/Excel. | Sprint 3 |

---

## 2. Backlog Completo — 26 Historias de Usuario

| ID | Épica | Historia | Prioridad | Pts | Deps | Restricción CSP | Sprint | Estado |
|---|---|---|---|---|---|---|---|---|
| HU-01 | EP-02 | Como administrador, quiero registrar usuarios, para asignarles roles en el sistema. | Alta | 3 | - | - | 1 | ✅ Terminado |
| HU-02 | EP-02 | Como usuario, quiero iniciar sesión, para acceder a las funciones de mi rol. | Alta | 5 | HU-01 | - | 1 | ✅ Terminado |
| HU-03 | EP-02 | Como administrador, quiero controlar el acceso por rol, para proteger la información. | Alta | 3 | HU-02 | - | 1 | ✅ Terminado |
| HU-04 | EP-01 | Como administrador, quiero gestionar estudiantes, para tener su registro base. | Media | 3 | HU-03 | - | 1 | ✅ Terminado |
| HU-05 | EP-01 | Como administrador, quiero gestionar docentes, para asignarles cursos. | Alta | 3 | HU-03 | - | 1 | ✅ Terminado |
| HU-06 | EP-01 | Como docente, quiero declarar mi disponibilidad, para que se considere en el horario. | Alta | 5 | HU-05 | B1-B3 | 1 | ✅ Terminado |
| HU-07 | EP-01 | Como administrador, quiero gestionar cursos y componentes, para la oferta del período. | Alta | 5 | HU-03 | - | 1 | ✅ Terminado |
| HU-08 | EP-01 | Como administrador, quiero gestionar aulas, para que sean asignadas a las clases. | Alta | 3 | HU-03 | D3 | 1 | ✅ Terminado |
| HU-09 | EP-03 | Como coordinador, quiero configurar las franjas horarias, para delimitar el horario válido. | Alta | 3 | HU-03 | - | 1 | ✅ Terminado |
| HU-10 | EP-03 | Como coordinador, quiero configurar tiempos de traslado y parámetros, para el solver. | Media | 2 | HU-09 | - | 1 | ✅ Terminado |
| HU-11 | EP-04 | Como coordinador, quiero que el motor CSP considere las restricciones duras (D1-D9), para obtener un horario factible. | Alta | 8 | HU-06,07,08,10 | D1-D9 | 2 | 🔄 En curso |
| HU-12 | EP-04 | Como coordinador, quiero ejecutar la generación y ver el resultado, para confirmar el horario. | Alta | 5 | HU-11 | - | 2 | 🔄 En curso |
| HU-13 | EP-05 | Como coordinador, quiero activar y cancelar el horario, para gestionar su vigencia. | Alta | 3 | HU-12 | - | 2 | 🔄 En curso |
| HU-14 | EP-05 | Como coordinador, quiero ajustar asignaciones manualmente, para resolver excepciones. | Media | 5 | HU-12 | - | 2 | 🔄 En curso |
| HU-15 | EP-05 | Como coordinador, quiero que el solver use restricciones blandas (B1-B5), para optimizar puntuaciones. | Media | 5 | HU-11 | B1-B5 | 2 | 🔄 En curso |
| HU-16 | EP-05 | Como docente, quiero ver la vista de mi horario, para conocer mi carga. | Alta | 5 | HU-12 | - | 2 | 🔄 En curso |
| HU-17 | EP-05 | Como docente, quiero consultar mi horario interactivo, para organizarme. | Media | 3 | HU-16 | - | 2 | 🔄 En curso |
| HU-18 | EP-06 | Como estudiante, quiero validación de prerrequisitos, para matricularme correctamente. | Alta | 5 | HU-04,07 | D12-D13 | 3 | ⬜ Pendiente |
| HU-19 | EP-06 | Como coordinador, quiero controlar la carga académica (20-22 cr), para cumplir la norma. | Alta | 3 | HU-18 | D14 | 3 | ⬜ Pendiente |
| HU-20 | EP-06 | Como estudiante, quiero generación automática de mi horario, para evitar conflictos. | Alta | 8 | HU-19 | D18 | 3 | ⬜ Pendiente |
| HU-21 | EP-06 | Como sistema, quiero atomicidad en cursos compuestos, para que lab y teoría no se separen. | Media | 5 | HU-07 | D19 | 3 | ⬜ Pendiente |
| HU-22 | EP-07 | Como estudiante, quiero consultar mi horario, para asistir a mis clases. | Alta | 5 | HU-20 | - | 3 | ⬜ Pendiente |
| HU-23 | EP-07 | Como usuario, quiero una grilla semanal, para ver el horario visualmente. | Alta | 5 | HU-17,22 | - | 3 | ⬜ Pendiente |
| HU-24 | EP-07 | Como coordinador, quiero exportar el horario a PDF, para imprimirlo. | Media | 3 | HU-23 | - | 3 | ⬜ Pendiente |
| HU-25 | EP-07 | Como coordinador, quiero exportar el horario a Excel, para análisis externo. | Media | 3 | HU-23 | - | 3 | ⬜ Pendiente |
| HU-26 | EP-07 | Como administrador, quiero protección OWASP, para mantener el sistema seguro. | Alta | 5 | - | - | 3 | ⬜ Pendiente |

---

## 3. Criterios de Aceptación (Ejemplos Clave)

**HU-11 — Restricciones Duras en Solver:**
```
Dado que el coordinador inicia la generación,
cuando el solver CP-SAT se ejecuta,
entonces se garantizan restricciones como: un docente no está en dos aulas a la vez, y la capacidad del aula no se excede.
```

**HU-20 — Horario Estudiantes:**
```
Dado que el estudiante selecciona sus cursos,
cuando el sistema procesa la solicitud,
entonces no existen cruces horarios y la suma de créditos está entre 20 y 22.
```

---

## 4. Priorización por Valor, Riesgo y Complejidad

*(Resumen de tareas críticas en el proyecto)*

| ID | Historia | Valor | Riesgo | Complejidad | Total | Prioridad |
|---|---|---|---|---|---|---|
| HU-11 | Solver Restricciones Duras | 5 | 5 | 5 | 15 | 🔴 Crítica |
| HU-20 | Generación Horario Estudiante | 5 | 4 | 5 | 14 | 🔴 Crítica |
| HU-02 | Inicio de Sesión | 5 | 3 | 2 | 10 | 🟠 Alta |
| HU-15 | Solver Restricciones Blandas | 4 | 4 | 4 | 12 | 🟠 Alta |
| HU-26 | Protección OWASP | 5 | 3 | 3 | 11 | 🟠 Alta |

---

## 5. Estructura de Sprints

### Sprint 1 — Fundamentos (Completado)
**Duración:** 2 semanas · **Objetivo:** Entidades base y configuración. · **Story Points:** 35 pts (incluye las 10 HUs).
*Alcance:* HU-01 a HU-10.

### Sprint 2 — Horario Institucional y Docentes (En curso)
**Duración:** 2 semanas · **Objetivo:** Generar el horario general utilizando CP-SAT. · **Story Points:** 34 pts.
*Alcance:* HU-11 a HU-17.

### Sprint 3 — Horario Estudiantes y Visualización (Planificado)
**Duración:** 2 semanas · **Objetivo:** PMV Completo. · **Story Points:** 42 pts.
*Alcance:* HU-18 a HU-26.

---

## 6. Releases

| Release | Sprint | Alcance | Fecha objetivo |
|---|---|---|---|
| **v0.1.0** | Sprint 1 | Base de datos, Auth JWT, CRUDs, configuración. | Fin Sprint 1 |
| **v0.2.0** | Sprint 2 | Solver institucional (FastAPI/OR-Tools) funcional. | Fin Sprint 2 |
| **v1.0.0** | Sprint 3 | Sistema completo: Matrícula estudiantes, exportación, UI interactiva. | Fin Sprint 3 |

---

## 7. Cronograma y Ruta Crítica

**Ruta Crítica (Dependencias fuertes):**
`HU-07 (Cursos) + HU-08 (Aulas) + HU-06 (Disp. Docente)` → **`HU-11 (Solver)`** → `HU-12 (Ejecución)` → **`HU-20 (Horario Estudiante)`** → `HU-23 (Visualización)`.

| Semana | Hito Principal | Sprint |
|---|---|---|
| 1-2 | Auth y CRUD de entidades básicas. | Sprint 1 |
| 3 | Configuración del motor CSP en Python. | Sprint 2 |
| 4 | Ejecución del Solver e integraciones. (Release v0.2.0) | Sprint 2 |
| 5 | Validación de prerrequisitos y lógica de estudiante. | Sprint 3 |
| 6 | Interfaz, PDF, y QA de Seguridad. (Release v1.0.0) | Sprint 3 |

---

## 8. Diagrama de Dependencias (Simplificado)

```
[HU-01] -> [HU-02] -> [HU-03]
                        |-> [HU-04, 05, 07, 08, 09]
                        
[HU-05] -> [HU-06] \
[HU-07] -----------> [HU-11 (Solver CSP)] -> [HU-12] -> [HU-13, 14, 16]
[HU-08] -----------/                    \
[HU-10] -----------/                     -> [HU-15]

[HU-04, 07] -> [HU-18] -> [HU-19] -> [HU-20 (Horario Estudiante)] -> [HU-22]
                                                                        \
                                                                  [HU-23 (Grilla)] -> [HU-24, 25]
```
