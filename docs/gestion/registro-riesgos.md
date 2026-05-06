# 1º Registro de Riesgos

**Proyecto:** SGOHA (Sistema de Generación Óptima de Horarios Académicos)  
**Mapeo Rúbrica:** 3.3.a.1º

La siguiente tabla registra los eventos adversos técnicos que amenazan el desarrollo y la viabilidad algorítmica del proyecto, junto con sus mitigaciones.

| ID | i. Descripción del Riesgo | Causa | ii. Probabilidad (P) / Impacto (I) | Nivel (P×I) | iii. Estrategia de Mitigación |
|---|---|---|---|---|---|
| **R001** | Motor CSP no converge | Complejidad NP-completa (OR-Tools) ante muchos cursos. | P: Alta (4) / I: Crítico (5) | 🔴 20 | Timeout configurado a 30s. Si no halla el óptimo, retorna solución `FEASIBLE`. |
| **R002** | Demora en generación >30s | Instancias masivas de cruces en horarios. | P: Alta (4) / I: Serio (4) | 🟠 16 | Implementar pruebas de estrés progresivas en Sprint 2. |
| **R003** | Vulnerabilidades OWASP | Fallos en JWT, Inyecciones SQL. | P: Media (3) / I: Crítico (5) | 🔴 15 | Auditoría activa y validación estricta con Zod en cada endpoint. |
| **R004** | Fallas integración API | Desconexión asíncrona Node.js / FastAPI. | P: Alta (4) / I: Serio (4) | 🟠 16 | Contratos estrictos compartidos en Pydantic y Zod. |
| **R005** | Conflictos silenciosos | Modelo matemático imperfecto aprueba cruces. | P: Media (3) / I: Serio (4) | 🟠 12 | Tests unitarios exhaustivos a cada restricción D1-D9. |
| **R006** | Caída Render/Supabase | Límite del Free Tier alcanzado en la nube. | P: Media (3) / I: Serio (4) | 🟠 12 | Entorno local replicable (Docker-compose) como fallback. |
| **R007** | Cortes eléctricos locales | Problemas de red en la zona del equipo. | P: Media (3) / I: Moderado (3) | 🟡 9 | Trabajo offline y commit diario obligatorio. |

*(Nota: La Probabilidad y el Impacto se miden del 1 al 5. Nivel Crítico > 15).*
