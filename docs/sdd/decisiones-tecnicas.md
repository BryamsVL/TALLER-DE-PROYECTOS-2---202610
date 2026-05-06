# Decisiones Técnicas (ADR) — SGOHA

**Proyecto:** Sistema de Generación Óptima de Horarios Académicos

---

## Resumen de Decisiones

| ID | Decisión | Área | Estado |
|---|---|---|---|
| **DT-001** | OR-Tools CP-SAT | Algorítmica (Solver) | ✅ Implementado |
| **DT-002** | Microservicio FastAPI | Arquitectura | ✅ Implementado |
| **DT-003** | Prisma + Supabase | Persistencia de Datos | ✅ Implementado |
| **DT-004** | TIMEOUT con Solución Parcial | Tolerancia a Fallos | ✅ Definido |
| **DT-005** | TanStack Router | Frontend Routing | ✅ Implementado |
| **DT-006** | Restricciones Duras > Blandas | Lógica de Negocio | ✅ Implementado |
| **DT-007** | Variables CP-SAT Booleanas | Modelado Matemático | ✅ Implementado |

---

## DT-001: Elección de OR-Tools CP-SAT

| Criterio | Análisis |
|---|---|
| **Problema** | Necesitamos generar un horario complejo respetando decenas de reglas lógicas. |
| **Alternativas** | 1. Heurísticas propias (Greedy/Genéticos). 2. OptaPlanner (Java). 3. OR-Tools CP-SAT (Python/C++). |
| **Decisión** | Se eligió **OR-Tools CP-SAT**. |
| **Trade-offs** | *A favor:* Resolución óptima, comprobada matemáticamente. *En contra:* Curva de aprendizaje empinada, modelado complejo. |
| **Impacto** | Obliga al equipo a aprender modelado de restricciones enteras y booleanas. Define el techo tecnológico del proyecto. |

## DT-002: Separación en Microservicio FastAPI

| Criterio | Análisis |
|---|---|
| **Problema** | El backend está en Node.js (Express), pero OR-Tools tiene su mejor soporte en Python. |
| **Alternativas** | 1. Usar `python-shell` en Node.js. 2. Reescribir el backend en Python. 3. Crear un microservicio. |
| **Decisión** | Se creó un **Microservicio en FastAPI (Python 3.11)** expuesto en el puerto 8000. |
| **Trade-offs** | *A favor:* Escalabilidad modular, lenguajes óptimos para cada tarea (Node para I/O, Python para CPU). *En contra:* Latencia de red, doble despliegue. |
| **Impacto** | El flujo es: Frontend -> Express -> FastAPI (CSP) -> Express -> BD. |

## DT-003: Prisma + Supabase (PostgreSQL)

| Criterio | Análisis |
|---|---|
| **Problema** | Gestión relacional eficiente con tipado fuerte en TypeScript. |
| **Alternativas** | 1. TypeORM + PostgreSQL local. 2. MongoDB (NoSQL). 3. Prisma + Supabase. |
| **Decisión** | Se utiliza **Prisma** como ORM conectado a **Supabase**. |
| **Trade-offs** | *A favor:* Migraciones seguras, autocompletado en TS, Free tier excelente en Supabase. *En contra:* Queries complejas pueden ser ineficientes si no se optimizan los `include`. |

## DT-004: Estrategia ante TIMEOUT / INFEASIBLE

| Criterio | Análisis |
|---|---|
| **Problema** | Si el motor CSP no encuentra solución en 30s o las reglas chocan entre sí. |
| **Alternativas** | 1. Retornar error genérico. 2. Retornar asignación parcial (TIMEOUT) o lista de conflictos (INFEASIBLE). |
| **Decisión** | Se implementa el manejo de estados de CP-SAT: si es TIMEOUT, guarda lo avanzado. Si es INFEASIBLE, aborta e informa el conflicto. |
| **Trade-offs** | *A favor:* Mejor UX para el coordinador. *En contra:* Requiere lógica adicional en el backend para distinguir soluciones completas de parciales. |

## DT-005: TanStack Router vs React Router

| Criterio | Análisis |
|---|---|
| **Problema** | Navegación robusta en la SPA (React). |
| **Alternativas** | 1. React Router v6. 2. Next.js. 3. TanStack Router. |
| **Decisión** | Se adoptó **TanStack Router**. |
| **Trade-offs** | *A favor:* 100% Type-safe, pre-fetching automático. *En contra:* Menos documentación comunitaria en español. |

## DT-006: Priorización Duras sobre Blandas

| Criterio | Análisis |
|---|---|
| **Problema** | Conflicto matemático entre reglas del sistema. |
| **Alternativas** | 1. Penalizar duras en la función objetivo. 2. Definir duras como `model.Add()` y blandas como `model.Maximize()`. |
| **Decisión** | **Alternativa 2.** Las duras son obligatorias. Las blandas solo suman puntos. |
| **Trade-offs** | *A favor:* Garantiza que el horario resultante nunca tendrá errores legales/operativos. |

## DT-007: Variables Booleanas en CP-SAT

| Criterio | Análisis |
|---|---|
| **Problema** | ¿Cómo representar las asignaciones en el solver? |
| **Decisión** | Uso de variables `bool_var` dimensionales: `x[curso, docente, aula, franja]`. |
| **Impacto** | Simplifica la formulación de las restricciones pero multiplica geométricamente la cantidad de variables. Para instancias masivas podría requerir optimización (ej. reducir franjas pre-filtrando). |
