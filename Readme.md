# 📅 SGOHA: Sistema de Generación Óptima de Horarios Académicos

<div align="center">

![Stack](https://img.shields.io/badge/Architecture-React%20%2B%20Node.js%20%2B%20FastAPI-8860D0?style=for-the-badge)
![Scrum](https://img.shields.io/badge/Methodology-Scrum%20%2F%20Agile-5680E9?style=for-the-badge)
![OR-Tools](https://img.shields.io/badge/Engine-Google%20OR--Tools%20CP--SAT-5AB9EA?style=for-the-badge)

_Sistema inteligente de optimización para la planificación académica universitaria en entornos de currículo flexible._

---
</div>

## 📌 1. Descripción del Sistema y Arquitectura

**SGOHA** aborda un **Problema Complejo de Ingeniería** de naturaleza combinatoria (**CSP — Constraint Satisfaction Problem**). Utiliza un motor de satisfacción de restricciones con **OR-Tools CP-SAT** para automatizar la creación de horarios académicos, resolviendo conflictos de solapamiento y optimizando el uso de infraestructura física.

* **Arquitectura:** SPA (React 18) + API REST (Node.js/Express) + Microservicio CSP (FastAPI + Python).
* **Documentación Arquitectónica:** Diagramas C4 y decisiones técnicas detalladas en el [Documento Maestro ARC42](docs/arquitectura/ARC42.md).

---

## 🚀 2. Guía de Instalación y Ejecución

> Requisito: tener **Docker** y **Docker Compose** instalados.

### Ejecución completa (Recomendado)
```bash
cp .env.example .env
docker-compose up --build
```

*(Si se desea correr individualmente: Ejecutar `npm run dev` en `/Backend` y `/Frontend`, y `uvicorn app.main:app` en `/Backend/csp-service`).*

---

## 📚 3. Entregables de la Rúbrica de Evaluación

Toda la documentación del repositorio ha sido estructurada para responder **exactamente a los criterios de evaluación académica**. A continuación se enlazan los artefactos correspondientes:

### 3.1. Planificación del Proyecto (Jira)
* 📋 **[Backlog del Producto](docs/planificacion/backlog-producto.md):** Historias de usuario, priorización y relación con restricciones del problema (CSP).
* 🏗️ **[Estructuración del Trabajo y Gestión Temporal](docs/planificacion/planificacion-jira.md):** Épicas, Sprints, Cronograma y **Ruta Crítica**.
* 📊 **[Métricas Ágiles y Análisis](docs/planificacion/metricas-agiles.md):** Gráficos Burnup/Burndown, Velocidad, Control y análisis de estabilidad/cuellos de botella.

### 3.2. Presupuesto del Proyecto
* 💰 **[Fuentes de Costos](docs/gestion/costos-fuentes.md):** Recursos Humanos, Infraestructura Tecnológica y Costos Indirectos.
* 📈 **[Evolución de Costos en el Tiempo](docs/gestion/costos-tiempo.md):** Gasto distribuido a lo largo de las 6 semanas.
* 🔄 **[Costos por Sprint](docs/gestion/costos-por-sprint.md):** Análisis del costo incremental por iteración.
* 📈 **[Costo Acumulado](docs/gestion/costo-acumulado.md):** Curva S de gasto del proyecto.
* 🍃 **[Análisis de Sostenibilidad](docs/gestion/analisis-sostenibilidad.md):** Relación complejidad/costo, factores de incremento y evaluación **Green Software**.

### 3.3. Gestión de Riesgos y Oportunidades
* ⚠️ **[Registro y Análisis de Riesgos/Oportunidades](docs/gestion/riesgos-oportunidades.md):** Probabilidad, impacto, mitigación y su relación directa con las limitaciones técnicas y restricciones CSP.

### 3.4. Spec-Driven Development (SDD)
* 🤖 **[AGENTS.md (Constitution)](docs/sdd/AGENTS.md):** Principios del sistema, reglas globales para desarrolladores y agentes IA.
* 📄 **[Spec.md (Especificación Formal)](docs/sdd/spec.md):** Entradas, salidas, casos límite, restricciones duras y blandas.

### 3.5. Gestión del Repositorio en GitHub
* 🔗 **[Matriz de Trazabilidad](docs/planificacion/trazabilidad.md):** Coherencia total entre Backlog, Commits, requerimientos CSP y funcionalidades implementadas.
* 🔄 **Desarrollo Incremental:** Evidenciado en el flujo de los Sprints:
  * [Sprint 1: Base de Entidades y Auth](docs/sprints/sprint-1/backlog.md)
  * [Sprint 2: Motor de Optimización CSP](docs/sprints/sprint-2/backlog.md)
  * [Sprint 3: PMV Final y Grillas](docs/sprints/sprint-3/backlog.md)

*(La estrategia de Git Flow, Commits Semánticos y Pull Requests con revisión se evidencia directamente en el historial de `git log` y la pestaña de Pull Requests de este repositorio).*

---

## 👥 Equipo de Desarrollo

| Rol Scrum | Integrante | Responsabilidad Principal |
|-----------|-----------|---------|
| Product Owner | Brianna Cortez Ponce | Backlog, Criterios de aceptación |
| Scrum Master | Andre De La Torre Segura | Riesgos, Jira, Git Flow |
| Dev — Backend / CSP | Alberto Patiño Reynoso | Algoritmo NP-Completo (FastAPI/OR-Tools) |
| Dev — Backend / Auth | Edward Flores Rodriguez | API REST Node.js y Seguridad |
| Dev — Frontend / UI | Bryams Vilchez Lazaro | Grillas interactivas React |
| Dev — QA / DevOps | Jack Perez Lizarbe | CI/CD GitHub Actions, Docker |

<div align="center">
  <br>
  <sub>Taller de Proyectos 2 — Universidad Continental — Huancayo, Perú — 2026</sub>
</div>
