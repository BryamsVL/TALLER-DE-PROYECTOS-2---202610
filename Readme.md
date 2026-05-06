<div align="center">

# 📅 SGOHA
**Sistema de Generación Óptima de Horarios Académicos**

*Plataforma inteligente de optimización combinatoria para la planificación académica en entornos de currículo flexible, impulsada por IA y Spec-Driven Development.*

![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Backend-Node.js_Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![FastAPI](https://img.shields.io/badge/CSP_Engine-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![OR-Tools](https://img.shields.io/badge/Solver-Google_OR--Tools-4285F4?style=for-the-badge&logo=google&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/Database-Supabase-336791?style=for-the-badge&logo=supabase&logoColor=white)

---
</div>

## 📑 Tabla de Contenidos
1. [📌 Descripción y Alcance](#-descripción-y-alcance)
2. [🛠 Stack Tecnológico](#-stack-tecnológico)
3. [🧠 Motor de Optimización (CSP)](#-motor-de-optimización-csp)
4. [🏗 Arquitectura del Sistema](#-arquitectura-del-sistema)
5. [🔌 API REST y Contratos](#-api-rest-y-contratos)
6. [⚙️ Instalación y Despliegue](#️-instalación-y-despliegue)
7. [📚 Documentación Académica (Rúbrica)](#-documentación-académica-rúbrica)
8. [👥 Equipo de Desarrollo](#-equipo-de-desarrollo)

---

## 📌 Descripción y Alcance

**SGOHA** resuelve el complejo problema de crear horarios universitarios de manera manual. Debido a la multiplicidad de variables (aulas físicas, disponibilidad de docentes, límites de créditos por alumno y prerrequisitos), el cálculo manual es ineficiente y propenso a colisiones.

Nuestra solución lo automatiza usando **Constraint Programming (Programación con Restricciones)**, garantizando matemáticamente cero solapamientos.

### Alcance Funcional
| Módulo | Funcionalidad |
|---|---|
| **Gestión (CRUD)** | Administración segura de Estudiantes, Docentes, Cursos y Aulas. |
| **Autenticación** | Seguridad JWT y validación basada en Roles (RBAC). |
| **Generación CSP** | Creación del horario institucional y docente en < 30 segundos. |
| **Control Académico** | Bloqueo de matrículas por prerrequisitos o exceso de créditos (20-22). |
| **Dashboard y Grillas** | Visualización interactiva con validación Drag & Drop en tiempo real. |
| **Exportación** | Descarga de horarios consolidados en PDF y Excel. |

---

## 🛠 Stack Tecnológico

Elegimos una arquitectura desacoplada orientada a microservicios para dividir la carga transaccional de la carga computacional pesada.

| Capa | Tecnología | Propósito Técnico |
|---|---|---|
| **Frontend** | React 18 + Vite | SPA ultrarrápida, ruteo con TanStack, UI con Shadcn/ui. |
| **Backend Core** | Node.js + Express | API transaccional, middleware JWT y validación Zod. |
| **Motor CSP** | FastAPI (Python 3.11)| Microservicio de alto rendimiento dedicado a OR-Tools. |
| **Base de Datos** | PostgreSQL (Supabase)| Persistencia relacional, seguridad RLS. |
| **ORM** | Prisma 5 | Tipado estricto de base de datos a TypeScript. |
| **Contenedores** | Docker | Orquestación aislada de entornos. |

---

## 🧠 Motor de Optimización (CSP)

El corazón de SGOHA es el solver basado en **Google OR-Tools**. El problema está modelado con variables booleanas multidimensionales `x[curso, docente, aula, franja]`.

### Variables del Modelo
```text
┌──────────────────────────────────────────────────────────┐
│                   ESPACIO DE BÚSQUEDA                    │
├──────────────┬───────────────────────────────────────────┤
│  C (Cursos)  │ Oferta académica del semestre activo      │
│  D (Docentes)│ Plantilla con disponibilidad limitada     │
│  E (Alumnos) │ Matriculados con historial y prerrequisitos│
│  A (Aulas)   │ Infraestructura física con aforo máximo   │
│  H (Franjas) │ Slots de tiempo semanales (L-S)           │
└──────────────┴───────────────────────────────────────────┘
```

### Restricciones Críticas (Hard Constraints)
1. **Unicidad Espacio-Temporal:** Un aula o un docente no pueden tener dos clases al mismo tiempo.
2. **Capacidad:** Los alumnos inscritos no pueden superar el aforo del aula física.
3. **Disponibilidad:** El docente solo es asignado dentro de sus horas declaradas.
4. **Reglas Académicas:** Carga mínima de 20 y máxima de 22 créditos por estudiante.

---

## 🏗 Arquitectura del Sistema

```mermaid
graph TD
    UI[Frontend - React] <-->|JSON / HTTPS| API[Backend - Express]
    API <-->|Prisma ORM| DB[(PostgreSQL)]
    API <-->|REST POST /solve| CSP[Microservicio FastAPI]
    CSP -->|Ejecuta CP-SAT| ORT[Google OR-Tools]
```

---

## 🔌 API REST y Contratos

La comunicación entre el Backend y el Microservicio CSP se realiza a través de un contrato estricto validado por Pydantic.

**Endpoint Principal:** `POST /api/schedules/generate`

```json
// Ejemplo de Solicitud (SolveRequest)
{
  "period_id": "2026-I",
  "timeout_seconds": 30,
  "courses": [
    {
      "id": "MAT101",
      "teacher_ids": ["T001", "T002"],
      "classroom_ids": ["A101"]
    }
  ]
}
```

---

## ⚙️ Instalación y Despliegue

### Requisitos Previos
* Node.js v20+
* Python 3.11+
* Docker & Docker Compose

### Levantar Todo con Docker (Recomendado)
```bash
# 1. Clonar y configurar variables
git clone https://github.com/BryamsVL/TALLER-DE-PROYECTOS-2---202610.git
cd TALLER-DE-PROYECTOS-2---202610
cp .env.example .env

# 2. Orquestar contenedores
docker-compose up --build
```

### Accesos Locales
* **Frontend:** `http://localhost:5173`
* **API Backend:** `http://localhost:3001`
* **Documentación CSP (Swagger):** `http://localhost:8000/docs`

---

## 📚 Documentación Académica (Rúbrica)

Toda la documentación está estructurada bajo metodologías ágiles y **Spec-Driven Development**, cumpliendo rigurosamente los entregables del curso. A continuación se presentan los artefactos alineados exactamente a la consigna académica:

### 3.1. Planificación del Proyecto (Jira)
**a. Artefactos requeridos**
* **1º Backlog del producto** ➔ [Ver Documento](docs/planificacion/backlog-producto.md)
  * i. Historias de usuario correctamente formuladas
  * ii. Priorización basada en valor, riesgo y complejidad
  * iii. Relación con restricciones del problema (CSP)
* **2º Estructuración del trabajo** ➔ [Ver Documento](docs/planificacion/planificacion-jira.md)
  * i. Épicas alineadas a funcionalidades críticas
  * ii. Versiones (releases) coherentes con entregables
  * iii. Sprints definidos con objetivos claros
* **3º Gestión temporal** ➔ [Ver Documento](docs/planificacion/planificacion-jira.md)
  * i. Cronograma del proyecto
  * ii. Identificación de dependencias y ruta crítica
* **4º Métricas ágiles (obligatorio incluir análisis)** ➔ [Ver Documento](docs/planificacion/metricas-agiles.md)
  * i. Gráfico de trabajo hecho (Burnup)
  * ii. Gráfico de trabajo pendiente (Burndown)
  * iii. Gráfico de velocidad
  * iv. Gráfico de control

**b. Análisis esperado** ➔ [Ver Análisis de Métricas](docs/planificacion/metricas-agiles.md)
* 1º Interpretación de la evolución del proyecto
* 2º Identificación de cuellos de botella
* 3º Evaluación de la estabilidad del equipo (variabilidad de velocidad)
* 4º Coherencia entre planificación y complejidad del problema

### 3.2. Presupuesto del Proyecto
**a. Elementos requeridos**
* **1º Fuente de costos** ➔ [Ver Documento](docs/gestion/costos-fuentes.md)
  * i. Recursos humanos (roles, horas estimadas)
  * ii. Infraestructura tecnológica
  * iii. Costos indirectos
* **2º Evolución de costos**
  * i. Costos a lo largo del tiempo ➔ [Ver Documento](docs/gestion/costos-tiempo.md)
  * ii. Costos por Sprint ➔ [Ver Documento](docs/gestion/costos-por-sprint.md)
  * iii. Costo acumulado del proyecto ➔ [Ver Documento](docs/gestion/costo-acumulado.md)

**b. Análisis esperado** ➔ [Ver Análisis Sostenibilidad](docs/gestion/analisis-sostenibilidad.md)
* 1º Relación entre complejidad del problema y costo del sistema
* 2º Identificación de factores de incremento de costos
* 3º Evaluación de sostenibilidad (enfoque Green Software)

### 3.3. Gestión de Riesgos y Oportunidades
**a. Registros obligatorios**
* **1º Registro de riesgos** ➔ [Ver Documento](docs/gestion/registro-riesgos.md)
  * i. Descripción del riesgo
  * ii. Probabilidad e impacto
  * iii. Estrategia de mitigación
* **2º Registro de oportunidades** ➔ [Ver Documento](docs/gestion/registro-oportunidades.md)
  * i. Impacto positivo esperado
  * ii. Estrategia de aprovechamiento

**b. Análisis esperado** ➔ [Ver Documento](docs/gestion/analisis-riesgos.md)
* 1º Relación de riesgos con:
  * i. Restricciones del problema (CSP)
  * ii. Limitaciones técnicas
  * iii. Dependencias externas

### 3.4. Spec-Driven Development (SDD)
**a. Artefactos requeridos**
* **1º Agents.md o constitution.md** ➔ [Ver Documento](docs/sdd/AGENTS.md)
  * i. Principios del sistema
  * ii. Reglas globales
  * iii. Restricciones duras y blandas
* **2º Spec.md** ➔ [Ver Documento](docs/sdd/spec.md)
  * i. Especificación formal del sistema
  * ii. Definición de: Entradas, Salidas, Reglas de negocio, Casos límite

**b. Análisis esperado** ➔ [Ver Análisis SDD](docs/sdd/analisis-sdd.md)
* 1º Coherencia entre:
  * i. Especificación
  * ii. Modelado del problema
  * iii. Implementación
* 2º Reducción de ambigüedad en requerimientos
* 3º Anticipación de conflictos (ej. solapamientos de horarios)

### 3.5. Gestión del Repositorio en GitHub
**b. Elementos obligatorios** *(Evidenciados en Historial Git)*
* 1º Estrategia de ramas (Git Flow o equivalente)
* 2º Commits semánticos
* 3º Pull Requests con revisión
* 4º Desarrollo incremental ➔ [S1](docs/sprints/sprint-1/backlog.md) | [S2](docs/sprints/sprint-2/backlog.md) | [S3](docs/sprints/sprint-3/backlog.md)

**c. Artefactos mínimos**
* **1º README.md completo:** *(Este mismo archivo)*
  * i. Descripción del sistema
  * ii. Instrucciones de instalación
  * iii. Arquitectura
* **2º Evidencia de:**
  * i. Integración de funcionalidades ➔ [Ver Trazabilidad](docs/planificacion/trazabilidad.md)
  * ii. Evolución del sistema ➔ [Ver Trazabilidad](docs/planificacion/trazabilidad.md)

**d. Análisis esperado** ➔ [Ver Matriz de Trazabilidad](docs/planificacion/trazabilidad.md)
* 1º Trazabilidad entre:
  * i. Backlog (Jira)
  * ii. Commits
  * iii. Funcionalidades implementadas
* 2º Evidencia de trabajo colaborativo real *(Ver Insights de GitHub)*

---

## 👥 Equipo de Desarrollo

| Rol | Integrante | Responsabilidad Clave |
|---|---|---|
| **Product Owner** | Brianna Cortez Ponce | Validación funcional y Backlog. |
| **Scrum Master** | Andre De La Torre Segura | Remoción de impedimentos, métricas. |
| **Dev CSP/Backend** | Alberto Patiño Reynoso | Algoritmo OR-Tools y matemáticas complejas. |
| **Dev Backend/Auth**| Edward Flores Rodriguez| Middlewares, Express, Seguridad. |
| **Dev Frontend/UI** | Bryams Vilchez Lazaro | SPA React, interfaces drag & drop. |
| **Dev QA/DevOps** | Jack Perez Lizarbe | CI/CD, automatización Docker, reportes. |

<div align="center">
  <br>
  <b>Desarrollado bajo licencia MIT</b><br>
  <sub>Taller de Proyectos 2 — Universidad Continental — Huancayo, Perú — 2026</sub>
</div>
