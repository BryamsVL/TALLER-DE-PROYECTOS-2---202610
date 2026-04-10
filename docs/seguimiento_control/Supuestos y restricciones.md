## Entregable D — Registro de supuestos y restricciones

### 1. Supuestos del proyecto

Los siguientes supuestos han sido identificados y deben ser validados con los stakeholders reales. Si alguno resulta incorrecto, impacta directamente en el alcance o el diseño del sistema.

| # | Supuesto | Área de impacto | Acción si es falso |
|---|----------|-----------------|-------------------|
| S1 | Cada docente puede dictar como máximo un curso por franja horaria. | Modelo CSP / Restricciones | Redefinir restricción de solapamiento para docentes. |
| S2 | Un aula puede albergar solo un curso por franja horaria. | Modelo CSP / Aulas | El supuesto es estándar; solo cambia si existen aulas compartidas. |
| S3 | El límite de créditos por estudiante es de 20 a 22 por ciclo, sin excepciones. | Módulo de matrícula | Agregar manejo de excepciones aprobadas por coordinación. |
| S4 | Los prerrequisitos son lineales (un curso tiene como máximo un prerrequisito directo). | Modelo de datos / CSP | Extender el modelo a grafos de prerrequisitos con dependencias múltiples. |
| S5 | Las franjas horarias son bloques fijos de 90 minutos distribuidos en turnos mañana, tarde y noche. | Modelo de horarios | Parametrizar la duración de las franjas en la configuración del período. |
| S6 | El sistema se desplegará en un servidor con acceso a internet y al menos 4 GB de RAM. | Infraestructura | Optimizar el algoritmo CSP para entornos con menor capacidad computacional. |
| S7 | Los datos de matrícula y disponibilidad se ingresan directamente al sistema (sin importación de sistemas externos). | Módulo de registro | Agregar módulo de importación desde Excel o API externa. |
| S8 | El equipo tiene disponibilidad de al menos 10 horas semanales por integrante para el proyecto. | Gestión del equipo | Renegociar el alcance del proyecto reduciendo módulos no esenciales. |
| S9 | Cada docente tiene una carga máxima de 4 cursos por ciclo académico. | Modelo CSP / Restricciones blandas | Agregar parámetro configurable de carga máxima por docente en el panel de administración. |
| S10 | Cada sección de curso tiene un aforo mínimo de 15 estudiantes y un máximo definido por la capacidad del aula asignada. | Modelo de datos / Módulo de matrícula | Implementar lógica de cancelación automática de secciones con inscripción inferior al mínimo requerido. |

---

### 2. Restricciones del proyecto

| # | Tipo | Restricción | Impacto en el diseño |
|---|------|-------------|----------------------|
| R1 | Técnica | Capacidad computacional limitada: el CSP solver debe ejecutarse en hardware estándar sin GPU. | El algoritmo debe incluir poda de dominio y heurísticas de selección de variables para limitar el espacio de búsqueda. |
| R2 | Técnica | Arquitectura obligatoria: SPA + API REST según la consigna del curso. | El frontend y backend deben desarrollarse como proyectos independientes comunicados mediante HTTP/JSON. |
| R3 | Técnica | El sistema debe cumplir OWASP Top 10 en su versión mínima viable. | Toda la API debe implementar autenticación JWT, validación de entradas y manejo seguro de errores desde el Sprint 1. |
| R4 | Económica | Sin presupuesto para servicios cloud de pago. Solo infraestructura gratuita. | Uso de Docker local, GitHub gratuito, y servicios de hosting en tier gratuito (Railway, Render). |
| R5 | Social | Equidad en la asignación de horarios: ningún grupo de estudiantes debe concentrar sistemáticamente los peores horarios. | El CSP debe incluir una función objetivo que penalice distribuciones inequitativas. |
| R6 | Ambiental | Aplicar principios de Green Software: minimizar ciclos de cómputo innecesarios. | Implementar caché de resultados del CSP. Lazy loading en frontend. Early exit en el algoritmo. |
| R7 | Seguridad | Protección de datos personales de estudiantes y docentes. | No almacenar contraseñas en texto plano. HTTPS obligatorio. Datos sensibles enmascarados en logs. |
| R8 | Temporal | El proyecto debe completarse en 16 semanas (4 sprints de 4 semanas) en el ciclo 2026-I. | El alcance del MVP se prioriza sobre la implementación de funcionalidades deseables. |
| R9 | Académica | Ningún docente puede ser asignado a más de 6 horas de clase consecutivas en un mismo día. | El motor CSP debe incorporar una restricción dura de continuidad horaria por docente, validada antes de confirmar cualquier asignación generada. |
| R10 | Legal | El sistema debe cumplir la Ley N.° 29733 (Ley de Protección de Datos Personales del Perú) en el tratamiento de información de estudiantes y docentes. | Incluir consentimiento explícito en el registro de usuarios, política de privacidad visible, y mecanismo de eliminación de datos personales a solicitud del titular. |
