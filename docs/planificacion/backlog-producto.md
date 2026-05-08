# Épicas, Sprints e Historias de Usuario — SGOHA

**Versión:** 1.0
**Fecha:** Mayo 2026
**Proyecto:** SGOHA — Sistema de Generación Óptima de Horarios Académicos
**Curso:** Taller de Proyectos 2

---

## Épicas del Proyecto

| ID | Nombre | Descripción | Sprint |
|---|---|---|---|
| **EP-01** | Gestión de Entidades Base | Registro y administración de todas las entidades del sistema: estudiantes, docentes, cursos, aulas y componentes de curso. | Sprint 1 |
| **EP-02** | Autenticación y Control de Acceso | Registro de usuarios, inicio de sesión, gestión de sesiones y control de acceso por rol (Administrador, Docente, Estudiante). | Sprint 1 |
| **EP-03** | Configuración del Período Académico | Definición de franjas horarias, tiempos de traslado entre edificios, límites de créditos y parámetros del período activo. | Sprint 1 |
| **EP-04** | Generación de Horario Institucional (Etapa 1) | Ejecución del motor OR-Tools para asignar componentes de curso a docentes, aulas y franjas sin solapamientos. Activación y ajuste manual del horario resultante. | Sprint 2 |
| **EP-05** | Generación de Horario de Docentes (Etapa 2) | Construcción de la vista personalizada de horario para cada docente derivada del horario institucional activo. | Sprint 2 |
| **EP-06** | Generación de Horario de Estudiantes (Etapa 3) | Asignación automática de cursos al estudiante respetando prerrequisitos, créditos, horas semanales, vacantes y turno preferido. | Sprint 3 |
| **EP-07** | Visualización y Exportación | Grilla semanal interactiva por rol y exportación de horarios en PDF y Excel. | Sprint 3 |

---

## Sprint 1 — Fundamentos del Sistema

**Objetivo:** Construir la base funcional del sistema: autenticación, gestión de entidades y configuración del período académico. Al cierre de este sprint el sistema debe permitir registrar todos los datos necesarios para ejecutar la generación de horarios.

**Épicas cubiertas:** EP-01, EP-02, EP-03

**Duración estimada:** 2 semanas

---

### EP-02 — Autenticación y Control de Acceso

---

#### HU-01 — Registro de Usuarios

**1. Descripción**

**1.1 Historia:**
Como administrador, quiero registrar usuarios con roles (administrador, docente, estudiante) para controlar el acceso al sistema según las responsabilidades de cada actor.

**1.2 Criterios de aceptación:**
- El sistema crea el usuario con el rol asignado y la contraseña hasheada con bcrypt (cost factor ≥ 10).
- No permite roles fuera del conjunto definido (administrador, docente, estudiante).
- Devuelve error 400 si el email ya existe en el sistema.
- Devuelve error 400 si algún campo obligatorio (nombre, email, contraseña, rol) está ausente o vacío.
- La respuesta exitosa retorna el usuario creado sin exponer la contraseña hasheada.

**2. Subtareas:**
- Diseñar el modelo de datos `Usuario` con campos: id, nombre, email, password_hash, rol, fecha_creacion.
- Implementar el endpoint `POST /api/auth/register` con validación de campos obligatorios y unicidad de email.
- Integrar bcrypt con cost factor ≥ 10 para el hasheo de contraseñas.
- Implementar validación del enum de roles permitidos.
- Escribir pruebas unitarias: registro exitoso, email duplicado, rol inválido, campos faltantes.

**3. Elementos de trabajo vinculados:**
- RF-01, RF-02 (gestión de administrador y docente como usuarios del sistema)
- RNF: Seguridad — autenticación y gestión de sesiones

---

#### HU-02 — Inicio de Sesión

**1. Descripción**

**1.1 Historia:**
Como usuario registrado (administrador, docente o estudiante), quiero iniciar sesión con mis credenciales para acceder a las funcionalidades correspondientes a mi rol.

**1.2 Criterios de aceptación:**
- El sistema verifica el email y la contraseña contra el registro almacenado.
- Ante credenciales válidas, retorna un JWT firmado con expiración de 8 horas.
- Ante credenciales inválidas, retorna error 401 con mensaje genérico (sin indicar cuál campo es incorrecto).
- El JWT incluye en su payload: id de usuario, email y rol.
- Un JWT expirado retorna HTTP 401 en el siguiente request autenticado.

**2. Subtareas:**
- Implementar el endpoint `POST /api/auth/login` con verificación de contraseña mediante bcrypt.
- Configurar la generación de JWT con payload mínimo (id, email, rol) y expiración de 8 horas.
- Implementar middleware de autenticación que valide el JWT en cada request protegido.
- Escribir pruebas unitarias: login exitoso por cada rol, contraseña incorrecta, email inexistente, token expirado.

**3. Elementos de trabajo vinculados:**
- RNF: Seguridad — autenticación y gestión de sesiones
- RNF: Seguridad — control de acceso por roles

---

#### HU-03 — Control de Acceso por Rol

**1. Descripción**

**1.1 Historia:**
Como sistema, quiero restringir el acceso a cada endpoint según el rol del usuario autenticado para garantizar que ningún actor pueda ejecutar operaciones fuera de su ámbito.

