# Riesgos y Oportunidades — SGOHA

**Proyecto:** Sistema de Generación Óptima de Horarios Académicos

---

## 1. Criterios de Valoración

| Probabilidad (P) | Valor | Impacto (I) | Valor |
|---|---|---|---|
| Muy Alto | 5 | Crítico | 5 |
| Alto | 4 | Serio | 4 |
| Medio | 3 | Moderado | 3 |
| Bajo | 2 | Menor | 2 |

**Nivel = P × I**.  
🔴 Crítico (15-25) | 🟠 Alto (8-14) | 🟡 Medio (4-7) | 🟢 Bajo (1-3)

---

## 2. Matriz de Riesgos

| ID | Riesgo | Causa | P | I | Nivel | Restricción/Dep. | Mitigación |
|---|---|---|---|---|---|---|---|
| **R001** | Motor CSP no converge | Complejidad NP-completa (OR-Tools). | 5 | 5 | 🔴 25 | D1-D9 | Timeout configurado a 30s. Solución FEASIBLE. |
| **R010** | Demora generación >30s | Instancias muy grandes de cursos. | 4 | 5 | 🔴 20 | D1, D3 | Pruebas de estrés progresivas en S2. |
| **R008** | Vulnerabilidades OWASP | Fallos en JWT, Inyecciones. | 3 | 5 | 🔴 15 | HU-26 | Auditoría de ZAP, validación con Zod en endpoints. |
| **R002** | Cambios en requisitos | Criterios académicos variables. | 4 | 4 | 🟠 16 | D14, D18 | Refinamiento semanal del backlog con el cliente. |
| **R003** | Fallas integración API | Desconexión Node.js / FastAPI. | 4 | 4 | 🟠 16 | D1-D9 | Pruebas de integración, esquemas compartidos en Pydantic y Zod. |
| **R006** | Curva aprendizaje CSP | OR-Tools es nuevo para el equipo. | 4 | 4 | 🟠 16 | - | Pair programming (Alberto + Jack). |
| **R011** | Conflictos no detectados | Modelo matemático imperfecto. | 3 | 4 | 🟠 12 | D1, D2, D4 | Tests unitarios exhaustivos a cada restricción. |
| **R005** | Caída Render/Supabase | Límite del Free Tier alcanzado. | 3 | 4 | 🟠 12 | - | Entorno local replicable (Docker-compose) como fallback. |
| **R007** | Sobrecarga del equipo | Tareas académicas paralelas. | 4 | 3 | 🟠 12 | - | Distribución equitativa y buffer de contingencia en horas. |
| **R004** | Baja cobertura pruebas | Tiempos cortos en Sprint 2 y 3. | 3 | 3 | 🟡 9 | - | CI/CD automatizado con Jest y PyTest obligatorios. |
| **R009** | Datos inconsistentes | Errores en carga de docentes. | 3 | 3 | 🟡 9 | D14 | Validación en UI y backend con Zod. |
| **R012** | Conflictos de Git | Mal uso de ramas/merges. | 2 | 3 | 🟡 6 | - | Branch protection en `main`. PRs requeridos. |
| **R013** | Cortes eléctricos locales | Problemas de red en Huancayo. | 3 | 2 | 🟡 6 | - | Trabajo offline, repositorios locales actualizados diariamente. |

---

## 3. Matriz de Oportunidades

| ID | Oportunidad | Impacto Positivo | Estrategia de Aprovechamiento |
|---|---|---|---|
| **OP-01** | **Open Source Standard** | Medio | Publicar SGOHA como estándar abierto para UCs peruanas. |
| **OP-02** | **Caché para rendimiento** | Alto | Implementar TTL en Redis o memoria para evitar recalculados del solver, bajando los costos de servidor. |
| **OP-03** | **Portafolio Profesional** | Alto | Destacar el uso de FastAPI + CP-SAT como diferenciador técnico para los desarrolladores. |
| **OP-04** | **Reutilización del Solver** | Alto | Parametrizar las reglas para que el módulo CSP sirva a otras facultades fácilmente. |
| **OP-05** | **Integración con IA futura** | Medio | Dejar endpoints preparados para usar LLMs como asistentes de conflictos horarios. |
