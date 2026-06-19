# Registro de Defectos (Defect Log) — Cierre del Proyecto

**Proyecto:** SGOHA — Sistema de Generación Óptima de Horarios Académicos
**Project Manager:** Edward Flores Rodríguez
**Fecha de preparación:** 2026-06-19

No existe plantilla del profesor para este registro; se usa una tabla simple consistente con el resto. Los defectos provienen de evidencia real: auditoría OWASP Top 10 2025 (`docs/calidad/owasp-top10-2025.md`), auditoría WCAG (`docs/calidad/wcag-auditoria.md`), retrospectivas, la HU-29 de endurecimiento de seguridad y el análisis de SonarCloud.

Severidad: Crítica · Alta · Media · Baja.

## 1. Defectos detectados

| ID | Defecto | Componente / evidencia | Severidad | Corrección aplicada | Validación | Estado |
|----|---------|------------------------|-----------|---------------------|------------|--------|
| D-01 | El middleware JWT no rechazaba tokens expirados. | `backend/src/middleware/auth.ts` | Alta | Verificación de expiración + pruebas unitarias Jest. | `auth.test.ts` | Corregido y validado |
| D-02 | `jwt.verify` aceptaba cualquier payload firmado, sin restringir el algoritmo ni la forma del token (OW-02). | `backend/src/middleware/auth.ts` | Alta | Restricción a `HS256` y validación exacta de `AuthPayload`. | `backend/src/middleware/auth.test.ts` | Corregido y validado |
| D-03 | Auto-provisión de usuario como `ADMIN` en `get-session-profile` (escalamiento de privilegios). | Flujo de sesión frontend (HU-29) | Crítica | Refactor de la lógica de sesión para impedir asignación automática de rol ADMIN. | Revisión + refactor HU-29 | Corregido |
| D-04 | Errores de login/registro no vinculados programáticamente a sus controles (WCAG 3.3.1). | `frontend/app/login`, `register` | Media | `aria-invalid` y `aria-describedby` en campos con error. | Auditoría WCAG | Corregido |
| D-05 | Mensajes globales de error no anunciados como estado a lectores de pantalla (WCAG 4.1.3). | Formularios | Media | `role="alert"` y `aria-live="polite"`. | Auditoría WCAG | Corregido |
| D-06 | Toggles de mostrar/ocultar contraseña sin exponer estado presionado (WCAG 4.1.2). | Botones de visibilidad | Baja | `aria-pressed` y `title`. | Auditoría WCAG | Corregido |
| D-07 | Latencia en ajuste manual (drag & drop) por re-validación constante contra Prisma (HU-14). | Frontend ajuste manual | Media | Endpoint *bulk* de re-validación + caché 24 h. | Prueba funcional | Corregido |
| D-08 | Grillas React lentas al renderizar muchas celdas (HU-23). | Componentes de grilla | Media | Memoización `useMemo` / `React.memo`. | Prueba funcional | Corregido |
| D-09 | 23 issues de confiabilidad (bugs) detectados por SonarCloud — Reliability Rating B (65 % Medium, 35 % Low). | Análisis SonarCloud | Media/Baja | En backlog de corrección; priorización posterior a la entrega. | Dashboard SonarCloud | Abierto / en backlog |

## 2. Métricas de defectos (SonarCloud, análisis 2026-06-12)

| Métrica | Valor |
|---------|-------|
| Quality Gate | 🟢 Passed |
| Reliability (bugs) | Rating **B** — 23 issues abiertos |
| Maintainability (deuda técnica) | Rating **A** — 277 issues abiertos |
| Security | Rating **C** — 2 issues (100 % Medium) |
| Security Hotspots | Rating **E** — 4 hotspots *to review* |
| Duplicación | 3.1 % |
| Issues abiertos (total) | 280 |

## 3. Conclusión

Se detectaron **8 defectos funcionales/seguridad/accesibilidad corregidos y validados** (D-01 a D-08) más un conjunto de **23 issues de confiabilidad en backlog** (D-09). Los defectos de seguridad (D-01, D-02, D-03) tienen prioridad de corrección y están enlazados al riesgo R003. La deuda técnica general es baja (Maintainability A); el foco de mejora posterior a la entrega es elevar la calificación de seguridad de C y revisar los 4 hotspots.

> Trazabilidad: D-01 ↔ I-01 · D-02/D-03 ↔ R003 y OWASP (OW-02) · D-04..D-06 ↔ `docs/calidad/wcag-auditoria.md` · D-07 ↔ I-04 · D-08 ↔ I-05 · D-09 ↔ `docs/calidad/sonarcloud.md`.
</content>