**1.2 Criterios de aceptación:**
- Cada endpoint verifica el rol del usuario autenticado antes de ejecutar la operación.
- Un Estudiante que intenta acceder a un endpoint de Administrador recibe error 403.
- Un Docente que intenta activar el horario institucional recibe error 403.
- Un request sin JWT válido recibe error 401.
- Los errores 401 y 403 incluyen un mensaje descriptivo del motivo del rechazo.

**2. Subtareas:**
- Implementar decoradores o middleware de autorización por rol en FastAPI.
- Definir la matriz de acceso: qué endpoints son accesibles por cada rol.
- Aplicar el control de acceso a todos los endpoints existentes y futuros.
- Escribir pruebas de autorización: acceso correcto por rol, acceso denegado por rol incorrecto, acceso sin token.

**3. Elementos de trabajo vinculados:**
- RNF: Seguridad — control de acceso por roles
- RNF: Seguridad — protección ante vulnerabilidades OWASP

---

### EP-01 — Gestión de Entidades Base

---

#### HU-04 — Gestión de Estudiantes

**1. Descripción**

**1.1 Historia:**
Como administrador, quiero registrar, editar, consultar y eliminar estudiantes en el sistema para mantener actualizado el padrón de usuarios que participarán en la generación de horarios.

**1.2 Criterios de aceptación:**
- El sistema permite crear un estudiante con campos: código (único), nombre, ciclo, carrera, turno preferido, límite de créditos y límite de horas semanales.
- No permite códigos duplicados; retorna error 400 con mensaje de duplicado.
- La lista de cursos aprobados solo acepta códigos de cursos existentes en el catálogo; retorna error 400 si alguno no existe.
- Las operaciones de edición, eliminación y búsqueda por código o nombre funcionan correctamente con datos válidos.
- El listado completo carga en ≤ 3 segundos.

**2. Subtareas:**
- Diseñar el modelo de datos `Estudiante` con todos sus campos y la relación con `Curso` para cursos aprobados.
- Implementar los endpoints CRUD: `POST`, `GET`, `PUT`, `DELETE /api/students` y `GET /api/students/{id}`.
- Implementar validación de unicidad de código y existencia de cursos aprobados referenciados.
- Implementar búsqueda por código y nombre (filtro en listado).
- Escribir pruebas unitarias: creación exitosa, código duplicado, curso aprobado inexistente, edición y eliminación.

**3. Elementos de trabajo vinculados:**
- RF-01 — Gestionar Estudiantes
- EP-06 — Generación de Horario de Estudiantes (consumirá estos datos)

---

#### HU-05 — Gestión de Docentes

**1. Descripción**

**1.1 Historia:**
Como administrador, quiero registrar, editar, consultar y eliminar docentes en el sistema para contar con el padrón completo de profesores disponibles para la asignación de componentes.

**1.2 Criterios de aceptación:**
- El sistema permite crear un docente con campos: código (único), nombre y área de especialización.
- No permite códigos duplicados; retorna error 400 con mensaje de duplicado.
- Las operaciones de edición, eliminación y búsqueda por código o nombre funcionan correctamente.
- El listado completo carga en ≤ 3 segundos.

**2. Subtareas:**
- Diseñar el modelo de datos `Docente` con sus campos y la relación con `FranjaHoraria` para disponibilidad.
- Implementar los endpoints CRUD: `POST`, `GET`, `PUT`, `DELETE /api/teachers` y `GET /api/teachers/{id}`.
- Implementar validación de unicidad de código.
- Escribir pruebas unitarias: creación exitosa, código duplicado, edición y eliminación.

**3. Elementos de trabajo vinculados:**
- RF-02 — Gestionar Docentes
- HU-06 — Gestión de Disponibilidad de Docentes

---

#### HU-06 — Gestión de Disponibilidad de Docentes

**1. Descripción**

**1.1 Historia:**
Como administrador, quiero registrar y actualizar la disponibilidad horaria semanal de cada docente para que el motor OR-Tools utilice únicamente las franjas en las que el docente puede ser asignado.

**1.2 Criterios de aceptación:**
- El sistema permite registrar franjas de disponibilidad por docente: día, hora de inicio, hora de fin, marcadas como disponible o no disponible.
- Las franjas registradas se almacenan correctamente y son recuperables por docente.
- El motor CSP no genera asignaciones fuera de las franjas marcadas como disponibles (D3).
- Si un docente no tiene franjas disponibles, el sistema reporta el conflicto sin bloquear el resto del proceso.

**2. Subtareas:**
- Implementar los endpoints `POST /api/teachers/{id}/availability` y `GET /api/teachers/{id}/availability`.
- Diseñar la estructura de datos para franjas de disponibilidad (día, hora_inicio, hora_fin, disponible).
- Integrar la disponibilidad del docente como dominio de variable en el motor OR-Tools (restricción D3).
- Implementar el caso EA-01: docente sin disponibilidad registrada no bloquea la generación.
- Escribir pruebas unitarias: registro de disponibilidad, recuperación por docente, validación de formato de franja.

**3. Elementos de trabajo vinculados:**
- RF-06 — Gestionar Disponibilidad de Docentes
- Restricción D3 del Spec v2.0
- Escenario atípico EA-01

---

#### HU-07 — Gestión de Cursos y Componentes

**1. Descripción**

**1.1 Historia:**
Como administrador, quiero registrar cursos con sus componentes (GENERAL, TEORÍA o PRÁCTICA) para que el motor de optimización conozca la estructura de cada asignatura antes de generar el horario.

