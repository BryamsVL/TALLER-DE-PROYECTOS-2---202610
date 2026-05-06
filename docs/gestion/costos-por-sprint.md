# Costos por Sprint

**Proyecto:** SGOHA  
**Distribución:** 3 Sprints (Acorde al Backlog del Producto)  

Este documento desglosa el costo financiero de cada iteración de desarrollo (Sprint), permitiendo auditar la inversión frente al valor entregado.

---

## 1. Distribución de Costos por Iteración

La asignación de costos indirectos (S/. 1,208) y de infraestructura (S/. 10) se ha prorrateado de manera uniforme a lo largo de los 3 sprints, mientras que los RRHH se calculan en base al esfuerzo real en horas por sprint (según `costos-fuentes.md`).

| Concepto de Gasto | Sprint 1 (S/) | Sprint 2 (S/) | Sprint 3 (S/) | Total (S/) |
|---|---|---|---|---|
| **Recursos Humanos** | 2,220 | 2,520 | 2,610 | 7,350 |
| **Infraestructura** | 3 | 3 | 4 | 10 |
| **Indirectos (Internet, Energía, Contingencia)**| 402 | 403 | 403 | 1,208 |
| **COSTO TOTAL DEL SPRINT**| **2,625** | **2,926** | **3,017** | **8,568** |

---

## 2. Análisis del Gasto por Sprint frente al Backlog

### Sprint 1: Fundamentos del Sistema (S/. 2,625)
* **Alcance:** HU-01 a HU-10.
* **Justificación de Costo:** Es el sprint más económico (30.6% del presupuesto). La mayor parte del desarrollo consistió en operaciones CRUD estándar (aulas, cursos, estudiantes) y autenticación base. No hubo investigación algorítmica pesada.

### Sprint 2: Horario Institucional y CSP (S/. 2,926)
* **Alcance:** HU-11 a HU-17.
* **Justificación de Costo:** Representa un incremento presupuestal (34.1%). Este incremento se debe **exclusivamente al modelado del motor CSP en OR-Tools** (HU-11 y HU-15). El desarrollador Backend/CSP (Alberto) consumió 40 horas en este único sprint, encareciendo la iteración debido a la complejidad de resolver restricciones matemáticas duras y blandas.

### Sprint 3: Horario Estudiantes y Visualización (S/. 3,017)
* **Alcance:** HU-18 a HU-26.
* **Justificación de Costo:** Es el sprint más costoso del proyecto (35.2%). Esto ocurre porque se cruzan dos grandes frentes en simultáneo: la finalización del motor CSP para la matrícula individual (HU-20) y la alta carga de desarrollo visual en Frontend para las grillas interactivas (HU-23) y la exportación de reportes (HU-24, HU-25). El esfuerzo de UI llega a su pico (40 horas).

---

## 3. Conclusión Presupuestal Ágil
El incremento progresivo de los costos (S1 < S2 < S3) refleja correctamente la **curva de complejidad del problema**. Se gastó menos construyendo la "cáscara" del sistema (S1) y se invirtió el capital principal en resolver el problema complejo de ingeniería (CSP) y entregar valor visual al cliente final (S2 y S3).
