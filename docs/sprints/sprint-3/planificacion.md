# Planificación del Sprint 3

**Fecha:** 08/05/2026
**Período del Sprint:** 08/05/2026 – 22/05/2026
**Objetivo del Sprint:** Finalizar el PMV integrando las restricciones complejas de alumnos, visualizaciones interactivas de React y exportación documental segura.

## 1. Capacidad del Equipo
El sprint dura 2 semanas (10 días hábiles).
- Edward Flores (PO): 25 horas.
- Andre De La Torre (SM): 20 horas.
- Alberto Patiño (Dev): 25 horas.
- Brianna Cortez (Dev): 25 horas.
- Bryams Vilchez (Dev): 40 horas.
- Jack Perez (Dev QA): 25 horas.

## 2. Dependencias Críticas
Para que el Sprint 3 inicie sin bloqueos, las siguientes piezas del Sprint 2 son **obligatorias**:
- **Motor CSP en producción:** Las HU-20 y HU-21 no existen sin el JSON resuelto de la HU-11.
- **Base de datos sólida:** El schema de Prisma debe tener la relación Estudiante-Curso lista para inyectar historial.

## 3. Diagrama de Dependencias (Ruta Crítica)

```ascii
[Sprint 2 Terminado]
      │
      ▼
 [HU-18: Prerreq] ────┐
      │               │
      ▼               ▼
 [HU-19: Créditos]  [HU-21: Atomicidad]
      │               │
      ▼               │
 [HU-20: Horario Estudiante]
      │
      ▼
 [HU-22: Consulta]
      │
      ▼
 [HU-23: Grilla Semanal UI] ─────┐
      │                          │
      ▼                          ▼
 [HU-24: PDF]               [HU-25: Excel]

[Independiente] -> [HU-26: Seguridad OWASP]
```
**La ruta crítica del sprint es:** `HU-18 -> HU-19 -> HU-20 -> HU-22 -> HU-23`. Es secuencial y recae fuertemente sobre el backend antes de llegar a UI.

## 4. Distribución de Carga

| Integrante | HUs Asignadas | Puntos Totales | Rol Principal |
|---|---|---|---|
| Alberto | HU-18, HU-19, HU-20, HU-21, HU-22 | 26 pts | Motor Crítico Estudiantil |
| Bryams | HU-23 | 5 pts | UI de Grillas Interactiva |
| Jack | HU-24, HU-25, HU-26 | 11 pts | Exportación y Ciberseguridad |

*(Brianna y Andre darán soporte cruzado a Alberto debido a su carga crítica de 26 puntos).*

## 5. Riesgos Específicos del Sprint 3

| Riesgo | Probabilidad | Impacto | Estrategia |
|---|---|---|---|
| Sobrecarga de Alberto (26 pts) | Alta | Crítico | Brianna tomará desarrollo de APIs menores (HU-22) para aliviarlo. |
| Librerías PDF pesadas rompen build | Media | Medio | Evaluar alternativas nativas si `react-pdf` da problemas en Vite. |
| Falsos positivos en análisis OWASP | Alta | Bajo | Jack configurará exclusiones correctas en ZAP. |

## 6. Plan de Contingencia (HU-20)
La **HU-20 (Generación horario estudiante)** vale 8 puntos y tiene alto impacto matemático (D18, D19). Si para el **Día 5** no está resuelta, se aplicará el contingente:
- **Fallback:** El estudiante se matriculará manualmente mediante selección en la interfaz (como en sistemas universitarios clásicos), y el backend solo validará los cruces en vez de auto-generarlos inteligentemente, garantizando un flujo funcional.

## 7. Criterios de Éxito
- La grilla (HU-23) renderiza sin lag (0 errores en consola).
- Al matricular, el sistema bloquea inmediatamente (HTTP 409) la infracción de prerrequisitos y créditos.
- Exportación PDF/Excel coincide exactamente con la grilla en pantalla.
- Despliegue final con todos los escaneos de seguridad en verde.
