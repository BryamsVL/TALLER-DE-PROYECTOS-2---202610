# Informe Final del Proyecto (Final Project Report)

**Proyecto:** SGOHA — Sistema de Generación Óptima de Horarios Académicos
**Código:** PFA-TP2-2026-01
**Institución:** Universidad Continental — Huancayo, Perú · Ciclo 2026-I
**Project Manager:** Edward Flores Rodríguez
**Sponsor:** Docente de Taller de Proyectos 2
**Fecha de preparación:** 2026-06-19
**Plantilla base:** `docs/plantillas/5.2_PROJECT CLOSEOUT.dotm.md`

## 1. Resumen ejecutivo

SGOHA es una aplicación web que automatiza la generación de horarios académicos óptimos en entornos de currículo flexible, modelando el problema como un CSP resuelto con OR-Tools (CP-SAT). Al cierre, el proyecto entrega un **MVP funcional para los roles administrador y docente**: gestión de entidades base, generación y ajuste de horarios, vista por docente y exportación PDF/Excel.

El proyecto **cumple sus cinco objetivos específicos** y 6 de 7 requerimientos de alto nivel, con cobertura de pruebas muy superior al objetivo (backend 93.5 %, frontend 81.81 % frente a ≥ 70 %) y Quality Gate de SonarCloud en estado *Passed*. Las dos variaciones principales —extensión de sprints a 3 semanas y cierre del módulo Estudiante— se originan en la refutación del supuesto de horas del equipo (S8) y fueron gestionadas sin comprometer el MVP. La entrega final está reprogramada a la semana del **22–28/06/2026**.

## 2. Producto y arquitectura final


| Componente                    | Tecnología                                |
| ----------------------------- | ----------------------------------------- |
| Aplicación web (SPA)          | Next.js                                   |
| Base de datos / Auth          | Supabase (Postgres + RLS)                 |
| Motor CSP (solver)            | Microservicio FastAPI + OR-Tools (CP-SAT) |
| Capa de autenticación backend | Node/Express (`backend/src`)              |
| Calidad / CI                  | GitHub Actions + SonarCloud               |


## 3. Resumen de desempeño

### 3.1 Alcance


| Objetivo                                    | Criterio de cierre                            | Cumplimiento                                |
| ------------------------------------------- | --------------------------------------------- | ------------------------------------------- |
| MVP de generación de horarios admin/docente | Generación CSP + ajuste + vista + exportación | ✅ Cumplido                                  |
| Módulo Estudiante (EP-06)                   | —                                             | ❌ Cerrado fuera de alcance (decisión 03/06) |


Restricciones duras D1–D9 y blandas B1–B5 implementadas; optimización de huecos con prioridad a docentes nombrados (HU-27).

### 3.2 Calidad


| Métrica                 | Resultado                                       | Objetivo       | Estado |
| ----------------------- | ----------------------------------------------- | -------------- | ------ |
| Cobertura backend       | 93.5 %                                          | ≥ 85 % crítico | ✅      |
| Cobertura frontend      | 81.81 %                                         | ≥ 70 % global  | ✅      |
| Quality Gate SonarCloud | Passed                                          | Passed         | ✅      |
| Reliability (bugs)      | B — 23 issues                                   | —              | ✅      |
| Maintainability         | A — 267 issues                                  | —              | ✅      |
| Security                | A                                               | —              | ✅      |
| Security Hotspots       | A                                               | —              | ✅      |
| Duplicación             | 3.1 %                                           | < 5 %          | ✅      |
| Auditorías              | OWASP Top 10 2025, WCAG (3 defectos corregidos) | —              | ✅      |


> Nota: la cobertura global que reporta SonarCloud (12.2 %) se mide sobre **todo el repositorio** (incluye archivos sin pruebas); las cifras 93.5 % / 81.81 % corresponden a la cobertura de los módulos bajo prueba (Vitest backend / Jest frontend).

### 3.3 Cronograma — plan vs ejecución