**1.2 Criterios de aceptación:**
- El sistema permite crear un curso con: código (único), nombre, créditos ∈ [1,6], horas semanales ≥ 1, prerrequisitos y corequisitos.
- Los prerrequisitos y corequisitos referenciados deben existir en el catálogo; retorna error 400 si alguno no existe.
- Un curso acepta exactamente un componente GENERAL o la combinación TEORÍA + PRÁCTICA; cualquier otra configuración retorna error 400.
- La suma de horas de los componentes debe coincidir con el total del curso; retorna error 400 si difieren.
- No permite códigos de curso duplicados.

**2. Subtareas:**
- Diseñar los modelos de datos `Curso` y `ComponenteCurso` con sus campos y relaciones.
- Implementar los endpoints CRUD para cursos: `POST`, `GET`, `PUT`, `DELETE /api/courses`.
- Implementar los endpoints para componentes: `POST`, `GET /api/courses/{id}/components`.
- Implementar validación de configuración de componentes (GENERAL vs. TEORÍA+PRÁCTICA, suma de horas).
- Implementar validación de existencia de prerrequisitos y corequisitos referenciados.
- Escribir pruebas unitarias: creación exitosa, configuración inválida de componentes, horas inconsistentes, prerrequisito inexistente.

**3. Elementos de trabajo vinculados:**
- RF-03 — Gestionar Cursos
- RF-05 — Gestionar Componentes de Curso
- Restricción D17 del Spec v2.0 (atomicidad de cursos compuestos)

---

#### HU-08 — Gestión de Aulas

**1. Descripción**

**1.1 Historia:**
Como administrador, quiero registrar y administrar las aulas disponibles con su capacidad, tipo y franjas de disponibilidad para que el motor de optimización pueda asignarlas correctamente a los componentes de curso.

**1.2 Criterios de aceptación:**
- El sistema permite crear un aula con: código (único), capacidad > 0, tipo (regular / laboratorio) y franjas de disponibilidad.
- No permite capacidad igual a 0 o negativa; retorna error 400 con mensaje descriptivo.
- No permite tipos fuera del conjunto definido (regular / laboratorio).
- No permite códigos duplicados.
- Las franjas de disponibilidad del aula son respetadas por el motor CSP (D4).

**2. Subtareas:**
- Diseñar el modelo de datos `Aula` con sus campos y la relación con `FranjaHoraria` para disponibilidad.
- Implementar los endpoints CRUD: `POST`, `GET`, `PUT`, `DELETE /api/classrooms` y `GET /api/classrooms/{id}`.
- Implementar validación de capacidad > 0 y validación del enum de tipo.
- Implementar los endpoints de disponibilidad del aula: `POST /api/classrooms/{id}/availability`.
- Integrar la disponibilidad del aula como dominio en el motor OR-Tools (restricción D4).
- Escribir pruebas unitarias: creación exitosa, capacidad inválida, tipo inválido, código duplicado.

**3. Elementos de trabajo vinculados:**
- RF-04 — Gestionar Aulas
- Restricciones D2, D4, D5 y D8 del Spec v2.0

---

### EP-03 — Configuración del Período Académico

---

#### HU-09 — Configuración de Franjas Horarias

**1. Descripción**

**1.1 Historia:**
Como administrador, quiero definir el catálogo de franjas horarias del período académico activo para que el motor OR-Tools disponga del universo de bloques de tiempo válidos durante la generación.

**1.2 Criterios de aceptación:**
- El sistema permite crear franjas horarias con: día de la semana, hora de inicio, hora de fin y turno (mañana / tarde / noche).
- No permite franjas con hora de fin igual o anterior a la hora de inicio.
- No permite turnos fuera del conjunto definido.
- Las franjas quedan asociadas al período académico activo.
- El listado de franjas es consultable y editable por el Administrador.

**2. Subtareas:**
- Diseñar el modelo de datos `FranjaHoraria` y su relación con el período académico.
- Implementar los endpoints CRUD: `POST`, `GET`, `PUT`, `DELETE /api/timeslots`.
- Implementar validación de coherencia hora_inicio < hora_fin y validación del enum de turno.
- Asociar las franjas al período académico activo en la base de datos.
- Escribir pruebas unitarias: creación exitosa, franja inválida (hora_fin ≤ hora_inicio), turno inválido.

**3. Elementos de trabajo vinculados:**
- RF-08 — Ejecutar Etapa 1 (el motor CSP consume estas franjas como dominio)
- EP-04 — Generación de Horario Institucional

---

#### HU-10 — Configuración de Tiempos de Traslado y Parámetros del Período

**1. Descripción**

**1.1 Historia:**
Como administrador, quiero registrar los tiempos de traslado entre edificios y los límites del período académico (créditos máximos, horas semanales máximas) para que el motor CSP los utilice como restricciones físicas y académicas durante la generación.

**1.2 Criterios de aceptación:**
- El sistema permite registrar el tiempo de traslado en minutos entre cada par de edificios.
- El sistema permite definir el límite global de créditos por período y el límite de horas semanales por período.
- Los tiempos de traslado son utilizados por el motor CSP para verificar la factibilidad de bloques consecutivos en edificios distintos (D9, D19).
- Los límites del período actúan como techo para los límites individuales del estudiante.

