# Épicas, Sprints e Historias de Usuario — SGOHA

**Versión:** 1.0
**Fecha:** Mayo 2026
**Proyecto:** SGOHA — Sistema de Generación Óptima de Horarios Académicos

---

## Épicas del Proyecto

| ID | Nombre | Descripción | Sprint |
|---|---|---|---|
| **EP-01** | Gestión de Entidades Base | Registro y administración de estudiantes, docentes, cursos, aulas. | Sprint 1 |
| **EP-02** | Autenticación y Control de Acceso | Registro, login, JWT y control RBAC. | Sprint 1 |
| **EP-03** | Configuración del Período Académico | Franjas horarias y límites del período activo. | Sprint 1 |
| **EP-04** | Generación de Horario Institucional | Motor OR-Tools para asignar cursos a aulas/docentes sin cruces. | Sprint 2 |
| **EP-05** | Generación de Horario de Docentes | Vista personalizada derivada del horario institucional. | Sprint 2 |
| **EP-06** | Generación de Horario de Estudiantes | Asignación automática respetando prerrequisitos y créditos. | Sprint 3 |
| **EP-07** | Visualización y Exportación | Grilla semanal y exportación a PDF/Excel. | Sprint 3 |

---

## Sprint 1 — Fundamentos del Sistema

### EP-02 — Autenticación y Control de Acceso

#### HU-01 — Registro de Usuarios
**Historia:** Como administrador, quiero registrar usuarios con roles para controlar el acceso.
**Criterios de aceptación:** 
- 1. Contraseña hasheada con bcrypt (mínimo 10 rounds).
- 2. Validación estricta de formato de email mediante esquema Zod.
- 3. Retorna HTTP 409 Conflict si el email ya existe en la base de datos.
**Priorización:** Alta (Valor 5, Riesgo 3, Complejidad 2)
**Relación CSP:** N/A (Habilitador técnico)

#### HU-02 — Inicio de Sesión
**Historia:** Como usuario, quiero iniciar sesión para acceder al sistema.
**Criterios de aceptación:** 
- 1. El endpoint valida credenciales de forma segura.
- 2. Retorna token JWT firmado con expiración estricta de 8 horas.
- 3. Incluye el rol del usuario dentro del payload del JWT.
**Priorización:** Alta (Valor 5, Riesgo 4, Complejidad 2)
**Relación CSP:** N/A

#### HU-03 — Control de Acceso por Rol
**Historia:** Como sistema, quiero restringir el acceso a endpoints por rol.
**Criterios de aceptación:** 
- 1. Middleware bloquea peticiones con HTTP 403 Forbidden si el rol no coincide.
- 2. Valida correctamente la estructura Bearer del token en la cabecera.
- 3. Middleware genérico aplicable como decorador/función en cualquier ruta.
**Priorización:** Alta (Valor 5, Riesgo 4, Complejidad 3)
**Relación CSP:** N/A

---

### EP-01 — Gestión de Entidades Base

#### HU-04 — Gestión de Estudiantes
**Historia:** Como administrador, quiero registrar y consultar estudiantes.
**Criterios de aceptación:** 
- 1. Permite crear, leer, actualizar y hacer soft-delete (eliminación lógica).
- 2. Valida que el código institucional de estudiante sea único.
- 3. Implementa paginación (limit, offset) en el endpoint GET.
**Priorización:** Media (Valor 4, Riesgo 2, Complejidad 2)
**Relación CSP:** D3 (Aforo y matrícula)

#### HU-05 — Gestión de Docentes
**Historia:** Como administrador, quiero registrar y administrar docentes.
**Criterios de aceptación:** 
- 1. Registro debe incluir tipo de contrato (Tiempo Completo, Tiempo Parcial).
- 2. Bloquea el registro de código docente duplicado.
- 3. Retorna listado ordenado y paginado para la interfaz de administración.
**Priorización:** Alta (Valor 5, Riesgo 2, Complejidad 2)
**Relación CSP:** D1 (Unicidad docente)

