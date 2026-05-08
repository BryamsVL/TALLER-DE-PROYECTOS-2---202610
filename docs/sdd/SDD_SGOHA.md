# SDD.md — Spec-Driven Development (SGOHA)

**Versión:** 1.0  
**Fecha:** Mayo 2026  
**Proyecto:** SGOHA — Sistema de Generación Óptima de Horarios Académicos  
**Curso:** Taller de Proyectos 2  
**Referencia base:** Spec_SGOHA_v2_0.md, modelado_SGOHA.md, HU_SGOHA.md

---

## Propósito del documento

Este documento traduce la especificación funcional de SGOHA en **contratos de comportamiento concretos por módulo**: para cada operación del sistema se define con precisión qué entrada produce qué salida bajo qué condición. Está alineado con las historias de usuario del proyecto (HU-01 a HU-26) y sirve como referencia de implementación para el desarrollo con TDD.

Cada contrato tiene la forma:

> **Dado** un estado del sistema y una entrada concreta  
> **Cuando** se ejecuta la operación  
> **Entonces** la salida es exactamente la especificada

---

## 1. Módulo de Autenticación y Control de Acceso

### 1.1. Registro de usuario (`POST /api/auth/register`)

| # | Condición previa | Entrada | Salida esperada | Código HTTP |
|---|---|---|---|---|
| C1 | No existe usuario con ese email | `{nombre, email, contraseña, rol}` válidos | Usuario creado, sin exponer `password_hash` | 201 |
| C2 | Ya existe usuario con el mismo email | Cualquier payload con email duplicado | `{"error": "El email ya está registrado"}` | 400 |
| C3 | Rol fuera del conjunto permitido | `rol = "superadmin"` (u otro no definido) | `{"error": "Rol inválido. Valores permitidos: administrador, docente, estudiante"}` | 400 |
| C4 | Campo obligatorio ausente o vacío | Payload sin `nombre`, o `nombre = ""` | `{"error": "El campo '<campo>' es obligatorio"}` | 400 |

**Invariante de seguridad:** La contraseña almacenada es siempre el hash bcrypt con cost factor ≥ 10. Nunca se devuelve en ninguna respuesta.

---

### 1.2. Inicio de sesión (`POST /api/auth/login`)

| # | Condición previa | Entrada | Salida esperada | Código HTTP |
|---|---|---|---|---|
| C1 | Usuario registrado con rol `administrador` | `{email, contraseña}` correctos | JWT firmado con `{id, email, rol}`, expiración 8 h | 200 |
| C2 | Usuario registrado con rol `docente` | `{email, contraseña}` correctos | JWT firmado con `{id, email, rol}`, expiración 8 h | 200 |
| C3 | Usuario registrado con rol `estudiante` | `{email, contraseña}` correctos | JWT firmado con `{id, email, rol}`, expiración 8 h | 200 |
| C4 | Email no registrado | Cualquier email | `{"error": "Credenciales inválidas"}` (mensaje genérico) | 401 |
| C5 | Contraseña incorrecta | Email válido + contraseña errónea | `{"error": "Credenciales inválidas"}` (mensaje genérico) | 401 |
| C6 | JWT expirado usado en cualquier endpoint protegido | Header `Authorization: Bearer <token_expirado>` | `{"error": "Token expirado"}` | 401 |

**Invariante:** El mensaje de error de C4 y C5 es **idéntico** para no revelar qué campo falló.

---

### 1.3. Control de acceso por rol (middleware)

