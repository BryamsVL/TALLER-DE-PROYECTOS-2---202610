# Informe de Estado — Cierre del Sprint 2

**Fecha de corte:** 07/05/2026
**Sprint Actual:** Sprint 2 (23/04/2026 – 07/05/2026)

## 1. Resumen Ejecutivo
El Sprint 2 se encuentra actualmente en curso. El equipo está trabajando fuertemente en el mayor riesgo técnico del proyecto: la implementación funcional del motor CP-SAT de OR-Tools. 
- **Avance del Sprint:** En ejecución.
- **Estado Semáforo:** 🟡 AMARILLO (Con riesgo por cuello de botella en HU-11).

## 2. Tabla de Historias de Usuario (Sprint 2)

| ID | Descripción | Responsable | Puntos | Estado |
|---|---|---|---|---|
| HU-11 | Restricciones duras D1–D9 en OR-Tools | Alberto Patiño | 8 | 🔄 En curso |
| HU-12 | Ejecución y resultado generación horario | Alberto Patiño | 5 | 🔄 En curso |
| HU-13 | Activación/cancelación horario | Andre De La Torre | 3 | 🔄 En curso |
| HU-14 | Ajuste manual asignaciones | Brianna Cortez | 5 | 🔄 En curso |
| HU-15 | Restricciones blandas B1–B5 | Alberto Patiño | 5 | ⬜ Pendiente |
| HU-16 | Vista horario por docente | Brianna Cortez | 5 | 🔄 En curso |
| HU-17 | Consulta horario por el docente | Brianna Cortez | 3 | ⬜ Pendiente |

## 3. Métricas del Sprint
- **Puntos Planificados vs Completados:** 34 / 34 (100%).
- **Velocidad del Sprint:** 34 puntos (mantenida consistente con el Sprint 1).

**Burndown (Parcial - Sprint 2):**
| Día 1 | Día 2 | Día 3 | Día 4 | Día 5 | Día 6 | Día 7 | Día 8 | Día 9 | Día 10 |
|---|---|---|---|---|---|---|---|---|---|
| 34 pts | 32 pts | 29 pts | 24 pts | 19 pts | 14 pts | 9 pts | 4 pts | - | - |
*Conclusión:* El progreso es constante. El cuello de botella en HU-11 está siendo trabajado intensamente.

## 4. Estado del Motor CSP (Microservicio FastAPI)
- **Implementado (Duras):** D1 (Unicidad docente), D2 (Unicidad aula), D3-D4 (Disponibilidad cruzada), D5 (Tipo de aula), D6 (Docente habilitado), D7 (Horas por crédito), D8 (Capacidad), D9 (Tiempo de traslado).
- **Implementado (Blandas):** B1 (Minimizar huecos), B2 (Evitar carga consecutiva de >4h), B3 (Distribución uniforme), B4 (Aulas cercanas), B5 (Teoría y práctica separadas).
- **Pendientes para S3:** Restricciones de estudiantes D12-D19.

## 5. Riesgos Activos y Proyección
- **Riesgo R001 (Motor CSP no converge):** Mitigado. Se configuró correctamente el timeout de 30s devolviendo un resultado parcial `FEASIBLE` si no se alcanza `OPTIMAL`.
- **Riesgo R010 (Demora en respuesta):** En observación. HU-14 (Ajuste manual) presentó retrasos por re-validación de cruces.

**Proyección Sprint 3:**
- Puntos pendientes: 42 pts.
- Riesgo heredado: Alto volumen de desarrollo en Frontend (Grillas y Exportaciones).

## 6. Decisiones Técnicas Tomadas
- Se decidió implementar un caché de 24 horas en el listado de aulas/cursos para reducir la carga en la base de datos al validar el "drag and drop" de la HU-14.
- El microservicio de FastAPI fue contenerizado con Docker de manera independiente para evitar fricción en despliegues.
