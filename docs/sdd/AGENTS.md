# AGENTS.md (Constitución para Agentes IA)

## Propósito

Este archivo es una guía compacta de Spec-Driven Development para los desarrolladores y agentes IA que trabajan en este repositorio.
Debe leerse antes de realizar cualquier cambio en el código fuente.

---

## Resumen del Proyecto

**SGOHA** (Sistema de Generación Óptima de Horarios Académicos) automatiza la generación de horarios para universidades con currículo flexible mediante optimización y satisfacción de restricciones (CSP).

Stack actual:

- `Frontend/`: React 18 + TypeScript + Vite + TanStack Router + shadcn/ui
- `Backend/`: Node.js 20 + TypeScript + Express 4 + Prisma 5 + Supabase
- `Backend/csp-service/`: FastAPI + Python 3.11 + OR-Tools CP-SAT

Estado actual: **Sprint 1 Completado / Sprint 2 En curso**

- El backend expone `/health` y las rutas base de entidades.
- El solver CSP (`Backend/csp-service/app/solver.py`) está en desarrollo.
- El frontend tiene las rutas generadas y datos simulados; pendiente la integración total de API.

---

## i. Principios del Sistema

1. **La Factibilidad ante todo:** Un horario con cruces reales (restricciones duras) es inválido. Si el modelo no converge, preferimos un `INFEASIBLE` transparente antes que una asignación corrupta.
2. **SSOT (Single Source of Truth):** El esquema de Prisma y el contrato `SolveRequest/SolveResponse` rigen el modelo de datos. Ningún otro archivo puede contradecirlos.
3. **Fail Fast:** Todos los inputs se validan en la capa más externa (Zod en Node, Pydantic en FastAPI). Un dato malo nunca llega al solver.
4. **Modularidad:** El motor matemático (`solver.py`) no sabe de HTTP. Solo recibe y devuelve estructuras Pydantic. El backend no sabe de matemáticas, solo delega.
5. **Trazabilidad:** Cada historia de usuario (HU) debe tener commits, tests y documentación asociada. Sin trazabilidad, la HU no está "Terminada".

---

## ii. Reglas Globales

### Gestión de Ramas (Git Flow)
- `main`: Código en producción (solo releases).
- `develop`: Entorno de integración (QA).
- `feature/HU-XX-nombre`: Ramas para desarrollo de historias de usuario.
- `bugfix/HU-XX-nombre`: Para correcciones puntuales.

### Commits Semánticos
Formato estricto: `tipo(scope): descripción`
- `feat(HU-11): añadir solver básico CP-SAT`
- `fix(HU-02): resolver expiración de JWT a 8h`
- `docs(agents): actualizar reglas globales`

### Pull Requests (PR)
- Ningún código entra a `develop` sin PR.
- Requiere revisión de al menos **1 integrante** del equipo distinto al autor.
- Debe referenciar la HU correspondiente (`Closes #12`).

### Estándares por Capa
- **Backend Express:** Separación lógica rutas/controladores. Zod en la primera línea del request.
- **FastAPI/Python:** Tipos Pydantic estrictos. El solver es puro algoritmo, sin lógica HTTP.
- **React/TypeScript:** TanStack Router para navegación. shadcn/ui para componentes. Prohibido instalar librerías de UI adicionales.

### Estrategia de Desarrollo
- Implementar un solo cambio significativo a la vez.
- Verificar cada cambio antes de continuar.
- Preferir ediciones pequeñas y seguras sobre reescrituras masivas.
- No mezclar refactorizaciones de backend y frontend en un solo paso.
- No codificar de forma rígida la URL del servicio CSP — siempre usar `process.env.CSP_SERVICE_URL`.

---

## iii. Restricciones Duras y Blandas

### Restricciones Duras (D) — Inviolables
El motor CP-SAT debe rechazar cualquier asignación que viole estas restricciones. No existe excepción posible.