| # | Token presentado | Endpoint solicitado | Salida esperada | Código HTTP |
|---|---|---|---|---|
| C1 | Rol `administrador` | Cualquier endpoint de administración | Operación ejecutada normalmente | 2xx |
| C2 | Rol `estudiante` | `POST /api/schedules/institutional/generate` | `{"error": "Acceso denegado. Se requiere rol: administrador"}` | 403 |
| C3 | Rol `docente` | `POST /api/schedules/institutional/{id}/activate` | `{"error": "Acceso denegado. Se requiere rol: administrador"}` | 403 |
| C4 | Sin token / token malformado | Cualquier endpoint protegido | `{"error": "Autenticación requerida"}` | 401 |
| C5 | Rol `estudiante` | `GET /api/schedules/students/{propio_id}` | Horario del estudiante autenticado | 200 |
| C6 | Rol `estudiante` | `GET /api/schedules/students/{otro_id}` | `{"error": "Acceso denegado al recurso de otro usuario"}` | 403 |

---

## 2. Módulo de Gestión de Entidades Base (CRUD)

### 2.1. Estudiantes (`/api/students`)

| # | Operación | Condición previa | Entrada | Salida esperada | HTTP |
|---|---|---|---|---|---|
| C1 | POST | No existe código duplicado | Payload completo y válido | Estudiante creado | 201 |
| C2 | POST | Código ya registrado | `codigo = "E001"` existente | `{"error": "Código de estudiante duplicado: E001"}` | 400 |
| C3 | POST | Curso aprobado referenciado no existe | `cursos_aprobados: ["CUR-999"]` | `{"error": "Curso no encontrado en catálogo: CUR-999"}` | 400 |
| C4 | GET (listado) | Existen estudiantes | — | Lista completa, tiempo ≤ 3 s | 200 |
| C5 | GET /{id} | Estudiante existe | `id` válido | Objeto estudiante completo | 200 |
| C6 | GET /{id} | Estudiante no existe | `id` inexistente | `{"error": "Estudiante no encontrado"}` | 404 |
| C7 | PUT /{id} | Estudiante existe | Campos a modificar | Estudiante actualizado | 200 |
| C8 | DELETE /{id} | Estudiante existe | `id` válido | Confirmación de eliminación | 200 |

---

### 2.2. Docentes (`/api/teachers`)

| # | Operación | Condición previa | Entrada | Salida esperada | HTTP |
|---|---|---|---|---|---|
| C1 | POST | No existe código duplicado | Payload completo y válido | Docente creado | 201 |
| C2 | POST | Código ya registrado | `codigo = "D001"` existente | `{"error": "Código de docente duplicado: D001"}` | 400 |
| C3 | GET (listado) | — | — | Lista completa, tiempo ≤ 3 s | 200 |
| C4 | PUT /{id} | Docente existe | Campos modificados | Docente actualizado | 200 |
| C5 | DELETE /{id} | Docente existe | `id` válido | Confirmación de eliminación | 200 |

#### Disponibilidad de docente (`/api/teachers/{id}/availability`)

| # | Operación | Condición | Entrada | Salida esperada | HTTP |
|---|---|---|---|---|---|
| C6 | POST | Docente existe | `[{dia, hora_inicio, hora_fin, disponible}]` | Disponibilidad registrada | 201 |
| C7 | POST | `hora_fin ≤ hora_inicio` | Franja inválida | `{"error": "hora_fin debe ser posterior a hora_inicio"}` | 400 |
| C8 | GET | Docente existe | — | Lista de franjas del docente | 200 |
| C9 | Motor CSP, Etapa 1 | Docente sin franjas disponibles | — | Sin asignaciones para ese docente; conflicto registrado; proceso continúa (EA-01) | — |

---

### 2.3. Cursos y Componentes (`/api/courses`)

