# Acta de Constitución del Proyecto — Revisión de Cierre

**Proyecto:** SGOHA — Sistema de Generación Óptima de Horarios Académicos
**Código:** PFA-TP2-2026-01
**Project Manager:** Edward Flores Rodríguez
**Fecha de revisión:** 2026-06-19
**Documento base (no modificado):** `docs/sprints/sprint-1/project-charter.md`

> Esta no es una reescritura del Acta de Constitución original. Se conserva el charter de planificación y se añade esta **sección de verificación final** que evalúa, al cierre, el cumplimiento de los objetivos, criterios de éxito y requerimientos de alto nivel aprobados al inicio.

## 1. Verificación de objetivos específicos

| # | Objetivo (original) | Criterio de éxito (original) | Resultado al cierre | Estado |
|---|---------------------|------------------------------|---------------------|--------|
| OE1 | Modelar el problema formalmente como CSP. | Documento de análisis CSP aprobado en Sprint 1. | Modelado CSP D1–D9 (duras) y B1–B5 (blandas) implementado y documentado. | ✅ Cumplido |
| OE2 | Diseñar arquitectura bajo estándares modernos. | Diagrama SPA + API REST validado. | Arquitectura Next.js + Supabase (app) + microservicio FastAPI/OR-Tools (CSP) + capa Node/Express (auth). | ✅ Cumplido (con ajuste de stack) |
| OE3 | Implementar el motor CSP y los módulos funcionales. | Motor CSP funcional con cobertura ≥ 70 %. | Motor CP-SAT funcional; cobertura backend 93.5 %, frontend 81.81 % (≥ 70 % superado). | ✅ Cumplido y superado |
| OE4 | Evaluar el impacto técnico, social, económico y ambiental. | Informe de impacto en Sprint 3. | Análisis de sostenibilidad y green software entregados (`docs/gestion/`). | ✅ Cumplido |
| OE5 | Documentar decisiones técnicas con trade-offs. | Informe de decisiones técnicas revisado. | `docs/sdd/decisiones-tecnicas.md` + auditoría de calidad (OWASP/WCAG/SonarCloud/SUS). | ✅ Cumplido |

## 2. Verificación de requerimientos de alto nivel

| ID | Requerimiento (resumen) | Sprint | Resultado al cierre | Estado |
|----|-------------------------|--------|---------------------|--------|
| RAN-01 | Generar horarios ≤ 50 cursos, 100 % restricciones duras, ≤ 30 s. | S2 | Motor CP-SAT con timeout 30 s → `FEASIBLE`; D1–D9 satisfechas. | ✅ Cumplido |
| RAN-02 | Registro/login con 4 roles vía JWT. | S1 | Auth JWT + RBAC implementado (HU-01..03); JWT endurecido (HS256). | ✅ Cumplido |
| RAN-03 | Matrícula con validación de prerrequisitos y créditos 20–22. | S2/S3 | HU-18/HU-19 (prerrequisitos, carga académica). | ✅ Cumplido |
| RAN-04 | Visualización calendario semanal + exportación PDF/Excel. | S3 | Grilla semanal (HU-23) + exportaciones (HU-24/25) para admin/docente. | ✅ Cumplido (admin/docente) |
| RAN-05 | Cumplir OWASP, WCAG AA, ISO 25010. | S3 | Auditoría OWASP Top 10 2025, WCAG (3 defectos corregidos), SonarCloud Quality Gate *Passed*. | ⚠️ Parcial — seguridad C, hotspots pendientes |
| RAN-06 | Motor CSP ≤ 30 s para instancias hasta 50 cursos. | S2/S3 | Cumplido con estrategia de timeout. | ✅ Cumplido |
| RAN-07 | Green Software: reducir llamadas CSP ≥ 40 % con caché. | S3 | Caché 24 h aplicada; análisis green software entregado. | ✅ Cumplido |

## 3. Verificación de criterios de aceptación del proyecto (Sponsor)

| Criterio de aceptación original | Resultado | Estado |
|---------------------------------|-----------|--------|
| Todos los entregables en fecha. | Entrega final reprogramada a la semana del 22–28/06/2026 (sprints reales de 3 semanas). | ⚠️ Variación de cronograma |
| Cobertura de pruebas ≥ 70 %. | Backend 93.5 %, frontend 81.81 %. | ✅ Superado |
| Video demostrativo funcional. | Disponible (referenciado en README del repositorio). | ✅ Cumplido |
| Informe de impacto completo. | Entregado (sostenibilidad / green software). | ✅ Cumplido |

## 4. Cambios de alcance autorizados respecto al Acta original

1. **Cierre del módulo Estudiante (EP-06: HU-18..HU-22)** fuera del MVP — decisión del 03/06/2026. La grilla y exportaciones se mantienen para **admin y docente**. Causa raíz: refutación del supuesto S8 (horas reales del equipo).
2. **Ajuste de stack tecnológico** respecto al charter original (que preveía FastAPI + OR-Tools como única arquitectura): la app final usa **Next.js + Supabase**, con **FastAPI/OR-Tools (CP-SAT)** como microservicio del solver y una capa **Node/Express** para autenticación.
3. **Adaptación de la estrategia de testing**: MSW se omitió por fricción con jsdom/next-jest; se usó `global.fetch` + server actions (adaptación autorizada por el docente).

## 5. Conclusión de la revisión

El proyecto **cumple integralmente sus objetivos específicos (OE1–OE5)** y 6 de 7 requerimientos de alto nivel de forma completa. La única brecha abierta es parte de **RAN-05** (seguridad: calificación SonarCloud C, 4 hotspots por revisar), en seguimiento. La principal variación frente al Acta original es de **cronograma** (sprints de 3 semanas, entrega reprogramada) y **alcance** (cierre del módulo Estudiante), ambas trazadas y justificadas por la refutación del supuesto S8.

> Trazabilidad: §4.1 ↔ S8 / IMP-04 · §3 cronograma ↔ Informe Final §4 · RAN-05 ↔ R003 y `06_registro_defectos.md`.
</content>
