# 🗓️ SGOHA: Sistema de Generación Óptima de Horarios Académicos
<div align="center">

![Stack](https://img.shields.io/badge/Architecture-React%20%2B%20Node.js%20%2B%20FastAPI-8860D0?style=for-the-badge)
![Scrum](https://img.shields.io/badge/Methodology-Scrum%20%2F%20Agile-5680E9?style=for-the-badge)
![OR-Tools](https://img.shields.io/badge/Engine-Google%20OR--Tools%20CP--SAT-5AB9EA?style=for-the-badge)

_Sistema inteligente de optimización para la planificación académica universitaria en entornos de currículo flexible._

---
</div>

## 📖 Índice de Documentación (TOC)

Toda la documentación del proyecto está organizada en archivos independientes para garantizar claridad y mantenibilidad, siguiendo el estándar **arc42**.

### **1. Inicio y Fundamentación**
- [🔍 Documento Inicial del Problema](docs/inicio/Documento%20inicial%20del%20problema.md) - Análisis de complejidad, naturaleza NP-completa y ambigüedades del UTP.
- [✨ Declaración de la Visión](docs/inicio/Declaracion%20de%20la%20vision%20del%20proyecto.md) - Propuesta de valor, misión del producto y valor por actor.
- [🛠️ Selección del Enfoque Técnico](docs/inicio/Documento%20de%20seleccion%20del%20enfoque%20del%20proyecto.md) - Justificación de tecnologías, stack y metodología Scrum.
- [📜 Project Charter](docs/inicio/Project%20Charter.md) - Acta de constitución, hitos, stakeholders y riesgos.
- [📌 Registro de Supuestos y Restricciones](docs/inicio/Registro%20de%20supuestos%20y%20restricciones.md) - Marco lógico del proyecto.

### **2. Requerimientos y Calidad**
- [📋 Lista de Requerimientos SMART](docs/inicio/Lista%20preliminar%20de%20requerimientos%20funcionales%20y%20no%20funcionales.md) - RF, RNF y Matriz de Trazabilidad.
- [🤝 Declaración del Equipo](docs/inicio/Declaracion%20del%20equipo%20del%20proyecto.md) - Roles Scrum, responsabilidades y normas de trabajo.
- [🚀 Repositorio Operativo](docs/inicio/Repositorio%20GitHub%20operativo.md) - Estructura de carpetas, ramas y guía de versiones.

### **3. Arquitectura y Diseño (arc42)**
- [🏗️ Documento Maestro ARC42](docs/ARC42.md) - Estructura completa de la arquitectura del sistema SGOHA.

---

## 🚀 Presentación del Proyecto

**SGOHA** aborda un **Problema Complejo de Ingeniería** de naturaleza combinatoria (**CSP — Constraint Satisfaction Problem**). El sistema utiliza un motor de satisfacción de restricciones con **OR-Tools CP-SAT** para automatizar la creación de horarios académicos, eliminando el error humano, resolviendo conflictos de solapamiento y optimizando el uso de infraestructura física.

### **Puntos Clave del Desarrollo:**
- **SMART Compliance:** Todos los requerimientos están validados bajo criterios específicos, medibles y temporales.
- **CSP Engine:** Motor de generación de horarios capaz de resolver instancias de hasta 50 cursos, 30 docentes y 20 aulas en ≤ 30 segundos.
- **Arquitectura desacoplada:** SPA (React) + API REST (Node.js/Express) + Microservicio CSP (FastAPI + OR-Tools).
- **Green Software:** Caché de resultados CSP con TTL de 24 h para reducir cómputo innecesario en ≥ 40%.

---

## ⚙️ Especificaciones Técnicas (Resumen)

- **Rendimiento CSP:** Generación de horarios completos (50 cursos) en **≤ 30 segundos**.
- **Latencia API:** Respuestas en el percentil 95 en **< 500 ms**.
- **Carga visual:** Vista de calendario con carga inicial en **< 3 segundos**.
- **Stack:** React 18 + TypeScript (Frontend) + Express + Node.js (API REST) + FastAPI + OR-Tools (Motor CSP) + PostgreSQL 16 (Base de datos).

---

## 🛠️ Guía de Ejecución Rápida

> Requisito previo: tener **Docker** y **Docker Compose** instalados.

### **Ejecución completa con Docker**
```bash
cp .env.example .env
docker-compose up --build
```

### **Backend — API REST (Node.js)**
```bash
cd backend
npm install
npm run dev
```

### **Microservicio CSP (FastAPI + OR-Tools)**
```bash
cd csp-service
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### **Frontend (React + TypeScript)**
```bash
cd frontend
npm install
npm run dev
```

---

## 👥 Equipo de Desarrollo

| Rol Scrum | Integrante | Módulos |
|---|---|---|
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
