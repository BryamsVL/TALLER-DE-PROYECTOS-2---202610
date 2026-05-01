# SGOHA Frontend

Single Page Application (SPA) del Sistema de Generacion Optima de Horarios Academicos.

## Stack

- **React 19** + **TypeScript**
- **TanStack Start** (file-based routing, SSR ready)
- **Vite 7** (bundler/dev server)
- **Tailwind CSS v4**
- **shadcn/ui** + **Radix UI** (componentes accesibles)
- **react-hook-form** + **zod** (formularios y validacion)
- **TanStack Query** (estado servidor)

## Setup

```bash
cd Frontend
npm install
npm run dev
```

Abre http://localhost:5173

## Scripts disponibles

| Comando | Descripcion |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Build de produccion |
| `npm run build:dev` | Build con sourcemaps de desarrollo |
| `npm run preview` | Preview del build de produccion |
| `npm run lint` | ESLint sobre todo el proyecto |
| `npm run format` | Prettier --write |

## Estructura

```
src/
|-- router.tsx          # Configuracion del router
|-- routeTree.gen.ts    # Generado por TanStack Router (no editar)
|-- styles.css          # Tailwind base + variables shadcn
|-- routes/             # Rutas file-based
|   |-- __root.tsx      # Layout raiz
|   |-- index.tsx       # Dashboard
|   |-- login.tsx       # RF-02: Autenticacion
|   |-- enrollment.tsx  # RF-04/05/06: Matricula
|   |-- scheduler.tsx   # RF-07/08/09: Motor CSP UI
|   |-- calendar.tsx    # RF-10/11: Vista calendario
|   |-- audit.tsx       # RF-15: Logs
|   `-- ...
|-- components/
|   |-- layout/         # AppLayout, sidebars
|   `-- ui/             # Componentes shadcn
|-- hooks/              # Custom hooks
`-- lib/                # Utilidades (cn, etc.)
```

## Variables de entorno

El frontend consume el backend via `VITE_API_URL`. Crear `.env.local`:

```
VITE_API_URL=http://localhost:3001
```

## Convenciones

- **Imports**: usar alias `@/...` (configurado en `tsconfig.json` y `vite.config.ts`).
- **Componentes shadcn**: agregar via `npx shadcn@latest add <component>`.
- **Formato**: Prettier corre en pre-commit (configurar hook si aplica).
- **Tipos estrictos**: el `tsconfig.json` tiene `strict: true`.

## Requerimientos relacionados

| RF / RNF | Modulo |
|----------|--------|
| RF-02 | `routes/login.tsx` |
| RF-04, RF-05, RF-06 | `routes/enrollment.tsx` |
| RF-07, RF-08, RF-09 | `routes/scheduler.tsx` |
| RF-10, RF-11 | `routes/calendar.tsx` |
| RF-12, RF-14 | `routes/reports.tsx` |
| RF-15 | `routes/audit.tsx` |
| RNF-03 (WCAG 2.1 AA) | shadcn/ui + Radix |
| RNF-08 (Chrome/Firefox/Edge) | configuracion Vite |
