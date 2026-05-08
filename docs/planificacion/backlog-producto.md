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

#### HU-12 — Ejecución del Horario Institucional
**Historia:** Como administrador, quiero ejecutar la generación automática del horario institucional y recibir el resultado (solución completa o reporte de conflictos) para decidir si activarlo o ajustarlo.
**Criterios de aceptación:** 
- 1. El endpoint de generación ejecuta el solver de OR-Tools con los datos del período activo.
- 2. El resultado se produce en <= 30 segundos bajo el escenario base del PMV (100 estudiantes, 20 docentes, 20 cursos, 10 aulas).
- 3. Si el solver encuentra solución completa, retorna el horario en estado BORRADOR.
- 4.  Si el solver no encuentra solución o agota el tiempo límite (30 s), retorna los conflictos identificados sin persistir ningún horario inválido.
- 5. Cada conflicto reportado identifica el recurso afectado y la restricción violada 
**Priorización:** Crítica (Valor 5, Riesgo 5, Complejidad 4)
**Relación CSP:** Función Objetivo y Exploración.

#### HU-13 — Activación de Horario
**Historia:** Como administrador, quiero aprobar un horario generado.
**Criterios de aceptación:** 
- 1. Transición de estado bloquea cualquier regeneración algorítmica posterior.
- 2. Registra log de auditoría con fecha y usuario que aprobó el horario.
- 3. Habilita visibilidad del horario para consultas de estudiantes y docentes.
**Priorización:** Media (Valor 3, Riesgo 1, Complejidad 2)
**Relación CSP:** N/A (Flujo transaccional).

#### HU-14 — Ajuste Manual de Asignaciones
**Historia:** Como administrador, quiero mover manualmente una clase si el CSP la puso en un lugar indeseado pero factible.
**Criterios de aceptación:** 
- 1. Interfaz permite Drag & Drop de un bloque de clase hacia otra celda.
- 2. Backend valida en tiempo real si el destino viola la unicidad D1 o D2.
- 3. Retorna HTTP 422 Unprocessable Entity si se intenta un movimiento que genera cruce.
**Priorización:** Alta (Valor 4, Riesgo 3, Complejidad 4)
**Relación CSP:** Validación heurística post-solver.

#### HU-15 — Restricciones Blandas y Puntuación
**Historia:** Como sistema, quiero optimizar el horario (B1-B5) minimizando huecos de docentes.
**Criterios de aceptación:** 
- 1. Integra matriz de preferencias de turno de docentes.
- 2. El solver implementa `model.Maximize()` sobre las variables de confort.
- 3. La ejecución con restricciones blandas respeta el mismo timeout de 30s.
**Priorización:** Baja (Valor 3, Riesgo 4, Complejidad 5)
**Relación CSP:** Soft Constraints y Variables de Penalización.

---

### EP-05 — Generación de Horario de Docentes

#### HU-16 — Generación de Vista de Docentes
**Historia:** Como administrador, quiero segmentar el horario total para cada docente.
**Criterios de aceptación:** 
- 1. Filtra las asignaciones maestras por `teacher_id`.
- 2. Devuelve JSON estructurado por días de la semana y horas ordenadas.
- 3. Latencia del endpoint menor a 300ms (con uso de índices).
**Priorización:** Media (Valor 3, Riesgo 2, Complejidad 2)
**Relación CSP:** Parseo de resultados del Solver.

#### HU-17 — Consulta de Horario por Docente
**Historia:** Como docente, quiero ver mi horario y confirmar que no hay cruces.
**Criterios de aceptación:** 
- 1. UI dibuja bloques de colores diferenciados por componente (T/P).
- 2. Tooltip o tarjeta muestra el aula y pabellón asignado.
- 3. Componente 100% responsivo para visualización en móviles.
**Priorización:** Alta (Valor 5, Riesgo 1, Complejidad 2)
**Relación CSP:** N/A.

---

## Sprint 3 — Horario de Estudiantes y UI

### EP-06 — Generación de Horario de Estudiantes

#### HU-18 — Validación de Prerrequisitos
**Historia:** Como sistema, quiero evitar matricular a estudiantes en cursos no aptos.
**Criterios de aceptación:** 
- 1. Verifica historial de notas aprobadas antes de confirmar la canasta.
- 2. Retorna HTTP 409 si el alumno no cuenta con el prerrequisito exigido.
- 3. El mensaje de error detalla exactamente qué curso previo le falta.
**Priorización:** Crítica (Valor 5, Riesgo 4, Complejidad 4)
**Relación CSP:** Restricción de Dominio Estudiantil.

