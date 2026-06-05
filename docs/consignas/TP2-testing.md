# TP2 — Estrategia de Testing y Aseguramiento de Calidad (SGOHA)

**Proyecto:** SGOHA — Sistema de Generación Óptima de Horarios Académicos
**Stack real:** Next.js 15 (App Router) · TypeScript · Supabase/PostgreSQL · Prisma · Express (puente) · Python CP-SAT (motor CSP)
**Documento:** Evidencia integral de la consigna *Estrategias de Testing y Aseguramiento de Calidad en Aplicaciones Web*.

> Este documento mapea 1:1 con la rúbrica. Cada sección indica herramientas,
> casos implementados, escenarios cubiertos y evidencias reproducibles.

---

## 0. Resumen ejecutivo

| Nivel de prueba | Herramienta | Ubicación | Resultado |
|---|---|---|---|
| Unitarias Backend | Vitest | `Backend/src/**/*.test.ts` | 27 pasan · 3 skip (integración BD) |
| Unitarias/Componentes Frontend | Jest + React Testing Library | `Frontend/**/*.test.tsx` | 14 pasan |
| Mocking de API | MSW | `Frontend/mocks/` | activo |
| Integración API | Supertest | `Backend/src/app.test.ts`, `courses.test.ts` | activo |
| Aceptación | Cypress | `Frontend/cypress/e2e/aceptacion/` | 13 pasan |
| End-to-End | Cypress | `Frontend/cypress/e2e/e2e/` | 4 pasan |
| Cobertura | v8 (back) / Istanbul (front) | `*/coverage/` | back 94% · front 82% |

**Totales:** 41 unitarias/componentes/integración + 17 aceptación/E2E = **58 pruebas automatizadas**.

---

## 1. Pruebas Unitarias (Consigna 1.1)

### 1.1 Backend — Vitest

**Comando:** `cd Backend && npm test` · cobertura: `npm run test:cov`

| Archivo | Objeto bajo prueba | Casos |
|---|---|---|
| `src/lib/gapMetrics.test.ts` | Lógica crítica de métricas de huecos | 16 |
| `src/middleware/auth.test.ts` | `requireAuth` / `requireRole` (JWT, RBAC) | 7 |
| `src/app.test.ts` | Factoría Express, health, 404, helmet | 4 |
| `src/routes/api/v1/courses.test.ts` | CRUD cursos (integración, `skipIf(!runDb)`) | 3 (condicionales) |

**Reglas de negocio y casos límite validados (`gapMetrics`):**
- 0 huecos sin asignaciones / con una sola clase / con bloques adyacentes.
- Conteo de 1 y 2 huecos entre clases con bloques vacíos en medio.
- **El almuerzo NO cuenta como hueco** (posiciones 720↔840 adyacentes) — regla de dominio.
- Agregación de huecos por docente e independencia entre docentes.
- `pctReduccion`: redondeo a entero, baseline 0 → 0, nunca negativo (clamp), 100% al eliminar todos.

**Manejo de excepciones / autenticación (`auth`):**
- 401 sin header `Authorization`, header no-Bearer, token inválido.
- 200 con token válido; 500 cuando falta `JWT_SECRET`.
- 403 rol no permitido; 200 rol permitido (`requireRole`).

**Mocks / stubs / spies:** `requireAuth` se prueba con tokens JWT firmados ad-hoc y
mocks de `JWT_SECRET` vía `process.env`; las respuestas Express se inspeccionan con Supertest.

### 1.2 Frontend — Jest + React Testing Library

**Comando:** `cd Frontend && npm test` · cobertura: `npm run test:cov`

Cubierto junto con las pruebas de componentes (sección 2), ya que en el App Router
los utilitarios puros (`lib/utils.ts`) y los componentes comparten el mismo runner.

---

## 2. Pruebas de Componentes React (Consigna 1.2)

**Herramientas:** React Testing Library + **MSW** (mocking de API a nivel de red).

| Archivo | Componente | Escenarios |
|---|---|---|
| `app/admin/cursos/CursoForm.test.tsx` | Formulario con validación (server action) | render, errores de validación, error general, `onSuccess` |
| `app/admin/horarios/GenerarHorarioPanel.test.tsx` | Consumo de API CSP (async) | éxito + % reducción, infactibilidad/conflictos, error de servicio |
| `components/HorarioGrid.test.tsx` | Grilla semanal | cabeceras 6 días, sesión asignada, **estado vacío**, **renderizado condicional** |
| `components/ExportHorarioButtons.test.tsx` | Botones de exportación | render, rutas con formato, atributos de descarga |

