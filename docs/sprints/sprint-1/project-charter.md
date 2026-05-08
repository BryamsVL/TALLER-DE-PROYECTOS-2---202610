## Entregable C — Project Charter

### 1. Información general del proyecto

| Campo | Detalle |
|-------|---------|
| Nombre del proyecto | Sistema de Generación Óptima de Horarios Académicos en Entornos de Currículo Flexible |
| Código | PFA-TP2-2026-01 |
| Asignatura | Taller de Proyectos 2 — Ingeniería de Sistemas e Informática |
| Institución | Universidad Continental — Huancayo, Perú |
| Ciclo académico | 2026-I |
| Fecha de inicio | Semana 1 del ciclo 2026-I |
| Fecha estimada de fin | Semana 16 del ciclo 2026-I |
| Metodología | Scrum — sprints de 2-3 semanas |
| Repositorio | https://github.com/BryamsVL/TALLER-DE-PROYECTOS-2---202610 |

---

### 2. Propósito y justificación del proyecto

La elaboración manual de horarios académicos en entornos universitarios con currículo flexible representa un proceso altamente complejo, propenso a errores, que consume considerable tiempo del personal administrativo y genera insatisfacción en docentes y estudiantes.

El proyecto SGOHA responde a esta necesidad institucional mediante el diseño e implementación de una aplicación web inteligente que automatiza la generación de horarios óptimos, aplicando un modelo formal de Satisfacción de Restricciones (CSP). La solución se alinea con el plan estratégico de transformación digital de la Universidad Continental y con los estándares internacionales de calidad de software (ISO/IEC 25010), seguridad (OWASP Top 10), accesibilidad (WCAG 2.1) y sostenibilidad (Green Software).

El desarrollo se enmarca en la asignatura Taller de Proyectos 2 como proyecto final de asignatura, constituyendo evidencia de las competencias profesionales del equipo en ingeniería de software.

---

### 3. Objetivos del proyecto y criterios de éxito

#### 3.1 Objetivo general

Diseñar e implementar una aplicación web inteligente que genere horarios académicos óptimos, considerando restricciones académicas, operativas y contextuales, bajo un modelo CSP, con arquitectura SPA + API REST y cumplimiento de estándares W3C, ISO/IEC 25010, OWASP Top 10, WCAG 2.1 y Green Software.

#### 3.2 Objetivos específicos

| # | Objetivo | Criterio de éxito |
|---|----------|-------------------|
| OE1 | Analizar el problema identificando variables, restricciones y actores, modelándolo formalmente como CSP. | Documento de análisis CSP aprobado en Sprint 1. |
| OE2 | Diseñar la arquitectura del sistema bajo estándares modernos de ingeniería de software. | Diagrama de arquitectura SPA + API REST validado por el equipo. |
| OE3 | Implementar el motor CSP y los módulos funcionales del sistema. | Motor CSP funcional con cobertura de pruebas ≥ 70%. |
| OE4 | Evaluar el impacto técnico, social, económico y ambiental de la solución. | Informe de impacto entregado en Sprint 4. |
| OE5 | Documentar todas las decisiones técnicas con justificación y trade-offs explícitos. | Informe de decisiones técnicas completo y revisado. |

#### 3.3 Objetivos de alcance, tiempo y costo

| Dimensión | Descripción |
|-----------|-------------|
| Alcance | Sistema web con módulos de registro, matrícula, motor CSP, visualización y reportes. Instancia inicial limitada a 50 cursos. |
| Tiempo | 16 semanas (4 sprints de 2 semanas cada uno + buffers). Entrega final en Semana 16. |
| Costo | Proyecto académico sin presupuesto monetario asignado. Recursos: tiempo del equipo (6 integrantes × 8 h/semana), licencias académicas y servicios gratuitos (GitHub, Render, Vercel). |

---

### 4. Requerimientos de alto nivel

Los siguientes requerimientos describen las capacidades principales que el sistema debe satisfacer para cumplir con el propósito del proyecto:

