# Spec.md — Sistema de Generación Óptima de Horarios Académicos (SGOHA)

**Versión:** 2.0
**Fecha:** Mayo 2026
**Proyecto:** SGOHA
**Curso:** Taller de Proyectos 2

---

## 1. Introducción

Este documento especifica el comportamiento funcional del sistema SGOHA previo a su desarrollo. Establece de forma precisa qué información procesa el sistema, qué resultados produce y bajo qué condiciones opera correctamente.

El propósito de esta especificación es triple: (1) servir como contrato técnico entre los miembros del equipo de desarrollo, (2) eliminar interpretaciones ambiguas durante la implementación, y (3) documentar los escenarios problemáticos del dominio antes de que se conviertan en errores en producción.

Cualquier módulo del sistema —interfaz de usuario, API REST, motor OR-Tools— debe comportarse de acuerdo con lo descrito aquí. Si durante el desarrollo se detecta una discrepancia, este documento tiene precedencia y debe actualizarse antes de cerrar la tarea correspondiente.

---

## 2. Descripción del sistema

SGOHA automatiza la construcción de horarios académicos a través de tres etapas ejecutadas de forma secuencial. Cada etapa depende de que la anterior haya concluido satisfactoriamente.

| Etapa | Descripción | Actor responsable |
|---|---|---|
| **Etapa 1 — Horario institucional** | Asigna cada componente de curso a un docente, un aula y una franja horaria, garantizando la ausencia de solapamientos. | Administrador |
| **Etapa 2 — Horario de docentes** | Selecciona los horarios disponibles de cada docente para generar su vista personalizada, considerando los cursos que tiene asignados en la Etapa 1. | Administrador / Docente |
| **Etapa 3 — Horario de estudiantes** | Selecciona los cursos disponibles para cada estudiante respetando prerrequisitos, créditos, horas semanales, vacantes y turno preferido. | Administrador / Estudiante |

**Capacidad del PMV:** hasta 100 estudiantes, 20 docentes, 20 cursos y 10 aulas.

**Roles del sistema:** Administrador, Docente, Estudiante.

**Motor de optimización:** OR-Tools (Constraint Satisfaction Problem).

---

## 3. Datos de entrada

### 3.1. Entidades principales

| Entidad | Campos requeridos | Restricciones de validación |
|---|---|---|
| **Estudiante** | Código, nombre completo, ciclo, carrera, historial de cursos aprobados, turno preferido, límite de créditos, límite de horas semanales | El código debe ser único. Los cursos del historial deben existir en el sistema. |
| **Docente** | Código, nombre completo, área de especialización, franjas de disponibilidad semanal | El código debe ser único. La disponibilidad se registra como conjunto de franjas (día, hora inicio, hora fin). |
| **Curso** | Código, nombre, créditos ∈ [1, 6], horas semanales totales ≥ 1, lista de prerrequisitos, lista de corequisitos | Los prerrequisitos y corequisitos referenciados deben existir en el catálogo de cursos. |
| **Aula** | Código, capacidad máxima > 0, tipo (regular / laboratorio), franjas de disponibilidad | La capacidad mínima es 1. El tipo condiciona qué componentes pueden dictarse en ella. |
| **Componente de curso** | Tipo (GENERAL / TEORÍA / PRÁCTICA), horas semanales, tipo de aula requerido | Un curso tiene exactamente un componente GENERAL o la combinación TEORÍA + PRÁCTICA; no se admiten otras configuraciones. La suma de horas de los componentes debe ser igual al total del curso. |

### 3.2. Parámetros del período académico

- Período activo: fechas de inicio y cierre.
- Catálogo de franjas horarias disponibles: día, hora de inicio, hora de fin, turno (mañana / tarde / noche).
- Tiempos de desplazamiento entre edificios: minutos necesarios para trasladarse de un edificio a otro.
- Capacidad máxima de créditos por estudiante por período.
- Capacidad máxima de horas semanales por estudiante por período.

### 3.3. Relaciones de habilitación

- Franjas en las que cada docente puede ser asignado.
- Franjas en las que cada aula está disponible para uso.
- Qué docentes están habilitados para dictar cada componente de curso.
- Qué aulas están autorizadas para cada curso según su tipo.

---

## 4. Resultados generados

### 4.1. Etapa 1 — Horario institucional

