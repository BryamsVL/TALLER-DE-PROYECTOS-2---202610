# Sistema de Generación Óptima de Horarios Académicos (SGOHA)

## Descripción general

Este repositorio corresponde al proyecto universitario desarrollado en el curso Taller de Proyectos 2 — Ingeniería de Sistemas e Informática, Universidad Continental. En el Sprint 0: Inicio del proyecto, el propósito principal es organizar adecuadamente el repositorio, consolidar la documentación inicial y establecer una base formal para el trabajo colaborativo del equipo.

El contenido actual del repositorio está orientado a la definición del problema, la visión inicial del proyecto, la organización documental y la identificación preliminar de requerimientos.

---

## Integrantes del equipo y roles

| Integrante | Rol |
|------------|-----|
| Alberto Patiño | Product Owner |
| Andre De La Torre | Scrum Master |
| Brianna Cortez | Dev — Backend / CSP |
| Edward Flores | Dev — Backend / Auth |
| Bryams Vilchez | Dev — Frontend / UI |
| Jack Perez | Dev — QA / DevOps |

---

## Problemática abordada

Las universidades con currículo flexible, como la Universidad Continental, enfrentan dificultades significativas en la planificación semestral de horarios académicos. El currículo flexible permite que cada estudiante elija su propia carga académica dentro de ciertos rangos, lo que genera una alta variabilidad en la demanda de secciones, docentes y aulas.

El proceso actual de generación de horarios es manual o semiautomático, dependiente del criterio de los coordinadores académicos, y frecuentemente produce resultados con conflictos (solapamientos de horarios, docentes asignados a dos cursos en la misma franja, aulas con capacidad insuficiente), inequidades en la distribución de horarios, y tiempos de procesamiento que se extienden durante semanas.

Como referencia de la formulación inicial del problema, puede revisarse `docs/inicio/PROBLEMA.md` y `docs/Documento inicial del problema.md`.

---

## Objetivo del proyecto

Diseñar e implementar una aplicación web inteligente que genere horarios académicos óptimos, considerando restricciones académicas, operativas y contextuales, bajo un modelo de Satisfacción de Restricciones (CSP), con arquitectura SPA + API REST y cumplimiento de estándares W3C, ISO/IEC 25010, OWASP Top 10, WCAG 2.1 y Green Software.

En el contexto específico del Sprint 0, el objetivo inmediato no es implementar el sistema completo, sino consolidar la documentación base, la organización del equipo y la estructura del repositorio para facilitar el desarrollo posterior del proyecto.

---

## Estado actual del Sprint 0

Actualmente, el proyecto se encuentra en una fase de inicio y organización. En esta etapa se prioriza:

- la definición y presentación formal del problema;
- la declaración de visión del proyecto;
- la identificación preliminar de requerimientos;
- la formalización de roles, normas y compromisos del equipo;
- la organización documental del repositorio para revisión académica.

---

## Estructura del repositorio

La estructura actual del repositorio es la siguiente:

```
|-- README.md
|-- Backend/
|   |-- README.md
|   `-- tests/
|       `-- README.md
|-- docs/
|   |-- declaracion-equipo.md
|   |-- Declaración de la visión del proyecto.md
|   |-- Documento inicial del problema.md
|   |-- Kickoff Project Charter.md
|   |-- Lista preliminar de requerimientos funcionales y no funcionales.md
|   |-- Selección del enfoque del proyecto.md
|   |-- cierre/
|   |   `-- README.md
|   |-- ejecucion/
|   |   |-- README.md
|   |   `-- REQUERIMIENTOS.md
|   |-- inicio/
|   |   |-- ENFOQUE.md
|   |   |-- PROBLEMA.md
|   |   `-- VISION.md
|   |-- Otros/
|   |   `-- README.md
|   `-- seguimiento_control/
|       `-- README.md
`-- Frontend/
    |-- README.md
    `-- tests/
        `-- README.md
```

### Descripción general de carpetas:

- `docs/` : documentación principal del proyecto.
- `docs/inicio/` : documentos base del Sprint 0, incluyendo visión, problema y enfoque.
- `docs/ejecucion/` : documentos vinculados a requerimientos y materiales de ejecución.
- `docs/seguimiento_control/` : espacio destinado al seguimiento y control del proyecto.
- `docs/cierre/` : espacio reservado para documentación de cierre.
- `docs/Otros/` : documentos complementarios.
- `Backend/` : carpeta base del componente de backend.
- `Frontend/` : carpeta base del componente de frontend.

---

## Documentación disponible

Los principales documentos identificados son los siguientes:

| Documento | Ruta |
|---|---|
| Declaración del equipo del proyecto | [docs/declaracion-equipo.md](docs/declaracion-equipo.md) |
| Declaración de visión del proyecto (Resumen) | [docs/inicio/VISION.md](docs/inicio/VISION.md) |
| Declaración de visión del proyecto (Detallado) | [docs/Declaración de la visión del proyecto.md](docs/seguimiento_control/Declaración%20de%20la%20visión%20del%20proyecto.md) |
| Documento inicial del problema (Resumen) | [docs/inicio/PROBLEMA.md](docs/inicio/PROBLEMA.md) |
| Documento inicial del problema (Detallado) | [docs/Documento inicial del problema.md](docs/seguimiento_control/Documento%20inicial%20del%20problema.md) |
| Selección del enfoque del proyecto (Resumen) | [docs/inicio/ENFOQUE.md](docs/inicio/ENFOQUE.md) |
| Selección del enfoque del proyecto (Detallado) | [docs/Selección del enfoque del proyecto.md](docs/seguimiento_control/Selección%20del%20enfoque%20del%20proyecto.md) |
| Requerimientos preliminares (Resumen) | [docs/ejecucion/REQUERIMIENTOS.md](docs/ejecucion/REQUERIMIENTOS.md) |
| Lista preliminar de requerimientos (Completo) | [docs/Lista preliminar de requerimientos funcionales y no funcionales.md](docs/seguimiento_control/Lista%20preliminar%20de%20requerimientos%20funcionales%20y%20no%20funcionales.md) |
| Project Charter | [docs/Kickoff Project Charter.md](docs/seguimiento_control/Kickoff%20Project%20Charter.md) |
| Índice de ejecución | [docs/ejecucion/README.md](docs/ejecucion/README.md) |
| Índice de seguimiento y control | [docs/seguimiento_control/README.md](docs/seguimiento_control/README.md) |
| Índice de cierre | [docs/cierre/README.md](docs/cierre/README.md) |
| Índice de otros documentos | [docs/Otros/README.md](docs/Otros/README.md) |
