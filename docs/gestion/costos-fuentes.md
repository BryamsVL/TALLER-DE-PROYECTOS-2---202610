# Fuentes de Costos del Proyecto

**Proyecto:** Sistema de Generación Óptima de Horarios Académicos (SGOHA)  
**Moneda:** Soles peruanos (S/)  

Este documento detalla la identificación de costos exigida por la rúbrica, dividida en las tres categorías fundamentales.

---

## 1. Recursos Humanos (RRHH)
Costos asociados al equipo Scrum durante los 3 sprints (6 semanas). Se estima una tarifa de desarrollador junior/practicante pre-profesional para el mercado local (S/. 15 - 18 / hora).

| Rol Scrum | Integrante | Horas S1 | Horas S2 | Horas S3 | Total Horas | Costo/hora (S/) | Total (S/) |
|---|---|---|---|---|---|---|---|
| Product Owner | Edward Flores | 20 | 20 | 25 | 65 | 15 | 975 |
| Scrum Master | Andre De La Torre | 20 | 20 | 20 | 60 | 15 | 900 |
| Dev — Backend/CSP | Alberto Patiño | 25 | 40 | 25 | 90 | 18 | 1,620 |
| Dev — Backend/Auth | Brianna Cortez | 25 | 25 | 25 | 75 | 18 | 1,350 |
| Dev — Frontend/UI | Bryams Vilchez | 20 | 25 | 40 | 85 | 18 | 1,530 |
| Dev — QA/DevOps | Jack Perez | 20 | 20 | 25 | 65 | 15 | 975 |
| **SUBTOTAL RRHH** | | **130** | **150** | **160** | **440** | | **7,350** |

---

## 2. Infraestructura Tecnológica
El proyecto emplea una arquitectura moderna orientada a la nube con modelos de pago por uso (Serverless) y niveles gratuitos durante el desarrollo (PMV).

| Servicio | Descripción | Plan | Costo/mes (S/) | Meses | Total (S/) |
|---|---|---|---|---|---|
| Supabase | PostgreSQL + Autenticación + RLS | Free tier | 0 | 2 | 0 |
| Render.com | Hosting Node.js (Express) + FastAPI | Free tier | 0 | 2 | 0 |
| Vercel | Hosting Frontend (React) | Hobby | 0 | 2 | 0 |
| GitHub Actions | CI/CD y automatización (build.yml) | Free (Open Source) | 0 | 2 | 0 |
| OR-Tools | Librería optimización CSP | Open Source | 0 | 2 | 0 |
| Dominio/DNS | Para pruebas y demo final | `.tech` `[estimado]` | 5 | 2 | 10 |
| **SUBTOTAL INFRAESTRUCTURA** | | | | | **10** |

---

## 3. Costos Indirectos
Costos operativos y de contingencia para la viabilidad del proyecto.

| Concepto | Descripción | Costo estimado (S/) |
|---|---|---|
| Internet y Energía | Proporcional por teletrabajo (6 personas durante 6 semanas) | 800 |
| Licencias software | VS Code, Postman, Figma (Planes gratuitos educativos) | 0 |
| Movilidad local | Reuniones de coordinación y sustentación presencial | 150 |
| Contingencia Técnica | Buffer de emergencia ante imprevistos (aprox. 3% del total) | 258 |
| **SUBTOTAL INDIRECTOS** | | **1,208** |

---

## Resumen de Fuentes de Costo

| Categoría | Subtotal (S/) | % del Total |
|---|---|---|
| 1. Recursos Humanos | 7,350 | 85.8% |
| 2. Infraestructura | 10 | 0.1% |
| 3. Costos Indirectos | 1,208 | 14.1% |
| **COSTO TOTAL DEL PROYECTO** | **8,568** | **100%** |