| Resultado | Descripción |
|---|---|
| Horario institucional (`BORRADOR`) | Conjunto de asignaciones componente–docente–aula–franja producidas por el solver. Requiere activación por parte del Administrador. |
| Detalle de asignaciones | Por cada componente: docente asignado, aula, franja horaria concreta. |
| Registro de conflictos | Listado de restricciones que no pudieron satisfacerse, identificando el recurso afectado y la causa. |
| Estado de resolución | `EXITOSO` si el solver encontró una solución completa; `FALLIDO` si no, con descripción de los conflictos detectados. |

### 4.2. Etapa 2 — Horario de docentes

| Resultado | Descripción |
|---|---|
| Vista de horario por docente | Grilla personalizada con los componentes asignados al docente: curso, aula, franja y día. |
| Indicador de carga semanal | Total de horas asignadas al docente en el período, agrupadas por día. |
| Alerta de bloques consecutivos excesivos | Se emite cuando el docente supera el umbral de horas continuas recomendado (restricción blanda S2). |

### 4.3. Etapa 3 — Horario de estudiantes

| Resultado | Descripción |
|---|---|
| Horario del estudiante | Conjunto de cursos asignados con sus componentes, franjas y aulas concretas. |
| Resumen de carga académica | Créditos totales acumulados y horas semanales totales frente a los límites del estudiante. |
| Indicador de turno alternativo (`TURNO_ALTERNATIVO`) | Se emite cuando el estudiante es ubicado en un turno distinto al preferido por falta de disponibilidad en el suyo. |
| Notificación de curso no asignable | Si un curso no puede incluirse, el sistema especifica la causa: sin vacantes, prerrequisito pendiente, límite de créditos alcanzado, límite de horas alcanzado, sin oferta en turno disponible. |

### 4.4. Visualización y exportación

- Grilla semanal interactiva (días × franjas) que muestra: nombre del curso, tipo de componente, docente y aula.
- Exportación en formato PDF o Excel con todos los campos visibles en la grilla.
- Tiempo de carga de la grilla: ≤ 3 segundos.
- Tiempo de exportación: ≤ 30 segundos.

---

## 5. Reglas generales de operación

Las siguientes reglas rigen el comportamiento del sistema con independencia del módulo que las ejecute.

1. **Jerarquía de restricciones:** El solver de OR-Tools satisface primero las restricciones duras. Las restricciones blandas solo se optimizan si las duras ya están completamente cubiertas.
2. **Transparencia ante fallos:** Si el solver no puede generar una solución completa, produce la mejor solución parcial posible y reporta con precisión cada conflicto. No se persiste ningún resultado con solapamientos no declarados.
3. **Flujo secuencial obligatorio:** La Etapa 2 requiere que la Etapa 1 haya sido activada. La Etapa 3 requiere que la Etapa 2 esté disponible. No es posible saltar etapas.
4. **Control de carga académica combinado:** La carga del estudiante se controla por dos variables simultáneas: créditos totales por período y horas semanales totales. Superar cualquiera de los dos límites bloquea la asignación.
5. **Créditos por curso, no por componente:** Un curso con TEORÍA + PRÁCTICA suma sus créditos una sola vez al total del estudiante, sin importar cuántos componentes tenga.
6. **Integridad de cursos compuestos:** Un curso con componentes TEORÍA + PRÁCTICA se asigna completo o no se asigna. No existe estado parcial.
7. **Integridad de corequisitos:** Los cursos declarados como corequisitos entre sí se asignan en conjunto. Si uno no puede asignarse, todos los del grupo quedan excluidos.
8. **Rastreabilidad de asignaciones:** Cada asignación generada debe poder vincularse a sus datos de origen: docente, aula, franja y componente. No se aceptan asignaciones sin trazabilidad.
9. **Mensajes de error orientados al usuario:** Todo mensaje de error dirigido al usuario debe identificar qué restricción fue violada y qué recurso está involucrado. No se aceptan mensajes genéricos sin contexto.
10. **Validación inmediata en edición manual:** Cuando el Administrador modifica una asignación de forma manual, el sistema verifica en ≤ 1 segundo si el cambio genera un solapamiento, antes de guardarlo.

---

## 6. Restricciones duras

Una asignación que incumpla cualquiera de las restricciones duras es inválida y no puede persistirse.

### Etapa 1 — Horario institucional