| ID | Nombre | Definición Formal |
|---|---|---|
| **D1** | Unicidad Docente | Un docente no puede estar asignado a dos componentes de curso distintos en la misma franja horaria y día. |
| **D2** | Unicidad Aula | Un aula no puede albergar dos componentes de curso distintos en la misma franja horaria y día. |
| **D3** | Capacidad Física | El número de estudiantes matriculados en un componente no puede superar el aforo registrado del aula asignada. |
| **D4** | Prerrequisitos Académicos | Un estudiante no puede matricularse en un curso si no ha aprobado sus prerrequisitos registrados en el sistema. |
| **D5** | Límite de Créditos | Un estudiante debe llevar entre 20 y 22 créditos por período. No se permite salir de ese rango. |
| **D6** | Disponibilidad Docente | Un docente solo puede ser asignado a franjas horarias declaradas como disponibles en su perfil. |
| **D7** | Atomicidad de Componentes | Los componentes TEORÍA y PRÁCTICA del mismo curso deben asignarse al mismo estudiante de forma completa (no se puede matricular solo uno de los dos). |

### Restricciones Blandas (B) — Optimizables
El solver intenta minimizar las penalizaciones asociadas. Su violación no invalida el horario, pero reduce la puntuación de calidad de la solución.

| ID | Nombre | Definición |
|---|---|---|
| **B1** | Carga Horaria Continua | Minimizar los huecos (ventanas libres) en el horario diario de un docente. Preferir bloques continuos. |
| **B2** | Turno Preferido del Docente | Priorizar la asignación de clases en el turno (mañana/tarde/noche) declarado por el docente. |
| **B3** | Distribución Semanal | Distribuir la carga horaria de un mismo curso a lo largo de la semana (evitar clases del mismo curso en días consecutivos). |
| **B4** | Minimizar Traslados | Evitar que un docente deba cambiar de edificio entre clases consecutivas cuando el tiempo de traslado supera 10 minutos. |

---

## Alcance Funcional

**Planeado e Implementado (Sprint 1 - 3):**
- `POST /auth/login`, `POST /auth/register` (Seguridad JWT).
- Rutas CRUD: cursos, aulas, docentes, períodos.
- Lógica de matrícula con validación de créditos (20-22).
- Implementación del motor CP-SAT (Algoritmo CSP).
- Detección de conflictos y log de auditoría.
- Exportación de reportes PDF/Excel.

**Fuera del alcance (A menos que se solicite expresamente):**
- Actualizaciones en tiempo real (WebSockets).
- Portal de autogestión de pagos para estudiantes.
- Configuración dinámica del motor desde la interfaz de usuario.

---

## Comportamiento del Sistema

**Backend Express (puerto 3001):**
- Valida peticiones con `zod`.
- Delega la generación de horarios al servicio CSP vía HTTP (`CSP_SERVICE_URL`).
- Maneja la autenticación con JWT (`requireAuth`).
- Persiste los datos en PostgreSQL (Supabase).

**Microservicio CSP (puerto 8000):**
- Recibe un `SolveRequest` (period_id, cursos con teacher_ids/classroom_ids/slots, timeout).
- Ejecuta el modelo CP-SAT con variables booleanas por (curso, docente, aula, franja).
- Retorna un `SolveResponse` con estado (`OPTIMAL|FEASIBLE|INFEASIBLE|TIMEOUT`), asignaciones y tiempo transcurrido.
- Objetivo de rendimiento: Resolver 50 cursos en ≤ 30 segundos.

**Frontend (puerto 5173):**
- Llama a los endpoints del API del backend (nunca al servicio CSP directamente).
- Renderiza la grilla de calendario semanal basándose en las asignaciones.

---

## Contrato API (Microservicio CSP)

`POST /solve` — No cambiar sin actualizar tanto `solver.py` como `schemas.py`:

```json
// Request
{
  "period_id": "2026-I",
  "courses": [
    {
      "id": "MAT101",
      "credits": 4,
      "teacher_ids": ["T001"],
      "classroom_ids": ["A101"],
      "available_slots": [{ "day": 1, "start_minute": 480, "end_minute": 600 }]
    }
  ],
  "timeout_seconds": 30
}

// Response
{
  "status": "OPTIMAL",
  "assignments": [
    {
      "course_id": "MAT101",
      "teacher_id": "T001",
      "classroom_id": "A101",
      "slot": { "day": 1, "start_minute": 480, "end_minute": 600 }
    }
  ],
  "elapsed_seconds": 4.7,
  "conflicts": []
}