#### HU-06 — Gestión de Disponibilidad de Docentes
**Historia:** Como administrador, quiero registrar la disponibilidad horaria del docente.
**Criterios de aceptación:** 
- 1. El docente puede marcar y desmarcar bloques en una grilla interactiva.
- 2. Validación backend asegura que las franjas no excedan horas de su contrato.
- 3. Bloquea el envío si la matriz de disponibilidad está completamente vacía.
**Priorización:** Crítica (Valor 5, Riesgo 4, Complejidad 3)
**Relación CSP:** Restricción D1 y D4 (Cruce de franjas)

#### HU-07 — Gestión de Cursos y Componentes
**Historia:** Como administrador, quiero registrar cursos (TEORÍA/PRÁCTICA) y créditos.
**Criterios de aceptación:** 
- 1. Registra tipo de componente explícito (Teoría, Práctica, Laboratorio).
- 2. Valida que el número de créditos sea un entero mayor a cero.
- 3. Asocia estrictamente el curso con una malla curricular y ciclo.
**Priorización:** Alta (Valor 4, Riesgo 2, Complejidad 3)
**Relación CSP:** Restricción Académica (Cálculo de bloques continuos)

#### HU-08 — Gestión de Aulas
**Historia:** Como administrador, quiero registrar aulas y su capacidad máxima.
**Criterios de aceptación:** 
- 1. Registro obliga a especificar pabellón, piso, número y aforo.
- 2. Validación restringe aforo mínimo a 10 y máximo a 150.
- 3. El nombre/código del aula debe ser único por pabellón.
**Priorización:** Alta (Valor 4, Riesgo 2, Complejidad 2)
**Relación CSP:** D2 (Unicidad aula) y D3 (Capacidad física)

---

### EP-03 — Configuración del Período Académico

#### HU-09 — Configuración de Franjas Horarias
**Historia:** Como administrador, quiero definir las franjas del período activo.
**Criterios de aceptación:** 
- 1. Las franjas se definen en intervalos fijos y consistentes (ej. 2 horas).
- 2. Permite definir hora de inicio y fin de operaciones (ej. 08:00 a 22:00).
- 3. Días habilitados son configurables (ej. restricción sábados tarde).
**Priorización:** Crítica (Valor 5, Riesgo 3, Complejidad 3)
**Relación CSP:** Define el universo de la variable H (Franjas) en OR-Tools.

#### HU-10 — Tiempos de Traslado
**Historia:** Como administrador, quiero registrar tiempos de traslado entre edificios.
**Criterios de aceptación:** 
- 1. Interfaz matricial para definir tiempo (en minutos) entre Pabellón A y B.
- 2. Validación de simetría (tiempo A→B debe ser igual a B→A).
- 3. Los tiempos registrados deben ser numéricos enteros positivos.
**Priorización:** Baja (Valor 3, Riesgo 2, Complejidad 4)
**Relación CSP:** Restricción blanda B4 (Minimizar viajes largos).

---

## Sprint 2 — Generación de Horario Institucional (Motor CSP)

### EP-04 — Generación de Horario Institucional

#### HU-11 — Modelado de Restricciones Duras en OR-Tools
**Historia:** Como sistema, quiero codificar D1-D9 en CP-SAT para evitar cruces absolutos.
**Criterios de aceptación:** 
- 1. El modelo CP-SAT integra D1 (docentes), D2 (aulas), D3 (aforo) y D4 (disponibilidad).
- 2. Retorna estado `INFEASIBLE` de forma transparente si los cruces son inevitables.
- 3. Tiempos de construcción de matriz en memoria menores a 5 segundos.
**Priorización:** Crítica (Valor 5, Riesgo 5, Complejidad 5)
**Relación CSP:** NÚCLEO CSP (D1, D2, D3, D4).

#### HU-12 Ejecución y resultado del horario institucional
**Historia:** Como administrador, quiero ejecutar la generación automática del horario institucional y recibir el resultado (solución completa o reporte de conflictos) para decidir si activarlo o ajustarlo.
**Criterios de aceptación:** 
- 1. El endpoint de generación ejecuta el solver de OR-Tools con los datos del período activo.
- 2. El resultado se produce en <= 30 segundos bajo el escenario base del PMV (100 estudiantes, 20 docentes, 20 cursos, 10 aulas).
- 3. Si el solver encuentra solución completa, retorna el horario en estado BORRADOR.
- 4.  Si el solver no encuentra solución o agota el tiempo límite (30 s), retorna los conflictos identificados sin persistir ningún horario inválido.
- 5. Cada conflicto reportado identifica el recurso afectado y la restricción violada 
**Priorización:** Crítica (Valor 5, Riesgo 5, Complejidad 4)
**Relación CSP:** Función Objetivo y Exploración.