| # | Operación | Condición | Entrada | Salida esperada | HTTP |
|---|---|---|---|---|---|
| C1 | POST curso | Código único | Payload válido (créditos ∈ [1,6], horas ≥ 1) | Curso creado | 201 |
| C2 | POST curso | Código duplicado | `codigo` existente | `{"error": "Código de curso duplicado"}` | 400 |
| C3 | POST curso | Prerrequisito no existe | `prerrequisitos: ["CUR-999"]` | `{"error": "Prerrequisito no encontrado en catálogo: CUR-999"}` | 400 |
| C4 | POST curso | Corequisito no existe | `corequisitos: ["CUR-999"]` | `{"error": "Corequisito no encontrado en catálogo: CUR-999"}` | 400 |
| C5 | POST componente | Configuración GENERAL + TEORÍA simultáneamente | Ambos tipos en mismo curso | `{"error": "Configuración inválida: un curso no puede tener GENERAL y TEORÍA/PRÁCTICA simultáneamente"}` | 400 |
| C6 | POST componente | Solo TEORÍA sin PRÁCTICA (o viceversa) | Un solo componente compuesto | `{"error": "Configuración inválida: TEORÍA requiere PRÁCTICA y viceversa"}` | 400 |
| C7 | POST componente | Suma de horas de componentes ≠ horas totales del curso | Horas inconsistentes | `{"error": "La suma de horas de componentes (<X>h) no coincide con el total del curso (<Y>h)"}` | 400 |
| C8 | POST componente | Configuración válida (GENERAL o TEORÍA+PRÁCTICA) | Horas consistentes | Componentes registrados | 201 |

---

### 2.4. Aulas (`/api/classrooms`)

| # | Operación | Condición | Entrada | Salida esperada | HTTP |
|---|---|---|---|---|---|
| C1 | POST | Código único, capacidad > 0 | Payload válido | Aula creada | 201 |
| C2 | POST | Capacidad = 0 o negativa | `capacidad = 0` | `{"error": "La capacidad del aula debe ser mayor a 0"}` | 400 |
| C3 | POST | Tipo fuera del conjunto | `tipo = "anfiteatro"` | `{"error": "Tipo inválido. Valores permitidos: regular, laboratorio"}` | 400 |
| C4 | POST | Código duplicado | `codigo` existente | `{"error": "Código de aula duplicado"}` | 400 |

---

### 2.5. Franjas Horarias (`/api/timeslots`)

| # | Operación | Condición | Entrada | Salida esperada | HTTP |
|---|---|---|---|---|---|
| C1 | POST | Horario válido | `{dia, hora_inicio, hora_fin, turno}` | Franja registrada y vinculada al período activo | 201 |
| C2 | POST | `hora_fin ≤ hora_inicio` | Franja inválida | `{"error": "hora_fin debe ser posterior a hora_inicio"}` | 400 |
| C3 | POST | Turno fuera del conjunto | `turno = "madrugada"` | `{"error": "Turno inválido. Valores permitidos: mañana, tarde, noche"}` | 400 |

---

### 2.6. Configuración del Período (`/api/period`)

| # | Operación | Condición | Entrada | Salida esperada | HTTP |
|---|---|---|---|---|---|
| C1 | POST travel-times | Par de edificios válido | `{edificio_origen, edificio_destino, minutos}` | Tiempo de traslado registrado | 201 |
| C2 | PUT config | Parámetros válidos | `{limite_creditos_periodo, limite_horas_semanales_periodo}` | Configuración actualizada | 200 |

---

## 3. Módulo de Generación de Horario Institucional (Etapa 1)

### 3.1. Generación automática (`POST /api/schedules/institutional/generate`)

| # | Condición previa | Entrada | Salida esperada | HTTP |
|---|---|---|---|---|
| C1 | Datos completos del período, sin conflictos insalvables | Período activo con cursos, docentes, aulas y franjas cargadas | Horario institucional en estado `BORRADOR`, cero solapamientos, tiempo ≤ 30 s | 200 |
| C2 | Docente sin franjas disponibles (EA-01) | Período activo | Horario parcial sin asignar ese docente; `conflictos: [{recurso: "docente_id", causa: "sin_disponibilidad"}]` | 200 |
| C3 | Ninguna aula con capacidad suficiente (EA-02) | Período activo | Curso excluido; `conflictos: [{recurso: "curso_id", causa: "SIN_AULA_DISPONIBLE", capacidad_requerida: N, capacidad_maxima_existente: M}]` | 200 |
| C4 | Ningún docente habilitado para un componente (EA-03) | Período activo | Componente sin asignación, curso excluido; conflicto registrado | 200 |
| C5 | Franjas insuficientes para todos los cursos (EA-04) | Período activo saturado | Heurística MRV aplicada; componentes sin franja emiten `SIN_FRANJA_DISPONIBLE` | 200 |
| C6 | Solver agota el tiempo límite de 30 s (EA-13) | Datos complejos | Notificación al administrador con conflictos identificados hasta ese momento; ningún resultado persiste | 200 |
| C7 | Aula de laboratorio no disponible para componente PRÁCTICA (EA-06) | Período con laboratorio saturado | Curso completo excluido (D17); `conflictos: [{componente: "PRÁCTICA", causa: "SIN_AULA_DISPONIBLE"}]` | 200 |