**2. Subtareas:**
- Diseñar el modelo de datos `TiempoTraslado` (edificio_origen, edificio_destino, minutos) y `ConfiguracionPeriodo`.
- Implementar los endpoints: `POST /api/period/travel-times`, `GET /api/period/travel-times`, `PUT /api/period/config`.
- Integrar los tiempos de traslado en la validación de restricciones D9 (docente) y D19 (estudiante) del motor CSP.
- Escribir pruebas unitarias: registro de tiempo de traslado, configuración de límites, validación de factibilidad de traslado consecutivo.

**3. Elementos de trabajo vinculados:**
- Restricciones D9 y D19 del Spec v2.0
- Escenarios atípicos EA-10 y EA-11

---

## Sprint 2 — Generación de Horario Institucional y de Docentes

**Objetivo:** Implementar las Etapas 1 y 2 del sistema: generación automática del horario institucional mediante OR-Tools, activación, ajuste manual y construcción de la vista de horario por docente.

**Épicas cubiertas:** EP-04, EP-05

**Duración estimada:** 2 semanas

---

### EP-04 — Generación de Horario Institucional (Etapa 1)

---

#### HU-11 — Modelado de Restricciones Duras en OR-Tools

**1. Descripción**

**1.1 Historia:**
Como sistema, quiero que el motor OR-Tools tenga codificadas todas las restricciones duras D1–D9 para garantizar que ninguna asignación del horario institucional las viole.

**1.2 Criterios de aceptación:**
- El modelo CSP incluye variables de asignación para cada componente de curso: `X(k) = (docente, aula, franja)`.
- Las restricciones D1–D9 están implementadas como constraints en OR-Tools y no pueden violarse en ninguna solución generada.
- El solver aplica la heurística MRV (Minimum Remaining Values) para priorizar componentes con menor dominio.
- El modelo retorna `EXITOSO` si encuentra solución completa o `FALLIDO` con lista de conflictos si no.

**2. Subtareas:**
- Definir las variables de decisión del modelo CSP en OR-Tools (una por componente de curso).
- Implementar la restricción D1: un docente no puede tener dos componentes en el mismo bloque horario.
- Implementar la restricción D2: un aula no puede alojar dos componentes en el mismo bloque horario.
- Implementar las restricciones D3, D4: dominio de docentes y aulas limitado a sus franjas disponibles.
- Implementar las restricciones D5, D6: tipo de aula compatible y habilitación docente–componente.
- Implementar las restricciones D7, D8: horas exactas por componente y capacidad suficiente del aula.
- Implementar la restricción D9: factibilidad de traslado entre edificios en bloques consecutivos del docente.
- Configurar la heurística MRV como estrategia de selección de variable en OR-Tools.
- Escribir pruebas unitarias para cada restricción dura (D1–D9) de forma independiente.

**3. Elementos de trabajo vinculados:**
- RF-08 — Ejecutar Etapa 1
- Restricciones D1–D9 del Spec v2.0
- Escenarios atípicos EA-01 a EA-05

---

#### HU-12 — Ejecución y Resultado de la Generación del Horario Institucional

**1. Descripción**

**1.1 Historia:**
Como administrador, quiero ejecutar la generación automática del horario institucional y recibir el resultado (solución completa o reporte de conflictos) para decidir si activarlo o ajustarlo.

**1.2 Criterios de aceptación:**
- El endpoint de generación ejecuta el solver de OR-Tools con los datos del período activo.
- El resultado se produce en ≤ 30 segundos bajo el escenario base del PMV (100 est., 20 doc., 20 cursos, 10 aulas).
- Si el solver encuentra solución completa, retorna el horario en estado BORRADOR.
- Si el solver no encuentra solución o agota el tiempo límite (30 s), retorna los conflictos identificados sin persistir ningún horario inválido.
- Cada conflicto reportado identifica el recurso afectado y la restricción violada.

**2. Subtareas:**
- Implementar el endpoint `POST /api/schedules/institutional/generate` que invoca el motor OR-Tools.
- Implementar el límite de tiempo de 30 segundos en el solver y el manejo del timeout (EA-13).
- Implementar la lógica de generación del reporte de conflictos con identificación de recurso y restricción.
- Persistir el horario generado en estado BORRADOR si la solución es completa o parcial.
- Escribir pruebas de integración: generación exitosa, generación con conflictos, timeout del solver.
- Medir el tiempo de ejecución bajo el escenario base del PMV y documentar el resultado.

**3. Elementos de trabajo vinculados:**
- RF-08 — Ejecutar Etapa 1
- Regla de operación 2 (prohibición de horarios inválidos silenciosos)
- Escenario atípico EA-13

---

#### HU-13 — Activación y Cancelación del Horario Institucional

**1. Descripción**

**1.1 Historia:**
Como administrador, quiero activar o cancelar el horario institucional en estado BORRADOR para controlar qué horario queda disponible como base para las etapas siguientes.

**1.2 Criterios de aceptación:**
- El endpoint de activación verifica cero solapamientos en el BORRADOR antes de cambiar el estado a ACTIVO.
- Un horario ACTIVO no puede modificarse directamente; debe cancelarse primero.
- Al cancelar un horario ACTIVO, todos los recursos quedan liberados para nueva asignación.
- La Etapa 2 no puede iniciarse sin un horario institucional en estado ACTIVO; retorna error descriptivo.
- Las operaciones de activación y cancelación son transaccionales (commit completo o rollback).

