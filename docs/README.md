# Índice de Documentación — SGOHA

Bienvenido a la documentación del **Sistema de Generación Óptima de Horarios Académicos (SGOHA)**. Todo el proyecto está diseñado bajo el enfoque de *Spec-Driven Development* (SDD).

## 📂 Directorios Principales

### 1. [Spec-Driven Development (`/sdd`)](./sdd)
El núcleo normativo del sistema. Ninguna línea de código debe escribirse sin estar amparada aquí.
- [AGENTS.md](./sdd/AGENTS.md) — Guía para agentes IA
- [Constitution](./sdd/constitution.md) — Reglas y principios rectores
- [Spec del Sistema](./sdd/spec.md) — Restricciones, entradas y casos límite
- [Análisis SDD](./sdd/analisis-sdd.md) — Coherencia, reducción de ambigüedad y anticipación de conflictos
- [Decisiones Técnicas (ADR)](./sdd/decisiones-tecnicas.md) — Elección de tecnologías

### 2. [Planificación (`/planificacion`)](./planificacion)
Artefactos ágiles y de trazabilidad.
- [Backlog del Producto](./planificacion/backlog-producto.md)
- [Planificación Jira](./planificacion/planificacion-jira.md)
- [Métricas Ágiles](./planificacion/metricas-agiles.md)
- [Matriz de Trazabilidad](./planificacion/trazabilidad.md)
- [Archivos Excel](./planificacion/xlsx/)

### 3. [Gestión y Control (`/gestion`)](./gestion)
Control del proyecto, presupuestos y riesgos.
- [Registro de Riesgos y Oportunidades](./gestion/riesgos-oportunidades.md)
- [Fuentes de Costo (RRHH, Infra, Indirectos)](./gestion/costos-fuentes.md)
- [Costos a lo largo del tiempo](./gestion/costos-tiempo.md)
- [Costos por Sprint](./gestion/costos-por-sprint.md)
- [Costo Acumulado (Curva S)](./gestion/costo-acumulado.md)
- [Análisis de Sostenibilidad y Complejidad (Green Software)](./gestion/analisis-sostenibilidad.md)
- [Reporte de Optimización Green Software (Detallado)](./gestion/green-software.md)

### 4. [Arquitectura Técnica (`/arquitectura`)](./arquitectura)
Documentación para el equipo de desarrollo.
- [ARC42](./arquitectura/ARC42.md) — Diagramas y contexto del sistema
- [Algoritmo del Solver](./arquitectura/algoritmo-solver.md) — Cómo funciona el motor de optimización CSP
- [Testing del Backend](./arquitectura/testing-backend.md) — Guía de pruebas del servidor

### 5. [Sprints (`/sprints`)](./sprints)
Histórico y trabajo en curso dividido por iteraciones.
- [Sprint 1 (Inicio y Fundamentos)](./sprints/sprint-1) — Completado
- [Sprint 2 (Motor CSP)](./sprints/sprint-2) — En curso
- [Sprint 3 (PMV)](./sprints/sprint-3) — Planificado

### 6. Entregables Académicos (TP2)
- [Entregable TP2 — Sostenibilidad y Desarrollo Web Responsable](./consignas/TP2-sostenibilidad.md)
- [Entregable TP2 — Estrategias de Testing y Aseguramiento de Calidad](./consignas/TP2-testing.md)
- [Reporte Técnico de Optimización Green Software](./gestion/green-software.md)
