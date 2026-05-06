# Planificación Jira — SGOHA

**Proyecto:** Sistema de Generación Óptima de Horarios Académicos (SGOHA)
**Fecha:** Mayo 2026

---

## Estructura de Épicas y Sprints

El proyecto está dividido en 7 Épicas y 3 Sprints.

| ID | Nombre | Sprint |
|---|---|---|
| **EP-01** | Gestión de Entidades Base | Sprint 1 |
| **EP-02** | Autenticación y Control de Acceso | Sprint 1 |
| **EP-03** | Configuración del Período Académico | Sprint 1 |
| **EP-04** | Generación de Horario Institucional (Etapa 1) | Sprint 2 |
| **EP-05** | Generación de Horario de Docentes (Etapa 2) | Sprint 2 |
| **EP-06** | Generación de Horario de Estudiantes (Etapa 3) | Sprint 3 |
| **EP-07** | Visualización y Exportación | Sprint 3 |

---

## Desglose de Sprints y Tareas (HUs)

### Sprint 1: Fundamentos del Sistema (Completado)
**Duración:** 2 Semanas
**Objetivo:** Construir la base funcional del sistema (autenticación, gestión de entidades y configuración del período académico).

| Epic | ID | Historia de Usuario | Estado Jira | Puntos | Responsable |
|---|---|---|---|---|---|
| EP-02 | HU-01 | Registro de Usuarios | ✅ Done | 3 | Edward Flores |
| EP-02 | HU-02 | Inicio de Sesión | ✅ Done | 5 | Edward Flores |
| EP-02 | HU-03 | Control de Acceso por Rol | ✅ Done | 3 | Edward Flores |
| EP-01 | HU-04 | Gestión de Estudiantes | ✅ Done | 3 | Alberto Patiño |
| EP-01 | HU-05 | Gestión de Docentes | ✅ Done | 3 | Alberto Patiño |
| EP-01 | HU-06 | Gestión de Disponibilidad de Docentes | ✅ Done | 5 | Edward Flores |
| EP-01 | HU-07 | Gestión de Cursos y Componentes | ✅ Done | 5 | Alberto Patiño |
| EP-01 | HU-08 | Gestión de Aulas | ✅ Done | 3 | Alberto Patiño |
| EP-03 | HU-09 | Configuración de Franjas Horarias | ✅ Done | 3 | Andre De La Torre |
| EP-03 | HU-10 | Configuración de Tiempos de Traslado y Parámetros | ✅ Done | 2 | Andre De La Torre |

**Total Puntos Sprint 1:** 35 pts

---

### Sprint 2: Generación de Horario Institucional y de Docentes (En Curso)
**Duración:** 2 Semanas
**Objetivo:** Implementar el motor OR-Tools, ejecución del algoritmo institucional, activación y ajuste manual.

| Epic | ID | Historia de Usuario | Estado Jira | Puntos | Responsable |
|---|---|---|---|---|---|
| EP-04 | HU-11 | Modelado de Restricciones Duras en OR-Tools | 🔄 In Progress | 8 | Alberto Patiño |
| EP-04 | HU-12 | Ejecución y Resultado de la Generación | 🔄 In Progress | 5 | Alberto Patiño |
| EP-04 | HU-13 | Activación y Cancelación del Horario Institucional | 🔄 In Progress | 3 | Andre De La Torre |
| EP-04 | HU-14 | Ajuste Manual de Asignaciones | 🔄 In Progress | 5 | Edward Flores |
| EP-04 | HU-15 | Restricciones Blandas y Puntuación del Horario | ⬜ To Do | 5 | Alberto Patiño |
| EP-05 | HU-16 | Generación de Vista de Horario por Docente | 🔄 In Progress | 5 | Edward Flores |
| EP-05 | HU-17 | Consulta de Horario por el Docente | ⬜ To Do | 3 | Edward Flores |

**Total Puntos Sprint 2:** 34 pts

---

### Sprint 3: Horario de Estudiantes, Visualización y Exportación (Planificado)
**Duración:** 2 Semanas
**Objetivo:** Generación automatizada de horario por estudiante, reportes y seguridad aplicativa.

| Epic | ID | Historia de Usuario | Estado Jira | Puntos | Responsable |
|---|---|---|---|---|---|
| EP-06 | HU-18 | Validación de Prerrequisitos y Corequisitos | ⬜ To Do | 5 | Alberto Patiño |
| EP-06 | HU-19 | Control de Carga Académica del Estudiante | ⬜ To Do | 5 | Alberto Patiño |
| EP-06 | HU-20 | Generación Automática del Horario de Estudiantes | ⬜ To Do | 8 | Alberto Patiño |
| EP-06 | HU-21 | Atomicidad de Cursos Compuestos | ⬜ To Do | 5 | Alberto Patiño |
| EP-06 | HU-22 | Consulta de Horario por el Estudiante | ⬜ To Do | 3 | Edward Flores |
| EP-07 | HU-23 | Grilla Semanal de Horario | ⬜ To Do | 5 | Bryams Vilchez |
| EP-07 | HU-24 | Exportación del Horario en PDF | ⬜ To Do | 3 | Bryams Vilchez |
| EP-07 | HU-25 | Exportación del Horario en Excel | ⬜ To Do | 3 | Bryams Vilchez |
| EP-07 | HU-26 | Protección ante Vulnerabilidades OWASP | ⬜ To Do | 5 | Jack Perez |

**Total Puntos Sprint 3:** 42 pts

---

## Cronograma, Dependencias y Ruta Crítica

El proyecto sigue una secuencia de ejecución lineal donde el entregable de una fase es prerrequisito estricto de la siguiente.

### Ruta Crítica
La ruta crítica del proyecto está trazada por el desarrollo del Motor CSP y la interfaz de visualización:
1. **Paso 1:** Gestión de Aulas, Docentes y Franjas (S1).
2. **Paso 2:** Modelado D1-D9 en OR-Tools (HU-11, S2). *[Punto de Bloqueo Mayor]*
3. **Paso 3:** Ejecución del algoritmo institucional (HU-12, S2).
4. **Paso 4:** Generación de horarios individuales de Estudiantes (HU-20, S3).
5. **Paso 5:** Renderizado interactivo en la Grilla Semanal (HU-23, S3).

Cualquier desviación de tiempo en HU-11 impactará en cadena a todo el Sprint 3, por lo que es la principal variable de riesgo controlada (ver registro de riesgos).

---

## Carga por Integrante (Estimación Global)

- **Alberto Patiño (Backend/CSP):** 45 pts (Mayormente concentrado en solver matemático S2/S3)
- **Edward Flores (Backend/Auth):** 32 pts (Autenticación y endpoints)
- **Bryams Vilchez (Frontend):** 11 pts (UI/Grillas y exportación)
- **Andre De La Torre (Scrum Master):** 8 pts (Apoyo backend + franjas)
- **Jack Perez (QA/DevOps):** 5 pts (Seguridad OWASP + Testing)
- **Brianna Cortez (PO):** Validación y levantamiento de backlog (No asignada a HUs técnicas)
