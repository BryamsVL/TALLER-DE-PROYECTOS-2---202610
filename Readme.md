# 🗓️Sistema de Generación Óptima de Horarios Académicos

> Aplicación web inteligente para la generación automática de horarios académicos
> bajo currículo flexible, impulsada por un motor de Satisfacción de Restricciones (CSP).

![Estado](https://img.shields.io/badge/Sprint-0%20%E2%80%94%20Inicio-blue)
![Metodología](https://img.shields.io/badge/Metodología-Scrum-brightgreen)
![Licencia](https://img.shields.io/badge/Licencia-Académica-lightgrey)

---

## ¿Qué es?

Es una solución web desarrollada como proyecto final del curso **Taller de Proyectos 2**
(Ingeniería de Sistemas e Informática — Universidad Continental, ciclo 2026-I).

El sistema automatiza la generación de horarios académicos válidos y sin conflictos,
resolviendo un problema NP-completo mediante un motor CSP implementado con **OR-Tools**,
expuesto vía microservicio **FastAPI**, con frontend en **React 18 + TypeScript** y
backend principal en **Express + Node.js**.

---

## El problema que resuelve

La elaboración manual de horarios en universidades con currículo flexible consume semanas
de trabajo administrativo y produce resultados con errores frecuentes: solapamientos de
docentes, aulas sobreasignadas y distribuciones inequitativas de turnos.

SGOHA reemplaza ese proceso con un motor que, para una instancia de hasta 50 cursos,
30 docentes y 20 aulas, produce una solución válida en **≤ 30 segundos**.

> Documentación completa del problema: [`docs/inicio/PROBLEMA.md`](docs/inicio/PROBLEMA.md)
> y [`docs/Documento inicial del problema.md`](docs/Documento%20inicial%20del%20problema.md)

---

## Stack tecnológico

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| Frontend | React 18 + TypeScript (Vite) | Ecosistema maduro, FullCalendar, tipado estricto |
| Backend principal | Express + Node.js | Consistencia JS con el frontend |
| Microservicio CSP | FastAPI + OR-Tools | Rendimiento en resolución de restricciones complejas |
| Base de datos | PostgreSQL 16 | Soporte robusto para consultas complejas |
| ORM | Prisma | Tipado nativo con TypeScript |
| Contenerización | Docker Compose | Portabilidad entre entornos |
| CI/CD | GitHub Actions | Integración directa con el repositorio |
| Hosting | Railway / Render | Despliegue rápido en tier gratuito |

---

## Equipo de desarrollo

| Integrante | Rol | Módulos principales |
|------------|-----|---------------------|
| Alberto Patiño | Product Owner | Backlog, criterios de aceptación, visión |
| Andre De La Torre | Scrum Master | Git workflow, ceremonias, dailies |
| Brianna Cortez | Dev — Backend / CSP | Motor CSP, microservicio FastAPI (RF-07, RF-08) |
| Edward Flores | Dev — Backend / Auth | API REST, JWT, registro, matrícula (RF-01, RF-02, RF-04/05/06) |
| Bryams Vilchez | Dev — Frontend / UI | SPA React, calendario, formularios (RF-10, RF-11) |
| Jack Perez | Dev — QA / DevOps | Pruebas, Docker, CI/CD, reportes (RF-12, RF-14, RF-15) |

---

## Estado del Sprint 0

| Ítem | Estado |
|------|--------|
| Definición formal del problema | ✅ Completado |
| Declaración de visión del proyecto | ✅ Completado |
| Identificación preliminar de requerimientos | ✅ Completado |
| Formalización de roles y normas del equipo | ✅ Completado |
| Organización documental del repositorio | ✅ Completado |
| Repositorio GitHub configurado con ramas `main` / `develop` | ✅ Completado |

---


## Estructura del repositorio

La estructura actual del repositorio es la siguiente:

```
|-- README.md
|-- Backend/
|   |-- README.md
|   `-- tests/
|       `-- README.md
|-- docs/
|   |-- declaracion-equipo.md
|   |-- Declaración de la visión del proyecto.md
|   |-- Documento inicial del problema.md
|   |-- Kickoff Project Charter.md
|   |-- Lista preliminar de requerimientos funcionales y no funcionales.md
|   |-- Selección del enfoque del proyecto.md
|   |-- cierre/
|   |   `-- README.md
|   |-- ejecucion/
|   |   |-- README.md
|   |   `-- REQUERIMIENTOS.md
|   |-- inicio/
|   |   |-- ENFOQUE.md
|   |   |-- PROBLEMA.md
|   |   `-- VISION.md
|   |-- Otros/
|   |   `-- README.md
|   `-- seguimiento_control/
|       `-- README.md
`-- Frontend/
    |-- README.md
    `-- tests/
        `-- README.md
```

---

## Documentación disponible

| Documento | Ruta | Tipo |
|-----------|------|------|
| Declaración del equipo | [`docs/seguimiento_control/declaracion_equipo.md`](docs/seguimiento_control/declaracion_equipo.md) | Completo |
| Visión del proyecto (resumen) | [`docs/inicio/VISION.md`](docs/inicio/VISION.md) | Resumen |
| Visión del proyecto (detallado) | [`docs/seguimiento_control/Declaracion de la vision del proyecto.md`](docs/seguimiento_control/Declaracion%20de%20la%20vision%20del%20proyecto.md) | Detallado |
| Problema inicial (resumen) | [`docs/inicio/PROBLEMA.md`](docs/inicio/PROBLEMA.md) | Resumen |
| Problema inicial (detallado) | [`docs/seguimiento_control/Documento inicial del problema.md`](docs/seguimiento_control/Documento%20inicial%20del%20problema.md) | Detallado |
| Enfoque metodológico (resumen) | [`docs/inicio/ENFOQUE.md`](docs/inicio/ENFOQUE.md) | Resumen |
| Enfoque metodológico (detallado) | [`docs/seguimiento_control/Seleccion del enfoque del proyecto.md`](docs/seguimiento_control/Seleccion%20del%20enfoque%20del%20proyecto.md) | Detallado |
| Supuestos y restricciones | [`docs/seguimiento_control/Supuestos y restricciones.md`](docs/seguimiento_control/Supuestos%20y%20restricciones.md) | Completo |
| Requerimientos (resumen) | [`docs/ejecucion/REQUERIMIENTOS.md`](docs/ejecucion/REQUERIMIENTOS.md) | Resumen |
| Requerimientos RF + RNF (completo) | [`docs/seguimiento_control/Lista preliminar de requerimientos funcionales y no funcionales.md`](docs/seguimiento_control/Lista%20preliminar%20de%20requerimientos%20funcionales%20y%20no%20funcionales.md) | Completo |
| Project Charter | [`docs/seguimiento_control/Kickoff Project Charter.md`](docs/seguimiento_control/Kickoff%20Project%20Charter.md) | Completo |

## Información del proyecto

| Campo | Detalle |
|-------|---------|
| Código | PFA-TP2-2026-01 |
| Asignatura | Taller de Proyectos 2 — ISI |
| Institución | Universidad Continental — Huancayo, Perú |
| Ciclo | 2026-I |
| Metodología | Scrum — sprints de 2-3 semanas |
| Repositorio | https://github.com/BryamsVL/TALLER-DE-PROYECTOS-2---202610 |
