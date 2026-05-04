# 🗓️ SGOHA: Sistema de Generación Óptima de Horarios Académicos

<div align="center">

![Stack](https://img.shields.io/badge/Architecture-React%20%2B%20Node.js%20%2B%20FastAPI-8860D0?style=for-the-badge)
![Scrum](https://img.shields.io/badge/Methodology-Scrum%20%2F%20Agile-5680E9?style=for-the-badge)
![OR-Tools](https://img.shields.io/badge/Engine-Google%20OR--Tools%20CP--SAT-5AB9EA?style=for-the-badge)

_Sistema inteligente de optimización para la planificación académica universitaria en entornos de currículo flexible._

---
</div>

## 📖 Índice de Documentación

Toda la documentación está organizada por fases del proyecto siguiendo el estándar **arc42** y la metodología **Scrum**.

---

### **1. 🔎 Definición del Problema**
> _¿Qué problema resolvemos y por qué es complejo?_

- [📄 Documento Inicial del Problema](docs/inicio/Documento%20inicial%20del%20problema%20(primer%20borrador).md) — Análisis de complejidad, naturaleza NP-completa y ambigüedades del UTP.
- [✨ Declaración de la Visión](docs/inicio/Declaracion%20de%20la%20vision%20del%20proyecto.md) — Propuesta de valor, misión del producto y valor por actor.
- [🛠️ Selección del Enfoque Técnico](docs/inicio/Documento%20de%20seleccion%20del%20enfoque%20del%20proyecto.md) — Justificación de tecnologías, stack y metodología Scrum.

---

### **2. 📋 Requerimientos y Alcance**
> _¿Qué debe hacer el sistema?_

- [📋 Lista de Requerimientos SMART](docs/inicio/Lista%20preliminar%20de%20requerimientos%20funcionales%20y%20no%20funcionales.md) — RF, RNF y Matriz de Trazabilidad.
- [📌 Registro de Supuestos y Restricciones](docs/inicio/Registro%20de%20supuestos%20y%20restricciones.md) — Marco lógico del proyecto.
- [📜 Project Charter](docs/inicio/Project%20Charter.md) — Acta de constitución, hitos, stakeholders y riesgos iniciales.

---

### **3. 🏗️ Arquitectura del Sistema (arc42)**
> _¿Cómo está construido el sistema?_

- [🏗️ Documento Maestro ARC42](docs/seguimiento_control/ARC42.md) — Estructura completa de la arquitectura del sistema SGOHA (contexto, decisiones, despliegue, vistas de componentes).

---

### **4. 📅 Planificación y Costos**
> _¿Cómo organizamos el trabajo y los recursos?_

- [📌 Backlog Detallado del Producto](docs/planificacion/Backlog%20Detallado%20del%20Proyecto.md)
- [🏃 Backlog del Sprint 1](docs/planificacion/Backlog%20del%20Sprint%201.md)
- [🏃 Backlog del Sprint 2](docs/planificacion/Backlog%20del%20Sprint%202.md)
- [💰 Fuentes de Costos del Proyecto](docs/planificacion/Fuentes%20de%20Costos%20del%20Proyecto.md) — Costos por tarea, horas hombre y materiales.
- [📈 Costos a lo Largo del Tiempo](docs/planificacion/Costos%20a%20lo%20largo%20del%20tiempo.md) — Distribución de gastos por semana y fase.
- [🔢 Costos por Sprint](docs/planificacion/Costos%20por%20Sprint.md) — Detalle económico de cada sprint.
- [📊 Costo Acumulado del Proyecto](docs/planificacion/Costo%20acumulado%20del%20proyecto.md) — Curva S proyectada vs. real.
- [⚠️ Registro de Riesgos](docs/planificacion/Registro%20de%20Riesgos.md) — 13 riesgos identificados con estrategias de respuesta y contingencias.

---

### **5. 👥 Equipo y Gestión**
> _¿Quiénes somos y cómo trabajamos?_

- [🤝 Declaración del Equipo](docs/inicio/Declaracion%20del%20equipo%20del%20proyecto.md) — Roles Scrum, responsabilidades y normas de trabajo.
- [🚀 Repositorio GitHub Operativo](docs/inicio/Repositorio%20Github%20operativo.md) — Estructura de carpetas, convención de ramas y guía de versiones.

---

## 🚀 Presentación del Proyecto

**SGOHA** aborda un **Problema Complejo de Ingeniería** de naturaleza combinatoria (**CSP — Constraint Satisfaction Problem**). El sistema utiliza un motor de satisfacción de restricciones con **OR-Tools CP-SAT** para automatizar la creación de horarios académicos, eliminando el error humano, resolviendo conflictos de solapamiento y optimizando el uso de infraestructura física.

### **Puntos Clave del Desarrollo**
- **SMART Compliance:** Todos los requerimientos están validados bajo criterios específicos, medibles y temporales.
- **CSP Engine:** Motor capaz de resolver instancias de hasta 50 cursos, 30 docentes y 20 aulas en ≤ 30 segundos.
- **Arquitectura desacoplada:** SPA (React) + API REST (Node.js/Express) + Microservicio CSP (FastAPI + OR-Tools).
- **Green Software:** Caché de resultados CSP con TTL de 24 h para reducir cómputo innecesario en ≥ 40%.

---

## ⚙️ Especificaciones Técnicas

| Criterio | Valor objetivo |
|----------|---------------|
| Rendimiento CSP (50 cursos) | ≤ 30 segundos |
| Latencia API (p95) | < 500 ms |
| Carga inicial del calendario | < 3 segundos |
| Reducción de cómputo (caché) | ≥ 40% |

**Stack:** React 18 + TypeScript · Express + Node.js · FastAPI + OR-Tools · PostgreSQL 16

---

## 🛠️ Guía de Ejecución Rápida

> Requisito previo: tener **Docker** y **Docker Compose** instalados.

### Ejecución completa con Docker
```bash
cp .env.example .env
docker-compose up --build
```

### Backend — API REST (Node.js)
```bash
cd backend
npm install
npm run dev
```

### Microservicio CSP (FastAPI + OR-Tools)
```bash
cd csp-service
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend (React + TypeScript)
```bash
cd frontend
npm install
npm run dev
```

---

## 👥 Equipo de Desarrollo

| Rol Scrum | Integrante | Módulos |
|-----------|-----------|---------|
| Product Owner | Alberto Patiño Reynoso | Documentación, criterios de aceptación |
| Scrum Master | Andre De La Torre Segura | Git workflow, gestión del proyecto |
| Dev — Backend / CSP | Brianna Cortez Ponce | Motor CSP, microservicio FastAPI |
| Dev — Backend / Auth | Edward Flores Rodriguez | API REST, autenticación JWT, matrícula |
| Dev — Frontend / UI | Bryams Vilchez Lazaro | SPA React, calendario, UI |
| Dev — QA / DevOps | Jack Perez Lizarbe | Pruebas, CI/CD, Docker, reportes |

---

<div align="center">
  <sub>Taller de Proyectos 2 · Universidad Continental · Huancayo, Perú · 2026</sub>
</div>