**2. Subtareas:**
- Implementar el endpoint `POST /api/schedules/institutional/{id}/activate` con verificación de solapamientos previa al cambio de estado.
- Implementar el endpoint `POST /api/schedules/institutional/{id}/cancel` con liberación de recursos.
- Implementar el ciclo de estados: BORRADOR → ACTIVO → CANCELADO y las transiciones válidas.
- Implementar el bloqueo de modificaciones directas sobre un horario ACTIVO (retorna error 409).
- Escribir pruebas de integración: activación exitosa, activación con solapamientos pendientes, cancelación y liberación de recursos.

**3. Elementos de trabajo vinculados:**
- RF-09 — Activar Horario Institucional
- Regla de operación 3 (ciclo de vida del horario institucional)
- Escenario atípico EA-12

---

#### HU-14 — Ajuste Manual de Asignaciones

**1. Descripción**

**1.1 Historia:**
Como administrador, quiero modificar manualmente las asignaciones del horario institucional en estado BORRADOR y recibir validación en tiempo real para corregir conflictos antes de activarlo.

**1.2 Criterios de aceptación:**
- El sistema permite reasignar un componente seleccionando una nueva combinación de docente, aula y franja.
- La validación de solapamientos se produce en ≤ 1 segundo tras la acción del Administrador.
- Si la nueva combinación produce solapamiento, el sistema rechaza el cambio e indica el recurso en conflicto y la franja afectada.
- Los cambios válidos se persisten en el BORRADOR sin afectar ningún horario ACTIVO.
- Solo se pueden ajustar horarios en estado BORRADOR; los ACTIVOS retornan error 409.

**2. Subtareas:**
- Implementar el endpoint `PUT /api/schedules/institutional/{id}/assignments/{assignmentId}`.
- Implementar la validación en tiempo real de solapamientos (D1 y D2) con respuesta en ≤ 1 segundo.
- Implementar la lógica de presentación de opciones compatibles (docentes disponibles, aulas disponibles, franjas libres) para cada componente.
- Implementar el bloqueo de ajuste sobre horarios en estado distinto a BORRADOR.
- Escribir pruebas unitarias: ajuste sin conflicto, ajuste con solapamiento de docente, ajuste con solapamiento de aula, intento sobre horario ACTIVO.

**3. Elementos de trabajo vinculados:**
- RF-10 — Ajustar Horario Institucional Manualmente
- Regla de operación 10 (validación en tiempo real)
- Restricciones D1 y D2 del Spec v2.0

---

#### HU-15 — Restricciones Blandas y Puntuación del Horario

**1. Descripción**

**1.1 Historia:**
Como administrador, quiero que el motor OR-Tools optimice el horario generado según criterios de calidad (restricciones blandas) para obtener una distribución más eficiente de recursos además de satisfacer las restricciones obligatorias.

**1.2 Criterios de aceptación:**
- El solver intenta minimizar huecos entre clases (B1), carga consecutiva del docente (B2) y concentración de bloques en un solo día (B3).
- El solver prefiere aulas con capacidad cercana a la matrícula real del curso (B4).
- El solver prefiere asignar TEORÍA y PRÁCTICA en días distintos (B5).
- Las restricciones blandas solo se optimizan si las duras ya están satisfechas.
- El horario generado incluye una puntuación interna que refleja el grado de cumplimiento de las restricciones blandas.

**2. Subtareas:**
- Implementar las restricciones blandas B1–B5 como términos de penalización en la función objetivo de OR-Tools.
- Configurar los pesos de cada penalización de acuerdo con la prioridad establecida en el Spec v2.0.
- Incluir la puntuación del horario en el response del endpoint de generación.
- Escribir pruebas de integración: verificar que el solver prioriza soluciones con mayor puntuación cuando existen múltiples soluciones válidas.

**3. Elementos de trabajo vinculados:**
- Restricciones blandas B1–B5 del Spec v2.0
- RF-08 — Ejecutar Etapa 1

---

### EP-05 — Generación de Horario de Docentes (Etapa 2)

---

#### HU-16 — Generación de Vista de Horario por Docente

**1. Descripción**

**1.1 Historia:**
Como administrador, quiero generar las vistas individuales de horario para cada docente a partir del horario institucional activo para que cada profesor pueda consultar sus asignaciones del período.

**1.2 Criterios de aceptación:**
- La Etapa 2 solo puede ejecutarse sobre un horario institucional en estado ACTIVO; retorna error descriptivo en caso contrario.
- La vista de cada docente incluye: nombre del curso, tipo de componente, aula, franja y día.
- La vista se genera en ≤ 5 segundos por docente.
- El indicador de carga horaria semanal muestra el total de horas asignadas por día.
- Si un docente supera 4 horas consecutivas, se emite la alerta de carga excesiva (B2).

**2. Subtareas:**
- Implementar el endpoint `POST /api/schedules/teachers/generate` que procesa el horario ACTIVO y construye las vistas.
- Implementar el endpoint `GET /api/schedules/teachers/{teacherId}` para consultar la vista individual.
- Implementar el cálculo de carga horaria semanal por docente agrupada por día.
- Implementar la detección de bloques consecutivos excesivos y la emisión de alerta (B2).
- Escribir pruebas de integración: generación exitosa, intento sin horario ACTIVO, docente sin asignaciones, detección de carga excesiva.

