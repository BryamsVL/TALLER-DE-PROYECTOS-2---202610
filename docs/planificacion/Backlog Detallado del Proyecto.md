# 📋 Backlog Detallado del Producto — SGOHA

**Proyecto:** SGOHA — Sistema de Generación Óptima de Horarios Académicos  
**Stack:** React + TypeScript · Express · Node.js · PostgreSQL · OR-Tools  
**Total Story Points:** 107 pts · 20 historias · 4 Sprints

---

| ID | Rol | Deseo | Para | ID Tarea | Descripción Tarea | Criterios de Aceptación | Prioridad | Pts | Deps | Sprint | Estado |
|---|---|---|---|---|---|---|---|---|---|---|---|
| HU01 | Administrador | Registrar usuarios con roles | Controlar acceso al sistema | T1.1 | POST /auth/register con validación de rol y bcrypt | Usuario guardado con rol y contraseña hasheada. Error 400 si email existe. No permite roles inválidos. | 🔴 Alta | 5 | - | Sprint 1 | ✅ Terminado |
| HU02 | Usuario registrado | Iniciar sesión con email y contraseña | Obtener token JWT | T2.1 | POST /auth/login con JWT expiración 8h | Login devuelve JWT 8h. Rutas protegidas rechazan tokens inválidos con 401. Token incluye rol. | 🔴 Alta | 5 | HU01 | Sprint 1 | ✅ Terminado |
| HU03 | Administrador | Editar y desactivar cuentas | Mantener el directorio actualizado | T3.1 | PUT /users/:id y PATCH /users/:id/deactivate | Solo admin edita. Usuario desactivado no inicia sesión. Cambios en log de auditoría. | 🟡 Media | 3 | HU01 | Sprint 1 | ✅ Terminado |
| HU04 | Administrador | Registrar cursos con créditos y tipo de aula | Configurar oferta académica | T4.1 | CRUD cursos con validación tipo aula y créditos 1–6 | Curso guardado con atributos. Tipo: normal/laboratorio/sala_audiovisual. Créditos 1–6. | 🔴 Alta | 5 | HU01 | Sprint 1 | ✅ Terminado |
| HU05 | Administrador | Registrar aulas con capacidad y disponibilidad | Que el solver CSP las asigne | T5.1 | CRUD aulas con código único y flag activa/inactiva | Código único. Impide duplicados. Se puede marcar inactiva. | 🔴 Alta | 3 | HU01 | Sprint 1 | ✅ Terminado |
| HU06 | Administrador | Crear y gestionar períodos académicos | Controlar el ciclo activo | T6.1 | CRUD períodos con un solo período activo simultáneo | Período con nombre, fechas y estado. Solo uno activo. Bloquea matrícula fuera del período. | 🔴 Alta | 3 | HU01 | Sprint 1 | ✅ Terminado |
| HU07 | Docente | Registrar franjas horarias disponibles | Que el sistema respete mi disponibilidad | T7.1 | UI + API disponibilidad por franja 07:00–19:30 | Marca disponibilidad por franja. Actualizable antes del cierre. Vista visual de franjas. | 🔴 Alta | 5 | HU01 | Sprint 2 | ⬜ Por Hacer |
| HU08 | Estudiante | Ver cursos disponibles del período activo | Decidir cuáles matricular | T8.1 | Listado cursos con indicador visual de prerrequisitos | Solo cursos del período activo. Indica si cumple prerrequisitos. Muestra créditos. | 🔴 Alta | 3 | HU06 | Sprint 2 | ⬜ Por Hacer |
| HU09 | Estudiante | Validar prerrequisitos al seleccionar curso | Evitar inscribirme en cursos que no puedo llevar | T9.1 | Validación en tiempo real contra historial en BD | Bloquea selección si no cumple con mensaje claro. Sin recargar página. | 🔴 Alta | 8 | HU08 | Sprint 2 | ⬜ Por Hacer |
| HU10 | Estudiante | Ver acumulado de créditos en tiempo real | No exceder 22 créditos por ciclo | T10.1 | Contador 20–22 con alerta visual y bloqueo | Actualiza al agregar/quitar cursos. Bloquea si < 20 o > 22. Alerta visual. | 🔴 Alta | 5 | HU09 | Sprint 2 | ⬜ Por Hacer |
| HU11 | Coordinador | Generar horario académico válido automáticamente | Evitar conflictos de docente, aula y franja | T11.1 | FastAPI + OR-Tools POST /horarios/generar | < 5 seg para 100 cursos. Sin duplicados en franja. Resultado guardado en BD. | 🔴 Alta | 8 | HU07 | Sprint 2 | ⬜ Por Hacer |
| HU12 | Estudiante | Confirmar matrícula y recibir constancia PDF | Tener evidencia de cursos inscritos | T12.1 | Confirmación + PDF con PDFKit | Matrícula en BD. PDF con nombre, cursos, créditos y fecha. Descargable. | 🟡 Media | 5 | HU10 | Sprint 3 | ⬜ Por Hacer |
| HU13 | Coordinador | Detectar conflictos en tiempo real al modificar | Corregir errores antes de publicar | T13.1 | Validación inmediata al mover asignación | Valida al mover. Alerta con detalle. No guarda sin confirmación explícita. | 🔴 Alta | 8 | HU11 | Sprint 3 | ⬜ Por Hacer |
| HU14 | Coordinador | Modificar manualmente asignaciones del horario | Ajustar casos especiales | T14.1 | Drag-and-drop con revalidación CSP y log | Reasigna curso-docente-aula-franja. Revalida CSP. Marca como 'editado manualmente'. | 🟡 Media | 8 | HU13 | Sprint 3 | ⬜ Por Hacer |
| HU15 | Coordinador | Recibir solución parcial cuando CSP no resuelve | Gestionar casos sin solución completa | T15.1 | Respuesta parcial tras 5s timeout | Devuelve lo resuelto. Lista cursos sin asignar. Permite reintentar. | 🟡 Media | 5 | HU11 | Sprint 3 | ⬜ Por Hacer |
| HU16 | Usuario | Visualizar horario en calendario semanal | Ver solo información relevante por rol | T16.1 | FullCalendar lun–sáb 07:00–19:30 por rol | Estudiante ve sus cursos. Docente su carga. Coordinador todo. | 🔴 Alta | 8 | HU11 | Sprint 3 | ⬜ Por Hacer |
| HU17 | Coordinador | Filtrar horario por docente, aula, ciclo o turno | Facilitar revisión y detección de problemas | T17.1 | Filtros combinables sin recarga < 1 seg | Sin recargar página. Combinables. Actualiza en < 1 segundo. | 🟡 Media | 5 | HU16 | Sprint 3 | ⬜ Por Hacer |
| HU18 | Coordinador | Exportar horario en PDF y Excel | Distribuirlo a docentes y estudiantes | T18.1 | PDF con logo + tabla, Excel por turno, descarga < 3s | PDF con logo y asignaciones. Excel por turno. Descarga < 3 segundos. | 🟡 Media | 5 | HU16 | Sprint 4 | ⬜ Por Hacer |
| HU19 | Administrador | Ver reporte de ocupación de aulas y carga docente | Optimizar uso de recursos | T19.1 | Reporte filtrable por período exportable a PDF | % ocupación por aula y horas por docente. Filtrable. Exportable a PDF. | 🟢 Baja | 5 | HU18 | Sprint 4 | ⬜ Por Hacer |
| HU20 | Administrador | Registrar log inmutable de acciones críticas | Tener trazabilidad completa | T20.1 | Log inmutable con filtros fecha/usuario | Registra acciones críticas. No eliminable por ningún rol. Consultable con filtros. | 🟡 Media | 5 | HU17, HU11, HU14 | Sprint 4 | ⬜ Por Hacer |

---

> **Total: 107 Story Points** · Sprint 1: 24 ✅ · Sprint 2: 29 ⬜ · Sprint 3: 39 ⬜ · Sprint 4: 15 ⬜
