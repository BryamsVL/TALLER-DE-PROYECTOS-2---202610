# TP2 — Desarrollo web responsable y reducción del impacto ambiental

**Proyecto:** SGOHA (Sistema de Generación Óptima de Horarios Académicos)
**Stack real:** Next.js (App Router) + Supabase/PostgreSQL (Prisma) + Express + microservicio Python CSP (OR-Tools)
**Autor:** Alberto Reynoso
**Fecha:** 2026-05-29

> **Nota de adaptación:** La consigna asume stack MERN (MongoDB). Este proyecto usa
> PostgreSQL vía Prisma/Supabase. Las técnicas de optimización de la rúbrica
> (paginación, caché, compresión, lazy loading, optimización de consultas y APIs)
> se aplican igual; se reemplaza "consultas MongoDB" por "consultas Prisma/Postgres".

---

## 1. Análisis del impacto ambiental del software

> **Meta rúbrica (3 pts):** ≥5 impactos relevantes ligados al proyecto + justificación técnica.

Impactos asociados al desarrollo, despliegue y uso de aplicaciones web, aplicados a SGOHA:

| # | Fase | Impacto ambiental | Justificación técnica (cómo aplica a SGOHA) |
|---|------|-------------------|---------------------------------------------|
| 1 | Uso | Consumo energético por consultas DB ineficientes | _[completar: ej. queries sin índices, N+1 en listados de cursos/profesores]_ |
| 2 | Uso | Transferencia de datos excesiva (payloads grandes) | _[completar: ej. listados sin paginación, columnas innecesarias en select]_ |
| 3 | Despliegue | Huella de cómputo del microservicio CSP | _[completar: solver OR-Tools con 161 cursos, segundos de CPU por corrida]_ |
| 4 | Uso | Peso de assets front (imágenes, JS sin lazy load) | _[completar: bundle Next.js, imágenes sin comprimir]_ |
| 5 | Desarrollo | Dependencias innecesarias (build/CI más pesado) | _[completar: paquetes sin uso en package.json]_ |
| 6 | Uso | Solicitudes HTTP redundantes / sin caché | _[completar: refetch en cada navegación]_ |

**Análisis crítico:** _[redactar 1–2 párrafos relacionando los impactos con métricas medibles: kWh, gCO₂, MB transferidos, ms de respuesta]_

---

## 2. Identificación de oportunidades de mejora

> **Meta rúbrica (3 pts):** ≥3 oportunidades justificadas con criterios de rendimiento y sostenibilidad.

| # | Componente / módulo | Oportunidad detectada | Justificación |
|---|---------------------|-----------------------|---------------|
| 1 | _[ej. listado admin de cursos/profesores]_ | Paginación de datos | _[reduce payload y carga DB]_ |
| 2 | _[ej. consultas Prisma en server actions]_ | Optimización de consultas (índices, select) | _[menos CPU/IO en Postgres]_ |
| 3 | _[ej. assets front]_ | Compresión imágenes + lazy loading | _[menos transferencia y render]_ |
| 4 | _[ej. APIs Express del backend]_ | Compresión gzip + caché de respuestas | _[menos ancho de banda]_ |

---

## 3. Implementación de mejoras

> **Meta rúbrica (3 pts):** ≥3 mejoras funcionales integradas + extras no solicitadas.

Marca lo implementado. Cada mejora debe enlazar a su commit.

- [ ] **3.1 Optimización de consultas (Prisma/Postgres)** — índices, `select` específico, evitar N+1 · commit: `____`
- [ ] **3.2 Paginación de datos** — listados admin con `take`/`skip` o cursor · commit: `____` _(diferido — ver Resultados)_
- [x] **3.3 Compresión de imágenes** — `images.formats: [AVIF, WebP]` en `next.config.ts` · `Frontend/next.config.ts`
- [ ] **3.4 Lazy loading** — `next/dynamic`, carga diferida de componentes pesados · commit: `____` _(no aplicable hoy — ver Resultados)_
- [x] **3.5 Eliminación de dependencias innecesarias** — removido `recharts` (0 imports) → 36 paquetes menos · `Frontend/package.json`
- [ ] **3.6 Reducción de solicitudes HTTP** — batch, evitar refetch, RSC · commit: `____`
- [x] **3.7 Caché de recursos** — `Cache-Control: immutable` 1 año en `/_next/static` · `Frontend/next.config.ts`
- [x] **3.8 Optimización de APIs Express** — middleware `compression()` (gzip) · `Backend/src/index.ts`

**Detalle por mejora:** _[para cada una: archivo tocado, qué cambió, antes/después de código]_

---

## 4. Validación de resultados (antes / después)

> **Meta rúbrica (3 pts):** comparación cuantitativa + capturas + herramienta (Lighthouse / CO2.js / GreenFrame).

### 4.1 Métricas Lighthouse

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| Performance score | | | |
| LCP (s) | | | |
| Total Blocking Time (ms) | | | |
| Peso transferido (KB) | | | |
| Nº solicitudes HTTP | | | |

### 4.2 Huella de carbono (CO2.js / GreenFrame)

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| gCO₂ por carga de página | | | |
| Bytes transferidos | | | |

### 4.3 Backend / DB

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| Tiempo de respuesta API (ms) | | | |
| Tiempo de query (ms) | | | |
| Tamaño de respuesta (KB) | | | |

> Insertar capturas en `docs/consignas/evidencias/` y referenciarlas: `![antes](evidencias/lighthouse-antes.png)`

