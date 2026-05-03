# Backlog del Sprint 1: Configuración Inicial y Gestión de Datos Maestros

**Duración:** 2 Semanas (Fecha estimada: 13/04/2026 - 25/04/2026)
**Objetivo del Sprint:** Establecer la base técnica del proyecto (entorno, arquitectura, repositorio) e implementar los módulos de gestión de usuarios (autenticación) y datos académicos fundamentales (cursos, aulas, periodos). El resultado debe ser una versión temprana pero funcional que permita a los administradores gestionar la información base del sistema.

## Historias de Usuario

| ID | Historia de Usuario | Criterios de Aceptación | Prioridad | Estimación (horas) |
|---|---|---|---|---|
| **HU-01** | **Configuración del Entorno de Desarrollo** <br><br> *Como* desarrollador, <br>*quiero* tener un entorno de desarrollo estandarizado con Docker, un repositorio en GitHub y una pipeline de Integración Continua (CI/CD) configurada, <br>*para* que todos los miembros del equipo trabajen sobre la misma base y los cambios se integren de forma automática y consistente. | 1. El repositorio en GitHub está creado con las ramas `main`, `develop` y `feature/*`. <br>2. Existe un `Dockerfile` y `docker-compose.yml` para levantar los servicios de backend (Node.js) y base de datos (PostgreSQL). <br>3. La pipeline de CI/CD (ej. GitHub Actions) ejecuta pruebas unitarias básicas al hacer `push` a `develop` y `main`. | Alta | 12 |
| **HU-02** | **Diseño de la Arquitectura de la Aplicación** <br><br> *Como* arquitecto de software, <br>*quiero* tener definida y documentada la arquitectura de la aplicación como una SPA con una API REST, <br>*para* que el equipo de desarrollo tenga una guía clara y estandarizada a seguir durante toda la implementación. | 1. Se entrega un documento (en el repositorio) que describe la arquitectura general (Frontend React, Backend Node/Express, API REST, PostgreSQL). <br>2. El documento incluye un diagrama de componentes y la justificación de las decisiones técnicas. <br>3. El equipo revisa y aprueba el documento en una reunión de planificación. | Media | 8 |
| **HU-03** | **Registro y Autenticación de Usuarios** <br><br> *Como* usuario del sistema (administrador, docente, estudiante), <br>*quiero* poder registrarme e iniciar sesión de forma segura en la plataforma, <br>*para* acceder a las funcionalidades específicas según mi rol. | 1. Existe un formulario de registro que permite crear una cuenta con correo electrónico y contraseña. <br>2. Existe un formulario de login que valida las credenciales contra la base de datos. <br>3. Tras un login exitoso, el usuario recibe un token (JWT) y es redirigido a su dashboard correspondiente. <br>4. Las contraseñas se almacenan de forma segura (hashed). | Alta | 16 |
| **HU-04** | **Gestión de Periodos Académicos** <br><br> *Como* administrador del sistema, <br>*quiero* poder crear, listar, editar y eliminar (ABM/CRUD) los periodos académicos (ej. '2026-1', '2026-2'), <br>*para* que el sistema pueda organizar las ofertas de cursos y horarios por ciclo. | 1. Existe una interfaz (página/sección) solo accesible para administradores. <br>2. Desde la interfaz, se puede ver una lista de todos los periodos creados. <br>3. Existen botones o formularios para añadir un nuevo periodo y editar los datos de uno existente. <br>4. Existe la opción de eliminar (o deshabilitar) un periodo, confirmando la acción. | Media | 10 |
| **HU-05** | **Gestión de Aulas** <br><br> *Como* administrador del sistema, <br>*quiero* poder gestionar (ABM/CRUD) las aulas disponibles, incluyendo su nombre, capacidad y tipo (ej. laboratorio, teoría), <br>*para* que el sistema de asignación de horarios tenga en cuenta estos recursos físicos. | 1. Existe una interfaz de administración para listar, crear, editar y eliminar aulas. <br>2. Cada aula tiene al menos los campos: `nombre`, `capacidad` (numérico), `ubicación` y `tipo` (selección). <br>3. Los datos se guardan correctamente en la base de datos. | Media | 8 |
| **HU-06** | **Gestión de Cursos** <br><br> *Como* administrador del sistema, <br>*quiero* poder gestionar (ABM/CRUD) los cursos que ofrece la universidad (ej. 'Matemáticas I', 'Base de Datos'), con su código, nombre, créditos y prerrequisitos, <br>*para* que estos datos estén disponibles para la generación de horarios y la validación de matrícula. | 1. Interfaz para listar, crear, editar y eliminar cursos. <br>2. Un curso tiene: `código` (único), `nombre`, `número_de_creditos` (entero). <br>3. **Prerrequisitos:** Se debe poder seleccionar una lista de otros cursos que son prerrequisitos para el curso actual. <br>4. La interfaz para asignar prerrequisitos es intuitiva (ej. un selector múltiple). | Alta | 14 |

## Tareas Técnicas del Sprint

- **Infraestructura (HU-01, HU-02)**
    - [ ] Inicializar repositorio Git con la estructura base de carpetas (frontend/, backend/, docs/).
    - [ ] Configurar proyecto base con Node.js/Express para el backend.
    - [ ] Configurar proyecto base con React (Vite o CRA) para el frontend.
    - [ ] Crear archivos `Dockerfile` para frontend, backend y DB, y un `docker-compose.yml` maestro.
    - [ ] Configurar pipeline CI en GitHub Actions para correr linters y pruebas.
    - [ ] Escribir documento de arquitectura `docs/architecture.md`.

- **Backend: Autenticación y Usuarios (HU-03)**
    - [ ] Crear modelo de `User` en la base de datos (Prisma/TypeORM/Mongoose) con campos: email, passwordHash, rol ('admin', 'teacher', 'student').
    - [ ] Implementar endpoints de `/api/auth/register` y `/api/auth/login`.
    - [ ] Implementar middleware de autenticación JWT.
    - [ ] Crear y ejecutar migraciones para la base de datos.

- **Frontend: Módulo de Autenticación (HU-03)**
    - [ ] Crear páginas/componentes de Login y Registro.
    - [ ] Implementar lógica para enviar credenciales a la API y almacenar el token JWT en localStorage/context.
    - [ ] Configurar rutas protegidas en el frontend.

- **Backend: ABM de Datos Maestros (HU-04, HU-05, HU-06)**
    - [ ] Crear modelos para `AcademicPeriod`, `Classroom`, `Course`.
    - [ ] Implementar endpoints CRUD completos (GET, POST, PUT/PATCH, DELETE) para cada uno de los tres modelos.
    - [ ] Añadir validación en el backend para asegurar que solo usuarios con rol `admin` accedan a estos endpoints.
    - [ ] Implementar lógica especial para la gestión de `prerrequisitos` en el endpoint de cursos.

- **Frontend: ABM de Datos Maestros (HU-04, HU-05, HU-06)**
    - [ ] Crear páginas/dashboards de administración para Periodos, Aulas y Cursos.
    - [ ] Implementar tablas para listar los ítems (con opciones de editar/eliminar).
    - [ ] Implementar formularios modales o páginas separadas para la creación/edición.
    - [ ] Para la edición de cursos, crear un componente especial para seleccionar múltiples prerrequisitos.

---