**Invariante (Regla 2):** El sistema **nunca** persiste un horario con solapamientos sin reportarlos. Ante cualquier fallo del solver, se emite el mejor resultado parcial alcanzable más el reporte detallado de conflictos.

---

### 3.2. Restricciones duras del solver (D1–D9)

Cada restricción produce un resultado específico cuando es violada durante la construcción de la solución:

| Restricción | Condición de violación | Resultado del solver |
|---|---|---|
| **D1** | Docente asignado a dos componentes en la misma franja | Asignación rechazada; franja alternativa buscada |
| **D2** | Aula asignada a dos componentes en la misma franja | Asignación rechazada; aula alternativa buscada |
| **D3** | Franja fuera de la disponibilidad declarada del docente | Franja excluida del dominio de ese docente |
| **D4** | Franja fuera del período de habilitación del aula | Franja excluida del dominio de esa aula |
| **D5** | Tipo de aula no coincide con el requerido por el componente | Aula excluida del dominio del componente |
| **D6** | Docente no habilitado para ese componente | Docente excluido del dominio del componente |
| **D7** | Horas asignadas ≠ horas definidas en el componente | Solución descartada como inválida |
| **D8** | Capacidad del aula < demanda proyectada del curso | Aula excluida del dominio del componente |
| **D9** | Tiempo de traslado entre edificios > intervalo entre bloques consecutivos | Par (franja1, franja2) excluido del dominio |

---

### 3.3. Activación y cancelación (`POST /api/schedules/institutional/{id}/activate` / `/cancel`)

| # | Condición previa | Operación | Salida esperada | HTTP |
|---|---|---|---|---|
| C1 | Horario en `BORRADOR`, cero solapamientos | Activar | Estado → `ACTIVO`; recursos bloqueados para reasignación | 200 |
| C2 | Horario en `BORRADOR` con solapamientos pendientes | Activar | `{"error": "El horario contiene solapamientos. Corrija antes de activar."}` | 409 |
| C3 | Horario en `ACTIVO` | Modificar directamente | `{"error": "El horario está activo. Cancélelo primero para modificarlo."}` | 409 |
| C4 | Horario en `ACTIVO` | Cancelar | Estado → `CANCELADO`; todos los recursos liberados para nueva asignación | 200 |
| C5 | No existe horario `ACTIVO` | Intentar iniciar Etapa 2 | `{"error": "El horario institucional aún no ha sido activado para este período."}` | 400 |

**Invariante transaccional:** La activación y cancelación son operaciones **atómicas**: commit completo o rollback completo. Ninguna operación queda en estado intermedio.

---

### 3.4. Ajuste manual de asignaciones (`PUT /api/schedules/institutional/{id}/assignments/{assignmentId}`)

| # | Condición previa | Entrada | Salida esperada | HTTP | Tiempo |
|---|---|---|---|---|---|
| C1 | Horario en `BORRADOR` | Nueva combinación válida (docente, aula, franja) sin solapamientos | Asignación actualizada en `BORRADOR` | 200 | ≤ 1 s |
| C2 | Horario en `BORRADOR` | Nueva franja que produce solapamiento de docente (D1) | `{"error": "Solapamiento de docente: <nombre_docente> ya está asignado en <franja> al curso <curso>"}` | 409 | ≤ 1 s |
| C3 | Horario en `BORRADOR` | Nueva franja que produce solapamiento de aula (D2) | `{"error": "Solapamiento de aula: <codigo_aula> ya está ocupada en <franja> por el curso <curso>"}` | 409 | ≤ 1 s |
| C4 | Horario en `ACTIVO` | Cualquier modificación | `{"error": "No se puede modificar un horario activo."}` | 409 | ≤ 1 s |