**3. Elementos de trabajo vinculados:**
- RF-11 — Ejecutar Etapa 2
- Restricciones D10 y D11 del Spec v2.0
- Restricción blanda B2

---

#### HU-17 — Consulta de Horario por el Docente

**1. Descripción**

**1.1 Historia:**
Como docente, quiero consultar mi horario asignado para el período activo y verificar que no existen solapamientos ni conflictos en mis asignaciones.

**1.2 Criterios de aceptación:**
- El docente autenticado puede consultar únicamente su propio horario; intentar acceder al de otro docente retorna error 403.
- La vista muestra todos los componentes asignados con: curso, componente, aula, franja y día.
- La vista indica el total de horas semanales asignadas.
- Si existe alerta de carga excesiva, se muestra de forma visible en la respuesta.
- La consulta retorna en ≤ 3 segundos.

**2. Subtareas:**
- Configurar el endpoint `GET /api/schedules/teachers/{teacherId}` para validar que el docente autenticado solo accede a su propio recurso.
- Implementar la respuesta con el indicador de carga excesiva si aplica.
- Escribir pruebas de autorización: docente accede a su propio horario, docente intenta acceder al de otro, Administrador accede a cualquier horario.

**3. Elementos de trabajo vinculados:**
- RF-11 — Ejecutar Etapa 2
- RNF: Seguridad — control de acceso por roles

---

## Sprint 3 — Horario de Estudiantes, Visualización y Exportación

**Objetivo:** Implementar la Etapa 3 del sistema (generación del horario de estudiantes), la grilla semanal interactiva y la exportación en PDF y Excel. Al cierre del sprint el sistema debe estar funcionalmente completo según los criterios de aceptación del PMV.

**Épicas cubiertas:** EP-06, EP-07

**Duración estimada:** 2 semanas

---

### EP-06 — Generación de Horario de Estudiantes (Etapa 3)

---

#### HU-18 — Validación de Prerrequisitos y Corequisitos

**1. Descripción**

**1.1 Historia:**
Como sistema, quiero validar automáticamente los prerrequisitos y corequisitos de cada curso antes de asignarlo al estudiante para garantizar que las inscripciones cumplan el plan de estudios.

**1.2 Criterios de aceptación:**
- Para cada curso candidato, el sistema verifica que todos sus prerrequisitos figuren en el historial aprobado del estudiante (D12).
- Los cursos que no cumplen prerrequisitos son excluidos con notificación que indica exactamente qué prerrequisito falta.
- Los corequisitos se validan como grupo: si un curso del grupo no puede asignarse, todos quedan excluidos (D18).
- La validación se ejecuta antes de invocar el solver OR-Tools de la Etapa 3.

**2. Subtareas:**
- Implementar la función de validación de prerrequisitos contra el historial del estudiante.
- Implementar la lógica de atomicidad de corequisitos: si uno falla, todos el grupo se descarta.
- Integrar ambas validaciones como filtro previo al modelo CSP de la Etapa 3.
- Implementar el escenario EA-07: corequisito no asignable libera la reserva del par.
- Escribir pruebas unitarias: prerrequisito faltante, corequisito fallido en grupo, validación exitosa.

**3. Elementos de trabajo vinculados:**
- RF-07 — Validar Prerrequisitos y Corequisitos
- Restricciones D12 y D18 del Spec v2.0
- Escenario atípico EA-07

---

#### HU-19 — Control de Carga Académica del Estudiante

**1. Descripción**

**1.1 Historia:**
Como sistema, quiero controlar simultáneamente los créditos totales y las horas semanales acumuladas del estudiante durante la generación de su horario para prevenir la sobrecarga académica.

**1.2 Criterios de aceptación:**
- La suma de créditos de los cursos asignados no puede superar el límite del estudiante ni el del período (D13).
- La suma de horas semanales de los cursos asignados no puede superar el límite del estudiante (D14).
- Si agregar un curso supera el límite de créditos, el sistema muestra: créditos actuales + créditos del curso vs. límite (ej: "18 + 5 = 23 créditos, límite: 20").
- Si agregar un curso supera el límite de horas, el sistema muestra: horas actuales + horas del curso vs. límite.
- Ambos controles operan de forma independiente; superar cualquiera de los dos bloquea la asignación.

**2. Subtareas:**
- Implementar la restricción D13 (límite de créditos) en el modelo CSP de la Etapa 3.
- Implementar la restricción D14 (límite de horas semanales) en el modelo CSP de la Etapa 3.
- Implementar los mensajes descriptivos para EA-10 (exceso de créditos) y EA-11 (exceso de horas).
- Escribir pruebas unitarias: exceso de créditos exactamente en el límite, exceso de horas exactamente en el límite, ambos límites combinados.

**3. Elementos de trabajo vinculados:**
- RF-12 — Ejecutar Etapa 3
- Restricciones D13 y D14 del Spec v2.0
- Escenarios atípicos EA-10 y EA-11

---

#### HU-20 — Generación Automática del Horario de Estudiantes

**1. Descripción**

**1.1 Historia:**
Como administrador o estudiante, quiero ejecutar la generación automática del horario individual del estudiante para obtener la selección óptima de cursos disponibles respetando todas las restricciones de la Etapa 3.

