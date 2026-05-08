# Backlog Detallado — Sprint 3

**Proyecto:** SGOHA  
**Sprint:** 3 (08/05/2026 – 22/05/2026)  
**Objetivo:** Consolidar el módulo de estudiantes, visualización interactiva y exportación de reportes (PMV Final).  

---

## HU-18: Validación de Prerrequisitos y Corequisitos
**Historia:** Como estudiante, quiero validación de prerrequisitos y corequisitos, para matricularme de forma reglamentaria.  
**Criterios de Aceptación:**
1. El sistema bloquea la matrícula si no se aprobó el prerrequisito histórico.
2. Si un curso requiere corequisito, se agregan ambos a la vez o ninguno.
3. Mensaje de error claro "Falta prerrequisito: MAT101".  

**Subtareas:** Integrar historial del alumno a Prisma, lógica de validación Zod en endpoint de matrícula.  
**Pts:** 5 | **Responsable:** Alberto | **Dependencias:** HU-04, HU-07 | **CSP:** D12, D13 | **Estado:** ⬜ Pendiente

---

## HU-19: Control de Carga Académica (20-22 Créditos)
**Historia:** Como coordinador, quiero que el sistema restrinja las matrículas entre 20 y 22 créditos, para cumplir la norma.  
**Criterios de Aceptación:**
1. Un alumno no puede matricular menos de 20 ni más de 22 créditos regulares.
2. El contador es visual en tiempo real en la UI de React.
3. El backend rechaza por seguridad si la suma final está fuera de rango.  

**Subtareas:** Suma de créditos en backend, alertas shadcn/ui.  
**Pts:** 3 | **Responsable:** Alberto | **Dependencias:** HU-18 | **CSP:** D14 | **Estado:** ⬜ Pendiente

---

## HU-20: Generación Automática Horario Estudiantes
**Historia:** Como estudiante, quiero que el sistema me genere un horario de clases sin cruces, para evitar conflictos de asistencia.  
**Criterios de Aceptación:**
1. Ninguna clase matriculada se superpone con otra.
2. Considera tiempos de traslado entre pabellones (D19).
3. Respuesta en < 3 segundos usando los horarios ya fijos del S2.  

**Subtareas:** Filtro de cruces matriciales, endpoint de sugerencia.  
**Pts:** 8 | **Responsable:** Alberto | **Dependencias:** HU-19, HU-11 | **CSP:** D18, D19 | **Estado:** ⬜ Pendiente

---

## HU-21: Atomicidad Cursos Compuestos
**Historia:** Como sistema, quiero asegurar que las secciones de teoría y práctica se matriculen en bloque, para no romper la currícula.  
**Criterios de Aceptación:**
1. Si un curso tiene componente TEORÍA y PRÁCTICA, se asigna al estudiante a ambas.
2. OR-Tools garantiza que ocurren en días distintos (B5).
3. No se puede abandonar la práctica sin abandonar la teoría.  

**Subtareas:** Refactor de payload CSP, validación de componentes.  
**Pts:** 5 | **Responsable:** Alberto | **Dependencias:** HU-07 | **CSP:** D17, B5 | **Estado:** ⬜ Pendiente

---

## HU-22: Consulta Horario por Estudiante
**Historia:** Como estudiante, quiero consultar mi horario confirmado, para saber a qué clases asistir.  
**Criterios de Aceptación:**
1. Retorna solo las clases donde el alumno `id` esté inscrito.
2. Vista móvil-friendly (Responsive).
3. Datos incluyen: curso, aula, docente y franja.  

**Subtareas:** Endpoint `GET /students/schedule`, UI de tabla.  
**Pts:** 5 | **Responsable:** Alberto | **Dependencias:** HU-20 | **CSP:** Ninguna | **Estado:** ⬜ Pendiente

---

## HU-23: Grilla Semanal Interactiva
**Historia:** Como usuario, quiero visualizar el horario en una grilla de lunes a sábado, para entender mis asignaciones visualmente.  
**Criterios de Aceptación:**
1. Matriz de Lunes a Sábado, de 07:00 a 19:30.
2. Las celdas muestran color según tipo de curso (Teoría/Práctica).
3. Soporta tooltips al pasar el mouse con detalles.  

**Subtareas:** Componente React Grid, Tooltip UI, parseo de JSON.  
**Pts:** 5 | **Responsable:** Bryams | **Dependencias:** HU-22, HU-17 | **CSP:** Ninguna | **Estado:** ⬜ Pendiente

---

## HU-24: Exportación PDF
**Historia:** Como coordinador, quiero exportar el horario en formato PDF, para compartirlo y publicarlo oficialmente.  
**Criterios de Aceptación:**
1. Genera un archivo `.pdf` con cabecera de la Universidad.
2. Incluye la grilla semanal completa.
3. Descarga nativa desde el navegador < 3s.  

**Subtareas:** Implementar React-PDF o biblioteca similar.  
**Pts:** 3 | **Responsable:** Jack | **Dependencias:** HU-23 | **CSP:** Ninguna | **Estado:** ⬜ Pendiente

---

## HU-25: Exportación Excel
**Historia:** Como coordinador, quiero exportar el horario en `.xlsx`, para análisis externo.  
**Criterios de Aceptación:**
1. Genera columnas separadas: Curso, Docente, Aula, Día, Hora.
2. Formato limpio sin celdas combinadas rotas.
3. Descarga < 3s.  

**Subtareas:** Implementar SheetJS (xlsx).  
**Pts:** 3 | **Responsable:** Jack | **Dependencias:** HU-23 | **CSP:** Ninguna | **Estado:** ⬜ Pendiente

---

## HU-26: Protección OWASP Top 10
**Historia:** Como administrador, quiero que el sistema esté protegido contra vulnerabilidades web críticas, para salvaguardar la data.  
**Criterios de Aceptación:**
1. Inyección SQL/NoSQL bloqueada (garantizado vía Prisma).
2. Protección XSS implementada en cabeceras de Express (Helmet).
3. Rate Limiting implementado para endpoints de Auth.  

**Subtareas:** Configurar `helmet`, `express-rate-limit`, escaneo ZAP.  
**Pts:** 5 | **Responsable:** Jack | **Dependencias:** Ninguna | **CSP:** Ninguna | **Estado:** ⬜ Pendiente

---

## Resumen del Sprint
- **Total de Puntos:** 42 pts.
- **Objetivo:** Liberación del PMV Final (v1.0).
- **Definición de Terminado (DoD):** Todas las HU integradas en `main`, PRs aprobados, Tests pasando, despliegue en Render y Supabase validado sin fallas de seguridad severas.
