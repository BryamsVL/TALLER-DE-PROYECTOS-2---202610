# Actividades - Consigna TP2: Revision de Calidad (SonarQube · OWASP Top 10 2025 · WCAG · SUS · Testing)

> Plan de trabajo y seguimiento para la consigna de aseguramiento de calidad.
> Stack real del proyecto: **Next.js (frontend) + Supabase + backend Node/TS**.
> Fuente: `TP_2 Consigna revision de la calidad mediante SonarQube - OWASP Top 10 2025 - WCAG - SUS.md`

---

## 0. Diagnostico inicial (estado del repo)

| Frente | Pide la consigna | Estado | Falta |
|---|---|---|---|
| **6.5 Testing** | Unit, integracion, E2E, cobertura | Hecho | Capturar evidencia (coverage HTML, videos Cypress) |
| **6.1 SonarQube** | Instalar, integrar GitHub, analisis estatico, metricas antes/despues, reducir deuda | Parcial | Ejecutar analisis en SonarCloud y capturar dashboards |
| **6.2 OWASP Top 10 2025** | Auditoria seguridad, matriz vulnerabilidades, mitigaciones, riesgo residual | Parcial | Completar evidencias y ampliar auditoria |
| **6.3 WCAG** | Contraste, teclado, semantica, lectores pantalla, formularios, checklist | Parcial | Auditoria automatica/manual completa y capturas |
| **6.4 SUS** | Encuesta usabilidad, participantes, puntaje, interpretacion | Parcial | Aplicacion con usuarios reales y calculo final |
| **7 Entregables** | Repo publico, informe integral, evidencias, presentacion | Parcial | Informe integral + presentacion |

Pesos de rubrica: Repositorio (2) · Informe integral (4) · Evidencias verificables (2) · Presentacion/demo (8) · Dominio tecnico en defensa.

---

## Camino critico (orden de ejecucion)

1. **SUS** - empezar ya: depende de participantes reales.
2. **SonarQube** - base de metricas, alimenta OWASP.
3. **WCAG** y **OWASP** - cerrar auditoria y evidencias.
4. **Informe integral + presentacion** - consolidacion final.

---

## 6.1 - SonarQube

- [x] Elegir despliegue: SonarCloud.
- [x] Crear `sonar-project.properties` (frontend + backend, rutas de cobertura LCOV).
- [x] Conectar repo GitHub / configurar analisis automatico (GitHub Action).
- [ ] Correr analisis inicial -> captura dashboard ANTES.
- [x] Conectar reportes LCOV existentes (Backend + Frontend) a Sonar.
- [ ] Analizar metricas: Bugs, Vulnerabilities, Code Smells, Duplicacion, Maintainability/Reliability/Security Rating, Technical Debt, Cobertura.
- [ ] Identificar componentes criticos y justificar problemas.
- [ ] Corregir issues priorizados -> captura dashboard DESPUES.
- [~] Evidencias: capturas antes/despues, reporte tecnico, evidencia de reduccion de deuda tecnica.

## 6.2 - OWASP Top 10 2025

- [x] Matriz de vulnerabilidades: ID, categoria OWASP, descripcion, riesgo, impacto, mitigacion, riesgo residual.
- [ ] Auditar: autenticacion, autorizacion, manejo de sesiones, sanitizacion de entradas, proteccion ataques comunes.
- [ ] Foco stack: RLS de Supabase, validacion de inputs, manejo de tokens/JWT, exposicion de claves.
- [x] Implementar mitigaciones con evidencia funcional.
- [x] Prueba de validacion por cada mitigacion.
- [~] Evidencias: matriz, evidencia de mitigacion, pruebas, capturas, analisis de riesgo residual.

## 6.3 - WCAG

- [ ] Auditoria automatica: Lighthouse + axe-core (via navegador / Playwright).
- [ ] Validacion manual: navegacion por teclado, inspeccion DOM, lectores de pantalla.
- [x] Checklist WCAG: contraste, semantica HTML, etiquetas/labels, formularios, multimedia, ARIA.
- [~] Listar incumplimientos -> corregir -> recapturar.
- [~] Evidencias: reportes automaticos, checklist WCAG, capturas, listado de incumplimientos, evidencia de correcciones.

## 6.4 - SUS (System Usability Scale)

- [x] Diseñar formulario SUS estandar (10 items, escala 1-5).
- [ ] Seleccionar participantes (minimo 5 recomendado).
- [ ] Aplicacion controlada + recoleccion de datos.
- [ ] Calcular puntaje SUS (0-100). Requisito minimo: interpretacion positiva (>68).
- [ ] Interpretar: aceptabilidad, facilidad de uso, oportunidades de mejora.
- [~] Evidencias: formulario aplicado, base de resultados, calculo, interpretacion, propuesta de mejoras.

## 6.5 - Testing (implementado - falta capturar evidencia)

- [x] Pruebas unitarias, integracion, E2E (Cypress), cobertura.
- [ ] Captura terminal `test:cov` (Backend + Frontend).
- [ ] Captura reportes HTML/LCOV de cobertura abiertos en navegador.
- [ ] Videos Cypress (17/17).

## 7 - Entregables

- [ ] Repositorio GitHub publico, ramas organizadas, historial limpio.
- [ ] Informe tecnico integral (SonarQube + OWASP + WCAG + SUS + testing).
- [ ] Evidencias tecnicas (capturas, dashboards) adjuntas al informe.
- [ ] Presentacion tecnica profesional (demo funcional + hallazgos + metricas).

---

## Registro de avance

| Fecha | Frente | Accion | Resultado |
|---|---|---|---|
| 2026-06-12 | Plan | Creado este documento; diagnostico inicial | Base del plan |
| 2026-06-12 | Sonar | Verificados `sonar-project.properties` y workflow `.github/workflows/sonarcloud.yml` | Base lista; falta ejecucion en GitHub/SonarCloud |
| 2026-06-12 | OWASP | Creada matriz inicial y endurecida la validacion JWT en backend | Mitigacion implementada + test agregado |
| 2026-06-12 | WCAG | Corregidos mensajes de error y estado accesible en login/registro | Mejora aplicada; falta auditoria automatica/manual completa |
| 2026-06-12 | SUS | Documentado instrumento, calculo y plantilla de participantes | Base lista para aplicacion |
