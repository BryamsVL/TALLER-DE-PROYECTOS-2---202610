# Análisis de Métricas Ágiles — SGOHA

**Proyecto:** Sistema de Generación Óptima de Horarios Académicos  
**Mapeo Rúbrica:** 3.1.b — Análisis esperado

> Este documento complementa las [métricas numéricas](metricas-agiles.md) con el análisis interpretativo requerido por la rúbrica.

---

## 1. Interpretación de la Evolución del Proyecto

El proyecto avanza en tres etapas claramente delimitadas:

- **Sprint 1 (Completado):** El equipo entregó los 35 puntos planificados al 100%. Las 10 historias base (Auth, CRUD de entidades y configuración del período) se cerraron sin deuda técnica. El burndown real siguió de cerca la línea ideal, lo que indica una buena estimación de tareas de baja complejidad técnica.
- **Sprint 2 (En curso):** El sprint concentra la mayor complejidad técnica del proyecto — el motor OR-Tools CP-SAT. A diferencia del Sprint 1, las tareas son de alta incertidumbre matemática. El avance es constante pero con mayor cycle time por tarea (~6-7 días proyectados vs. 4.2 reales del S1).
- **Sprint 3 (Planificado):** Depende enteramente del éxito del Sprint 2. Con 42 puntos planificados, es el sprint más cargado e involucra la UI visual (Bryams) y las restricciones estudiantiles (Alberto).

**Tendencia general:** El proyecto muestra una curva de complejidad creciente por sprint. El Sprint 1 fue de cimentación, el Sprint 2 es el punto de inflexión técnico, y el Sprint 3 es el de convergencia hacia el PMV.

---

## 2. Identificación de Cuellos de Botella

| Cuello de botella | Tipo | Sprint afectado | Causa raíz | Impacto en proyecto |
|---|---|---|---|---|
| **HU-11 — Solver OR-Tools CP-SAT** | Técnico / Algorítmico | Sprint 2 | Problema NP-completo. Curva de aprendizaje alta en OR-Tools. | **CRÍTICO.** Bloquea en cadena a HU-12 → HU-17 y todo el Sprint 3. |
| **HU-18 — Prerrequisitos complejos** | Lógico / Académico | Sprint 3 | Múltiples mallas curriculares con historiales distintos. | Retrasa el inicio de HU-19, HU-20 y HU-21. |
| **HU-14 — Drag & Drop con validación en tiempo real** | Rendimiento | Sprint 2 | Re-validación constante a Prisma por cada movimiento de asignación. | Latencia UI > 1 s. Se mitiga con caché de 24 h y endpoint bulk. |

**Estrategia de mitigación adoptada:** Soporte cruzado donde Brianna y Andre dan apoyo a Alberto en las HU del solver para reducir la dependencia crítica en un solo integrante.

---

## 3. Evaluación de la Estabilidad del Equipo

La variabilidad de velocidad entre sprints es un indicador de la estabilidad del equipo:

| Métrica | Sprint 1 | Sprint 2 (proyectado) | Sprint 3 (proyectado) |
|---|---|---|---|
| Puntos entregados | 35 | ~34 | ~42 |
| Variación respecto al anterior | — | -2.9% | +23.5% |
| Cycle time promedio (días/HU) | 4.2 | ~6.5 | ~4.7 |
| HU bloqueadas en el sprint | 0 | 2 (HU-15, HU-17) | — |

**Análisis:**
- La **velocidad numérica** se mantiene estable en S1–S2 (~35 pts). La variación real se verá al cerrar S2.
- El **riesgo de inestabilidad** está concentrado en S3: pasar de 34 a 42 puntos exige un +23% de productividad, justificado parcialmente porque S3 tiene más tareas de baja complejidad individual (exportación, grilla UI) versus S2 que tenía pocas tareas pero de altísima complejidad matemática.
- El integrante con mayor riesgo de carga es **Alberto Patiño** (45 pts totales en S2-S3), seguido de **Bryams Vilchez** (todo el frontend visual en S3).

---

## 4. Coherencia entre Planificación y Complejidad del Problema

El problema SGOHA es un problema **NP-completo de satisfacción de restricciones (CSP)**. La planificación ágil refleja esta complejidad de las siguientes formas:

| Característica del problema CSP | Reflejo en la planificación |
|---|---|
| Variables multidimensionales (curso × docente × aula × franja) | HU-11 tiene 8 puntos, la HU más pesada del proyecto |
| Restricciones duras D1-D9 no negociables | Sprint 2 completo dedicado a modelarlas antes de cualquier UI |
| Restricciones blandas B1-B5 opcionales | HU-15 es la última del Sprint 2, con menor prioridad |
| Instancias de 50 cursos en ≤ 30 s (RNF-01) | Criterio de aceptación medible en HU-12 |
| Prerrequisitos de estudiantes (mallas complejas) | HU-18 e HU-19 separadas en Sprint 3 para validación independiente |

**Conclusión:** La planificación no es un template genérico. Cada sprint y cada HU crítica existe por una razón técnica derivada directamente de las restricciones del problema CSP.