**Escenarios obligatorios cubiertos:**
- **Carga asincrónica:** `GenerarHorarioPanel` consume `/api/v1/solver/generate` (MSW).
- **Formularios con validaciones:** `CursoForm` muestra errores devueltos por la action.
- **Estados de error:** conflictos del modelo + fallo del servicio CSP.
- **Estados vacíos:** `HorarioGrid` sin celdas no renderiza sesiones.
- **Renderizado condicional:** `HorarioGrid` omite docente cuando no viene.

**MSW (mocking de API):**
- `mocks/handlers.ts` — handler base `POST /api/v1/solver/generate` (respuesta OPTIMAL).
- `mocks/server.ts` — `setupServer` para entorno Node de Jest.
- Ciclo de vida en `jest.setup.ts` (`listen`/`resetHandlers`/`close`, `onUnhandledRequest: "error"`).
- Cada escenario sobrescribe el handler con `server.use(...)` (infactible / error 500).
- Polyfills de MSW v2 en `jest.polyfills.js` (fetch de undici, streams, `BroadcastChannel`).

> Decisión: MSW reemplazó al mock manual de `global.fetch` para cumplir la herramienta
> obligatoria de la rúbrica e interceptar la dependencia externa a nivel de red.

---

## 3. Pruebas de Integración (Consigna 1.3)

**Herramientas:** Supertest (API) · RTL + MSW (frontend).

### 3.1 API — Supertest

`Backend/src/app.test.ts` levanta la app Express real (`createApp()`) y verifica:
- **Códigos HTTP y JSON:** `GET /health` → 200 + cuerpo JSON de estado.
- **Manejo de errores:** rutas inexistentes → 404 con cuerpo de error.
- **Seguridad:** cabeceras de `helmet` aplicadas.

`Backend/src/routes/api/v1/courses.test.ts` (integración con BD, `describe.skipIf(!runDb)`):
- **CRUD:** `POST` crea curso → 201 con registro persistido.
- **Persistencia:** `GET` devuelve la lista incluyendo el curso creado.
- **Datos inconsistentes:** `POST` con código duplicado falla sin duplicar.

> Estos 3 casos se ejecutan cuando hay una BD de prueba disponible (`runDb`); sin ella
> se omiten para no acoplar la suite unitaria a infraestructura externa.

### 3.2 Frontend — RTL + MSW

`GenerarHorarioPanel.test.tsx` valida la integración componente ↔ API REST del motor
CSP a través de MSW (peticiones válidas, respuesta infactible y error del servidor).

---

## 4. Pruebas de Aceptación (Consigna 1.4) — Cypress

**Comando:** `cd Frontend && npm run cy:run` (headless) · `npm run cy:open` (interactivo).
**Requisito:** app en `http://localhost:3000` + `cypress.env.json` con un usuario admin real.

| Spec | Escenarios obligatorios |
|---|---|
| `aceptacion/01-auth.cy.ts` | **Inicio de sesión** OK, credenciales inválidas, validación de email, formulario de registro (5 casos) |
| `aceptacion/02-gestion-datos.cy.ts` | **Gestión de datos**: listado, validación de campos, crear, persistencia tras recarga, eliminar (5 casos) |
| `aceptacion/03-navegacion.cy.ts` | **Navegación** entre secciones, **control de acceso** (redirección a login), ruta inexistente (3 casos) |

**Resultado:** 13/13 pasan.

**Evidencias automáticas:** videos en `cypress/videos/`, capturas de fallo en
`cypress/screenshots/`, reporte en consola.

---

## 5. Pruebas End-to-End (Consigna 1.5) — Cypress

`Frontend/cypress/e2e/e2e/horario-flow.cy.ts` (4 casos):

| Tipo | Escenario |
|---|---|
| **Golden Path** | Admin inicia sesión y accede al panel de gestión sin errores. |
| **Happy Path** | Crea un aula y verifica que **persiste tras recargar** (limpieza incluida). |
| **Unhappy Path** | Acceso a ruta protegida sin sesión → redirige a login. |
| **Unhappy Path** | Login con credenciales inválidas → mensaje de error, permanece en login. |

