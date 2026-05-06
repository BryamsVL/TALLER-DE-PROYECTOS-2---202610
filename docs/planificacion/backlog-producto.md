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

#### HU-01 — Registro de Usuarios
**Historia:** Como administrador, quiero registrar usuarios con roles (administrador, docente, estudiante) para controlar el acceso al sistema según las responsabilidades de cada actor.
**Criterios de aceptación:** El sistema crea el usuario con el rol asignado y la contraseña hasheada. No permite roles fuera del conjunto definido. Devuelve error 400 si el email ya existe.

#### HU-02 — Inicio de Sesión
**Historia:** Como usuario registrado (administrador, docente o estudiante), quiero iniciar sesión con mis credenciales para acceder a las funcionalidades correspondientes a mi rol.
**Criterios de aceptación:** Retorna JWT firmado con expiración de 8 horas ante credenciales válidas. JWT incluye id, email y rol.

#### HU-03 — Control de Acceso por Rol
**Historia:** Como sistema, quiero restringir el acceso a cada endpoint según el rol del usuario autenticado para garantizar que ningún actor pueda ejecutar operaciones fuera de su ámbito.
**Criterios de aceptación:** Cada endpoint verifica el rol. Estudiante a endpoint admin recibe 403. Sin JWT recibe 401.

---

### EP-01 — Gestión de Entidades Base

#### HU-04 — Gestión de Estudiantes
**Historia:** Como administrador, quiero registrar, editar, consultar y eliminar estudiantes en el sistema.

#### HU-05 — Gestión de Docentes
**Historia:** Como administrador, quiero registrar, editar, consultar y eliminar docentes en el sistema.

#### HU-06 — Gestión de Disponibilidad de Docentes
**Historia:** Como administrador, quiero registrar y actualizar la disponibilidad horaria semanal de cada docente para que el motor OR-Tools utilice únicamente las franjas.

#### HU-07 — Gestión de Cursos y Componentes
**Historia:** Como administrador, quiero registrar cursos con sus componentes (GENERAL, TEORÍA o PRÁCTICA).

#### HU-08 — Gestión de Aulas
**Historia:** Como administrador, quiero registrar y administrar las aulas disponibles con su capacidad, tipo y franjas de disponibilidad.

---

### EP-03 — Configuración del Período Académico

#### HU-09 — Configuración de Franjas Horarias
**Historia:** Como administrador, quiero definir el catálogo de franjas horarias del período académico activo.

#### HU-10 — Configuración de Tiempos de Traslado y Parámetros del Período
**Historia:** Como administrador, quiero registrar los tiempos de traslado entre edificios y los límites del período académico.

---

## Sprint 2 — Generación de Horario Institucional y de Docentes

**Objetivo:** Implementar las Etapas 1 y 2 del sistema: generación automática del horario institucional mediante OR-Tools, activación, ajuste manual y construcción de la vista de horario por docente.

**Épicas cubiertas:** EP-04, EP-05

**Duración estimada:** 2 semanas

---

### EP-04 — Generación de Horario Institucional (Etapa 1)

#### HU-11 — Modelado de Restricciones Duras en OR-Tools
**Historia:** Como sistema, quiero que el motor OR-Tools tenga codificadas todas las restricciones duras D1–D9 para garantizar que ninguna asignación del horario institucional las viole.

#### HU-12 — Ejecución y Resultado de la Generación del Horario Institucional
**Historia:** Como administrador, quiero ejecutar la generación automática del horario institucional y recibir el resultado.

#### HU-13 — Activación y Cancelación del Horario Institucional
**Historia:** Como administrador, quiero activar o cancelar el horario institucional en estado BORRADOR.

#### HU-14 — Ajuste Manual de Asignaciones
**Historia:** Como administrador, quiero modificar manualmente las asignaciones del horario institucional en estado BORRADOR.

#### HU-15 — Restricciones Blandas y Puntuación del Horario
**Historia:** Como administrador, quiero que el motor OR-Tools optimice el horario generado según criterios de calidad (B1-B5).

---

### EP-05 — Generación de Horario de Docentes (Etapa 2)

#### HU-16 — Generación de Vista de Horario por Docente
**Historia:** Como administrador, quiero generar las vistas individuales de horario para cada docente a partir del horario institucional activo.

#### HU-17 — Consulta de Horario por el Docente
**Historia:** Como docente, quiero consultar mi horario asignado para el período activo y verificar que no existen solapamientos.

---

## Sprint 3 — Horario de Estudiantes, Visualización y Exportación

**Objetivo:** Implementar la Etapa 3 del sistema, la grilla semanal interactiva y la exportación en PDF y Excel.

**Épicas cubiertas:** EP-06, EP-07

**Duración estimada:** 2 semanas

---

### EP-06 — Generación de Horario de Estudiantes (Etapa 3)

#### HU-18 — Validación de Prerrequisitos y Corequisitos
**Historia:** Como sistema, quiero validar automáticamente los prerrequisitos y corequisitos de cada curso antes de asignarlo al estudiante.

#### HU-19 — Control de Carga Académica del Estudiante
**Historia:** Como sistema, quiero controlar simultáneamente los créditos totales y las horas semanales acumuladas del estudiante.

#### HU-20 — Generación Automática del Horario de Estudiantes
**Historia:** Como administrador o estudiante, quiero ejecutar la generación automática del horario individual del estudiante.

#### HU-21 — Atomicidad de Cursos Compuestos en Horario de Estudiante
**Historia:** Como sistema, quiero garantizar que los cursos con componentes TEORÍA + PRÁCTICA se asignen de forma completa.

#### HU-22 — Consulta de Horario por el Estudiante
**Historia:** Como estudiante, quiero consultar mi horario generado para el período activo y conocer el detalle de cada curso asignado.

---

### EP-07 — Visualización y Exportación

#### HU-23 — Grilla Semanal de Horario
**Historia:** Como usuario, quiero visualizar mi horario en formato de grilla semanal.

#### HU-24 — Exportación del Horario en PDF
**Historia:** Como usuario, quiero exportar mi horario en formato PDF.

#### HU-25 — Exportación del Horario en Excel
**Historia:** Como usuario, quiero exportar mi horario en formato Excel.

#### HU-26 — Protección ante Vulnerabilidades OWASP
**Historia:** Como sistema, quiero estar protegido contra las vulnerabilidades del OWASP Top 10.

---

## Resumen de Cobertura

| Sprint | Épicas | HU | RF cubiertos | RNF cubiertos |
|---|---|---|---|---|
| Sprint 1 | EP-01, EP-02, EP-03 | HU-01 a HU-10 | RF-01 a RF-06 | Seguridad, Escalabilidad |
| Sprint 2 | EP-04, EP-05 | HU-11 a HU-17 | RF-07 a RF-11 | Rendimiento (Etapas 1 y 2), Confiabilidad |
| Sprint 3 | EP-06, EP-07 | HU-18 a HU-26 | RF-12 a RF-15 | Rendimiento (Etapa 3, grilla), Usabilidad, Seguridad OWASP |