---

## 5. Contribución a la sostenibilidad

> **Meta rúbrica (3 pts):** beneficios con indicadores medibles ligados a eficiencia/consumo.

_[Redactar: cuánto se redujo el consumo de recursos (transferencia, CPU, energía estimada),
relacionando los números de la sección 4 con sostenibilidad y eficiencia energética.]_

---

## 6. Gestión del repositorio GitHub

> **Meta rúbrica (3 pts):** commits relevantes + trazabilidad completa.

- Rama de trabajo: `____`
- Commits clave (uno por mejora, mensajes descriptivos): _[listar hashes]_
- PR: `____`

---

## 7. Cumplimiento de actividades y recursos

- [ ] Escuchar audio: *El_costo_físico_del_mundo_digital.m4a*
- [ ] Ver video: *Viaje_Full-Stack_Sostenible.mp4*
- [ ] Revisar infografía: *Sostenibilidad y eficiencia web móvil.png*
- [ ] Revisar diapositivas: *Green_MERN_Engineering.pptx*
- [ ] **Responder encuesta estudiantil** (NotebookLM 2026) — adjuntar captura

---

## Checklist final de entrega

- [ ] ≥5 impactos analizados (§1)
- [ ] ≥3 oportunidades justificadas (§2)
- [ ] ≥3 mejoras implementadas y funcionando (§3)
- [ ] Métricas antes/después con herramienta (§4)
- [ ] Beneficios explicados con indicadores (§5)
- [ ] Repo actualizado con commits trazables (§6)
- [ ] Encuesta respondida (§7)

---

## Resultados de implementación — 2026-05-29

Mejoras de sostenibilidad aplicadas en esta iteración. Todas verificadas a nivel de
compilación (`tsc --noEmit` del backend limpio; lockfile del frontend sincronizado).

### Mejoras aplicadas

| # | Técnica (rúbrica) | Cambio | Archivo | Impacto esperado |
|---|-------------------|--------|---------|------------------|
| 1 | Optimización de APIs Express | Middleware `compression()` (gzip) sobre todas las respuestas | `Backend/src/index.ts` | Menos bytes en payloads JSON (el horario del solver puede pesar cientos de KB → ~70–80 % menos al comprimir texto) |
| 2 | Compresión de imágenes | `images.formats: ["image/avif", "image/webp"]` | `Frontend/next.config.ts` | AVIF/WebP pesan ~30–50 % menos que JPEG/PNG; menos transferencia y energía de red |
| 3 | Reducción de JS / bundle | `experimental.optimizePackageImports` para 8 paquetes Radix UI | `Frontend/next.config.ts` | Tree-shaking de barrels → menos JS al cliente |
| 4 | Caché de recursos | `Cache-Control: public, max-age=31536000, immutable` en `/_next/static` | `Frontend/next.config.ts` | Assets con hash no se re-descargan entre visitas |
| 5 | Eliminación de dependencias | Removido `recharts` (0 imports en el código) | `Frontend/package.json` | **36 paquetes** eliminados de `node_modules` y lockfile (`npm prune`) → build/CI más ligero |

> Nota técnica: se añadió `Backend/src/types/compression.d.ts` (declaración de tipos local)
> porque el registro npm rechazó `@types/compression` (ECONNRESET repetido). Si más
> adelante se instala el paquete oficial de tipos, ese archivo puede borrarse.

### Evidencia ya verificable

- `recharts` y 35 dependencias transitivas eliminadas (`npm prune` → "removed 36 packages").
- `recharts` ya no aparece en `package.json`, `package-lock.json` ni `node_modules/`.
- Backend compila sin errores tras añadir `compression`.

### Cómo medir el antes/después (pendiente de ejecutar por el alumno)

1. **Tamaño de respuesta API (compresión Express):**
   ```bash
   # Antes: revertir el commit de compression y medir
   curl -s -H "Accept-Encoding: gzip" -o /dev/null -w "%{size_download} bytes\n" \
     http://localhost:3001/api/v1/solver/...
   # Comparar con / sin "Accept-Encoding: gzip"
   ```
2. **Lighthouse (frontend):** `npx lighthouse http://localhost:3000 --view`
   anotar Performance, LCP, TBT, "Total Byte Weight" antes y después.
3. **Bundle JS:** comparar la salida de `next build` (columna "First Load JS") antes/después
   de `optimizePackageImports`.
4. **Huella de carbono:** CO2.js o GreenFrame sobre la URL desplegada.

Rellenar las tablas de §4 con estos números y adjuntar capturas en `docs/consignas/evidencias/`.

### Mejoras diferidas (y por qué)

- **3.2 Paginación:** las tablas de admin (usuarios, cursos, profesores) hacen búsqueda y
  filtrado en cliente sobre la lista completa. Paginar en servidor exige rediseñar esos
  componentes y mover búsqueda/orden al servidor; se difiere para no romper la UX actual.
  Es la mejora de mayor impacto en consumo de DB y debería priorizarse en la siguiente iteración.
- **3.4 Lazy loading:** `ExportHorarioButtons` son solo enlaces; `exceljs`/`pdf-lib` ya viven
  en el route handler `/api/horario/export` (servidor), así que no pesan en el bundle del
  cliente. No hay hoy un componente cliente pesado que justifique `next/dynamic`.
- **3.1 Optimización de consultas:** las server actions ya usan `select` específico; mejora
  fina (índices Prisma, `groupBy` en lugar de traer filas para contar) pendiente de medición.
