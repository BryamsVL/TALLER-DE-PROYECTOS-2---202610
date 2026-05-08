# Métricas Ágiles — SGOHA

**Proyecto:** Sistema de Generación Óptima de Horarios Académicos  
**Ciclo:** 3 sprints de 2 semanas cada uno.  

---

## 1. Tabla de Avance por Sprint

| Sprint | HU planif. | HU complet. | Pts planif. | Pts complet. | Incidencias | Observación |
|---|---|---|---|---|---|---|
| Sprint 1 | 10 | 10 | 35 | 35 | 1 | Completado al 100%. Las 10 historias base finalizaron. |
| Sprint 2 | 7 | [En curso] | 34 | [En curso] | [En curso] | En curso. HU-11 es el mayor desafío técnico. |
| Sprint 3 | 9 | [Proyectado] | 42 | [Proyectado] | — | Planificado. Depende del éxito del solver en S2. |
| **Total** | **26** | **10** | **111** | **35** | — | **31.5% completado** |

---

## 2. Análisis del Burndown

![Análisis de Burndown](./burndown.jpg)

### Sprint 1 — Datos reales (10 HU, 35 Puntos)

| Día (Hábiles) | Pts Restantes (Ideal) | Pts Restantes (Real) | Tendencia |
|---|---|---|---|
| 1 | 35.0 | 35.0 | 35.0 |
| 2 | 31.5 | 32.0 | 31.0 |
| 3 | 28.0 | 29.0 | 28.5 |
| 4 | 24.5 | 24.0 | 23.0 |
| 5 | 21.0 | 20.0 | 19.5 |
| 6 | 17.5 | 18.0 | 16.0 |
| 7 | 14.0 | 12.0 | 12.5 |
| 8 | 10.5 | 8.0 | 9.0 |
| 9 | 7.0 | 3.0 | 4.0 |
| 10 | 3.5 | 0.0 | 0.0 |

**Interpretación:**
- El equipo logró entregar los 35 puntos previstos (HU-01 a HU-10) en el marco de las dos semanas.
- El burndown real se mantuvo sumamente cerca a la línea ideal, indicando una correcta estimación de las tareas CRUD y de Auth.

### Sprints 2–3 — Proyección

| Sprint | Pts planificados | Velocidad req. (pts/día) | Riesgo principal |
|---|---|---|---|
| Sprint 2 | 34 | 3.4 | Cuello de botella en HU-11 (OR-Tools) |
| Sprint 3 | 42 | 4.2 | Alta carga. Sprint de exportación y UI |

---

## 3. Análisis del Burnup

![Análisis de Burnup 1](./burnup-1.jpg)
![Análisis de Burnup 2](./burnup-2.jpg)
![Análisis de Burnup 3](./burnup-3.jpg)

| Sprint | Pts acumulados (proyectado) | Pts acumulados (real) | % del proyecto |
|---|---|---|---|
| Inicio | 0 | 0 | 0% |
| Sprint 1 | 35 | 35 | 31.5% |
| Sprint 2 | 69 | [Proyectado] | 62.1% proyectado |
| Sprint 3 | 111 | [Proyectado] | 100% proyectado |

**Interpretación:**
- El alcance total se define en 111 puntos de historia.
- El salto más grande está programado para el Sprint 3 (42 pts). Si el Sprint 2 sufre retrasos, el Sprint 3 será inmanejable.

---

## 4. Análisis de Velocidad por Sprint

![Análisis de Velocidad](./velocidad.jpg)

| Sprint | Velocidad (pts) | Variación | Observación |
|---|---|---|---|
| Sprint 1 | 35 | — | Base establecida. CRUDs entregados. |
| Sprint 2 | [Proyectado: 34] | ~0% | Menos HU, pero de mayor complejidad técnica (CSP). |
| Sprint 3 | [Proyectado: 42] | +23% | Sprint cargado. Muchas dependencias en UI y lógicas de validación. |

---

## 5. Análisis del Gráfico de Control (Lead & Cycle Time)

**Métricas del Sprint 1 (Promedios):**
- **Cycle time promedio:** 4.2 días.
- **Lead time promedio:** 4.8 días.
- El tiempo en cola fue mínimo (~0.6 días). Las historias (CRUD de aulas, docentes) pasaron rápidamente de In Progress a Done.

Para el **Sprint 2**, se proyecta un **cycle time más alto** para las tareas HU-11 y HU-15 debido a la compilación y prueba matemática del modelo de OR-Tools.

---

## 6. Identificación de Cuellos de Botella

| Cuello de botella | Tipo | Sprint afectado | Causa | Impacto |
|---|---|---|---|---|
| **Solver OR-Tools CP-SAT (HU-11)** | Técnico | Sprint 2 | Complejidad NP-completa. | **CRÍTICO**. Bloquea HU-12 a HU-17 y por ende todo el Sprint 3. |
| Reglas de Prerrequisitos (HU-18) | Lógico | Sprint 3 | Multiplicidad de mallas curriculares. | Demora la validación de matrícula. |

---

## 7. Evaluación de Estabilidad del Equipo

El equipo consta de 6 integrantes.

| Integrante | Rol | Asignación Principal (S2-S3) | Nivel de Riesgo/Carga |
|---|---|---|---|
| **Alberto Patiño** | Dev CSP/Backend | HU-11, HU-15, HU-18 | 🔴 Alta (Lidera el desarrollo del Solver) |
| **Edward Flores** | Product Owner | HU-12, Documentación | 🟡 Media |
| **Andre De La Torre** | Scrum Master / Dev | HU-13, Infraestructura | 🟢 Baja |
| **Brianna Cortez** | Dev Backend / Auth | HU-14, HU-16 | 🟡 Media |
| **Bryams Vilchez** | Dev Frontend / UI | HU-23, Grillas, HU-24 | 🔴 Alta (Todo el Frontend de UI visual) |
| **Jack Perez** | Dev QA / DevOps | HU-26 (OWASP), CI/CD, Reportes | 🟡 Media |

**Conclusión:**
La estabilidad del equipo depende críticamente de Alberto (Solver) y Bryams (UI Visual). Se necesita soporte cruzado para mitigar el riesgo de bloqueo.
