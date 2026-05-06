# Épicas, Sprints e Historias de Usuario — SGOHA

**Versión:** 1.0
**Fecha:** Mayo 2026
**Proyecto:** SGOHA — Sistema de Generación Óptima de Horarios Académicos

---

## Épicas del Proyecto

| ID | Nombre | Descripción | Sprint |
|---|---|---|---|
| **EP-01** | Gestión de Entidades Base | Registro y administración de estudiantes, docentes, cursos, aulas. | Sprint 1 |
| **EP-02** | Autenticación y Control de Acceso | Registro, login, JWT y control RBAC. | Sprint 1 |
| **EP-03** | Configuración del Período Académico | Franjas horarias y límites del período activo. | Sprint 1 |
| **EP-04** | Generación de Horario Institucional | Motor OR-Tools para asignar cursos a aulas/docentes sin cruces. | Sprint 2 |
| **EP-05** | Generación de Horario de Docentes | Vista personalizada derivada del horario institucional. | Sprint 2 |
| **EP-06** | Generación de Horario de Estudiantes | Asignación automática respetando prerrequisitos y créditos. | Sprint 3 |
| **EP-07** | Visualización y Exportación | Grilla semanal y exportación a PDF/Excel. | Sprint 3 |

---

## Sprint 1 — Fundamentos del Sistema

### EP-02 — Autenticación y Control de Acceso

#### HU-01 — Registro de Usuarios
**Historia:** Como administrador, quiero registrar usuarios con roles para controlar el acceso.
**Criterios de aceptación:** Contraseña hasheada. Validación Zod. 400 si email existe.
**Priorización:** Alta (Valor 5, Riesgo 3, Complejidad 2)
**Relación CSP:** N/A (Habilitador técnico)

#### HU-02 — Inicio de Sesión
**Historia:** Como usuario, quiero iniciar sesión para acceder al sistema.
**Criterios de aceptación:** Retorna JWT expiración 8 horas.
**Priorización:** Alta (Valor 5, Riesgo 4, Complejidad 2)
**Relación CSP:** N/A

#### HU-03 — Control de Acceso por Rol
**Historia:** Como sistema, quiero restringir el acceso a endpoints por rol.
**Criterios de aceptación:** 403 Forbidden si rol incorrecto.
**Priorización:** Alta (Valor 5, Riesgo 4, Complejidad 3)
**Relación CSP:** N/A

---

### EP-01 — Gestión de Entidades Base

#### HU-04 — Gestión de Estudiantes
**Historia:** Como administrador, quiero registrar y consultar estudiantes.
**Criterios de aceptación:** CRUD completo.
**Priorización:** Media (Valor 4, Riesgo 2, Complejidad 2)
**Relación CSP:** D3 (Aforo y matrícula)

#### HU-05 — Gestión de Docentes
**Historia:** Como administrador, quiero registrar y administrar docentes.
**Criterios de aceptación:** CRUD completo.
**Priorización:** Alta (Valor 5, Riesgo 2, Complejidad 2)
**Relación CSP:** D1 (Unicidad docente)

#### HU-06 — Gestión de Disponibilidad de Docentes
**Historia:** Como administrador, quiero registrar la disponibilidad horaria del docente.
**Criterios de aceptación:** Validación de matriz de días/horas libres.
**Priorización:** Crítica (Valor 5, Riesgo 4, Complejidad 3)
**Relación CSP:** Restricción D1 y D4 (Cruce de franjas)

#### HU-07 — Gestión de Cursos y Componentes
**Historia:** Como administrador, quiero registrar cursos (TEORÍA/PRÁCTICA) y créditos.
**Criterios de aceptación:** Límite de créditos.
**Priorización:** Alta (Valor 4, Riesgo 2, Complejidad 3)
**Relación CSP:** Restricción Académica (Cálculo de bloques continuos)

#### HU-08 — Gestión de Aulas
**Historia:** Como administrador, quiero registrar aulas y su capacidad máxima.
**Criterios de aceptación:** Aforo debe ser > 0.
**Priorización:** Alta (Valor 4, Riesgo 2, Complejidad 2)
**Relación CSP:** D2 (Unicidad aula) y D3 (Capacidad física)

---

### EP-03 — Configuración del Período Académico

#### HU-09 — Configuración de Franjas Horarias
**Historia:** Como administrador, quiero definir las franjas del período activo.
**Criterios de aceptación:** Franjas de 2 horas.
**Priorización:** Crítica (Valor 5, Riesgo 3, Complejidad 3)
**Relación CSP:** Define el universo de la variable H (Franjas) en OR-Tools.

#### HU-10 — Tiempos de Traslado
**Historia:** Como administrador, quiero registrar tiempos de traslado entre edificios.
**Criterios de aceptación:** Validación matricial de distancia.
**Priorización:** Baja (Valor 3, Riesgo 2, Complejidad 4)
**Relación CSP:** Restricción blanda B4 (Minimizar viajes largos).

---

## Sprint 2 — Generación de Horario Institucional (Motor CSP)

### EP-04 — Generación de Horario Institucional

#### HU-11 — Modelado de Restricciones Duras en OR-Tools
**Historia:** Como sistema, quiero codificar D1-D9 en CP-SAT para evitar cruces absolutos.
**Criterios de aceptación:** El modelo matemático rechaza configuraciones superpuestas. Retorna INFEASIBLE si es imposible.
**Priorización:** Crítica (Valor 5, Riesgo 5, Complejidad 5)
**Relación CSP:** NÚCLEO CSP (D1, D2, D3, D4).