#### HU-13 Activación y cancelación del horario institucional
**Historia:** Como administrador, quiero activar o cancelar el horario institucional en estado BORRADOR para controlar qué horario queda disponible como base para las etapas siguientes.** 
- 1. El endpoint de activación verifica cero solapamientos en el BORRADOR antes de cambiar el estado a ACTIVO.
- 2. Un horario ACTIVO no puede modificarse directamente; debe cancelarse primero.
- 3. Al cancelar un horario ACTIVO, todos los recursos quedan liberados para nueva asignación.
- 4. La Etapa 2 no puede iniciarse sin un horario institucional en estado ACTIVO; retorna error descriptivo.
- 5. Las operaciones de activación y cancelación son transaccionales (commit completo o rollback).
**Priorización:** Media (Valor 3, Riesgo 1, Complejidad 2)
**Relación CSP:** N/A (Flujo transaccional).

#### HU-14 — HU-14 Ajuste manual de asignaciones
**Historia:** Como administrador, quiero modificar manualmente las asignaciones del horario institucional en estado BORRADOR y recibir validación en tiempo real para corregir conflictos antes de activarlo.
**Criterios de aceptación:** 
- 1.  El sistema permite reasignar un componente seleccionando una nueva combinación de docente, aula y franja.
- 2. La validación de solapamientos se produce en <= 1 segundo tras la acción del Administrador.
. Si la nueva combinación produce solapamiento, el sistema rechaza el cambio e indica el recurso en conflicto y la franja afectada.
- 3. Los cambios válidos se persisten en el BORRADOR sin afectar ningún horario ACTIVO.
- 4. Solo se pueden ajustar horarios en estado BORRADOR; los ACTIVOS retornan error 409.
**Priorización:** Alta (Valor 4, Riesgo 3, Complejidad 4)
**Relación CSP:** Validación heurística post-solver.

#### HU-15 — Restricciones blandas y puntuación del horario
**Historia:** Como administrador, quiero que el motor OR-Tools optimice el horario generado según criterios de calidad (restricciones blandas) para obtener una distribución más eficiente de recursos además de satisfacer las restricciones obligatorias.** 
- 1. El solver intenta minimizar huecos entre clases (B1), carga consecutiva del docente (B2) y concentración de bloques en un solo día (B3).
- 2. El solver prefiere aulas con capacidad cercana a la matrícula real del curso (B4).
. El solver prefiere asignar TEORÍA y PRÁCTICA en días distintos (B5).
- 3. Las restricciones blandas solo se optimizan si las duras ya están satisfechas.
- 4.  El horario generado incluye una puntuación interna que refleja el grado de cumplimiento de las restricciones blandas.
**Priorización:** Baja (Valor 3, Riesgo 4, Complejidad 5)
**Relación CSP:** Soft Constraints y Variables de Penalización.

---

### EP-05 — Generación de Horario de Docentes

#### HU-16 — Generación de vista de horario por docente
**Historia:** Como administrador, quiero generar las vistas individuales de horario para cada docente a partir del horario institucional activo para que cada profesor pueda consultar sus asignaciones del período.** 
- 1. La Etapa 2 solo puede ejecutarse sobre un horario institucional en estado ACTIVO; retorna error descriptivo en caso contrario.
- 2. La vista de cada docente incluye: nombre del curso, tipo de componente, aula, franja y día.
. La vista se genera en <= 5 segundos por docente.
- 3. LEl indicador de carga horaria semanal muestra el total de horas asignadas por día.
- 4. Si un docente supera 4 horas consecutivas, se emite la alerta de carga excesiva (B2).
**Priorización:** Media (Valor 3, Riesgo 2, Complejidad 2)
**Relación CSP:** Parseo de resultados del Solver.