| ID | Restricción | Fundamento |
|---|---|---|
| **D1** | Un docente no puede tener dos componentes asignados en el mismo bloque horario. | Imposibilidad física de estar en dos lugares simultáneamente. |
| **D2** | Un aula no puede alojar dos componentes distintos en el mismo bloque horario. | El aula es un recurso físico no compartible de forma simultánea. |
| **D3** | Solo se asignan franjas dentro de la disponibilidad declarada por el docente. | La disponibilidad es un compromiso formal entre el docente y la institución. |
| **D4** | Solo se asignan franjas dentro del período de habilitación del aula. | Las aulas pueden estar fuera de servicio por mantenimiento u otros usos institucionales. |
| **D5** | El tipo de aula asignada debe coincidir con el tipo requerido por el componente. | Un componente de práctica no puede dictarse en un aula sin equipamiento de laboratorio. |
| **D6** | El docente asignado debe tener habilitación para dictar el componente específico. | No todos los docentes están calificados para todos los componentes del catálogo. |
| **D7** | La cantidad de horas asignadas a un componente debe ser exactamente la definida en su configuración. | El plan curricular establece una carga horaria fija por componente. |
| **D8** | La capacidad del aula debe ser igual o mayor a la demanda proyectada del curso. | El aforo del aula es un límite físico no negociable. |
| **D9** | Si un docente tiene bloques consecutivos en edificios distintos, el intervalo entre ellos debe permitir el traslado. | Los tiempos de desplazamiento entre edificios son una restricción física del campus. |

### Etapa 2 — Horario de docentes

| ID | Restricción | Fundamento |
|---|---|---|
| **D10** | El horario generado para un docente solo puede incluir los componentes que le fueron asignados en la Etapa 1. | La Etapa 2 es una vista derivada de la Etapa 1; no puede agregar ni eliminar asignaciones. |
| **D11** | El horario del docente no puede mostrar bloques que se solapen entre sí. | Coherencia con D1; la vista no puede contradecir las restricciones del horario institucional. |

### Etapa 3 — Horario de estudiantes

| ID | Restricción | Fundamento |
|---|---|---|
| **D12** | El estudiante solo puede inscribir un curso si tiene todos sus prerrequisitos aprobados. | El plan de estudios establece prerrequisitos como condición académica no negociable. |
| **D13** | La suma de créditos de los cursos asignados no puede superar el límite del período ni el del estudiante. | Límite académico diseñado para prevenir la sobrecarga. |
| **D14** | La suma de horas semanales de los cursos asignados no puede superar el límite del estudiante. | Complemento al control de créditos; limita la carga horaria concreta del estudiante. |
| **D15** | Solo se asigna un estudiante a un componente si existen vacantes disponibles en esa sección. | Cada sección tiene un cupo físico máximo definido. |
| **D16** | Los bloques asignados deben corresponder al turno preferido del estudiante. Si no existen opciones en ese turno, se puede asignar en turno adyacente emitiendo `TURNO_ALTERNATIVO`. | El turno preferido es una restricción de disponibilidad personal del estudiante. |
| **D17** | Un curso con TEORÍA + PRÁCTICA se asigna de forma atómica: ambos componentes o ninguno. | El estudiante no puede cursar solo una parte de un curso compuesto. |
| **D18** | Los corequisitos se inscriben en bloque: todos o ninguno. | Los corequisitos fueron diseñados para cursarse de manera simultánea. |
| **D19** | El intervalo entre bloques consecutivos del estudiante en edificios distintos debe permitir el traslado. | El estudiante también está sujeto a los tiempos físicos de desplazamiento. |

---

## 7. Restricciones blandas

Las restricciones blandas son criterios de calidad que el solver intenta optimizar. Su incumplimiento no invalida el horario, pero reduce su puntuación interna.

| ID | Criterio de calidad | Efecto si no se cumple |
|---|---|---|
| **B1** | Minimizar los bloques libres intermedios en el horario del estudiante. | Los horarios con huecos prolongados reducen la percepción de eficiencia del sistema. |
| **B2** | Evitar que un docente acumule más de 4 horas consecutivas de clase sin descanso. | Afecta la calidad del dictado y el bienestar del docente. |
| **B3** | Distribuir los bloques de un mismo componente a lo largo de la semana, sin concentrarlos en un solo día. | Las jornadas sobrecargadas impactan negativamente tanto a docentes como a estudiantes. |
| **B4** | Asignar aulas cuya capacidad se aproxime a la matrícula real del curso. | El uso de aulas sobredimensionadas representa un desperdicio de recursos institucionales. |
| **B5** | Asignar los componentes TEORÍA y PRÁCTICA de un mismo curso en días distintos. | Separar las sesiones permite al estudiante prepararse con mayor efectividad entre una y otra. |
| **B6** | Agrupar cursos del mismo ciclo en franjas compatibles entre sí. | Facilita que los estudiantes de un mismo ciclo puedan organizar su horario de forma coherente. |

