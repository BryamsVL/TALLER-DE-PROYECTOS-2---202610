# Análisis de Spec-Driven Development (SDD)

**Proyecto:** SGOHA  
**Marco de evaluación:** Criterios de la Rúbrica (Análisis de SDD)

Este documento detalla el análisis crítico sobre cómo la adopción del enfoque Spec-Driven Development (SDD) garantizó el éxito del sistema, asegurando coherencia y reduciendo la ambigüedad en un problema NP-Completo.

---

## 1. Coherencia entre Especificación, Modelado e Implementación

El desarrollo de SGOHA no comenzó con la escritura de código, sino con la formalización en `spec.md`. Esta coherencia se evidencia en tres capas exactas:

1. **Especificación:** El documento `spec.md` define matemáticamente las restricciones D1 (Unicidad Docente) y D2 (Unicidad Aula).
2. **Modelado del Problema:** La arquitectura define un microservicio independiente (`csp-service/`) aislado del backend transaccional. El contrato JSON de entrada (SolveRequest) modelado en `spec.md` es exactamente el mismo esquema Pydantic en FastAPI.
3. **Implementación:** El código de `app/solver.py` no toma decisiones de negocio; simplemente traduce las reglas D1 y D2 a variables booleanas de `OR-Tools CP-SAT`. La coherencia es 1 a 1: si una regla cambia en `spec.md`, falla la prueba unitaria en la implementación.

La trazabilidad de esta coherencia se demuestra en la [Matriz de Trazabilidad](../planificacion/trazabilidad.md), donde cada restricción (D1-D9) mapea hacia una historia de usuario y un commit de código.

---

## 2. Reducción de Ambigüedad en Requerimientos

En los sistemas universitarios tradicionales, el requerimiento *"Generar un horario sin cruces"* es altamente ambiguo. Al aplicar SDD, SGOHA logró reducir esta ambigüedad definiendo **Reglas de Negocio (RN)** y **Casos Límite** explícitos antes del Sprint 1:

* **De lo ambiguo a lo formal:** En lugar de decir *"El sistema no debe colapsar"*, el `spec.md` formalizó el **Caso Límite de TIMEOUT (30s)**. Esto le dio instrucciones claras al equipo: *"Si OR-Tools no encuentra la solución óptima en 30 segundos, debe retornar la mejor solución FEASIBLE parcial"*.
* **Contratos Estrictos:** Se eliminó la ambigüedad en la comunicación entre el desarrollador Frontend y Backend al usar un único payload JSON como fuente de verdad (`spec.md`), forzando a que ambos desarrollen en paralelo sin esperar a que el otro termine.

---

## 3. Anticipación de Conflictos y Solapamientos

La principal ventaja del SDD en SGOHA fue anticipar conflictos de la vida real (física y tiempo) antes de programar la interfaz gráfica:

1. **Solapamientos de Horarios (Cruces):** La restricción matemática `Sum(x[c,t,a,f]) <= 1` descrita en el SDD anticipó que un docente podría ser asignado a dos sedes distintas. Como resultado, en la etapa de modelado se añadió una variable restrictiva extra: **El tiempo de traslado entre edificios** (HU-10). Si no se hubiera anticipado en el SDD, el sistema habría generado horarios físicamente imposibles.
2. **Conflictos de Matrícula (Alumnos):** El SDD anticipó que si el motor CSP no puede encontrar un horario institucional perfecto, la carga recaerá en la matrícula del estudiante. Por lo tanto, se especificaron reglas duras de **Aforo Máximo (D3)** y **Corequisitos (HU-21)**. Si un alumno intenta matricular una Práctica sin su Teoría, la API Node.js responde `409 Conflict` inmediatamente gracias a la regla pre-establecida en la especificación, evitando que el problema contamine el motor de base de datos.
