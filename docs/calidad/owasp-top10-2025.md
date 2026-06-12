# OWASP Top 10 2025

Fecha de revision: 2026-06-12

## Referencia base

La pagina oficial de OWASP lista como version actual:

- A01 Broken Access Control
- A02 Security Misconfiguration
- A03 Software Supply Chain Failures
- A04 Cryptographic Failures
- A05 Injection
- A06 Insecure Design
- A07 Authentication Failures
- A08 Software or Data Integrity Failures
- A09 Security Logging and Alerting Failures
- A10 Mishandling of Exceptional Conditions

## Hallazgos y mitigaciones

| ID | Categoria | Hallazgo | Riesgo | Impacto | Estado / mitigacion | Riesgo residual |
|---|---|---|---|---|---|---|
| OW-01 | A01 Broken Access Control | Las operaciones administrativas del frontend validan rol `ADMIN` antes de usar `SERVICE_ROLE_KEY`, y la base usa RLS en Supabase. | Medio | Escalamiento de privilegios si un flujo admin omitiera control previo. | Mitigado parcialmente con `assertAdminCaller()` y RLS; mantener revisiones sobre nuevas server actions. | Medio-bajo |
| OW-02 | A07 Authentication Failures | `backend/src/middleware/auth.ts` aceptaba cualquier payload firmado mientras pasara `jwt.verify`. | Medio | Tokens con forma inesperada podian entrar al flujo protegido. | Corregido: ahora se restringe a `HS256` y se valida forma exacta de `AuthPayload`. | Bajo |
| OW-03 | A02 Security Misconfiguration | `sonar-project.properties` aun tiene `CHANGE_ME_ORG`; sin esto no hay analisis continuo en SonarCloud. | Medio | Perdida de visibilidad de bugs, smells y vulnerabilidades. | Pendiente operativo: configurar organizacion real y `SONAR_TOKEN`. | Bajo tras configuracion |
| OW-04 | A04 Cryptographic Failures | Las claves de Supabase se leen desde variables de entorno y el cliente admin es `server-only`. | Bajo | Exposicion de `SERVICE_ROLE_KEY` seria critica si migrara al cliente. | Mitigado: encapsulado en `frontend/lib/supabase/admin.ts`. Mantener prohibicion de importarlo desde componentes cliente. | Bajo |
| OW-05 | A05 Injection | Los formularios server-side usan `zod.safeParse()` y Prisma parametriza queries. | Bajo | Insercion de datos malformados o manipulacion de tipos. | Mitigado en flujos revisados (`auth`, `admin/*/actions`, `estudiante/*/actions`). | Bajo |
| OW-06 | A09 Security Logging and Alerting Failures | No se observa estrategia centralizada de auditoria o alertas de seguridad. | Medio | Dificulta detectar abuso, cambios de rol o errores repetidos de autenticacion. | Pendiente: registrar eventos de login fallido, cambios de rol y borrado de usuarios. | Medio |
| OW-07 | A10 Mishandling of Exceptional Conditions | Hay manejo basico de errores con mensajes de usuario, pero sin estandar de correlacion o observabilidad. | Medio | Fallas operativas menos trazables. | Pendiente: normalizar logging y errores de server actions / backend. | Medio |

## Evidencia tecnica

- `backend/src/middleware/auth.ts`
- `backend/src/middleware/auth.test.ts`
- `frontend/lib/supabase/admin.ts`
- `frontend/lib/supabase/env.ts`
- `frontend/supabase/schema.sql`
- `frontend/supabase/migrations/002_perfil_docente_read_y_cupo.sql`
