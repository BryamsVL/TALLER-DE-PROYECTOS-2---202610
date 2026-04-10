## Entregable E — Declaración del equipo del proyecto

### 1. Roles y responsabilidades

| Rol Scrum / Técnico | Integrante | Responsabilidades principales | Módulos asignados |
|---------------------|------------|-------------------------------|-------------------|
| Product Owner | Alberto Patiño | Priorizar el Product Backlog, validar que los entregables cumplan los criterios de aceptación, representar los intereses del negocio. | Documentación, criterios de aceptación, visión del producto. |
| Scrum Master | Andre De La Torre | Facilitar las ceremonias Scrum, remover impedimentos, asegurar que el equipo siga el proceso ágil y mantener el repositorio GitHub organizado. | Git workflow, gestión del proyecto, dailies. |
| Dev — Backend / CSP | Brianna Cortez | Implementar el motor CSP con OR-Tools y desarrollar el microservicio especializado en FastAPI encargado de la generación de horarios. | RF-07 Motor CSP, RF-08 Conflictos, API REST. |
| Dev — Backend / Auth | Edward Flores | Diseñar y desarrollar la API REST principal con Express + Node.js, incluyendo autenticación JWT, módulo de registro de entidades (estudiantes, docentes, cursos, aulas), validaciones de matrícula. | RF-01 Registro, RF-02 Auth, RF-04/05/06 Matrícula. |
| Dev — Frontend / UI | Bryams Vilchez | Implementar la SPA con React + TypeScript, vistas de calendario, formularios de registro y módulo de matrícula, integración con la API REST. | RF-10 Vista, RF-11 Filtros, RF-06 UI matrícula. |
| Dev — QA / DevOps | Jack Perez | Escribir pruebas unitarias y de integración (Pytest + Vitest), configurar Docker Compose, CI/CD con GitHub Actions, exportación de reportes. | RF-12 Exportación, RF-14 Reportes, RF-15 Auditoría. |

---

### 2. Normas de trabajo del equipo

#### Ceremonias Scrum

| Ceremonia | Frecuencia | Duración | Descripción |
|-----------|------------|----------|-------------|
| Sprint Planning | Primer lunes de cada sprint | 60 min | Se define el Sprint Goal y el Sprint Backlog. |
| Daily Standup | Cada día hábil (asíncrono por WhatsApp/Discord) | — | ¿Qué hice ayer? ¿Qué haré hoy? ¿Tengo impedimentos? |
| Sprint Review | Último viernes de cada sprint | 45 min | Demo del incremento y actualización del Product Backlog. |
| Sprint Retrospectiva | Inmediatamente después de la Review | 30 min | ¿Qué funcionó? ¿Qué mejorar? |

#### Normas de Git y desarrollo

- **Ramas:** `main` (producción), `develop` (integración), `feature/nombre-feature` (desarrollo individual).
- **Commits semánticos obligatorios:** `feat:`, `fix:`, `docs:`, `test:`, `chore:` seguido de descripción en español.
- Todo cambio a `develop` requiere Pull Request con revisión de al menos 1 integrante.
- Prohibido hacer push directo a `main`. Solo se permite merge desde `develop` mediante PR aprobado por el Scrum Master.
- Cada issue de GitHub debe tener: descripción, criterios de aceptación y etiqueta de sprint.

#### Normas de comunicación

- Tiempo máximo de respuesta en canales del equipo: 24 horas en días hábiles.
- Las decisiones técnicas importantes se documentan en el archivo `DECISIONS.md` del repositorio.
- Cualquier cambio de alcance requiere aprobación del Product Owner y debe actualizarse en el Project Charter.
- Conflictos entre integrantes se escalan primero al Scrum Master y luego al docente del curso.
