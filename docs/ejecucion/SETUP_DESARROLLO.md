# SGOHA — Guía de Setup para Desarrollo

Documento de pasos para que cualquier integrante del equipo pueda levantar el proyecto en su máquina local.

**Stack final (Sprint 1):**
- **Web:** Next.js 15 (App Router) + TypeScript + Tailwind — carpeta `web/` (puerto 3000)
- **Base de datos + Auth:** Supabase (PostgreSQL hosteado + Supabase Auth)
- **CSP-service:** **diferido** a Sprint 2-3

> **Nota sobre carpetas legacy:** `Frontend/` (TanStack Start) y `Backend/` (Express + Prisma) se mantienen temporalmente en el repositorio mientras se valida el nuevo stack. Una vez funcional, se eliminarán en una rama dedicada.

---

## 1. Prerrequisitos

Cada developer necesita instalado:

- **Node.js 20+** — [nodejs.org](https://nodejs.org/)
- **Git** — para clonar el repositorio
- **Editor** — VS Code recomendado

No se requiere Docker, Python, Prisma ni PostgreSQL local.

---

## 2. Crear proyecto en Supabase (solo una vez, lo hace el tech lead)

1. Ir a [supabase.com](https://supabase.com) y crear cuenta gratuita.
2. Click en **"New project"**.
3. Llenar:
   - **Name:** `sgoha-dev`
   - **Database password:** generar una segura y guardarla en el gestor de contraseñas del equipo (no se necesitará para el día a día, pero sí si alguna vez se conecta vía SQL directo).
   - **Region:** la más cercana (ej. `South America (São Paulo)` o `US East`).
4. Esperar ~2 minutos a que se aprovisione.
5. Una vez listo, ir a **Project Settings (engranaje) → API** y copiar:
   - **Project URL** (algo como `https://xxxxx.supabase.co`) → será `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key (un JWT largo) → será `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Compartir ambos valores con el equipo por canal seguro.

> **Importante:** La `anon` key es pública (puede vivir en el cliente). NO confundir con la `service_role` key, que es privada y NO se usa en este proyecto por ahora.

> **Nota:** Supabase pausa proyectos gratuitos tras 7 días de inactividad. Un developer debe entrar al dashboard semanalmente para mantenerlo activo.

---

## 3. Clonar el repositorio

```bash
git clone https://github.com/BryamsVL/TALLER-DE-PROYECTOS-2---202610.git
cd TALLER-DE-PROYECTOS-2---202610
```

---

## 4. Setup de la app web

```bash
cd web
npm install
```

Crear el archivo `.env.local` copiando la plantilla:

```powershell
# Windows (PowerShell)
Copy-Item .env.local.example .env.local
```

```bash
# Linux / Mac
cp .env.local.example .env.local
```

Editar `web/.env.local` y reemplazar:

- `NEXT_PUBLIC_SUPABASE_URL` con la **Project URL** de Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` con la **anon public** key

### Levantar el servidor

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000). Debe verse la landing default de Next.js (será reemplazada en Sprint 1).

---

## 5. Crear el esquema en Supabase

A diferencia del enfoque anterior con Prisma, ahora las tablas se crean directamente en Supabase. Hay dos formas:

### Opción A: SQL Editor del dashboard (recomendado para Sprint 1)

1. En el dashboard de Supabase, ir a **SQL Editor**.
2. Crear una nueva query y pegar el script de inicialización (se proveerá en `web/supabase/schema.sql` durante Sprint 1).
3. Click en **Run**.

### Opción B: Supabase CLI (Sprint 2+)

Cuando se necesite versionar migraciones en git, se introducirá el [Supabase CLI](https://supabase.com/docs/guides/cli) y la carpeta `web/supabase/migrations/`. Por ahora se mantiene manual para reducir herramientas.

---

## 6. Autenticación — Supabase Auth

En lugar del JWT custom + bcrypt anterior, se usa **Supabase Auth**:

- **Registro/Login:** `supabase.auth.signUp()`, `supabase.auth.signInWithPassword()` desde el cliente.
- **Sesión:** se persiste automáticamente en cookies HTTP-only por `@supabase/ssr` (ver `web/middleware.ts`).
- **Roles** (ADMIN, COORDINADOR, DOCENTE, ESTUDIANTE): se almacenan en una tabla `profiles` que extiende `auth.users` con un campo `role`. Las políticas RLS (Row Level Security) hacen cumplir los permisos a nivel de base de datos.

Estructura de archivos clave:

```
web/
├── app/                       # Rutas Next.js (App Router)
├── lib/
│   └── supabase/
│       ├── client.ts          # Cliente para Client Components
│       └── server.ts          # Cliente para Server Components / Route Handlers
├── middleware.ts              # Refresca la sesión de Supabase en cada request
├── .env.local                 # (gitignored)
└── .env.local.example
```

---

## 7. Próximos pasos por Sprint

### Sprint 1 — Base funcional

- [ ] Crear tabla `profiles` (id ref `auth.users`, name, role) con RLS habilitado
- [ ] Crear tablas `periods`, `courses`, `classrooms` con RLS
- [ ] **RF-01** — UI de CRUD para usuarios/cursos/aulas (Server Actions)
- [ ] **RF-02** — Páginas `/login`, `/register` usando Supabase Auth
- [ ] **RF-03** — Tabla `availability` + UI para registrarla
- [ ] **RF-13** — UI de gestión de períodos académicos
- [ ] Migrar componentes `shadcn/ui` desde `Frontend/src/components/ui/` a `web/components/ui/`
- [ ] Eliminar carpetas `Frontend/` y `Backend/` (rama dedicada, solo después de validar el nuevo stack)

### Sprint 2-3 — Motor CSP

- [ ] Desplegar microservicio FastAPI con OR-Tools (carpeta nueva `csp-service/`)
- [ ] Crear Route Handler `web/app/api/schedule/generate/route.ts` que llame al servicio
- [ ] **RF-07/RF-08/RF-09** — Generación, detección de conflictos, modificación manual
- [ ] **RF-10/RF-11** — Vista calendario y filtros

### Sprint 4 — Reportes y administración

- [ ] **RF-12** — Exportar horarios a PDF/Excel (Supabase Storage para los archivos)
- [ ] **RF-14** — Dashboards de ocupación de aulas y carga docente
- [ ] **RF-15** — Audit log inmutable con SHA-256 (tabla `audit_logs` append-only)

---

## 8. Troubleshooting

**Error `Invalid API key` o `Project not found`**
- Verificar que `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en `.env.local` no tengan espacios ni comillas erróneas.
- Reiniciar el servidor de desarrollo (`Ctrl+C` y `npm run dev` otra vez) — Next.js sólo lee `.env.local` al iniciar.

**Las páginas no reconocen la sesión tras login**
- Verificar que `web/middleware.ts` exista y esté en la **raíz de `web/`** (no dentro de `app/`).

**Proyecto Supabase pausado**
- Ir al dashboard y click en "Restore project". Toma ~1 minuto.

**Quiero ver/editar registros directamente**
- Dashboard de Supabase → **Table Editor** (UI tipo Excel para todas las tablas).

---

## 9. Decisiones de arquitectura registradas

- **Next.js + Supabase (no Express + Prisma):** Reemplazar el stack inicial por Next.js + Supabase reduce el número de tecnologías de ~7 a 3 (Next.js, Supabase, Tailwind/shadcn). Se elimina la complejidad de connection strings de PostgreSQL (pooler/IPv4/IPv6), CORS entre frontend y backend, JWT custom, bcrypt y migraciones de Prisma. Justificación principal: el equipo es de 6 estudiantes, varios aprendiendo, en Sprint 0 — minimizar superficie técnica acelera entregas.
- **Supabase Auth (no JWT custom):** El sistema de 4 roles (ADMIN, COORDINADOR, DOCENTE, ESTUDIANTE) se implementa con una tabla `profiles` + RLS, no con middleware Express.
- **csp-service diferido:** Excluido de Sprint 1. Se reactivará como microservicio FastAPI standalone en Sprint 2-3 cuando el equipo aborde RF-07. La integración será via un Route Handler de Next.js que actúa como proxy.
- **Carpetas `Frontend/` y `Backend/` mantenidas temporalmente:** Se conservan en `version-supabase` hasta validar que `web/` cubre todas las funcionalidades planeadas. Eliminar prematuramente sería destructivo.