---

## 8. Escenarios atípicos y respuestas del sistema

Esta sección describe las situaciones que se apartan del flujo normal de operación y cómo el sistema debe responder ante cada una, sin generar fallos ni resultados incoherentes.

| ID | Situación | Respuesta esperada del sistema |
|---|---|---|
| **EA-01** | Docente sin franjas de disponibilidad registradas. | El solver no le asigna ningún componente. Registra el conflicto y continúa con el resto del horario. |
| **EA-02** | Ningún aula disponible tiene capacidad suficiente para un curso determinado. | El curso no se asigna. Se emite `SIN_AULA_DISPONIBLE` con el tamaño requerido vs. la capacidad máxima existente. |
| **EA-03** | Ningún docente habilitado está disponible para dictar un componente. | El componente queda sin asignación. El curso completo se excluye del horario y el conflicto se registra. |
| **EA-04** | La cantidad de cursos supera los bloques horarios disponibles. | El solver prioriza los componentes con menor cantidad de opciones (heurística MRV de OR-Tools). Los que no encuentran franja emiten `SIN_FRANJA_DISPONIBLE`. |
| **EA-05** | El único docente habilitado para un curso solo está disponible en turno nocturno, y el curso requiere turno diurno. | El componente no se asigna. No se fuerza la asignación violando D3. Se registra el conflicto. |
| **EA-06** | Un curso compuesto requiere aula regular para teoría y laboratorio para práctica, pero no existe laboratorio disponible. | El solver busca aulas por separado para cada componente. Si falta alguna, reporta `SIN_AULA_DISPONIBLE` para ese componente y descarta el curso completo por D17. |
| **EA-07** | Un curso corequisito no puede asignarse por falta de docente o aula. | Se libera la reserva del corequisito que sí tenía asignación provisional. Ambos quedan excluidos. Se notifica al estudiante. |
| **EA-08** | El estudiante no tiene turno preferido registrado. | El solver usa todas las franjas disponibles sin restricción de turno. No se emite `TURNO_ALTERNATIVO`. |
| **EA-09** | Varios cursos compiten por el mismo aula en el mismo bloque horario. | Se asigna según el orden de prioridad del solver. Los restantes buscan aula alternativa; si no existe, emiten `SIN_AULA_DISPONIBLE`. |
| **EA-10** | Agregar un curso al horario del estudiante superaría el límite de créditos. | El curso no se agrega. El sistema muestra: créditos actuales + créditos del curso vs. límite (ej: "18 + 5 = 23 créditos, límite: 20"). |
| **EA-11** | Agregar un curso al horario del estudiante superaría el límite de horas semanales. | El curso no se agrega. El sistema muestra: horas actuales + horas del curso vs. límite (ej: "18 + 4 = 22 horas, límite: 20"). |
| **EA-12** | Se intenta iniciar la Etapa 3 sin que la Etapa 2 esté disponible. | La Etapa 3 no se inicia. El sistema devuelve: "El horario de docentes aún no ha sido generado para este período." |
| **EA-13** | El solver de OR-Tools no encuentra solución dentro del tiempo límite de 30 segundos. | Se notifica al Administrador con los conflictos identificados hasta ese momento. No se persiste ningún resultado parcial inválido. |

---

## 9. Definición precisa de términos

Esta sección fija el significado exacto de los conceptos que en versiones anteriores de la especificación resultaban ambiguos o podían interpretarse de múltiples maneras.