---

## 4. Módulo de Horario de Docentes (Etapa 2)

### 4.1. Generación de vistas (`POST /api/schedules/teachers/generate`)

| # | Condición previa | Entrada | Salida esperada | HTTP |
|---|---|---|---|---|
| C1 | Horario institucional en `ACTIVO` | — | Vistas generadas para todos los docentes con asignaciones; tiempo ≤ 5 s por docente | 200 |
| C2 | No existe horario `ACTIVO` | — | `{"error": "No existe horario institucional activo. Ejecute y active la Etapa 1 primero."}` | 400 |
| C3 | Docente sin asignaciones en el horario activo | — | Vista vacía para ese docente; no es un error | 200 |

---

### 4.2. Consulta de horario de docente (`GET /api/schedules/teachers/{teacherId}`)

| # | Actor | Condición | Salida esperada | HTTP |
|---|---|---|---|---|
| C1 | Docente autenticado | Consulta su propio `teacherId` | `{asignaciones: [{curso, componente, aula, franja, dia}], carga_semanal: {lunes: Xh, ...}, alerta_carga_excesiva: bool}` | 200 |
| C2 | Docente autenticado | Consulta `teacherId` de otro docente | `{"error": "Acceso denegado al recurso de otro docente"}` | 403 |
| C3 | Administrador | Cualquier `teacherId` | Horario completo del docente | 200 |
| C4 | Cualquier actor | Docente con > 4 h consecutivas | Respuesta incluye `alerta_carga_excesiva: true` con detalle del bloque | 200 |

**Invariante (D10):** La vista solo contiene asignaciones derivadas del horario institucional `ACTIVO`. Ningún componente ajeno aparece en la vista del docente.

**Invariante (D11):** La vista nunca contiene dos bloques solapados para el mismo docente.

---

## 5. Módulo de Horario de Estudiantes (Etapa 3)

### 5.1. Validación de prerrequisitos y corequisitos

| # | Condición | Entrada | Salida esperada |
|---|---|---|---|
| C1 | Estudiante tiene todos los prerrequisitos de un curso aprobados | Evaluación de curso candidato | Curso habilitado para asignación |
| C2 | Estudiante le falta un prerrequisito (D12) | Evaluación de "CALC-2" sin "CALC-1" aprobado | Curso excluido; notificación: `"Prerrequisito pendiente: CALC-1"` |
| C3 | Corequisito del grupo no puede asignarse (D18) | Grupo {A, B} donde B falla | Ambos excluidos; recursos reservados de A liberados (EA-07) |
| C4 | Grupo de corequisitos supera límite de créditos (D13 + D18) | Créditos actuales + créditos del grupo > límite | Ninguno del grupo asignado; mensaje con valores concretos |

---

### 5.2. Control de carga académica (D13, D14)

| # | Condición | Entrada | Salida esperada |
|---|---|---|---|
| C1 | Créditos actuales + créditos del curso ≤ límite Y horas actuales + horas del curso ≤ límite | Curso candidato válido | Curso habilitado para asignación |
| C2 | Créditos actuales + créditos del curso > límite (EA-10) | `18 + 5 = 23 créditos, límite: 20` | Curso excluido; mensaje: `"Límite de créditos superado: 18 + 5 = 23 créditos (límite: 20)"` |
| C3 | Horas actuales + horas del curso > límite (EA-11) | `18 + 4 = 22 horas, límite: 20` | Curso excluido; mensaje: `"Límite de horas superado: 18 + 4 = 22 horas semanales (límite: 20)"` |
| C4 | Ambos límites superados simultáneamente | Curso que excede créditos y horas | Curso excluido; ambos mensajes emitidos |