**Escenarios cubiertos:** navegación completa, persistencia de información, validaciones
de seguridad (acceso no autorizado), manejo de errores y recuperación controlada.

**Resultado:** 4/4 pasan. Evidencias: videos + capturas automáticas.

---

## 6. Análisis de Cobertura y Calidad (Consigna 1.6)

**Reportes:** HTML + LCOV en `Backend/coverage/` y `Frontend/coverage/`.

### 6.1 Métricas obtenidas

| Suite | Statements | Branches | Functions | Lines |
|---|---|---|---|---|
| **Backend (lógica crítica)** | **94.2%** | 95.65% | 90% | 93.75% |
| **Frontend (global unitario)** | **81.81%** | 75% | 71.42% | 81.42% |

**Cumplimiento de la rúbrica:**
- Cobertura global ≥ 70% → ✅ (frontend 81.8%, backend 94.2%).
- Cobertura lógica crítica ≥ 85% → ✅ (backend `gapMetrics` + `auth` 94.2%).

Umbrales **forzados en CI** (la suite falla si bajan):
- `Backend/vitest.config.ts`: `thresholds: 85%`.
- `Frontend/jest.config.mjs`: `coverageThreshold.global: 70%`.

### 6.2 Módulos críticos cubiertos
- **Métricas de huecos** (`gapMetrics.ts`) — núcleo de la optimización del horario.
- **Autenticación/RBAC** (`middleware/auth.ts`) — control de acceso.
- **Componentes de UI con lógica** — formularios, grilla, panel de generación.

### 6.3 Justificación de exclusiones de cobertura

El alcance unitario se concentra en lógica pura y componentes cliente; el resto se
valida en otras capas de la pirámide de pruebas:

| Excluido | Motivo | Validado por |
|---|---|---|
| `components/ui/**` | Primitivas generadas por shadcn/ui (3rd-party) | — |
| `app/**/page.tsx`, `layout.tsx`, `actions.ts` | Server Components / Server Actions ligados a Supabase/Prisma | Integración + E2E (Cypress) |
| `lib/scheduler/**` | Motor TS heredado, fuera de producción (motor vivo = Python CP-SAT) | Deuda documentada |
| `lib/supabase`, `lib/prisma` | Singletons de infraestructura | — |
| `Backend` rutas `solver`/`courses` | Dependen del servicio Python/BD | Supertest (integración) |

### 6.4 Riesgos y defectos identificados
- **Compilación on-demand de Next dev** provocaba clicks perdidos en Cypress antes de
  la hidratación → mitigado con apertura resiliente (reintento con espera).
- **Redirección `/dashboard` → `/admin` (307)** por rol → asserts ajustados a área autenticada.
- **MSW v2 + jsdom** requiere polyfills de plataforma web (fetch/streams/canales) →
  resueltos en `jest.polyfills.js`; `FormData` se conserva el de jsdom para no romper `useActionState`.

---

## 7. Herramientas obligatorias — cumplimiento

| Tipo de prueba | Herramienta exigida | Estado |
|---|---|---|
| Unitarias Frontend | Jest + React Testing Library | ✅ |
| Unitarias Backend | Vitest | ✅ |
| Integración API | Supertest | ✅ |
| Integración Frontend | RTL + MSW | ✅ |
| Aceptación | Cypress | ✅ |
| E2E | Cypress | ✅ |
| Cobertura | LCOV/HTML | ✅ |

---

## 8. Reproducción

```bash
# Backend — unitarias + integración + cobertura
cd Backend
npm install
npm run test:cov        # reporte en Backend/coverage/

# Frontend — unitarias + componentes (MSW) + cobertura
cd ../Frontend
npm install
npm run test:cov        # reporte en Frontend/coverage/

# Frontend — aceptación + E2E (requiere la app corriendo y cypress.env.json)
npm run dev             # terminal 1: http://localhost:3000
npm run cy:run          # terminal 2: videos en cypress/videos/
```

**Estructura de pruebas (separación código fuente / pruebas):**
- Backend: pruebas junto al código (`*.test.ts`), config en `vitest.config.ts`.
- Frontend: pruebas junto al código (`*.test.tsx`), mocks en `mocks/`, E2E en `cypress/`.
