# Registro de Riesgos — Cierre del Proyecto

**Proyecto:** SGOHA — Sistema de Generación Óptima de Horarios Académicos
**Código:** PFA-TP2-2026-01
**Project Manager:** Edward Flores Rodríguez
**Fecha de preparación:** 2026-06-19
**Plantilla base:** `docs/plantillas/2.26_RISK REGISTER.dotm.md`

Escala: Probabilidad (P) e Impacto (I) de 1 a 5. Nivel = P × I. Crítico > 15 🔴 · Serio 10–15 🟠 · Moderado < 10 🟡.
Este registro consolida los riesgos identificados en planificación (`docs/gestion/registro-riesgos.md`) y cierra cada uno con su materialización real y riesgo residual al término del proyecto.

## 1. Riesgos identificados y estado final

| ID | Enunciado del riesgo | Owner | P | I | Nivel | Respuesta aplicada | ¿Se materializó? | Estado final | Riesgo residual |
|----|----------------------|-------|---|---|-------|--------------------|------------------|--------------|-----------------|
| R001 | Motor CSP no converge en tiempo aceptable (complejidad NP del problema en OR-Tools). | Alberto Patiño | 4 | 5 | 🔴 20 | Timeout a 30 s; si no halla `OPTIMAL`, retorna solución `FEASIBLE`. Pruebas unitarias por restricción D1–D9. | Parcial: la curva de OR-Tools generó cuello de botella, pero el solver convergió dentro del límite. | Cerrado / controlado | Bajo |
| R002 | Demora en generación > 30 s en instancias masivas. | Alberto Patiño | 4 | 4 | 🟠 16 | Timeout con solución parcial; pruebas de estrés progresivas en Sprint 2. | No: el timeout con `FEASIBLE` evitó respuestas colgadas. | Cerrado | Bajo |
| R003 | Vulnerabilidades OWASP (JWT, inyección, control de acceso). | Brianna Cortez | 3 | 5 | 🔴 15 | Validación con Zod, JWT restringido a HS256, RLS en Supabase, auditoría OWASP Top 10 2025. | Sí: defectos D-02 (JWT sin restringir algoritmo), D-03 (auto-provisión ADMIN), hallazgos OW-01/OW-06/OW-07. | Abierto / en seguimiento | Medio (SonarCloud: 2 security issues Medium, 4 hotspots *to review*) |
| R004 | Fallas de integración entre API Node/Express y microservicio FastAPI. | Bryams Vílchez | 4 | 4 | 🟠 16 | Contratos estrictos compartidos en Pydantic y Zod; CORS configurado desde el inicio. | No de forma significativa: los payloads viajaron sin errores de tipado. | Cerrado | Bajo |
| R005 | Conflictos silenciosos: el modelo matemático aprueba cruces inválidos. | Alberto Patiño | 3 | 4 | 🟠 12 | Tests unitarios exhaustivos por cada restricción dura D1–D9 (`gapMetrics.ts`, 100 % cobertura). | No: las pruebas fijaron el comportamiento correcto. | Cerrado | Bajo |
| R006 | Caída de Render/Supabase por límite de Free Tier. | Andre De La Torre | 3 | 4 | 🟠 12 | Entorno local replicable (Docker-compose) como fallback. | No: el free tier sostuvo el desarrollo y la demo. | Cerrado | Bajo |
| R007 | Cortes eléctricos / problemas de red en la zona del equipo. | Equipo | 3 | 3 | 🟡 9 | Trabajo offline y commit diario obligatorio (232 commits a la fecha). | No de forma relevante. | Cerrado | Bajo |
| R008 | Distribución desigual del trabajo / cuello de botella de conocimiento del CSP en un solo integrante. | Andre De La Torre | 4 | 3 | 🟠 12 | Definir responsabilidades por módulo; sesiones de transferencia del modelo CP-SAT. | Sí: Alberto concentró la carga crítica del solver (ver IMP-01). | Cerrado con plan de transferencia | Bajo-medio |

## 2. Conclusión de gestión de riesgos

De 8 riesgos gestionados, **3 se materializaron** (R001 parcial, R003, R008) y fueron controlados con las respuestas planificadas. El único con **riesgo residual medio** es R003 (seguridad): SonarCloud reporta calificación de seguridad **C** con 2 issues de severidad media y 4 *security hotspots* pendientes de revisión, en seguimiento para el endurecimiento posterior a la entrega.

> Trazabilidad: R003 ↔ defectos D-02/D-03 (`06_registro_defectos.md`) ↔ hallazgos OWASP (`docs/calidad/owasp-top10-2025.md`). R008 ↔ IMP-01 (`05_registro_impedimentos.md`).
</content>
