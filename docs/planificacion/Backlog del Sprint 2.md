# Backlog del Sprint 2: Lógica de Negocio e Implementación del Motor CSP

**Duración:** 2 Semanas (Fecha estimada: 28/04/2026 - 10/05/2026)
**Objetivo del Sprint:** Implementar las reglas de negocio centrales del sistema de horarios. Esto incluye la lógica de disponibilidad de docentes, la validación de prerrequisitos y créditos para estudiantes, y el desarrollo de la primera versión funcional del motor CSP usando OR-Tools para la generación automática de horarios sin conflictos.

## Historias de Usuario

| ID | Historia de Usuario | Criterios de Aceptación | Prioridad | Estimación (horas) |
|---|---|---|---|---|
| **HU-07** | **Definición de Disponibilidad Docente** <br><br> *Como* administrador, <br>*quiero* poder asignar y gestionar los horarios de disponibilidad de cada profesor (días y horas en que no puede tener clases), <br>*para* que el motor de horarios evite asignar clases en esos bloques de tiempo. | 1. Existe una interfaz donde, para cada profesor, se puede seleccionar bloques de "no disponibilidad" (ej. Lunes 8-10 am). <br>2. Los datos de disponibilidad se guardan en la base de datos asociados al profesor y al periodo académico. <br>3. Esta información es consumida por el motor CSP como una restricción obligatoria (*hard constraint*). | Alta | 12 |
| **HU-08** | **Definición de Cursos y Prerrequisitos por Docente** <br><br> *Como* administrador, <br>*quiero* asignar qué cursos dictará cada profesor en un periodo académico, teniendo en cuenta los prerrequisitos de los cursos, <br>*para* que el sistema sepa qué cursos deben ser asignados y quién los dicta. | 1. Interfaz para crear la "Oferta Académica" de un periodo. <br>2. Se puede seleccionar un curso de la lista general y luego asignarle uno o más profesores de la lista. <br>3. El sistema informa si el profesor asignado no cumple con algún prerrequisito (ej. título, especialidad) – aunque esto podría ser una validación manual inicialmente. | Alta | 14 |
| **HU-09** | **Validación de Créditos y Prerrequisitos para el Estudiante** <br><br> *Como* estudiante, <br>*quiero* que al momento de seleccionar mis cursos para un periodo, el sistema valide automáticamente si cumplo con el acumulado de créditos y los prerrequisitos de cada curso, <br>*para* que no pueda inscribirme en cursos para los que no estoy habilitado. | 1. En la interfaz de "Pre-matrícula" del estudiante, se muestra la lista de cursos ofertados. <br>2. Los cursos que no cumplen con los prerrequisitos o el mínimo de créditos acumulados aparecen deshabilitados o con un mensaje de advertencia claro. <br>3. Si el estudiante intenta seleccionar un curso no habilitado, el sistema lo impide y le explica la razón. | Media | 10 |
| **HU-10** | **Generación Automática de Horario con CSP (MVP)** <br><br> *Como* administrador académico, <br>*quiero* que el sistema genere automáticamente un horario de clases semanal, asignando cursos a aulas y franjas horarias, respetando todas las reglas (disponibilidad, capacidad de aula, etc.), <br>*para* optimizar el uso de recursos y ahorrar tiempo en la planificación manual. | 1. Existe un botón o comando para ejecutar el generador de horarios para un periodo específico. <br>2. El sistema retorna un horario sin conflictos (ningún profesor/aula está en dos lugares a la vez) y que respeta las *hard constraints* básicas. <br>3. El horario resultante se puede visualizar en una vista de calendario semanal (por aula o por profesor). <br>4. Si no es posible encontrar un horario que cumpla todas las reglas, el sistema informa de la imposibilidad y sugiere las restricciones que podrían relajarse. | Alta | 24 |

## Tareas Técnicas del Sprint

- **Backend: Modelos y Lógica de Restricciones**
    - [ ] Crear modelos para `TeacherAvailability`, `CourseOffer` (que conecta `AcademicPeriod`, `Course` y `Teacher`).
    - [ ] Implementar lógica de validación de prerrequisitos y créditos en el backend (servicio `EnrollmentValidator`).
    - [ ] Crear endpoints para gestionar disponibilidad de profesores (CRUD).
    - [ ] Crear endpoints para gestionar la oferta académica (asignar profesor a un curso en un periodo).

- **Frontend: Gestión de Restricciones y Oferta**
    - [ ] Crear interfaz para la gestión de disponibilidad de profesores (vista por profesor, selección de bloques).
    - [ ] Crear interfaz para construir la oferta académica: seleccionar un periodo, y luego añadir "cursos ofertados" asignándoles profesores.
    - [ ] En la vista de estudiante, consumir el servicio de validación para mostrar la lista de cursos habilitados/no habilitados.

- **Integración e Implementación del Motor CSP (OR-Tools)**
    - [ ] **Configuración:** Añadir la librería `google-or-tools` al backend.
    - [ ] **Modelado del Problema:** Definir las variables de decisión (por ejemplo: `Asignacion[curso_ofertado, franja_horaria, aula]`).
    - [ ] **Definición de Dominios:** Crear listas de franjas horarias (ej. Lunes 7-9am, Lunes 9-11am, ...) y de aulas.
    - [ ] **Implementación de Restricciones Fuertes (Hard):**
        - [ ] Un curso se dicta en una sola franja y aula.
        - [ ] Un profesor no puede dictar dos cursos a la vez.
        - [ ] Un aula no puede albergar dos cursos a la vez.
        - [ ] Respetar la disponibilidad de los profesores.
        - [ ] La capacidad del aula >= número de estudiantes estimado para el curso.
    - [ ] **Función Objetivo (Opcional para MVP):** Minimizar franjas horarias "no deseadas" (ej. evitar clases a primera hora).
    - [ ] **API del Solver:** Crear un endpoint `/api/schedule/generate` que reciba el `periodId`, ejecute el modelo de OR-Tools y guarde el resultado en una nueva tabla `ScheduleAssignment`.

- **Frontend: Visualización de Horarios**
    - [ ] Crear un componente de vista de calendario (puede ser usando una librería como `FullCalendar` o construido con tablas CSS).
    - [ ] Consumir el horario generado desde el backend.
    - [ ] Permitir alternar vistas: horario por aula y horario por profesor.
    - [ ] Añadir la interfaz de usuario para iniciar el proceso de generación (un botón de "Generar Horario" con indicador de carga).

---