| ID | Tipo | Descripción SMART | Sprint | Criterio de Aceptación |
|----|------|-------------------|--------|------------------------|
| RAN-01 | Funcional | El sistema debe generar horarios académicos automáticamente para un conjunto de hasta 50 cursos, satisfaciendo el 100% de las restricciones duras en un tiempo máximo de 30 segundos, verificable mediante pruebas de rendimiento en el entorno de despliegue (4 GB RAM). | Sprint 2 | Motor CSP funcional con 100% restricciones duras satisfechas en ≤ 30 s |
| RAN-02 | Funcional | El sistema debe permitir el registro y autenticación de usuarios con 4 roles diferenciados mediante JWT, con tiempo de respuesta de login inferior a 500 ms en el percentil 95, implementado y verificable en Sprint 1. | Sprint 1 | Login funcional con JWT; pruebas de carga confirman P95 < 500 ms |
| RAN-03 | Funcional | El sistema debe permitir la gestión de matrícula validando automáticamente prerrequisitos y controlando el rango de créditos (20–22) por ciclo, mostrando retroalimentación al usuario en menos de 2 segundos, con cobertura de pruebas ≥ 70% en Sprint 2. | Sprint 2 | Validación automática correcta en ≥ 98% de casos de prueba definidos |
| RAN-04 | Funcional | El sistema debe ofrecer visualización interactiva de horarios en formato calendario semanal con carga inicial < 3 s en conexión estándar (10 Mbps), con exportación a PDF y Excel en menos de 5 segundos para hasta 50 cursos, implementado en Sprint 3. | Sprint 3 | Carga < 3 s y exportación < 5 s verificadas con prueba de rendimiento |
| RAN-05 | No funcional | El sistema debe cumplir con OWASP Top 10 (2021), WCAG 2.1 nivel AA e ISO/IEC 25010, verificado mediante herramientas automatizadas (OWASP ZAP, axe-core) antes de la entrega final en Sprint 4. | Sprint 4 | 0 vulnerabilidades críticas en OWASP ZAP; 0 errores WCAG nivel A/AA en axe-core |
| RAN-06 | No funcional | El motor CSP debe retornar una solución en un tiempo máximo de 30 segundos para instancias de hasta 50 cursos, 30 docentes y 20 aulas, en hardware estándar sin GPU (mínimo 4 GB RAM), medible mediante pruebas automatizadas. | Sprint 2–3 | Prueba de rendimiento automatizada con instancia de 50 cursos en entorno Docker |
| RAN-07 | No funcional | La aplicación debe seguir principios de Green Software, reduciendo llamadas al motor CSP en al menos un 40% mediante caché de resultados (node-cache, TTL 24 h), medible comparando ejecuciones CSP con y sin caché en 100 consultas repetidas. | Sprint 3 | Logs de caché confirman reducción ≥ 40% de ejecuciones CSP en escenario de prueba |

---

### 5. Entregables del proyecto

| # | Entregable | Sprint | Criterio rúbrica | Aceptación |
|---|-----------|--------|------------------|------------|
| 1 | Documento de análisis del problema y modelado CSP | Sprint 0–1 | Análisis + Modelado | Revisión docente |
| 2 | Diseño de arquitectura (SPA + API REST) | Sprint 1 | Diseño | Revisión equipo |
| 3 | Módulo de registro y autenticación | Sprint 1 | Implementación | Demo funcional |
| 4 | Módulo de matrícula y validación | Sprint 2 | Implementación | Demo funcional |
| 5 | Motor CSP de generación de horarios | Sprint 2–3 | Implementación core | Pruebas exitosas |
| 6 | Módulo de visualización y reportes | Sprint 3 | Implementación | Demo funcional |
| 7 | Pruebas unitarias e integración (cobertura ≥ 70%) | Sprint 3–4 | Pruebas | Reporte cobertura |
| 8 | Informe de decisiones técnicas e impacto | Sprint 4 | Documentación + Impacto | Revisión docente |
| 9 | Video demostrativo del sistema completo | Sprint 4 | Comunicación | Entrega final |

---

### 6. Cronograma de hitos

