# Minuta de Reunión: Sprint Planning 2

**Proyecto:** SGOHA
**Motivo:** Planificación de Inicio del Sprint 2
**Fecha:** 23/04/2026
**Lugar:** Google Meet
**Facilitador:** Andre De La Torre Segura (Scrum Master)
**Asistentes:** Edward Flores, Andre De La Torre, Alberto Patiño, Brianna Cortez, Bryams Vilchez, Jack Perez.

## 1. Revisión del Cierre del Sprint 1

El Sprint 1 se cerró exitosamente con 35 puntos completados (HU-01 a HU-10).

| ID | Historia de Usuario | Estado |
|---|---|---|
| HU-01 | Registro usuarios | ✅ Terminado |
| HU-02 | Login JWT | ✅ Terminado |
| HU-03 | Control acceso rol | ✅ Terminado |
| HU-04 | CRUD Estudiantes | ✅ Terminado |
| HU-05 | CRUD Docentes | ✅ Terminado |
| HU-06 | Disp. docentes | ✅ Terminado |
| HU-07 | CRUD Cursos | ✅ Terminado |
| HU-08 | CRUD Aulas | ✅ Terminado |
| HU-09 | Franjas horarias | ✅ Terminado |
| HU-10 | Traslado y parámetros | ✅ Terminado |

**Impedimentos Resueltos:**
- El JWT ahora rechaza correctamente tokens expirados (solucionado por Brianna).
- Incompatibilidad de Supabase RLS resuelta desactivando temporalmente en desarrollo (Jack investigará reglas definitivas).

## 2. Planificación del Sprint 2

El objetivo principal es lograr que el motor OR-Tools genere horarios institucionales válidos (satisfaciendo restricciones duras y blandas) y que el coordinador pueda ajustar los resultados manualmente.

| HU | Descripción | Responsable | Puntos | Nivel de Riesgo |
|---|---|---|---|---|
| HU-11 | Restricciones duras D1–D9 en OR-Tools | Alberto Patiño | 8 | 🔴 Crítico |
| HU-12 | Ejecución y resultado generación horario | Alberto Patiño | 5 | 🟠 Alto |
| HU-13 | Activación/cancelación horario | Andre De La Torre | 3 | 🟢 Bajo |
| HU-14 | Ajuste manual asignaciones | Brianna Cortez | 5 | 🟠 Alto |
| HU-15 | Restricciones blandas B1–B5 | Alberto Patiño | 5 | 🟠 Alto |
| HU-16 | Vista horario por docente | Brianna Cortez | 5 | 🟡 Medio |
| HU-17 | Consulta horario por el docente | Brianna Cortez | 3 | 🟢 Bajo |

**Carga Total:** 34 Story Points.

## 3. Identificación del Cuello de Botella
El equipo acuerda unánimemente que la **HU-11 (Restricciones duras D1-D9)** es el cuello de botella más peligroso del proyecto. Si Alberto se retrasa en el modelado de OR-Tools CP-SAT en FastAPI, la HU-12 y la HU-15 no podrán ejecutarse. 

## 4. Acuerdos Tomados
1. **Apoyo a Alberto:** Si Alberto enfrenta bloqueos matemáticos graves en CP-SAT después de 48 horas, Jack apoyará en la revisión de la documentación de Google OR-Tools. (Responsable: Jack Perez, Límite: 27/04).
2. **Contrato de Interfaz:** Bryams y Brianna acordarán el formato exacto del JSON del horario para iniciar el frontend (HU-14 y HU-16) con mocks, sin esperar a que el solver funcione. (Responsable: Brianna/Bryams, Límite: 25/04).
3. **Pair Programming:** Brianna realizará pair programming con Andre para asegurar que la activación del horario (HU-13) se propague correctamente a las vistas.

## 5. Próxima Reunión
- **Daily Scrum:** 24/04/2026 a las 09:00 AM.
