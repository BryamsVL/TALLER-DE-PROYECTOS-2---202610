# Registro de Impedimentos (Impediment Log) — Cierre del Proyecto

**Proyecto:** SGOHA — Sistema de Generación Óptima de Horarios Académicos
**Project Manager:** Edward Flores Rodríguez
**Fecha de preparación:** 2026-06-19

No existe plantilla del profesor para este registro; se usa una tabla simple y consistente con el resto de registros de cierre. Los impedimentos se derivan de las retrospectivas de Sprint 1 y 2 y del informe de estado del Sprint 2 (obstáculos que frenaron el avance del equipo).

## 1. Impedimentos

| ID | Impedimento | Origen | Impacto en el avance | Acción de mitigación | Estado |
|----|-------------|--------|----------------------|----------------------|--------|
| IMP-01 | Cuello de botella: Alberto Patiño concentró toda la carga crítica del motor CSP (CP-SAT). Si se ausentaba, el sprint completo quedaba en riesgo. | Retro S2 | Alto — dependencia de una sola persona en la ruta crítica (HU-11/HU-12). | Sesión de transferencia del modelo CP-SAT al resto del backend (09/05); documentación del solver en Swagger. | Resuelto |
| IMP-02 | Curva de aprendizaje de OR-Tools / CP-SAT para traducir restricciones D1–D9 al modelo booleano. | Retro S1/S2, Charter | Medio — ralentizó el arranque del Sprint 2. | Prototipo de prueba de concepto temprano; code review diario del módulo OR-Tools. | Resuelto |
| IMP-03 | Incompatibilidad de RLS de Supabase en entorno local que bloqueaba las pruebas. | Retro S1 | Medio — frenó pruebas de CRUD. | RLS desactivada en dev; políticas por rol configuradas (ver I-02). | Resuelto |
| IMP-04 | Disponibilidad real del equipo inferior a las 10 h/semana supuestas (supuesto S8 refutado). | Retros, supuestos | Alto — obligó a extender la duración real de cada sprint de 2 a 3 semanas y a recortar alcance. | Re-priorización del alcance: cierre del módulo Estudiante (EP-06) fuera del MVP (decisión 03/06). | Resuelto / aceptado |
| IMP-05 | Fatiga mental por depurar restricciones matemáticas "invisibles" del solver. | Retro S2 | Medio — menor velocidad efectiva pese a estimación estable. | Dailys estrictas de 15 min enfocadas en bloqueos; foco único por desarrollador. | Resuelto |

## 2. Conclusión

5 impedimentos, **todos resueltos o aceptados**. El de mayor impacto (IMP-04, falta de horas reales) provocó la **principal variación del proyecto**: extensión de sprints a 3 semanas y cierre del módulo Estudiante. La gestión activa del equipo (transferencia de conocimiento, re-priorización) evitó que IMP-01 e IMP-04 comprometieran la entrega del MVP admin/docente.

> Trazabilidad: IMP-01 ↔ R008 · IMP-03 ↔ I-02 · IMP-04 ↔ supuesto S8 (`07_registro_supuestos.md`) y al cambio de alcance del Informe Final.
</content>
