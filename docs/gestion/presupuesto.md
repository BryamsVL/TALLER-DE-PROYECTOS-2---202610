# Presupuesto del Proyecto — SGOHA

**Proyecto:** Sistema de Generación Óptima de Horarios Académicos  
**Moneda:** Soles peruanos (S/)  
**Período:** 3 sprints (6 semanas)  
**Nota:** Valores marcados como `[estimado]` son proyecciones.

---

## 1. Recursos Humanos

| Rol Scrum | Integrante | Horas S1 | Horas S2 | Horas S3 | Total Horas | Costo/hora (S/) | Total (S/) |
|---|---|---|---|---|---|---|---|
| Product Owner | Brianna Cortez | 20 | 20 | 25 | 65 | 15 | 975 |
| Scrum Master | Andre De La Torre | 20 | 20 | 20 | 60 | 15 | 900 |
| Dev — Backend/CSP | Alberto Patiño | 25 | 40 | 25 | 90 | 18 | 1,620 |
| Dev — Backend/Auth | Edward Flores | 25 | 25 | 25 | 75 | 18 | 1,350 |
| Dev — Frontend/UI | Bryams Vilchez | 20 | 25 | 40 | 85 | 18 | 1,530 |
| Dev — QA/DevOps | Jack Perez | 20 | 20 | 25 | 65 | 15 | 975 |
| **SUBTOTAL RRHH** | | **130** | **150** | **160** | **440** | | **7,350** |

> Costo `[estimado]` de desarrolladores nivel universitario/junior en mercado local.

---

## 2. Infraestructura Tecnológica

| Servicio | Descripción | Plan | Costo/mes (S/) | Meses | Total (S/) |
|---|---|---|---|---|---|
| Supabase | PostgreSQL + Auth | Free tier | 0 | 2 | 0 |
| Render.com | Hosting Node.js + FastAPI | Free tier | 0 | 2 | 0 |
| GitHub Actions | CI/CD y automatización | Free (Open Source) | 0 | 2 | 0 |
| OR-Tools | Librería optimización | Open Source | 0 | 2 | 0 |
| Dominio/DNS | Para pruebas y demo final | `.tech` `[estimado]` | 5 | 2 | 10 |
| **SUBTOTAL INFRA** | | | | | **10** |

---

## 3. Costos Indirectos

| Concepto | Descripción | Costo estimado (S/) |
|---|---|---|
| Internet/Energía | Proporcional por teletrabajo (6 personas) | 800 |
| Licencias software | VS Code, Postman, herramientas Open Source | 0 |
| Contingencia (5%) | Buffer de emergencia | 408 |
| **SUBTOTAL INDIR** | | **1,208** |

---

## 4. Costos por Sprint (Acumulado - Curva S)

| Concepto | Sprint 1 | Sprint 2 | Sprint 3 | Total |
|---|---|---|---|---|
| RRHH (S/) | 2,220 | 2,520 | 2,610 | 7,350 |
| Infraestructura (S/) | 5 | 5 | 0 | 10 |
| Indirectos (S/) | 400 | 400 | 408 | 1,208 |
| **Total Sprint (S/)**| **2,625** | **2,925** | **3,018** | **8,568** |
| **ACUMULADO (S/)** | **2,625** | **5,550** | **8,568** | — |

---

## 5. Análisis: CSP vs Costo

El módulo de mayor impacto presupuestal es el desarrollo del motor CP-SAT (Sprint 2) y la integración visual de la grilla (Sprint 3). 
* **Alberto Patiño** concentra 40 horas solo en el Sprint 2 para resolver el modelo matemático, lo que representa el 28% del costo de RRHH del sprint.
* En total, el solver y sus pruebas demandan unos S/. 2,000 en esfuerzo directo, reflejando la naturaleza NP-completa del problema.

---

## 6. Evaluación Green Software

SGOHA implementa patrones de **Green Software**:
- **Eficiencia Computacional:** Al implementar caché (TTL de 24h) en las respuestas del sistema y los horarios estáticos, se evita recalcular con OR-Tools para vistas de lectura. Esto reduce en un **≥40%** el tiempo de cómputo del procesador.
- **Serverless/Free Tiers:** Al alojar en infraestructura compartida de Render que suspende instancias inactivas, la huella de carbono en desarrollo es cercana a cero frente a mantener servidores locales 24/7.
