# TP2 - Revision Integral de Calidad (SGOHA)

**Proyecto:** SGOHA - Sistema de Generacion Optima de Horarios Academicos  
**Stack real:** Next.js · TypeScript · Supabase/PostgreSQL · Prisma · Express · JWT  
**Documento:** Evidencia integral de la consigna *Revision de la calidad mediante SonarQube, OWASP Top 10 2025, WCAG y SUS*.

> Este documento resume lo editado y documentado en el repositorio para responder
> la consigna. Incluye configuracion, mitigaciones implementadas, auditorias base
> y pendientes operativos para cerrar evidencias.

---

## 0. Resumen ejecutivo


| Frente               | Estado  | Resultado actual                                                           |
| -------------------- | ------- | -------------------------------------------------------------------------- |
| SonarCloud           | Parcial | Configuracion y workflow listos; falta ejecucion real en GitHub/SonarCloud |
| OWASP Top 10 2025    | Parcial | Matriz inicial creada; mitigacion JWT aplicada y validada                  |
| WCAG                 | Parcial | Correcciones en login/registro; checklist inicial documentado              |
| SUS                  | Parcial | Instrumento, metodo de calculo y plantilla de aplicacion listos            |
| Tracking de consigna | Hecho   | Plan actualizado en `docs/consignas/actividades_consignaOWASP.md`          |


---

## 1. Artefactos agregados o actualizados

### 1.1 Documentacion de calidad

Se creo el directorio `docs/calidad/` con estos archivos:


| Archivo                            | Proposito                                                  |
| ---------------------------------- | ---------------------------------------------------------- |
| `docs/calidad/README.md`           | Indice de entregables de calidad                           |
| `docs/calidad/sonarcloud.md`       | Configuracion actual de SonarCloud y pendientes operativos |
| `docs/calidad/owasp-top10-2025.md` | Matriz inicial de riesgos y mitigaciones                   |
| `docs/calidad/wcag-auditoria.md`   | Auditoria base de accesibilidad                            |
| `docs/calidad/sus.md`              | Instrumento SUS, formula y plantilla                       |


Ademas:

- Se actualizo `docs/README.md` para enlazar la nueva seccion `calidad/`.
- Se reescribio `docs/consignas/actividades_consignaOWASP.md` para dejar el seguimiento en estado legible y actualizado.

### 1.2 Configuracion ya presente y verificada

Se verificaron como parte de la consigna:


| Archivo                            | Estado                                    |
| ---------------------------------- | ----------------------------------------- |
| `sonar-project.properties`         | Presente y apuntando a frontend + backend |
| `.github/workflows/sonarcloud.yml` | Presente para analisis automatico         |
| `backend/coverage/lcov.info`       | Presente                                  |
| `frontend/coverage/lcov.info`      | Presente                                  |


---

## 2. SonarCloud / SonarQube

### 2.1 Lo que ya quedo resuelto

- El proyecto tiene configuracion de analisis estatico multi-modulo.
- Se integran fuentes de `backend` y `frontend`.
- Se conectan reportes LCOV existentes.
- Se definieron exclusiones para `node_modules`, `.next`, `coverage`, migraciones y builds.
- Existe workflow de GitHub Actions para instalar dependencias, correr tests con cobertura y disparar el scan.

### 2.2 Archivos involucrados

- `sonar-project.properties`
- `.github/workflows/sonarcloud.yml`
- `docs/calidad/sonarcloud.md`

---

## 3. OWASP Top 10 2025

### 3.1 Matriz inicial de riesgos

Se documento una primera matriz alineada con OWASP Top 10 2025 en:

- `docs/calidad/owasp-top10-2025.md`

Hallazgos principales documentados:


| ID    | Categoria                             | Situacion                                                  |
| ----- | ------------------------------------- | ---------------------------------------------------------- |
| OW-01 | Broken Access Control                 | Uso de `assertAdminCaller()` y RLS como defensa principal  |
| OW-02 | Authentication Failures               | Validacion JWT endurecida en backend                       |
| OW-03 | Security Misconfiguration             | Falta cerrar organizacion/token de SonarCloud              |
| OW-04 | Cryptographic Failures                | `SERVICE_ROLE_KEY` confinada a cliente server-only         |
| OW-05 | Injection                             | Validacion con `zod.safeParse()` y persistencia con Prisma |
| OW-06 | Logging and Alerting Failures         | Falta trazabilidad centralizada de eventos de seguridad    |
| OW-07 | Mishandling of Exceptional Conditions | Manejo de errores aun sin estandar de observabilidad       |