| Sprint | Período | Objetivos principales |
|--------|---------|-----------------------|
| Sprint 0 | Semanas 1–2 | Inicio del proyecto: análisis, documentación base, repositorio GitHub, selección de stack, primer borrador del problema. |
| Sprint 1 | Semanas 3–4 | Modelado CSP formal, diseño de arquitectura, prototipo de UI, módulo de registro y autenticación. |
| Sprint 2 | Semanas 5–8 | Módulo de matrícula con validaciones, implementación del motor CSP, primeras pruebas del algoritmo. |
| Sprint 3 | Semanas 9–12 | Módulo de visualización, ajuste manual de horarios, exportación, pruebas de integración. |
| Sprint 4 | Semanas 13–16 | Pruebas finales (cobertura ≥ 70%), informe de impacto, video demostrativo, presentación final. |

---

### 7. Stakeholders clave

| Stakeholder | Rol en el proyecto | Interés principal | Nivel de influencia |
|-------------|-------------------|-------------------|---------------------|
| Docente del curso | Sponsor / Evaluador | Calidad académica y cumplimiento de la rúbrica. | Alto |
| Equipo de desarrollo (6 integrantes) | Project Team | Aprendizaje, aprobación del curso y calidad del producto. | Alto |
| Área de Registros Académicos (UC) | Usuario final principal | Automatizar y optimizar la elaboración de horarios. | Medio |
| Docentes universitarios | Usuario final | Horarios coherentes con sus disponibilidades. | Medio |
| Estudiantes | Usuario final | Horarios sin traslapes y alineados al plan curricular. | Bajo |

---

### 8. Riesgos de alto nivel

| Riesgo | Prob. | Impacto | Estrategia de mitigación |
|--------|-------|---------|--------------------------|
| El algoritmo CSP no converge en tiempo aceptable para instancias grandes. | Media | Alto | Limitar el alcance inicial a 50 cursos. Implementar timeout con solución parcial. Evaluar heurísticas de búsqueda (MRV, AC-3). |
| Distribución desigual del trabajo entre los 6 integrantes. | Alta | Medio | Definir responsabilidades claras por módulo. Revisiones semanales de progreso y daily standups asíncronos. |
| Requerimientos ambiguos o cambiantes durante el desarrollo. | Alta | Medio | Documentar supuestos explícitamente. Revisión de requerimientos al inicio de cada sprint. |
| Curva de aprendizaje en OR-Tools o FastAPI. | Media | Medio | Sprint 0 incluye prototipos técnicos de prueba de concepto del CSP solver y del API framework. |
| Dificultad para integrar frontend React con backend FastAPI. | Baja | Medio | Definir contratos de API (OpenAPI/Swagger) antes de implementar. CORS configurado desde el inicio del proyecto. |

---

### 9. Project Manager — Responsabilidad y autoridad

| Dimensión | Descripción |
|-----------|-------------|
| Nombre / Rol | Por designar (integrante del equipo) — Project Manager del proyecto SGOHA. |
| Autoridad sobre el equipo | Asignar tareas, redistribuir carga de trabajo y solicitar revisiones de los entregables de otros integrantes. |
| Gestión del cronograma | Ajustar el plan de sprints dentro del ciclo de 16 semanas sin alterar las fechas de entrega evaluadas. |
| Decisiones técnicas | Elegir herramientas, frameworks y patrones de diseño en coordinación con el equipo. Decisiones mayores requieren consenso. |
| Resolución de conflictos | Resolver conflictos internos del equipo. Escalar al docente del curso en caso de no alcanzar resolución. |
| Límites de varianza | Variaciones de alcance que impliquen eliminación de módulos principales deben ser aprobadas por el docente sponsor. |

---

### 10. Sponsor y autorización del proyecto

| Campo | Información |
|-------|-------------|
| Nombre del sponsor | Docente responsable — Taller de Proyectos 2 |
| Institución | Universidad Continental — Huancayo, Perú |
| Autoridad del sponsor | Aprobar cambios de alcance, determinar límites de varianza aceptables, resolver conflictos inter-equipos y validar la entrega final del proyecto. |
| Criterios de aceptación del proyecto | Todos los entregables entregados en fecha, cobertura de pruebas ≥ 70%, video demostrativo funcional e informe de impacto completo. |