#### HU-17 —  Consulta de horario por el docente
**Historia:** Como docente, quiero consultar mi horario asignado para el período activo y verificar que no existen solapamientos ni conflictos en mis asignaciones.** 
- 1. El docente autenticado puede consultar únicamente su propio horario; intentar acceder al de otro docente retorna error 403.
- 2. La vista muestra todos los componentes asignados con: curso, componente, aula, franja y día.
- 3. La vista indica el total de horas semanales asignadas.
- 4. Si existe alerta de carga excesiva, se muestra de forma visible en la respuesta.
- 5. La consulta retorna en <= 3 segundos.
**Priorización:** Alta (Valor 5, Riesgo 1, Complejidad 2)
**Relación CSP:** N/A.

---

## Sprint 3 — Horario de Estudiantes y UI

### EP-06 — Generación de Horario de Estudiantes

#### HU-18 — Validación de prerrequisitos y corequisitos
**Historia:** Como sistema, quiero validar automáticamente los prerrequisitos y corequisitos de cada curso antes de asignarlo al estudiante para garantizar que las inscripciones cumplan el plan de estudios.** 
- 1. Para cada curso candidato, el sistema verifica que todos sus prerrequisitos figuren en el historial aprobado del estudiante (D12).
- 2. Los cursos que no cumplen prerrequisitos son excluidos con notificación que indica exactamente qué prerrequisito falta.
- 3. Los corequisitos se validan como grupo: si un curso del grupo no puede asignarse, todos quedan excluidos (D18).
- 4. La validación se ejecuta antes de invocar el solver OR-Tools de la Etapa 3.
**Priorización:** Crítica (Valor 5, Riesgo 4, Complejidad 4)
**Relación CSP:** Restricción de Dominio Estudiantil.

#### HU-19 — Control de carga académica del estudiante
**Historia:** Como sistema, quiero controlar simultáneamente los créditos totales y las horas semanales acumuladas del estudiante durante la generación de su horario para prevenir la sobrecarga académica.** 
- 1.  La suma de créditos de los cursos asignados no puede superar el límite del estudiante ni el del período (D13).
- 2. La suma de horas semanales de los cursos asignados no puede superar el límite del estudiante (D14).
- 3. Si agregar un curso supera el límite de créditos, el sistema muestra: créditos actuales + créditos del curso vs. límite.
- 4. Si agregar un curso supera el límite de horas, el sistema muestra: horas actuales + horas del curso vs. límite.
- 5. Ambos controles operan de forma independiente; superar cualquiera de los dos bloquea la asignación.
**Priorización:** Alta (Valor 4, Riesgo 3, Complejidad 3)
**Relación CSP:** Restricción D5 (Límite Créditos).

#### HU-20 — Generación automática del horario de estudiantes
**Historia:** Como administrador o estudiante, quiero ejecutar la generación automática del horario individual del estudiante para obtener la selección óptima de cursos disponibles respetando todas las restricciones de la Etapa 3.** 
- 1. La Etapa 3 solo puede ejecutarse con un horario institucional en estado ACTIVO; retorna error descriptivo en caso contrario (EA-12).
. El horario del estudiante se genera en <= 5 segundos.
- 2. El resultado incluye: cursos asignados, componentes, aulas, franjas, créditos totales y horas semanales totales.
- 3. Si no existen opciones en el turno preferido del estudiante, el sistema asigna en turno adyacente y emite TURNO_ALTERNATIVO (D16).
- 4. Para cada curso no asignable, el sistema indica la causa específica: sin vacantes, prerrequisito pendiente, límite de créditos, límite de horas, sin oferta en turno.
**Priorización:** Alta (Valor 4, Riesgo 4, Complejidad 5)
**Relación CSP:** Mini-CSP Estudiantil (Optimización individual).

#### HU-21 — Atomicidad de cursos compuestos (estudiante)
**Historia:** Como sistema, quiero garantizar que los cursos con componentes TEORÍA + PRÁCTICA se asignen de forma completa o no se asignen en absoluto para que el estudiante nunca quede con solo una parte de un curso compuesto.** 
- 1. Si el componente TEORÍA de un curso puede asignarse pero el de PRÁCTICA no (o viceversa), ninguno de los dos se asigna (D17).
- 2. El sistema notifica al estudiante que el curso no pudo asignarse de forma completa, indicando qué componente presentó el conflicto.
- 3. Un curso compuesto parcialmente asignable no reduce el total de créditos del estudiante.
- 4. El solver libera los recursos reservados para el componente que sí tenía asignación provisional.
**Priorización:** Alta (Valor 4, Riesgo 3, Complejidad 4)
**Relación CSP:** Restricción D8 (Co-requisitos paralelos).