#### HU-12 — Ejecución del Horario Institucional
**Historia:** Como coordinador, quiero ejecutar el motor para obtener el horario general.
**Criterios de aceptación:** Timeout 30s. Solución OPTIMAL o FEASIBLE.
**Priorización:** Crítica (Valor 5, Riesgo 5, Complejidad 4)
**Relación CSP:** Función Objetivo y Exploración.

#### HU-13 — Activación de Horario
**Historia:** Como administrador, quiero aprobar un horario generado.
**Criterios de aceptación:** Cambio de estado BORRADOR a ACTIVO.
**Priorización:** Media (Valor 3, Riesgo 1, Complejidad 2)
**Relación CSP:** N/A (Flujo transaccional).

#### HU-14 — Ajuste Manual de Asignaciones
**Historia:** Como administrador, quiero mover manualmente una clase si el CSP la puso en un lugar indeseado pero factible.
**Criterios de aceptación:** Valida D1 y D2 en tiempo real al arrastrar y soltar.
**Priorización:** Alta (Valor 4, Riesgo 3, Complejidad 4)
**Relación CSP:** Validación heurística post-solver.

#### HU-15 — Restricciones Blandas y Puntuación
**Historia:** Como sistema, quiero optimizar el horario (B1-B5) minimizando huecos de docentes.
**Criterios de aceptación:** El solver busca maximizar la variable de confort.
**Priorización:** Baja (Valor 3, Riesgo 4, Complejidad 5)
**Relación CSP:** Soft Constraints y Variables de Penalización.

---

### EP-05 — Generación de Horario de Docentes

#### HU-16 — Generación de Vista de Docentes
**Historia:** Como administrador, quiero segmentar el horario total para cada docente.
**Criterios de aceptación:** Queries SQL optimizados.
**Priorización:** Media (Valor 3, Riesgo 2, Complejidad 2)
**Relación CSP:** Parseo de resultados del Solver.

#### HU-17 — Consulta de Horario por Docente
**Historia:** Como docente, quiero ver mi horario y confirmar que no hay cruces.
**Criterios de aceptación:** Interfaz React con grilla limpia.
**Priorización:** Alta (Valor 5, Riesgo 1, Complejidad 2)
**Relación CSP:** N/A.

---

## Sprint 3 — Horario de Estudiantes y UI

### EP-06 — Generación de Horario de Estudiantes

#### HU-18 — Validación de Prerrequisitos
**Historia:** Como sistema, quiero evitar matricular a estudiantes en cursos no aptos.
**Criterios de aceptación:** Bloqueo API 409 Conflict.
**Priorización:** Crítica (Valor 5, Riesgo 4, Complejidad 4)
**Relación CSP:** Restricción de Dominio Estudiantil.

#### HU-19 — Control de Carga (20-22)
**Historia:** Como sistema, quiero asegurar que el alumno lleve entre 20 y 22 créditos.
**Criterios de aceptación:** Validación en backend.
**Priorización:** Alta (Valor 4, Riesgo 3, Complejidad 3)
**Relación CSP:** Restricción D5 (Límite Créditos).

#### HU-20 — Horario Automático Estudiantes
**Historia:** Como estudiante, quiero que el sistema elija las secciones óptimas para mí.
**Criterios de aceptación:** Motor OR-Tools resuelve a nivel estudiante.
**Priorización:** Alta (Valor 4, Riesgo 4, Complejidad 5)
**Relación CSP:** Mini-CSP Estudiantil (Optimización individual).

#### HU-21 — Atomicidad de Cursos
**Historia:** Como sistema, quiero que Teoría y Práctica del mismo curso no se dividan.
**Criterios de aceptación:** Asignación en bloque.
**Priorización:** Alta (Valor 4, Riesgo 3, Complejidad 4)
**Relación CSP:** Restricción D8 (Co-requisitos paralelos).

#### HU-22 — Consulta de Horario Alumno
**Historia:** Como estudiante, quiero ver mis clases aprobadas.
**Criterios de aceptación:** Render en pantalla.
**Priorización:** Media (Valor 4, Riesgo 1, Complejidad 2)
**Relación CSP:** N/A.

---

### EP-07 — Visualización y Exportación

#### HU-23 — Grilla Semanal
**Historia:** Como usuario, quiero ver mi horario en grilla (L-S).
**Criterios de aceptación:** Componente React tipo Calendar.
**Priorización:** Alta (Valor 5, Riesgo 3, Complejidad 4)
**Relación CSP:** N/A.

#### HU-24 — Exportación PDF
**Historia:** Como usuario, quiero descargar mi horario en PDF.
**Criterios de aceptación:** Generación de archivo.
**Priorización:** Baja (Valor 3, Riesgo 2, Complejidad 3)
**Relación CSP:** N/A.

#### HU-25 — Exportación Excel
**Historia:** Como usuario, quiero mi horario en XLSX.
**Criterios de aceptación:** Descarga XLSX.
**Priorización:** Baja (Valor 3, Riesgo 2, Complejidad 2)
**Relación CSP:** N/A.

#### HU-26 — Seguridad OWASP
**Historia:** Como sistema, quiero estar libre de inyecciones.
**Criterios de aceptación:** Reporte ZAP.
**Priorización:** Crítica (Valor 5, Riesgo 5, Complejidad 3)
**Relación CSP:** N/A.
