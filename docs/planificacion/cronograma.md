# Cronograma, Dependencias y Ruta Crítica — SGOHA (Actualizado)

**Proyecto:** Sistema de Generación Óptima de Horarios Académicos (SGOHA)
**Inicio:** 20 de abril
**Duración por sprint:** 2 semanas
**Metodología:** Scrum

---

## 1. Línea de Tiempo General

| Sprint | Fechas | Duración | Estado | HU | Épicas |
|--------|--------|----------|--------|-----|--------|
| **Sprint 1** | 20 abril – 4 mayo | 2 semanas | ✅ Completado | HU-01 a HU-10 | EP-01, EP-02, EP-03 |
| **Sprint 2** | 5 mayo – 19 mayo | 2 semanas | 🔄 En progreso | HU-11 a HU-17 | EP-04, EP-05 |
| **Sprint 3** | 26 mayo – 9 junio | 2 semanas | ⏳ Pendiente | HU-18 a HU-26 | EP-06, EP-07 |
| **Buffer** | 10 junio – 16 junio | 5 días | ⏳ Reservado | Correcciones + Integración | - |
| **Release MVP** | 17 junio | - | 🎯 Objetivo | Todas las HU completadas | - |

---

## 2. Desglose por Sprint con HUs

### Sprint 1 (20 abril – 4 mayo) — ✅ COMPLETADO

| HU | Nombre | Épica | Estado |
|----|--------|-------|--------|
| HU-01 | Registro de Usuarios | EP-02 | ✅ Done |
| HU-02 | Inicio de Sesión | EP-02 | ✅ Done |
| HU-03 | Control de Acceso por Rol | EP-02 | ✅ Done |
| HU-04 | Gestión de Estudiantes | EP-01 | ✅ Done |
| HU-05 | Gestión de Docentes | EP-01 | ✅ Done |
| HU-06 | Gestión de Disponibilidad de Docentes | EP-01 | ✅ Done |
| HU-07 | Gestión de Cursos y Componentes | EP-01 | ✅ Done |
| HU-08 | Gestión de Aulas | EP-01 | ✅ Done |
| HU-09 | Configuración de Franjas Horarias | EP-03 | ✅ Done |
| HU-10 | Configuración de Tiempos de Traslado y Parámetros | EP-03 | ✅ Done |

**Entregable:** Base de datos completa + API de ingesta + Autenticación JWT + Control de acceso por roles.

---

### Sprint 2 (5 mayo – 19 mayo) — 🔄 EN PROGRESO

| HU | Nombre | Épica | Dependencia | Estado | Riesgo |
|----|--------|-------|-------------|--------|--------|
| HU-11 | Modelado de Restricciones Duras D1–D9 en OR-Tools | EP-04 | HU-01 a HU-10 | ✅ Done | **Alto** |
| HU-12 | Ejecución y Resultado de la Generación | EP-04 | HU-11 | ✅ Done | Alto |
| HU-13 | Activación y Cancelación del Horario Institucional | EP-04 | HU-12 | ✅ Done | Medio |
| HU-14 | Ajuste Manual de Asignaciones | EP-04 | HU-13 | ⏳ Pendiente | Medio |
| HU-15 | Restricciones Blandas B1–B5 y Puntuación | EP-04 | HU-11 | ⏳ Pendiente | Bajo |
| HU-16 | Generación de Vista de Horario por Docente | EP-05 | HU-12, HU-13 | ⏳ Pendiente | Medio |
| HU-17 | Consulta de Horario por el Docente | EP-05 | HU-16 | ⏳ Pendiente | Bajo |

**📌 Punto de control crítico:** HU-11 debe estar funcional antes del **14 mayo** para que HU-12 a HU-17 puedan completarse dentro del sprint.

---

### Sprint 3 (26 mayo – 9 junio) — ⏳ PENDIENTE

| HU | Nombre | Épica | Dependencia | Estado | Riesgo |
|----|--------|-------|-------------|--------|--------|
| HU-18 | Validación de Prerrequisitos y Corequisitos | EP-06 | HU-13 (Horario ACTIVO) | ⏳ Pendiente | Medio |
| HU-19 | Control de Carga Académica del Estudiante | EP-06 | HU-13 | ⏳ Pendiente | Medio |
| HU-20 | Generación Automática del Horario de Estudiantes | EP-06 | HU-18, HU-19 | ⏳ Pendiente | **Alto** |
| HU-21 | Atomicidad de Cursos Compuestos | EP-06 | HU-20 | ⏳ Pendiente | Medio |
| HU-22 | Consulta de Horario por el Estudiante | EP-06 | HU-20 | ⏳ Pendiente | Bajo |
| HU-23 | Grilla Semanal de Horario | EP-07 | HU-20, HU-17 | ⏳ Pendiente | **Alto** |
| HU-24 | Exportación del Horario en PDF | EP-07 | HU-23 | ⏳ Pendiente | Bajo |
| HU-25 | Exportación del Horario en Excel | EP-07 | HU-23 | ⏳ Pendiente | Bajo |
| HU-26 | Protección ante Vulnerabilidades OWASP | EP-07 | Todas las anteriores | ⏳ Pendiente | Bajo |

