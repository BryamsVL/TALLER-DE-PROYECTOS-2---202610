# Registro de Incidentes / Problemas (Issue Log) — Cierre del Proyecto

**Proyecto:** SGOHA — Sistema de Generación Óptima de Horarios Académicos
**Project Manager:** Edward Flores Rodríguez
**Fecha de preparación:** 2026-06-19
**Plantilla base:** `docs/plantillas/3.1_ISSUE LOG.dotm.md`

Registra problemas reales surgidos durante la ejecución, derivados de las retrospectivas de Sprint 1 y 2, el informe de estado del Sprint 2 y la auditoría de calidad. No se incluyen incidencias hipotéticas.

## 1. Incidencias

| ID | Tipo | Descripción del problema | Prioridad | Impacto en objetivos |
|----|------|--------------------------|-----------|----------------------|
| I-01 | Seguridad | El middleware JWT no rechazaba correctamente tokens expirados. | Alta | Riesgo de acceso con tokens caducados (OE3, RAN-02). |
| I-02 | Técnico | Row Level Security (RLS) de Supabase bloqueaba las pruebas en entorno local. | Media | Frenaba pruebas de los CRUD en Sprint 1. |
| I-03 | Proceso | Pull Requests aprobados sin revisión profunda → conflictos de merge menores. | Media | Calidad de integración y retrabajo. |
| I-04 | Rendimiento | Latencia en el ajuste manual (drag & drop, HU-14) por re-validación constante contra Prisma. | Media | UX del ajuste manual (RAN-03). |
| I-05 | Rendimiento | Grillas React lentas al renderizar muchas celdas (HU-23, TanStack). | Media | Carga de la vista de horario (RAN-04). |
| I-06 | Técnico | Conflictos de merge rompieron el build en un par de ocasiones. | Baja | Disponibilidad temporal de la rama de trabajo. |
| I-07 | Configuración | `sonar-project.properties` con `CHANGE_ME_ORG` y sin `SONAR_TOKEN` → sin análisis continuo. | Media | Visibilidad de calidad (OE5). |

## 2. Responsables, estado y resolución

| ID | Responsable | Estado | Fecha res. | Resolución final | Comentarios |
|----|-------------|--------|------------|------------------|-------------|
| I-01 | Brianna Cortez | Cerrado | 2026-04-25 | Pruebas unitarias Jest del middleware JWT; verificación de expiración. | Originó el defecto D-01. |
| I-02 | Jack Pérez | Cerrado | 2026-04-28 | RLS desactivada en dev; políticas por rol configuradas para los entornos protegidos. | Acción del plan de retro S1. |
| I-03 | Andre De La Torre | Cerrado | 2026-04-23 | Regla en GitHub: mínimo 1 review obligatorio por PR antes del merge. | Control de configuración. |
| I-04 | Brianna Cortez | Cerrado | 2026-05-12 | Endpoint *bulk* para re-validación de cruces + caché de 24 h en listados. | Originó el defecto D-07. |
| I-05 | Bryams Vílchez | Cerrado | 2026-05-10 | Memoización con `useMemo` / `React.memo` en los componentes de grilla. | Originó el defecto D-08. |
| I-06 | Equipo | Cerrado | — | Re-merge y resolución de conflictos; refuerzo de la regla de PR (I-03). | Sin pérdida de trabajo. |
| I-07 | Andre De La Torre | Cerrado | 2026-06-12 | Organización real de SonarCloud configurada; análisis ejecutado (Quality Gate *Passed*). | Habilita métricas del Informe Final. |

## 3. Conclusión

7 incidencias registradas, **todas cerradas**. Las de seguridad (I-01) y configuración (I-07) escalaron a defectos/seguimiento documentados. Las de rendimiento (I-04, I-05) se resolvieron con optimización y se trazan como defectos D-07/D-08.

> Trazabilidad: I-01 ↔ D-01 · I-04 ↔ D-07 · I-05 ↔ D-08 · I-07 ↔ `docs/calidad/sonarcloud.md`.
</content>