**1.2 Criterios de aceptación:**
- La Etapa 3 solo puede ejecutarse con un horario institucional en estado ACTIVO; retorna error descriptivo en caso contrario (EA-12).
- El horario del estudiante se genera en ≤ 5 segundos.
- El resultado incluye: cursos asignados, componentes, aulas, franjas, créditos totales y horas semanales totales.
- Si no existen opciones en el turno preferido del estudiante, el sistema asigna en turno adyacente y emite `TURNO_ALTERNATIVO` (D16).
- Para cada curso no asignable, el sistema indica la causa específica: sin vacantes, prerrequisito pendiente, límite de créditos, límite de horas, sin oferta en turno.

**2. Subtareas:**
- Implementar el endpoint `POST /api/schedules/students/{studentId}/generate`.
- Integrar las restricciones D12–D19 en el modelo CSP de la Etapa 3.
- Implementar la lógica de emisión de `TURNO_ALTERNATIVO` cuando no hay oferta en el turno preferido.
- Implementar el mecanismo de notificación de cursos no asignables con causa específica por curso.
- Implementar el escenario EA-08: estudiante sin turno preferido usa todas las franjas disponibles.
- Medir el tiempo de generación bajo el escenario base del PMV y documentar el resultado.
- Escribir pruebas de integración: generación exitosa, turno alternativo, múltiples causas de exclusión simultáneas.

**3. Elementos de trabajo vinculados:**
- RF-12 — Ejecutar Etapa 3
- Restricciones D12–D19 del Spec v2.0
- Escenarios atípicos EA-07 a EA-12

---

#### HU-21 — Atomicidad de Cursos Compuestos en Horario de Estudiante

**1. Descripción**

**1.1 Historia:**
Como sistema, quiero garantizar que los cursos con componentes TEORÍA + PRÁCTICA se asignen de forma completa o no se asignen en absoluto para que el estudiante nunca quede con solo una parte de un curso compuesto.

**1.2 Criterios de aceptación:**
- Si el componente TEORÍA de un curso puede asignarse pero el de PRÁCTICA no (o viceversa), ninguno de los dos se asigna (D17).
- El sistema notifica al estudiante que el curso no pudo asignarse de forma completa, indicando qué componente presentó el conflicto.
- Un curso compuesto parcialmente asignable no reduce el total de créditos del estudiante.
- El solver libera los recursos reservados para el componente que sí tenía asignación provisional.

**2. Subtareas:**
- Implementar la restricción D17 en el modelo CSP de la Etapa 3 como constraint de atomicidad.
- Implementar la lógica de liberación de recursos cuando solo uno de los componentes puede asignarse.
- Implementar el mensaje de notificación que identifica el componente en conflicto (EA-06 aplicado a Etapa 3).
- Escribir pruebas unitarias: curso compuesto asignado completo, TEORÍA sin PRÁCTICA disponible, PRÁCTICA sin TEORÍA disponible.

**3. Elementos de trabajo vinculados:**
- Restricción D17 del Spec v2.0
- Escenario atípico EA-06
- Regla de operación 6 (integridad de cursos compuestos)

---

#### HU-22 — Consulta de Horario por el Estudiante

**1. Descripción**

**1.1 Historia:**
Como estudiante, quiero consultar mi horario generado para el período activo y conocer el detalle de cada curso asignado, incluyendo el componente, el docente, el aula y la franja.

**1.2 Criterios de aceptación:**
- El estudiante autenticado puede consultar únicamente su propio horario; acceder al de otro estudiante retorna error 403.
- La respuesta incluye por cada curso asignado: nombre del curso, tipo de componente, docente, aula, franja y día.
- La respuesta incluye el resumen de carga académica: créditos totales y horas semanales acumuladas vs. límites.
- Si el horario contiene cursos en turno alternativo, el indicador `TURNO_ALTERNATIVO` se muestra de forma visible.
- La consulta retorna en ≤ 3 segundos.

**2. Subtareas:**
- Configurar el endpoint `GET /api/schedules/students/{studentId}` con validación de propiedad del recurso.
- Implementar la respuesta con resumen de carga académica (créditos y horas) y el indicador de turno alternativo.
- Escribir pruebas de autorización: estudiante accede a su propio horario, estudiante intenta acceder al de otro, Administrador accede a cualquier horario.

**3. Elementos de trabajo vinculados:**
- RF-12 — Ejecutar Etapa 3
- RNF: Seguridad — control de acceso por roles

---

### EP-07 — Visualización y Exportación

---

#### HU-23 — Grilla Semanal de Horario

**1. Descripción**

**1.1 Historia:**
Como usuario (administrador, docente o estudiante), quiero visualizar mi horario en formato de grilla semanal (días × franjas) para tener una vista clara y ordenada de mis asignaciones del período.

**1.2 Criterios de aceptación:**
- La grilla muestra las columnas por día de la semana y las filas por franja horaria.
- Cada celda ocupada muestra: nombre del curso, tipo de componente, docente asignado y aula.
- El Administrador visualiza el horario institucional completo; el Docente y el Estudiante visualizan únicamente sus asignaciones propias.
- La grilla carga completamente en ≤ 3 segundos.
- No se producen solapamientos visuales: dos asignaciones en la misma celda indican un error de datos que debe reportarse.

**2. Subtareas:**
- Implementar el componente de grilla semanal en React con estructura días × franjas.
- Implementar la lógica de renderizado de celdas según el rol del usuario autenticado.
- Implementar la detección visual de solapamientos y el reporte de error al Administrador.
- Optimizar la carga de datos de la grilla para cumplir el tiempo de ≤ 3 segundos bajo el escenario base.
- Escribir pruebas de componente: renderizado correcto, tiempo de carga, vista por rol.