| Sprint      | Plan  | Real     | Puntos                 |
| ----------- | ----- | -------- | ---------------------- |
| Sprint 1    | 2 sem | 3 sem    | 35 pts (100 %)         |
| Sprint 2    | 2 sem | 3 sem    | 34 pts                 |
| Sprint 3    | 2 sem | 3 sem    | 42 pts (EP-06 cerrada) |
| Entrega MVP | 17/06 | 22–28/06 | —                      |


**Variación de cronograma:** +1 semana por sprint (capacidad real del equipo, S8). Ruta crítica: HU-01..10 → HU-11 → HU-12 → HU-13 → HU-16/17 → HU-23 → HU-24/25.

### 3.4 Costos


| Concepto         | Total (S/) |
| ---------------- | ---------- |
| Recursos humanos | 7,350      |
| Infraestructura  | 10         |
| Indirectos       | 1,208      |
| **Total**        | **8,568**  |


Distribución por sprint: S1 2,625 · S2 2,926 · S3 3,017. Sin desviación monetaria (todo free tier); el incremento progresivo refleja la curva de complejidad (CRUDs → CSP → grillas/exportación). El sobrecosto real fue en **horas-persona**, no en dinero.

## 4. Variaciones (plan vs resultado)


| Dimensión | Resultado final   | Variación                              | Comentario                  |
| --------- | ----------------- | -------------------------------------- | --------------------------- |
| Alcance   | MVP admin/docente | Módulo Estudiante excluido             | Decisión 03/06; causa S8    |
| Tiempo    | Entrega 22–28/06  | +~6 semanas sobre plan de 2 sem/sprint | Sprints reales de 3 semanas |
| Costo     | S/ 8,568          | Sin desviación monetaria               | Sobrecosto en horas         |


## 5. Resumen de riesgos e incidentes

- **Riesgos:** 8 gestionados; 3 materializados (R001 parcial, R003, R008), todos controlados. Residual relevante: R003 (seguridad, medio).
- **Incidentes:** 7 registrados, todos cerrados (JWT, RLS, PRs, latencia drag&drop, grillas, merges, SonarCloud).
- **Impedimentos:** 5, todos resueltos/aceptados; IMP-04 (horas reales) fue la causa raíz de las variaciones de alcance y cronograma.
- **Defectos:** 8 corregidos y validados (incl. 3 de seguridad) + 23 issues de confiabilidad en backlog.

Detalle en `03_registro_riesgos.md`, `04_registro_incidentes.md`, `05_registro_impedimentos.md`, `06_registro_defectos.md`.

## 6. Gestión de beneficios y necesidad de negocio

- **Necesidad de negocio:** automatizar la elaboración manual de horarios en currículo flexible, proceso lento y propenso a errores.
- **Beneficio entregado:** generación automática de horarios institucionales válidos (100 % restricciones duras) en ≤ 30 s, con ajuste manual, vista por docente y exportación — reduciendo drásticamente el esfuerzo administrativo para el alcance admin/docente.

## 7. Conclusiones estratégicas

1. El núcleo de valor (motor CSP) se entregó sólido y probado; la decisión de acotar el alcance al MVP admin/docente fue acertada frente a la capacidad real del equipo.
2. La calidad de pruebas es sobresaliente; la **seguridad es la deuda abierta** prioritaria post-entrega (subir de C, revisar 4 hotspots, cerrar 23 bugs de confiabilidad).
3. La trazabilidad documental (charter → registros → informe) y el control de configuración (232 commits, regla de PR, SonarCloud en CI) evidencian aplicación de buenas prácticas PMBOK.

## 8. Evidencia verificable

- Repositorio Git: 232 commits; SonarCloud Quality Gate *Passed*.
- Auditorías: `docs/calidad/owasp-top10-2025.md`, `docs/calidad/wcag-auditoria.md`, `docs/calidad/sonarcloud.md`.
- Costos y cronograma: `docs/gestion/costos-por-sprint.md`, `docs/planificacion/cronograma.md`.
- Retrospectivas: `docs/sprints/sprint-1|2/retrospectiva.md`.
- Manual y demo: `README.md` (+ video demostrativo).

> Coherencia: este informe es consistente con el Acta revisada (`08`), las lecciones aprendidas (`02`) y los cinco registros base (`03`–`07`). Toda métrica proviene de evidencia real del proyecto.