---

### 5.3. Generación automática del horario de estudiantes (`POST /api/schedules/students/{studentId}/generate`)

| # | Condición previa | Entrada / Situación | Salida esperada | HTTP |
|---|---|---|---|---|
| C1 | Horario institucional `ACTIVO` | Estudiante con perfil completo y cursos disponibles | Horario generado: `{cursos_asignados, creditos_totales, horas_semanales_totales}` en ≤ 5 s | 200 |
| C2 | No existe horario `ACTIVO` (EA-12) | — | `{"error": "El horario de docentes aún no ha sido generado para este período."}` | 400 |
| C3 | Turno preferido sin oferta (D16) | Estudiante con turno `mañana`, solo disponible `tarde` | Asignación en turno alternativo + `TURNO_ALTERNATIVO: true` | 200 |
| C4 | Estudiante sin turno preferido (EA-08) | `turno_preferido = null` | Solver usa todas las franjas; no se emite `TURNO_ALTERNATIVO` | 200 |
| C5 | Sección sin vacantes (D15) | Curso con `vacantes = 0` | Curso excluido; `{"causa": "SIN_VACANTES", "curso": "<nombre>"}` | 200 |
| C6 | Curso compuesto sin componente disponible (D17) | PRÁCTICA sin aula / TEORÍA sin docente | Ninguno de los dos componentes asignado; créditos no acumulados; notificación con componente en conflicto | 200 |

---

### 5.4. Restricciones duras de la Etapa 3 (D12–D19) — contratos de validación

| Restricción | Condición de violación detectada | Acción del sistema |
|---|---|---|
| **D12** | Prerrequisito no aprobado | Curso excluido; notificación con el prerrequisito específico |
| **D13** | Créditos acumulados > límite | Curso excluido; mensaje con valores concretos |
| **D14** | Horas semanales acumuladas > límite | Curso excluido; mensaje con valores concretos |
| **D15** | Sin vacantes en la sección | Curso excluido; causa `SIN_VACANTES` |
| **D16** | Sin oferta en turno preferido | Asignación en turno adyacente + indicador `TURNO_ALTERNATIVO` |
| **D17** | Un componente del par TEORÍA/PRÁCTICA no puede asignarse | Ambos excluidos; recursos liberados |
| **D18** | Un curso del grupo de corequisitos no puede asignarse | Todo el grupo excluido; recursos reservados liberados |
| **D19** | Tiempo de traslado entre edificios > intervalo entre bloques consecutivos del estudiante | Par de franjas excluido del dominio del estudiante |

---

### 5.5. Consulta de horario del estudiante (`GET /api/schedules/students/{studentId}`)

| # | Actor | Condición | Salida esperada | HTTP |
|---|---|---|---|---|
| C1 | Estudiante autenticado | Consulta su propio horario | `{cursos_asignados: [{curso, componente, docente, aula, franja, dia}], creditos_totales, horas_semanales_totales, TURNO_ALTERNATIVO: bool}` | 200 |
| C2 | Estudiante autenticado | Consulta horario de otro estudiante | `{"error": "Acceso denegado al recurso de otro estudiante"}` | 403 |
| C3 | Administrador | Cualquier `studentId` | Horario completo del estudiante | 200 |
| C4 | Cualquier actor | Horario con turno alternativo | `TURNO_ALTERNATIVO: true` visible de forma explícita en la respuesta | 200 |

---

## 6. Módulo de Visualización y Exportación

### 6.1. Grilla semanal (`GET /api/schedules/{type}/{id}/grid`)