**3. Elementos de trabajo vinculados:**
- RF-13 — Visualizar Horario en Grilla Semanal
- RNF: Rendimiento — carga de grilla semanal

---

#### HU-24 — Exportación del Horario en PDF

**1. Descripción**

**1.1 Historia:**
Como usuario (administrador, docente o estudiante), quiero exportar mi horario en formato PDF para tener una copia imprimible o compartible con todos los datos de la grilla.

**1.2 Criterios de aceptación:**
- El archivo PDF contiene todos los campos visibles en la grilla: nombre del curso, componente, docente, aula, día y franja.
- El PDF incluye el nombre del usuario, el período académico y la fecha de exportación en el encabezado.
- La descarga se completa en ≤ 30 segundos.
- Solo se puede exportar el horario propio; intentar exportar el de otro usuario retorna error 403.

**2. Subtareas:**
- Implementar el endpoint `GET /api/schedules/{type}/{id}/export?format=pdf`.
- Integrar una librería de generación de PDF (ej. ReportLab para Python) con el layout de la grilla.
- Implementar el encabezado del PDF con nombre de usuario, período y fecha de exportación.
- Implementar la validación de propiedad del recurso antes de generar el archivo.
- Medir el tiempo de generación del PDF bajo el escenario base y documentar el resultado.
- Escribir pruebas de integración: exportación exitosa, tiempo dentro del límite, intento sobre horario ajeno.

**3. Elementos de trabajo vinculados:**
- RF-14 — Exportar Horario en PDF o Excel
- RNF: Rendimiento — exportación de horario

---

#### HU-25 — Exportación del Horario en Excel

**1. Descripción**

**1.1 Historia:**
Como usuario (administrador, docente o estudiante), quiero exportar mi horario en formato Excel para poder manipular los datos o compartirlos en un formato editable.

**1.2 Criterios de aceptación:**
- El archivo Excel contiene todos los campos visibles en la grilla en hojas organizadas por día o en una hoja única con columna de día.
- La descarga se completa en ≤ 30 segundos.
- Solo se puede exportar el horario propio; intentar exportar el de otro usuario retorna error 403.
- El archivo es abierto sin errores en Microsoft Excel y LibreOffice Calc.

**2. Subtareas:**
- Implementar la generación del archivo Excel en el endpoint `GET /api/schedules/{type}/{id}/export?format=excel`.
- Integrar una librería de generación de Excel (ej. openpyxl para Python) con el layout de la grilla.
- Implementar la estructura de columnas: día, franja, curso, componente, docente, aula.
- Medir el tiempo de generación del Excel bajo el escenario base y documentar el resultado.
- Escribir pruebas de integración: exportación exitosa, apertura sin errores en Excel y LibreOffice, tiempo dentro del límite.

**3. Elementos de trabajo vinculados:**
- RF-14 — Exportar Horario en PDF o Excel
- RNF: Rendimiento — exportación de horario

---

#### HU-26 — Protección ante Vulnerabilidades OWASP

**1. Descripción**

**1.1 Historia:**
Como sistema, quiero estar protegido contra las vulnerabilidades del OWASP Top 10 aplicables al PMV para garantizar la confidencialidad e integridad de los datos académicos.

**1.2 Criterios de aceptación:**
- Todos los accesos a base de datos usan ORM o queries parametrizados (sin SQL Injection).
- Todas las salidas de texto renderizadas en el frontend aplican escape de caracteres (sin XSS).
- Los endpoints de escritura implementan protección CSRF (token de sincronización o SameSite cookies).
- El sistema opera exclusivamente sobre HTTPS en el entorno de producción.
- Los datos sensibles (contraseñas, tokens) no se exponen en logs ni en respuestas de error.

**2. Subtareas:**
- Auditar todos los endpoints de la API para confirmar uso de ORM o queries parametrizados.
- Implementar escape de salida en todos los puntos de renderizado del frontend React.
- Configurar protección CSRF en FastAPI mediante middleware o SameSite cookies.
- Configurar HTTPS en el entorno de despliegue y redirigir tráfico HTTP.
- Ejecutar un análisis con herramienta automatizada (ej. OWASP ZAP) y documentar los resultados.
- Escribir pruebas de seguridad: intento de SQL Injection, intento de XSS, request CSRF sin token.

**3. Elementos de trabajo vinculados:**
- RNF: Seguridad — protección ante vulnerabilidades OWASP
- HU-02 — Inicio de Sesión
- HU-03 — Control de Acceso por Rol

---

## Resumen de Cobertura

| Sprint | Épicas | HU | RF cubiertos | RNF cubiertos |
|---|---|---|---|---|
| Sprint 1 | EP-01, EP-02, EP-03 | HU-01 a HU-10 | RF-01 a RF-06 | Seguridad, Escalabilidad |
| Sprint 2 | EP-04, EP-05 | HU-11 a HU-17 | RF-07 a RF-11 | Rendimiento (Etapas 1 y 2), Confiabilidad |
| Sprint 3 | EP-06, EP-07 | HU-18 a HU-26 | RF-12 a RF-15 | Rendimiento (Etapa 3, grilla, exportación), Usabilidad, Seguridad OWASP |