#### HU-22 — Consulta de horario por el estudiante
**Historia:** Como estudiante, quiero consultar mi horario generado para el período activo y conocer el detalle de cada curso asignado, incluyendo el componente, el docente, el aula y la franja.** 
- 1. l estudiante autenticado puede consultar únicamente su propio horario; acceder al de otro estudiante retorna error 403.
- 2. La respuesta incluye por cada curso asignado: nombre del curso, tipo de componente, docente, aula, franja y día.
- 3. La respuesta incluye el resumen de carga académica: créditos totales y horas semanales acumuladas vs. límites.
- 4. Si el horario contiene cursos en turno alternativo, el indicador TURNO_ALTERNATIVO se muestra de forma visible.
- 5. La consulta retorna en <= 3 segundos.
**Priorización:** Media (Valor 4, Riesgo 1, Complejidad 2)
**Relación CSP:** N/A.

---

### EP-07 — Visualización y Exportación

#### HU-23 — Grilla semanal de horario
**Historia:** Como usuario (administrador, docente o estudiante), quiero visualizar mi horario en formato de grilla semanal (días x franjas) para tener una vista clara y ordenada de mis asignaciones del período.** 
- 1. La grilla muestra las columnas por día de la semana y las filas por franja horaria.
. Cada celda ocupada muestra: nombre del curso, tipo de componente, docente asignado y aula.
- 2. IEl Administrador visualiza el horario institucional completo; el Docente y el Estudiante visualizan únicamente sus asignaciones propias.
- 3. La grilla carga completamente en <= 3 segundos.
- 4. No se producen solapamientos visuales: dos asignaciones en la misma celda indican un error de datos que debe reportarse.
**Priorización:** Alta (Valor 5, Riesgo 3, Complejidad 4)
**Relación CSP:** N/A.

#### HU-24 — Exportación del horario en PDF
**Historia:** Como usuario (administrador, docente o estudiante), quiero exportar mi horario en formato PDF para tener una copia imprimible o compartible con todos los datos de la grilla.
**Criterios de aceptación:** 
- 1. El archivo PDF contiene todos los campos visibles en la grilla: nombre del curso, componente, docente, aula, día y franja.
- 2. El PDF incluye el nombre del usuario, el período académico y la fecha de exportación en el encabezado.
- 3. La descarga se completa en <= 30 segundos.
- 4. Solo se puede exportar el horario propio; intentar exportar el de otro usuario retorna error 403.
**Priorización:** Baja (Valor 3, Riesgo 2, Complejidad 3)
**Relación CSP:** N/A.

#### HU-25 — Exportación del horario en Excel
**Historia:** Como usuario (administrador, docente o estudiante), quiero exportar mi horario en formato Excel para poder manipular los datos o compartirlos en un formato editable.** 
- 1. El archivo Excel contiene todos los campos visibles en la grilla en hojas organizadas por día o en una hoja única con columna de día.
- 2. La descarga se completa en <= 30 segundos.
- 3. Solo se puede exportar el horario propio; intentar exportar el de otro usuario retorna error 403.
- 4. El archivo es abierto sin errores en Microsoft Excel y LibreOffice Calc.
**Priorización:** Baja (Valor 3, Riesgo 2, Complejidad 2)
**Relación CSP:** N/A.

#### HU-26 — HU-26 Protección ante vulnerabilidades OWASP
**Historia:** Como sistema, quiero estar protegido contra las vulnerabilidades del OWASP Top 10 aplicables al PMV para garantizar la confidencialidad e integridad de los datos académicos.
**Criterios de aceptación:** 
- 1. Todos los accesos a base de datos usan ORM o queries parametrizados (sin SQL Injection)..
- 2. Todas las salidas de texto renderizadas en el frontend aplican escape de caracteres (sin XSS).
- 3. Los endpoints de escritura implementan protección CSRF (token de sincronización o SameSite cookies).
- 4. El sistema opera exclusivamente sobre HTTPS en el entorno de producción.
- 5. Los datos sensibles (contraseñas, tokens) no se exponen en logs ni en respuestas de error.
**Priorización:** Crítica (Valor 5, Riesgo 5, Complejidad 3)
**Relación CSP:** N/A.