**📌 Puntos de control críticos:**
- HU-20 (Generación de horario de estudiantes) debe estar lista antes del **3 junio** para permitir integración con grilla.
- HU-23 (Grilla semanal) debe estar integrada antes del **6 junio** para validar exportaciones.

---

## 3. Dependencias Visuales (Cadena Crítica)

```
Sprint 1 (Completado)
├── HU-01 a HU-03 (Autenticación + Roles)
├── HU-04 a HU-08 (Entidades Base)
└── HU-09 a HU-10 (Configuración Período)
                    │
                    ▼
Sprint 2 (En progreso)
                    │
├── ✅ HU-11 (Modelado D1-D9 en OR-Tools) ← PUNTO DE BLOQUEO #1
│         │
│         ▼
├── ✅ HU-12 (Ejecución Generación)
│         │
│         ▼
├── HU-13 (Activación Horario Institucional)
│         │
│         ├──────────────────────┐
│         ▼                      ▼
├── HU-14 (Ajuste Manual)   HU-15 (Restricciones Blandas)
│         │                      │
│         ▼                      │
├── HU-16 (Vista por Docente)     │
│         │                      │
│         ▼                      │
└── HU-17 (Consulta Docente)      │
                                  │
                    ▼             ▼
Sprint 3                        │
│                               │
├── HU-18 (Prerrequisitos)       │
├── HU-19 (Carga Académica)      │
│         │                      │
│         ▼                      │
├── 🔴 HU-20 (Generación Horario Estudiante) ← PUNTO DE BLOQUEO #2
│         │                      │
│         ▼                      │
├── HU-21 (Atomicidad Cursos)    │
├── HU-22 (Consulta Estudiante)  │
│         │                      │
│         ▼                      │
├── 🔴 HU-23 (Grilla Semanal React) ← PUNTO DE BLOQUEO #3
│         │
│         ▼
├── HU-24 (Exportación PDF)
├── HU-25 (Exportación Excel)
│
└── HU-26 (OWASP)
```

---

## 4. Ruta Crítica Actualizada

La **ruta crítica** que determina la duración total del proyecto es:

```
HU-01..10 → HU-11 → HU-12 → HU-13 → HU-20 → HU-23 → HU-24/HU-25
```

### Tabla de hitos críticos

| Orden | Hito | Sprint | Margen | Riesgo | Fecha límite |
|-------|------|--------|--------|--------|--------------|
| 1 | Sprint 1 completo (HU-01 a HU-10) | Sprint 1 | ✅ Completado | - | 4 mayo |
| 2 | **HU-11 (Modelado D1-D9)** | Sprint 2 | ✅ Completado | **Alto** | 14 mayo |
| 3 | HU-12 (Ejecución generación) | Sprint 2 | ✅ Completado | Alto | 16 mayo |
| 4 | HU-13 (Activación horario) | Sprint 2 | ✅ Completado | Medio | 19 mayo |
| 5 | Fin Sprint 2 | Sprint 2 | - | - | 19 mayo |
| 6 | **HU-20 (Generación horario estudiantes)** | Sprint 3 | **0 días** | **Alto** | 3 junio |
| 7 | **HU-23 (Grilla semanal)** | Sprint 3 | **0 días** | **Alto** | 6 junio |
| 8 | Fin Sprint 3 | Sprint 3 | - | - | 9 junio |
| 9 | Fin Buffer | Buffer | 5 días | Bajo | 16 junio |
| 10 | **RELEASE MVP** | - | - | - | **17 junio** |

---

## 5. Holguras y Tareas No Críticas

| HU | Sprint | Holgura (días) | Puede retrasarse sin afectar release |
|----|--------|----------------|---------------------------------------|
| HU-14 (Ajuste Manual) | Sprint 2 | 2-3 días | Sí, si HU-13 está activo |
| HU-15 (Restricciones Blandas) | Sprint 2 | 3-4 días | Sí, es optimización no bloqueante |
| HU-16/HU-17 (Horario Docentes) | Sprint 2 | 2 días | Sí, siempre que esté antes de fin sprint |
| HU-18/HU-19 (Validaciones previas) | Sprint 3 | 1-2 días | Sí, si HU-20 tiene buffer |
| HU-21 (Atomicidad) | Sprint 3 | 2 días | Sí, es refinamiento de HU-20 |
| HU-22 (Consulta Estudiante) | Sprint 3 | 2 días | Sí |
| HU-24/HU-25 (Exportaciones) | Sprint 3 | 3 días | Sí, dependen de HU-23 |
| HU-26 (OWASP) | Sprint 3 | Flexible | Puede pasar a post-MVP si es necesario |

---

## 6. Plan de Mitigación (Actualizado)

### 6.1 Para HU-11 (Modelado D1-D9) — RIESGO #1