### 3.2 Mitigacion implementada en codigo

Se modifico:

- `backend/src/middleware/auth.ts`
- `backend/src/middleware/auth.test.ts`

Cambios realizados:

- Se restringio `jwt.verify()` al algoritmo `HS256`.
- Se agrego `isAuthPayload()` para validar que el token decodificado tenga `userId` y `role` validos.
- Se rechazan tokens firmados pero con payload inesperado.
- Se agrego test especifico para token malformado.

### 3.3 Validacion ejecutada

Comando corrido:

```bash
cd backend
npm test -- src/middleware/auth.test.ts
```

Resultado:

- 1 archivo
- 8 pruebas
- 8/8 OK

---

## 4. WCAG / Accesibilidad

### 4.1 Pantallas intervenidas

- `frontend/app/login/page.tsx`
- `frontend/app/register/page.tsx`

### 4.2 Correcciones implementadas

Se mejoro accesibilidad de formularios con foco en:


| Ajuste               | Aplicacion                                |
| -------------------- | ----------------------------------------- |
| `aria-invalid`       | Campos con error de validacion            |
| `aria-describedby`   | Asociacion entre campo y mensaje de error |
| `role="alert"`       | Mensajes globales de error                |
| `aria-live="polite"` | Anuncio accesible de cambios de estado    |
| `aria-pressed`       | Botones para mostrar/ocultar contrasena   |
| `title`              | Apoyo adicional para controles iconicos   |


### 4.3 Hallazgos documentados

Se registraron en `docs/calidad/wcag-auditoria.md`:

- Error identification en login/registro
- Status messages no anunciados
- Name/Role/Value insuficiente en toggles de password

### 4.4 Validacion ejecutada

Se corrio la suite frontend:

```bash
cd frontend
npm test
```

Resultado:

- 4 suites
- 14 pruebas
- 14/14 OK

Observacion:

- Jest reporto un warning de teardown abierto. No rompe la suite, pero conviene revisarlo.

---

## 5. SUS

Se dejo lista la base documental para la evaluacion de usabilidad en:

- `docs/calidad/sus.md`

Incluye:

- Cuestionario SUS de 10 items
- Formula de calculo
- Umbral objetivo `> 68`
- Perfiles sugeridos de participantes
- Plantilla tabular para registrar resultados

Pendiente inevitable:

- Aplicacion con usuarios reales
- Carga de respuestas
- Calculo del puntaje final
- Interpretacion de aceptabilidad

---

## 6. Seguimiento de la consigna

Se actualizo el tracker en:

- `docs/consignas/actividades_consignaOWASP.md`

Estado reflejado ahi:

- Sonar: base tecnica lista
- OWASP: matriz y una mitigacion concreta implementadas
- WCAG: correcciones parciales aplicadas
- SUS: instrumento listo
- Testing: ya existente, falta captura de evidencias

---

## 7. Archivos editados en codigo


| Archivo                               | Tipo de cambio                                |
| ------------------------------------- | --------------------------------------------- |
| `backend/src/middleware/auth.ts`      | Endurecimiento de validacion JWT              |
| `backend/src/middleware/auth.test.ts` | Caso nuevo para token malformado              |
| `frontend/app/login/page.tsx`         | Mejoras WCAG en mensajes, errores y controles |
| `frontend/app/register/page.tsx`      | Mejoras WCAG en mensajes, errores y controles |


---

## 8. Conclusiones

Respecto a la consigna, el repositorio ya no esta en cero: quedo montada la base de calidad y se aplicaron cambios verificables en seguridad y accesibilidad.

Lo ya resuelto aporta evidencia tecnica concreta en cuatro niveles:

- configuracion reproducible para SonarCloud,
- matriz inicial OWASP con una mitigacion real implementada,
- mejoras WCAG sobre flujos criticos de autenticacion,
- instrumento SUS listo para aplicacion.

Lo que falta para cerrar completamente la entrega ya no es de definicion tecnica sino de ejecucion y captura:

1. correr SonarCloud real,
2. recolectar evidencias WCAG automatizadas/manuales,
3. aplicar SUS con participantes,
4. consolidar capturas y dashboards en el informe final.

