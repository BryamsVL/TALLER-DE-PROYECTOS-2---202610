# Informe Final de Lecciones Aprendidas (Final Lessons Learned Report)

**Proyecto:** SGOHA — Sistema de Generación Óptima de Horarios Académicos
**Project Manager:** Edward Flores Rodríguez
**Fecha de preparación:** 2026-06-19
**Plantilla base:** `docs/plantillas/5.1_LESSONS LEARNED SUMMARY.dotm.md`
**Fuentes:** retrospectivas Sprint 1 y 2, informe de estado S2, registros de cierre (riesgos, incidentes, impedimentos, defectos, supuestos).

## 1. Análisis de desempeño del proyecto

| Área | Qué funcionó bien | Qué se puede mejorar |
|------|-------------------|----------------------|
| Definición y gestión de requisitos | Contratos OpenAPI/Swagger + Pydantic/Zod evitaron errores de integración. | Requisitos del módulo Estudiante sobredimensionados frente a la capacidad real (S8). |
| Definición y gestión del alcance | Re-priorización ágil: cierre del módulo Estudiante (EP-06) protegió el MVP admin/docente. | El alcance inicial no consideró un colchón realista de horas del equipo. |
| Cronograma | Buffer de 5 días reservado; ruta crítica explícita. | Sprints estimados en 2 semanas tomaron 3 reales → reprogramación de la entrega. |
| Costos | Costeo por sprint trazable (S/ 8,568) reflejando la curva de complejidad. | Sin desviaciones monetarias (free tier), pero el costo en horas-persona superó lo planificado. |
| Calidad | Cobertura 93.5 % backend / 81.81 % frontend; SonarCloud Quality Gate *Passed*; auditorías OWASP/WCAG. | Seguridad en C: 4 hotspots y 2 issues Medium pendientes; 23 bugs de confiabilidad en backlog. |
| Recursos físicos / infraestructura | Free tier (Vercel/Render/Supabase) sostuvo todo el ciclo sin caídas (R006 no materializó). | Supuesto de servidor ≥ 4 GB (S6) no se cumplió; hubo que adaptar el despliegue. |
| Equipo y desempeño | Colaboración cruzada frontend/backend fluida; transferencia de CP-SAT mitigó el cuello de botella. | Concentración de conocimiento crítico en un solo integrante (IMP-01); fatiga por complejidad del solver. |
| Comunicaciones | Dailys asíncronas y, en S3, estrictas de 15 min enfocadas en bloqueos. | Revisiones de PR superficiales al inicio (I-03) causaron conflictos de merge. |
| Reporting | Informes de estado y retrospectivas por sprint con métricas (velocidad, burndown, cycle time). | Falta retrospectiva formal de Sprint 3 / cierre. |
| Gestión de riesgos | 8 riesgos gestionados; respuestas efectivas (timeout CSP, contratos API). | Riesgo de seguridad (R003) quedó con residual medio. |
| Adquisiciones | No aplicaron (open source / free tier) — sin contratos que gestionar. | — |
| Compromiso de stakeholders | Sponsor (docente) alineado con la rúbrica desde el charter. | Faltó validar supuestos con usuarios reales (Registros Académicos UC). |
| Producto (CSP) | Traducción exitosa de reglas D1–D9 a CP-SAT; estrategia de timeout → `FEASIBLE`. | Optimización de blandas (huecos, nombrados) llegó tarde respecto al plan. |

## 2. Riesgos e incidentes — lecciones (referencia a registros reales)

| Origen | Lección aprendida |
|--------|-------------------|
| R001 / IMP-02 (curva OR-Tools) | Un prototipo de prueba de concepto temprano del solver es indispensable antes de comprometer HU de alta complejidad. |
| R003 / D-02 / D-03 (seguridad) | La seguridad debe probarse desde el Sprint 1: el JWT sin restricción de algoritmo y la auto-provisión ADMIN debieron detectarse con tests de seguridad, no en auditoría tardía. |
| R008 / IMP-01 (cuello de botella) | Distribuir el conocimiento crítico (pair programming, documentación del solver) reduce el riesgo de dependencia de una sola persona. |
| I-03 / I-06 (merges) | Imponer revisión obligatoria de PR desde el día 1 evita conflictos de integración y builds rotos. |
| S8 (horas del equipo) | Estimar el alcance contra la capacidad **real** de horas, no la ideal, evita reprogramaciones. |

## 3. Defectos de calidad — lecciones

- Los defectos de accesibilidad (WCAG D-04..D-06) son baratos de corregir si se aplican patrones ARIA desde el diseño del formulario.
- Los defectos de rendimiento (D-07, D-08) surgieron por validar/renderizar de forma ingenua; memoización y endpoints *bulk* deben ser el patrón por defecto en vistas densas.

## 4. Áreas de desempeño excepcional vs. áreas de mejora

| Desempeño excepcional | Áreas de mejora |
|-----------------------|-----------------|
| Modelado CSP (D1–D9) y estrategia de timeout. | Calificación de seguridad (subir de C; revisar hotspots). |
| Cobertura de pruebas muy por encima del objetivo (≥ 70 %). | Estimación de capacidad real del equipo. |
| Adaptación ágil del alcance ante restricciones reales. | Transferencia temprana de conocimiento crítico. |

## 5. Mejoras aplicables a futuros proyectos

1. Prototipar lo más riesgoso (algoritmo central) en un Sprint 0 técnico.
2. Integrar pruebas de seguridad automatizadas desde el primer sprint.
3. Estimar alcance contra horas reales disponibles, con colchón explícito.
4. Pair programming obligatorio en los módulos de la ruta crítica.
5. Revisión de PR obligatoria desde el inicio (ya adoptada, mantener).

> Trazabilidad: §2 referencia directa a `03_registro_riesgos.md`, `04_registro_incidentes.md`, `05_registro_impedimentos.md`, `06_registro_defectos.md`, `07_registro_supuestos.md`.
</content>