| Acción | Responsable | Fecha límite |
|--------|-------------|--------------|
| Code review diario del módulo OR-Tools | Tech Lead Backend | Diario |
| Pruebas unitarias por cada restricción (D1 a D9) | Backend | 13 mayo |
| Documentación de API del solver (Swagger) | Backend | 14 mayo |
| Ambiente de staging para pruebas | DevOps | 14 mayo |

### 6.2 Para HU-20 (Generación horario estudiantes) — RIESGO #2

| Acción | Responsable | Fecha límite |
|--------|-------------|--------------|
| Mock de HU-11/HU-13 para probar HU-20 en paralelo | Frontend + Backend | 22 mayo |
| Pruebas de integración HU-18 + HU-19 antes de HU-20 | Backend | 28 mayo |
| Revisión de rendimiento (<5 seg por estudiante) | Backend | 2 junio |

### 6.3 Para HU-23 (Grilla semanal) — RIESGO #3

| Acción | Responsable | Fecha límite |
|--------|-------------|--------------|
| Mock de datos de horario para desarrollo frontend | Frontend | 26 mayo |
| Pruebas de carga de grilla (<3 seg) | Frontend | 4 junio |
| Integración con datos reales de HU-20 | Frontend + Backend | 5 junio |

### 6.4 Mocking para desarrollo en paralelo

Para que el equipo no quede bloqueado:

```typescript
// Mock para Sprint 3 (desarrollo frontend en paralelo)
export const mockScheduleData = {
  institutional: { ... },  // Para HU-23 (Admin)
  teacher: { ... },        // Para HU-23 (Docente)
  student: { ... }         // Para HU-23 (Estudiante)
};
```

**Entregable:** Script de simulación que devuelve estructura de horario completa — **Responsable:** Frontend Lead — **Fecha:** 26 mayo

---

## 7. Hitos de Control (Checkpoints Actualizados)

| Fecha | Hito | Criterio de éxito | Responsable |
|-------|------|-------------------|-------------|
| **4 mayo** | Fin Sprint 1 | ✅ HU-01 a HU-10 completas | Todo el equipo |
| **14 mayo** | HU-11 funcional | OR-Tools resuelve D1-D9 | Backend |
| **16 mayo** | HU-12 integrada | Generación produce horario BORRADOR | Backend |
| **19 mayo** | Fin Sprint 2 | HU-11 a HU-17 completas | Todo el equipo |
| **26 mayo** | Inicio Sprint 3 | Mock listo para frontend | Frontend |
| **3 junio** | HU-20 funcional | Generación horario estudiantes OK | Backend |
| **6 junio** | HU-23 integrada | Grilla con datos reales funcionando | Frontend + Backend |
| **9 junio** | Fin Sprint 3 | HU-18 a HU-26 completas | Todo el equipo |
| **16 junio** | Fin Buffer | Correcciones aplicadas | Todo el equipo |
| **17 junio** | **RELEASE MVP** | Sistema en producción | Todo el equipo |

---

## 8. Resumen de Riesgos y Estados

| Riesgo | HU asociada | Impacto | Probabilidad | Mitigación |
|--------|-------------|---------|--------------|-------------|
| OR-Tools no modela correctamente D1-D9 | HU-11 | Catastrófico | Media | Code reviews diarios + pruebas unitarias |
| Tiempo de generación excede límites | HU-12, HU-20 | Alto | Media | Optimización + monitoreo temprano |
| Frontend bloqueado esperando backend | HU-20, HU-23 | Alto | Media | Mocks desde 26 mayo |
| Integración grilla con datos reales falla | HU-23 | Alto | Baja | Pruebas de integración anticipadas |
| Exportaciones no cumplen tiempo límite | HU-24, HU-25 | Bajo | Baja | Librerías probadas previamente |
| Vulnerabilidades OWASP | HU-26 | Medio | Baja | Auditoría + ZAP en staging |

---

## 9. Resumen para tu documento final

```markdown
# Cronograma, Dependencias y Ruta Crítica — SGOHA (Actualizado)

## Línea de Tiempo

| Sprint | Fechas | Estado | HU |
|--------|--------|--------|-----|
| Sprint 1 | 20 abril – 4 mayo | ✅ Completado | HU-01 a HU-10 |
| Sprint 2 | 5 mayo – 19 mayo | 🔄 En progreso | HU-11 a HU-17 |
| Sprint 3 | 26 mayo – 9 junio | ⏳ Pendiente | HU-18 a HU-26 |
| Buffer | 10 – 16 junio | ⏳ Reservado | Correcciones |
| Release | 17 junio | 🎯 Objetivo | MVP |

## Ruta Crítica

HU-01..10 → HU-11 → HU-12 → HU-13 → HU-20 → HU-23 → HU-24/HU-25

## Puntos de Bloqueo

1. **HU-11 (14 mayo)** — Modelado D1-D9 en OR-Tools
2. **HU-20 (3 junio)** — Generación horario estudiantes
3. **HU-23 (6 junio)** — Grilla semanal interactiva

## Mitigación Principal

- Code reviews diarios de OR-Tools (HU-11)
- Mocks para frontend desde 26 mayo (desarrollo paralelo)
- Buffer de 5 días al final del proyecto
