# Análisis de Spec-Driven Development (SDD) — SGOHA

**Proyecto:** Sistema de Generación Óptima de Horarios Académicos  
**Versión del análisis:** 2.0  
**Mapeo Rúbrica:** Sección 3.4.b

Este documento realiza un análisis crítico y técnico sobre cómo la adopción del enfoque
Spec-Driven Development (SDD) estructuró el sistema SGOHA antes de su implementación,
garantizando coherencia total entre artefactos, eliminando ambigüedades y anticipando
conflictos propios de un problema de optimización combinatoria NP-Completo.

---

## 1º Coherencia entre Especificación, Modelado del Problema e Implementación

La coherencia en SGOHA no es un atributo deseable, es una restricción de diseño. El
proyecto aplica el principio de **Single Source of Truth (SSOT)**: ninguna capa del
sistema puede tomar decisiones de negocio que no estén primero formalizadas en `spec.md`.

### 1.1. Trazabilidad Especificación → Modelado

La restricción D1 ("Unicidad Docente") definida en `spec.md` como:

```
Sum(x[c, teacher, a, f]) ≤ 1  ∀ teacher ∈ T, ∀ f ∈ F
```

no es una nota de diseño libre; es la semilla matemática que determina la **forma del
modelo de datos**. Como consecuencia directa, el modelo Prisma define `teacher_id` como
clave foránea en la tabla de asignaciones y no como un campo libre de texto. El `spec.md`
predijó la estructura de la base de datos, no al revés.

### 1.2. Trazabilidad Modelado → Implementación

El contrato JSON de `SolveRequest` y `SolveResponse` definido en `spec.md` (secciones 2.2
y 3) es literalmente idéntico al schema Pydantic en `Backend/csp-service/app/schemas.py`.
Esto no es coincidencia: los schemas se generaron copiando el JSON del spec y envolviéndolo
en clases Python. El mismo contrato es reproducido como tipos TypeScript en el frontend.

**Evidencia de coherencia 1 a 1:**

| Artefacto | Campo | Valor |
|---|---|---|
| `spec.md` (Contrato JSON) | `"timeout_seconds": 30` | Límite declarado en la especificación |
| `schemas.py` (Pydantic) | `timeout_seconds: int = 30` | Default igual al spec |
| `solver.py` (CP-SAT) | `solver.parameters.max_time_in_seconds = req.timeout_seconds` | Uso directo del campo |
| `routes/scheduler.ts` (TS) | `body: { timeout_seconds: 30 }` | Mismo valor al llamar al backend |

Cualquier cambio en el spec propaga una cadena de fallos verificables: si se cambia
`timeout_seconds` a 60 en el spec pero no en Pydantic, el test de integración falla.
Eso es coherencia auditable.

### 1.3. Trazabilidad Implementación → Restricciones del Problema

El `AGENTS.md` establece que las restricciones D1-D7 son inviolables. El equipo de
desarrollo codificó cada `model.Add(...)` en `solver.py` con un comentario directo
al identificador de restricción:

```python
# D1: Unicidad Docente — spec.md §5.1
model.Add(sum(x[c, teacher, a, f] for c in courses for a in classrooms) <= 1)
```

Esto crea una traza directa verificable: `spec.md § D1` → `solver.py` → `test_d1_unicidad.py`.

---

## 2º Reducción de Ambigüedad en Requerimientos

La gestión académica universitaria acumula décadas de vocabulario impreciso. SGOHA
identificó y resolvió las siguientes ambigüedades críticas antes del Sprint 1:

### 2.1. Ambigüedad: "El horario no debe tener cruces"

**El problema:** Esta frase es el requerimiento más común en sistemas de horarios y también
el más peligroso. "Cruce" puede interpretarse de cuatro formas distintas:

- (a) Dos clases del mismo **docente** en la misma franja.
- (b) Dos clases en la misma **aula** en la misma franja.
- (c) Dos clases del mismo **estudiante** en la misma franja.
- (d) Una clase en un horario donde el **docente declaró no estar disponible**.

**La resolución SDD:** El `spec.md` convirtió las 4 interpretaciones en 4 restricciones
formales e independientes (D1, D2, D4, D6), cada una con su scope matemático preciso. El
término ambiguo "cruce" desapareció del vocabulario técnico del proyecto; fue reemplazado
por el ID de restricción específico. Un desarrollador que recibe el error `"D2 violation"`
sabe exactamente qué tabla consultar y qué constraint revisar, sin necesidad de buscar
al dueño del producto para que le aclare qué quiso decir.

### 2.2. Ambigüedad: "El alumno no puede exceder su carga académica"

**El problema:** "Carga académica" es ambiguo entre créditos totales (número abstracto) vs.
horas semanales efectivas (tiempo real). Ambos conceptos son distintos: un curso de 4
créditos puede implicar 6 horas presenciales en algunos currículos con componentes
prácticos.