| Término o situación | Ambigüedad original | Definición adoptada en este documento |
|---|---|---|
| "Solapamiento" | No distinguía si era de docente, aula o estudiante. | D1: solapamiento de docente. D2: solapamiento de aula. D19: solapamiento en el horario personal del estudiante. Cada uno es una restricción independiente. |
| "Disponibilidad del docente" | No estaba claro si aplicaba solo al solver o también a la edición manual. | D3 aplica durante la generación automática. La regla 10 de operación aplica cuando el Administrador edita manualmente. |
| "Carga académica del estudiante" | No precisaba si era en créditos, horas o ambos. | SGOHA controla ambas dimensiones simultáneamente: créditos por período (D13) y horas semanales (D14). Superar cualquiera de las dos bloquea la inscripción. |
| "Velocidad de generación" | No definía tiempos ni condiciones de medición. | Etapa 1: ≤ 30 segundos bajo las condiciones del PMV. Etapa 3: ≤ 5 segundos por estudiante. Condiciones base: 100 estudiantes, 20 docentes, 20 cursos, 10 aulas. |
| "Curso con teoría y práctica" | No estaba claro si eran cursos separados o partes del mismo. | Son componentes del mismo curso. El estudiante acumula créditos por el curso una sola vez, pero el solver agenda dos bloques horarios distintos. |
| "Prioridad de restricciones" | No existía jerarquía documentada. | Las restricciones duras (sección 6) tienen prioridad absoluta. Las blandas (sección 7) se optimizan solo después. La jerarquía está fijada en la regla 1 de operación. |
| "Generación parcial" | No estaba claro qué sucede si el solver no puede completar el horario. | Regla 2: se genera la mejor solución parcial alcanzable y se reportan todos los conflictos. EA-13 define el comportamiento específico ante timeout. |
| "Validación de prerrequisitos" | No especificaba en qué etapa se valida ni qué información se muestra al usuario. | D12 aplica en la Etapa 3. El sistema indica exactamente qué prerrequisito está pendiente (regla 9). EA-07 define el comportamiento cuando un corequisito falla. |

---

## 10. Conflictos frecuentes del dominio y su manejo

Esta sección documenta los problemas más recurrentes en sistemas de generación de horarios académicos y describe cómo SGOHA los previene o resuelve mediante sus restricciones y reglas.

### 10.1. Docente asignado en paralelo a dos cursos

**Escenario:** El Administrador intenta registrar manualmente al mismo docente en los cursos MAT-201 y FIS-101 en la misma franja del miércoles.

**Conflicto:** El docente no puede estar físicamente en dos aulas al mismo tiempo.

**Respuesta del sistema:**
- D1 bloquea la asignación antes de persistirla.
- La regla 10 obliga a validar en ≤ 1 segundo y mostrar el motivo del rechazo.
- El mensaje indica: nombre del docente, cursos en conflicto y franja horaria afectada.

---

### 10.2. Aula asignada a dos cursos simultáneos

**Escenario:** El solver intenta ubicar los cursos QUI-101 y BIO-102 en el Laboratorio L-2 en el mismo bloque del jueves.

**Conflicto:** El laboratorio no puede ser usado por dos grupos distintos al mismo tiempo.

**Respuesta del sistema:**
- D2 impide la asignación doble.
- La base de datos aplica una restricción de unicidad como segunda línea de defensa: `UNIQUE(horario_id, aula_id, franja_id)`.

---

### 10.3. Curso compuesto asignado de forma incompleta

**Escenario:** El solver encuentra docente y aula para la teoría de MAT-301, pero el único laboratorio compatible para su práctica ya está ocupado en todas las franjas.

**Conflicto:** El estudiante quedaría con solo una parte del curso, incumpliendo el plan curricular.

**Respuesta del sistema:**
- D17 exige atomicidad: si la práctica no puede asignarse, la teoría se libera también.
- EA-06 detalla el tratamiento cuando falta aula para uno de los componentes.

---

### 10.4. Exceso de carga por corequisitos

**Escenario:** Un estudiante desea inscribir dos cursos corequisitos, pero juntos superan tanto su límite de créditos como su límite de horas semanales.

**Conflicto:** D13 y D14 (límites de carga) colisionan con D18 (atomicidad de corequisitos).

**Respuesta del sistema:**
- D13 y D14 tienen precedencia: si el grupo de corequisitos supera cualquiera de los dos límites, ninguno se asigna.
- El sistema notifica al estudiante con los valores concretos: créditos resultantes, horas resultantes y los límites correspondientes.

---

### 10.5. Saturación de franjas en días de alta demanda

**Escenario:** La mayoría de los docentes solo tienen disponibilidad de lunes a miércoles. El solver debe distribuir 20 cursos en esos tres días.

**Conflicto:** La concentración de demanda en pocos días genera conflictos en cadena entre cursos, docentes y aulas.

**Respuesta del sistema:**
- OR-Tools aplica la heurística MRV (Minimum Remaining Values): los componentes con menos opciones disponibles se asignan primero.
- Los componentes sin franja viable emiten `SIN_FRANJA_DISPONIBLE` individualmente.
- EA-04 documenta este comportamiento como escenario atípico reconocido.