#### HU-19 — Control de Carga (20-22)
**Historia:** Como sistema, quiero asegurar que el alumno lleve entre 20 y 22 créditos.
**Criterios de aceptación:** 
- 1. Acumulador suma dinámicamente los créditos en la interfaz.
- 2. Backend bloquea confirmación de matrícula si la suma < 20 o > 22.
- 3. Excepciones de carga (sobrecréditos) requieren bandera de override de administrador.
**Priorización:** Alta (Valor 4, Riesgo 3, Complejidad 3)
**Relación CSP:** Restricción D5 (Límite Créditos).

#### HU-20 — Horario Automático Estudiantes
**Historia:** Como estudiante, quiero que el sistema elija las secciones óptimas para mí.
**Criterios de aceptación:** 
- 1. El motor evalúa secciones disponibles sin generar cruces con lo ya elegido.
- 2. Retorna las mejores combinaciones posibles balanceando días libres.
- 3. Considera tiempos de traslado (HU-10) entre clases consecutivas.
**Priorización:** Alta (Valor 4, Riesgo 4, Complejidad 5)
**Relación CSP:** Mini-CSP Estudiantil (Optimización individual).

#### HU-21 — Atomicidad de Cursos
**Historia:** Como sistema, quiero que Teoría y Práctica del mismo curso no se dividan.
**Criterios de aceptación:** 
- 1. Si se elige Teoría, exige seleccionar la Práctica correspondiente del mismo código.
- 2. Retorna HTTP 400 Bad Request si el payload omite uno de los componentes obligatorios.
- 3. UI bloquea deseleccionar un componente si el otro sigue marcado.
**Priorización:** Alta (Valor 4, Riesgo 3, Complejidad 4)
**Relación CSP:** Restricción D8 (Co-requisitos paralelos).

#### HU-22 — Consulta de Horario Alumno
**Historia:** Como estudiante, quiero ver mis clases aprobadas.
**Criterios de aceptación:** 
- 1. Renderiza componentes inscritos con estado visual (Confirmado / Pendiente).
- 2. Opción de imprimir o exportar versión preliminar.
- 3. Tiempo de renderizado inicial de la grilla menor a 1 segundo.
**Priorización:** Media (Valor 4, Riesgo 1, Complejidad 2)
**Relación CSP:** N/A.

---

### EP-07 — Visualización y Exportación

#### HU-23 — Grilla Semanal
**Historia:** Como usuario, quiero ver mi horario en grilla (L-S).
**Criterios de aceptación:** 
- 1. Componente React renderiza estructura de tabla 6x14 horas.
- 2. Incorpora tooltips interactivos con detalle de docente y pabellón.
- 3. Incluye filtros rápidos por día de la semana y turno (Mañana/Tarde).
**Priorización:** Alta (Valor 5, Riesgo 3, Complejidad 4)
**Relación CSP:** N/A.

#### HU-24 — Exportación PDF
**Historia:** Como usuario, quiero descargar mi horario en PDF.
**Criterios de aceptación:** 
- 1. El documento incluye cabecera con datos del alumno/docente y logo institucional.
- 2. Usa formato A4 apaisado para asegurar que la tabla semanal no se corte.
- 3. La descarga y generación toma menos de 3 segundos.
**Priorización:** Baja (Valor 3, Riesgo 2, Complejidad 3)
**Relación CSP:** N/A.

#### HU-25 — Exportación Excel
**Historia:** Como usuario, quiero mi horario en XLSX.
**Criterios de aceptación:** 
- 1. Las columnas son días de la semana y las filas franjas horarias.
- 2. La primera fila (cabecera) está congelada en el archivo resultante.
- 3. Auto-ajusta el ancho de celda para legibilidad del curso.
**Priorización:** Baja (Valor 3, Riesgo 2, Complejidad 2)
**Relación CSP:** N/A.

#### HU-26 — Seguridad OWASP
**Historia:** Como sistema, quiero estar libre de inyecciones.
**Criterios de aceptación:** 
- 1. Implementa Helmet y configuración estricta de CORS en el backend Node.
- 2. Pasa análisis de código estático sin vulnerabilidades altas.
- 3. Incorpora Rate Limiting en endpoints de autenticación para mitigar fuerza bruta.
**Priorización:** Crítica (Valor 5, Riesgo 5, Complejidad 3)
**Relación CSP:** N/A.