**La resolución SDD:** La regla `RN-05` del spec formaliza el rango `[20, 22]` en
**créditos** (no horas). La implementación validó exactamente esto en el middleware de
matrícula sin debate ni reuniones adicionales. Sin este spec, el equipo habría necesitado
al menos una reunión técnica extra y probablemente habría implementado la validación
incorrecta primero, descubriéndolo en testing de aceptación.

### 2.3. Ambigüedad: "El sistema debe ser rápido"

**El problema:** "Rápido" no es un requerimiento de ingeniería. Es un adjetivo que varía
según quién lo usa: para un coordinador con 10 cursos es inmediato, para uno con 200 cursos
puede significar 5 minutos.

**La resolución SDD:** La sección 7 del spec define tres métricas cuantitativas
independientes para tres capas del sistema:

| Capa | Métrica | Umbral |
|---|---|---|
| Motor CSP (OR-Tools) | Tiempo de resolución | ≤ 30 segundos |
| API Node.js (CRUD) | Latencia P95 | < 500ms |
| Frontend (React) | Renderizado de grilla | < 3 segundos |

Esto convirtió un adjetivo subjetivo en tres criterios de aceptación objetivos que el equipo
puede medir con herramientas reales (k6, Playwright, pytest-benchmark) y fallar con
precisión si no se cumplen.

---

## 3º Anticipación de Conflictos

La diferencia entre un sistema de horarios que "funciona en demo" y uno que "funciona en
producción" es su capacidad de anticipar conflictos que solo emergen con datos reales del
mundo académico. El SDD permitió a SGOHA identificar tres categorías de conflictos antes
de escribir una sola línea de código de producción:

### 3.1. Conflicto Físico: Traslado Imposible entre Edificios

**El conflicto anticipado:** Un docente termina clase en el Edificio A a las 10:00 y el
solver le asigna clase en el Edificio B a las 10:05. El horario es matemáticamente válido
(D1 no se viola porque las franjas son consecutivas, no simultáneas) pero físicamente
imposible de cumplir.

**Cómo el SDD lo anticipó:** Al formalizar la restricción blanda B4 ("Minimizar Traslados")
en el spec durante el Sprint 0, el equipo descubrió que el solver necesitaba una **matriz
de tiempos de traslado entre edificios** como dato de entrada, antes de diseñar cualquier
interfaz. Esto derivó en la HU-10 (Configuración de Tiempos de Traslado), una historia de
usuario que no existía en el backlog inicial y que no habría sido identificada si el diseño
se hubiera hecho de forma exploratoria. El spec capturó un requisito oculto antes de que
se convirtiera en un defecto en producción.

### 3.2. Conflicto Algorítmico: Espacio de Soluciones Vacío (INFEASIBLE)

**El conflicto anticipado:** Si el número de cursos requeridos excede la combinación posible
de aulas × franjas disponibles × docentes habilitados, el problema CSP no tiene solución
matemáticamente posible. Un sistema sin especificación previa simplemente "se congela" o
devuelve un error genérico `HTTP 500` que no le dice nada útil al coordinador.

**Cómo el SDD lo anticipó:** La sección 6 del spec ("Casos Límite") formalizó el estado
`INFEASIBLE` como un **resultado válido y esperado** del sistema, no como un error de
software. Esto tuvo consecuencias de diseño concretas e inmediatas: el `SolveResponse`
incluye un array `"conflicts": []` donde el solver debe explicar la causa del fallo (ej.
`"Sin aulas de tipo LAB disponibles para MAT101 en franjas matutinas"`). Sin este caso
límite formalizado, el backend habría retornado un 500 genérico y el coordinador no habría
podido tomar ninguna acción correctiva.

### 3.3. Conflicto de Integridad: Atomicidad de Componentes (Teoría + Práctica)

**El conflicto anticipado:** En currículos flexibles, un curso puede tener un componente
teórico (Teoría, 2h) y uno práctico (Laboratorio, 3h). Si el motor asigna exitosamente
la sección de Teoría pero no encuentra Laboratorio disponible, y el sistema confirma la
matrícula del estudiante de todas formas, el alumno queda con un horario corrupto e
incompleto que no le permite cumplir con los créditos del curso.

**Cómo el SDD lo anticipó:** La restricción `D7 (Atomicidad de Componentes)` en el
`AGENTS.md` exige explícitamente que si un curso tiene componentes múltiples, todos deben
asignarse en bloque atómico o ninguno se confirma. Esta regla se tradujo directamente en
la HU-21 del backlog y en una restricción adicional en el solver CP-SAT (variable auxiliar
de "completitud") durante Sprint 3. Si esta regla no hubiera sido capturada durante la
fase de especificación, el error solo se habría detectado en pruebas de aceptación final
—cuando un evaluador real intentara matricularse— con un costo de corrección
significativamente mayor que durante el modelado.
