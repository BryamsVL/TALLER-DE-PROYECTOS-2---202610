# Análisis de Sostenibilidad y Complejidad Financiera

**Proyecto:** SGOHA  
**Marco de evaluación:** Criterios de la Rúbrica (Evaluación Económica Integral)  

Este documento responde a los requerimientos de análisis de la rúbrica sobre la relación complejidad/costo, los factores de incremento y el enfoque Green Software.

---

## 1. Relación entre Complejidad del Problema y Costo del Sistema

El problema a resolver (Constraint Satisfaction Problem aplicado a Horarios Académicos) es un problema NP-Completo. Esto significa que la dificultad computacional crece exponencialmente con la cantidad de variables. 
Esta complejidad técnica se ha reflejado directamente en los costos del proyecto:

1. **Inversión concentrada en un solo recurso:** El costo total en RRHH para el perfil "Backend/CSP" (Alberto Patiño) fue de S/. 1,620. Representa el rol técnico más costoso de todo el equipo (22% del presupuesto de RRHH), justificando la alta demanda cognitiva requerida para el modelado matemático en OR-Tools.
2. **Desfase en Esfuerzo de Sprints:** Mientras que el Sprint 1 (base del sistema) costó S/. 2,625, el Sprint 2 (que abordaba exclusivamente la mitad de la lógica del solver) elevó el costo drásticamente a S/. 2,926, demostrando que resolver un problema CSP es inherentemente más costoso que construir interfaces y bases de datos transaccionales.

## 2. Identificación de Factores de Incremento de Costos

Los principales "drivers" o disparadores que incrementaron el costo a lo largo del desarrollo fueron:

1. **El modelo matemático en Python:** Integrar FastAPI con OR-Tools para resolver las 19 restricciones (Duras y Blandas) consumió la mayor cantidad de horas/hombre del Sprint 2 y Sprint 3.
2. **Validación en Tiempo Real (HU-14):** Lograr que la UI valide cruces en menos de 1 segundo al hacer "Drag and Drop" incrementó el esfuerzo Frontend y Backend, forzando la creación de índices y optimización de caché, encareciendo el Sprint 2.
3. **El Módulo de Exportación:** Las HU-24 y HU-25 obligaron al equipo a lidiar con el parseo complejo de un JSON de franjas horarias a formatos de impresión estructurados (PDF/Excel), lo que llevó al Sprint 3 a ser el más caro del proyecto (S/. 3,017).

## 3. Evaluación de Sostenibilidad (Enfoque Green Software)

SGOHA no solo es eficiente a nivel algorítmico, sino que aplica los **Principios de Green Software** para minimizar su impacto de carbono, lo que reduce directamente los costos de infraestructura a largo plazo:

1. **Eficiencia Computacional (Energy Efficiency):** Al ser un sistema que resuelve problemas NP-completos, el motor CSP podría consumir ciclos de CPU de forma agresiva. Para mitigar esto, SGOHA implementa una política de **timeout de 30 segundos** en OR-Tools (Escenario Atípico EA-13). El servidor nunca queda iterando infinitamente. Si el timeout ocurre, se devuelve una solución `FEASIBLE` parcial y se detiene el cómputo, ahorrando energía en el centro de datos.
2. **Arquitectura Serverless / Escalamiento a Cero:** El microservicio CSP en FastAPI y la API Express están desplegados en instancias *Free Tier* de Render que aplican "Scale-to-Zero". Si no hay matrículas activas ni generación de horarios (lo cual ocurre el 90% del semestre), los servidores se "apagan", reduciendo el consumo eléctrico de los servidores en la nube a casi cero.
3. **Optimización de Consultas de Lectura (Caching):** Para la visualización de la Grilla (HU-23), el horario ya activado se mantiene de manera estática y cacheada. Cuando un alumno o docente consulta el horario, el sistema solo sirve JSON, evitando re-ejecutar el algoritmo CP-SAT. Esto reduce en >95% la demanda de procesamiento de CPU durante el día a día institucional.
