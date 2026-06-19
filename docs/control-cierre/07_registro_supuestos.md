# Registro de Supuestos (Assumption Log) — Cierre del Proyecto

**Proyecto:** SGOHA — Sistema de Generación Óptima de Horarios Académicos
**Project Manager:** Edward Flores Rodríguez
**Fecha de preparación:** 2026-06-19
**Plantilla base:** `docs/plantillas/1.2_ASSUMPTION LOG.dotm.md`
**Fuente:** `docs/sprints/sprint-1/registro-supuestos.md` (S1–S10, R1–R10)

Este registro cierra cada supuesto identificado en planificación indicando su **validación real** durante la ejecución y la acción tomada cuando resultó falso.

## 1. Supuestos del proyecto y su validación

| ID | Categoría | Supuesto | Responsable | Resultado en ejecución | Acción / impacto | Estado |
|----|-----------|----------|-------------|------------------------|------------------|--------|
| S1 | Modelo CSP | Cada docente dicta máximo un curso por franja. | Alberto Patiño | Validado verdadero | Restricción dura D1 implementada sin cambios. | Validado |
| S2 | Modelo CSP | Un aula alberga solo un curso por franja. | Alberto Patiño | Validado verdadero | Restricción dura D2 sin cambios. | Validado |
| S3 | Matrícula | Límite de créditos 20–22 por ciclo, sin excepciones. | Brianna Cortez | Validado verdadero | Control de carga académica (HU-19) sin excepciones. | Validado |
| S4 | Datos / CSP | Prerrequisitos lineales (un curso, máx. un prerrequisito directo). | Alberto Patiño | Validado verdadero | Modelo de prerrequisitos lineal (HU-18). | Validado |
| S5 | Horarios | Franjas fijas de 90 min en turnos mañana/tarde/noche. | Andre De La Torre | Validado verdadero | Configuración de franjas (HU-09) sin parametrización adicional. | Validado |
| **S6** | Infraestructura | Despliegue en servidor con internet y ≥ 4 GB RAM. | Bryams Vílchez | **Refutado / ajustado** | La infraestructura real difirió del supuesto; se ajustó el despliegue al free tier disponible (Vercel/Render/Supabase) sin servidor dedicado. | Ajustado |
| S7 | Registro | Datos de matrícula/disponibilidad se ingresan directo (sin importación externa). | Brianna Cortez | Validado verdadero | No se desarrolló módulo de importación. | Validado |
| **S8** | Equipo | Disponibilidad de ≥ 10 h/semana por integrante. | Edward Flores | **Refutado** | El equipo tuvo menos horas reales → extensión de sprints de 2 a 3 semanas y cierre del módulo Estudiante (EP-06). | Refutado |
| **S9** | CSP / blandas | Carga máxima de 4 cursos por docente por ciclo. | Alberto Patiño | **Refutado** | Los docentes tienen mayor carga horaria real; la restricción de carga se trató como parámetro configurable, no como límite fijo. | Refutado |
| S10 | Datos / Matrícula | Aforo mínimo 15 y máximo según capacidad del aula. | Brianna Cortez | Validado verdadero | Capacidad de aula (D8) aplicada. | Validado |

## 2. Análisis de impacto de los supuestos refutados

- **S8 (horas del equipo)** — Mayor impacto. Su refutación es la causa raíz del impedimento IMP-04 y de las dos variaciones principales del proyecto: sprints de 3 semanas (no 2) y cierre del módulo Estudiante fuera del MVP.
- **S6 (infraestructura)** — Impacto medio. Forzó adaptar el despliegue al free tier; no comprometió funcionalidad pero validó la restricción económica R4.
- **S9 (carga docente)** — Impacto bajo-medio en el modelo. Llevó a parametrizar la carga máxima por docente en lugar de fijarla, aumentando la flexibilidad del solver.

## 3. Conclusión

De 10 supuestos, **7 se validaron verdaderos** y **3 se refutaron** (S6, S8, S9). Los tres refutados se gestionaron sin comprometer la entrega: el de horas del equipo (S8) condicionó alcance y cronograma; los de infraestructura (S6) y carga docente (S9) se absorbieron mediante adaptación de despliegue y parametrización del modelo.

> Trazabilidad: S8 ↔ IMP-04 y al cambio de alcance/cronograma del Informe Final · S6 ↔ restricción R4 · S9 ↔ restricción blanda configurable del solver (HU-15/HU-27).
</content>
