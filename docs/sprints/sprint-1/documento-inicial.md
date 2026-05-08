## Entregable G — Documento inicial del problema (primer borrador)

### 1. Descripción del problema

Las universidades con currículo flexible, como la Universidad Continental, enfrentan dificultades significativas en la planificación semestral de horarios académicos. A diferencia de los currículos rígidos, el currículo flexible permite que cada estudiante elija su propia carga académica dentro de ciertos rangos, lo que genera una alta variabilidad en la demanda de secciones, docentes y aulas.

El proceso actual de generación de horarios es manual o semiautomático, dependiente del criterio de los coordinadores académicos, y frecuentemente produce resultados con conflictos (solapamientos de horarios, docentes asignados a dos cursos en la misma franja, aulas con capacidad insuficiente), inequidades en la distribución de horarios, y tiempos de procesamiento que se extienden durante semanas.

---

### 2. Naturaleza de problema complejo

> **¿Por qué es un problema complejo de ingeniería?**
> El problema de generación de horarios académicos (conocido como University Timetabling Problem o UTP) es un problema NP-completo. Esto significa que no existe un algoritmo eficiente que garantice encontrar la solución óptima en tiempo polinomial para instancias grandes. Requiere modelado abstracto, decisiones fundamentadas con trade-offs, y participación de múltiples actores con intereses distintos.

| Característica | Manifestación en este problema |
|----------------|-------------------------------|
| Múltiples variables | Cursos, docentes, estudiantes, aulas, franjas horarias — todas interrelacionadas. |
| Restricciones interdependientes | La disponibilidad del docente afecta al aula, que afecta al estudiante, que afecta al crédito acumulado. |
| Sin solución única | Para 50 cursos, 30 docentes y 20 aulas hay del orden de 10^80 asignaciones posibles; la mayoría inválidas. |
| Múltiples actores | Estudiantes, docentes, coordinadores y administradores con objetivos a veces en conflicto. |
| Requerimientos cambiantes | Las matrículas varían cada ciclo. Las restricciones pueden cambiar por políticas institucionales. |
| Impacto real | Un horario mal generado afecta directamente el progreso académico de cientos de estudiantes. |

---

### 3. Ambigüedades identificadas en la consigna

Se han identificado las siguientes ambigüedades que deben ser resueltas mediante supuestos justificados o consulta con el cliente:

| # | Ambigüedad | Impacto | Supuesto adoptado |
|---|-----------|---------|-------------------|
| A1 | ¿Qué significa 'óptimo' en la generación de horarios? ¿Mínimo de conflictos, máxima satisfacción de preferencias, mínimo tiempo de cómputo? | Define la función objetivo del CSP y los criterios de evaluación del algoritmo. | Se priorizará: (1) cero conflictos duros, (2) máxima cobertura de disponibilidad de docentes, (3) equidad en distribución de turnos. |
| A2 | ¿Los estudiantes tienen preferencias de horario que el sistema debe respetar, o solo restricciones de disponibilidad? | Determina si la disponibilidad del estudiante es una restricción dura o blanda. | La disponibilidad del estudiante es una restricción blanda (preferencia). La del docente es restricción dura (obligatoria). |
| A3 | ¿Cuántas franjas horarias hay por día? ¿Cuál es la duración de cada bloque? | Impacta directamente en la dimensión del dominio del CSP y el diseño de la base de datos. | Se asumen 6 franjas de 90 minutos por día (07:00–19:30), distribuidas en turnos mañana y tarde. |
| A4 | ¿Un curso puede tener múltiples secciones con distintos docentes, o una sola sección por curso? | Define la cardinalidad del modelo: si hay múltiples secciones, el espacio de soluciones crece exponencialmente. | Se asume una sección por curso por ciclo, con posibilidad de extensión a múltiples secciones en versiones posteriores. |
| A5 | ¿La 'disponibilidad de infraestructura' incluye solo capacidad de personas, o también equipamiento especial (laboratorios, proyectores)? | Añade una dimensión adicional al dominio del CSP (tipo de aula requerida por el curso). | Se incluye un atributo 'tipo de aula' en el modelo (normal, laboratorio, sala audiovisual). El CSP verifica compatibilidad. |