| # | Condición | Entrada | Salida esperada | Tiempo |
|---|---|---|---|---|
| C1 | Horario generado y disponible | `type = institutional` | Grilla `{dias × franjas}`: cada celda con `{curso, componente, docente, aula}` | ≤ 3 s |
| C2 | Rol `docente` | `type = teacher, id = propio` | Solo asignaciones propias en la grilla | ≤ 3 s |
| C3 | Rol `estudiante` | `type = student, id = propio` | Solo asignaciones propias en la grilla | ≤ 3 s |
| C4 | Dos asignaciones detectadas en la misma celda | Cualquier tipo | Celda marcada como error; reporte al Administrador | ≤ 3 s |

---

### 6.2. Exportación PDF y Excel (`GET /api/schedules/{type}/{id}/export?format={pdf|excel}`)

| # | Condición | Entrada | Salida esperada | HTTP | Tiempo |
|---|---|---|---|---|---|
| C1 | Horario disponible, formato `pdf` | `id` propio | Archivo PDF con: nombre de usuario, período, fecha de exportación y todos los campos de la grilla | 200 | ≤ 30 s |
| C2 | Horario disponible, formato `excel` | `id` propio | Archivo `.xlsx` con columnas: día, franja, curso, componente, docente, aula; abre sin errores en Excel y LibreOffice | 200 | ≤ 30 s |
| C3 | Intentar exportar horario ajeno (cualquier formato) | `id` de otro usuario | `{"error": "Acceso denegado al recurso de otro usuario"}` | 403 | — |
| C4 | Formato no soportado | `format = "csv"` | `{"error": "Formato no soportado. Valores permitidos: pdf, excel"}` | 400 | — |

---

## 7. Escenarios atípicos — contratos de respuesta

Los siguientes contratos cubren los escenarios de la sección 8 del Spec v2.0 que no están incluidos en las secciones anteriores.

| Escenario | Condición | Salida del sistema |
|---|---|---|
| **EA-04** | Cursos superan los bloques disponibles | Heurística MRV aplicada; componentes sin franja emiten `SIN_FRANJA_DISPONIBLE` individualmente |
| **EA-05** | Único docente habilitado disponible solo en turno nocturno, curso requiere diurno | Componente no asignado; restricción D3 no forzada; conflicto registrado |
| **EA-09** | Varios cursos compiten por el mismo aula en el mismo bloque | Solver prioriza; los demás buscan aula alternativa; si no existe → `SIN_AULA_DISPONIBLE` |

---

## 8. Restricciones de rendimiento — contratos de tiempo

| Operación | Condición de medición | Tiempo máximo garantizado |
|---|---|---|
| Generación horario institucional (Etapa 1) | ≤ 100 est., ≤ 20 doc., ≤ 20 cursos, ≤ 10 aulas | 30 s |
| Generación horario de docente (Etapa 2) | Por docente, escenario base | 5 s |
| Generación horario de estudiante (Etapa 3) | Por estudiante, escenario base | 5 s |
| Validación de solapamiento en ajuste manual | Por acción del Administrador | 1 s |
| Carga de grilla semanal | Escenario base | 3 s |
| Exportación PDF o Excel | Escenario base | 30 s |
| Listado de cualquier entidad (CRUD) | Escenario base | 3 s |

---

## 9. Trazabilidad de contratos

| Módulo SDD | HU vinculadas | Restricciones del Spec |
|---|---|---|
| Autenticación | HU-01, HU-02, HU-03 | RNF Seguridad |
| Gestión de entidades | HU-04 a HU-10 | RF-01 a RF-06 |
| Etapa 1 — Generación institucional | HU-11, HU-12, HU-13, HU-14, HU-15 | D1–D9, B1–B6, EA-01 a EA-06, EA-13 |
| Etapa 2 — Docentes | HU-16, HU-17 | D10, D11, B2 |
| Etapa 3 — Estudiantes | HU-18, HU-19, HU-20, HU-21, HU-22 | D12–D19, EA-07 a EA-12 |
| Visualización y exportación | HU-23, HU-24, HU-25 | RF-13, RF-14, RNF Rendimiento |
| Seguridad OWASP | HU-26 | RNF Seguridad |
