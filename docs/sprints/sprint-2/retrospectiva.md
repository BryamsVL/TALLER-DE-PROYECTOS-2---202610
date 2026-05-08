# Retrospectiva del Sprint 2

**Fecha de la reunión:** 07/05/2026
**Sprint:** 2 (23/04/2026 – 07/05/2026)
**Facilitador:** Andre De La Torre Segura (Scrum Master)

## 1. Resumen Ejecutivo (Borrador en curso)
El Sprint 2 se encuentra en ejecución. El equipo está trabajando en dotar de "inteligencia" al sistema SGOHA mediante el solver. A pesar de los retos iniciales sobre la curva de aprendizaje de OR-Tools, el equipo mantiene un ritmo constante, probando que la separación del microservicio en FastAPI fue una decisión arquitectónica acertada.

## 2. Historias de Usuario
| HU | Responsable | Estado | Puntos |
|---|---|---|---|
| HU-11 (CSP Duras) | Alberto Patiño | 🔄 En curso | 8 |
| HU-12 (Ejecución CSP) | Alberto Patiño | 🔄 En curso | 5 |
| HU-13 (Activar Horario) | Andre De La Torre | 🔄 En curso | 3 |
| HU-14 (Ajuste manual) | Brianna Cortez | 🔄 En curso | 5 |
| HU-15 (CSP Blandas) | Alberto Patiño | ⬜ Pendiente | 5 |
| HU-16 (Vista Horario) | Brianna Cortez | 🔄 En curso | 5 |
| HU-17 (Consulta Docente) | Brianna Cortez | ⬜ Pendiente | 3 |

## 3. ¿Qué salió bien?
1. **Modelado CSP Impecable:** Alberto logró traducir exitosamente las reglas D1-D9 al modelo booleano de CP-SAT.
2. **Integración Express-FastAPI:** El contrato en Pydantic y Zod permitió que los payloads viajaran sin errores de tipado.
3. **Desempeño del Timeout:** La estrategia de retornar una solución parcial `FEASIBLE` tras 30 segundos resultó fundamental para evitar que el request quede colgado.
4. **Mocking efectivo:** Frontend pudo avanzar con la UI de HU-16 y HU-17 gracias al JSON de prueba creado el primer día.

## 4. ¿Qué podemos mejorar?
1. **Cuello de botella en un solo integrante:** Alberto concentró demasiada carga crítica. Si se enfermaba, todo el sprint se caía. 
2. **Validación en tiempo real:** En la HU-14, la validación de arrastrar y soltar (drag & drop) provocó problemas de latencia al consultar a Prisma constantemente.
3. **Carga visual en React:** Las grillas comenzaron a ponerse lentas al renderizar demasiadas celdas en el componente de TanStack Router.

## 5. Plan de Acción (Para Sprint 3)

| Acción a tomar | Responsable | Fecha Límite |
|---|---|---|
| Compartir conocimiento del modelo CP-SAT con el resto del equipo backend. | Alberto Patiño | 09/05/2026 |
| Implementar memoización (`useMemo`, `React.memo`) en los componentes de las grillas. | Bryams Vilchez | 10/05/2026 |
| Usar un endpoint optimizado (bulk) para la re-validación de cruces de la HU-14. | Brianna Cortez | 12/05/2026 |

## 6. Comparación de Velocidad S1 vs S2 (Parcial)
- **Sprint 1:** 35 pts (CRUDs y Auth, alta cantidad de tareas de baja complejidad).
- **Sprint 2:** [En curso] — Velocidad proyectada: 34 pts (Solver y algoritmos, baja cantidad de tareas de extrema complejidad).
*Análisis:* La velocidad numérica se mantiene estable en estimación, pero la fatiga mental del equipo es mayor en el S2 debido a la complejidad de depurar restricciones matemáticas invisibles.

## 7. Acuerdos para el Sprint 3
- Dado que el Sprint 3 tiene 42 puntos (la carga más alta), las dailys serán estrictas de 15 minutos enfocadas únicamente en bloqueos.
- La protección OWASP (HU-26) iniciará el Día 1 del sprint, no al final.
