# Arquitectura del Sistema — Estándar ARC42
**Sistema de Generación Óptima de Horarios Académicos (SGOHA)**  
Universidad Continental — Ciclo 2026-I

---

## 1. Introducción y Metas
Describe los objetivos del sistema y las metas de calidad.

- **Visión:** El SGOHA es una aplicación web inteligente que genera automáticamente horarios válidos y sin conflictos para coordinadores, docentes y estudiantes de la Universidad Continental bajo un currículo flexible.
- **Problema Real:** [Documento inicial del problema — primer borrador](https://github.com/BryamsVL/TALLER-DE-PROYECTOS-2---202610) *(Entregable G del Sprint 0)*

---

## 2. Restricciones de Arquitectura
Limitaciones de diseño, técnicas o de negocio validadas con stakeholders.

- **Restricciones:** [Registro de Supuestos y Restricciones](https://github.com/BryamsVL/TALLER-DE-PROYECTOS-2---202610) *(Entregable D del Sprint 0)*

---

## 3. Contexto y Alcance
Delimitación de las fronteras operativas y de negocio.

- **Alcance y Metas:** [Project Charter](https://github.com/BryamsVL/TALLER-DE-PROYECTOS-2---202610) *(Entregable C del Sprint 0)*
- **Dentro del alcance:** Registro de entidades, validación de matrícula, motor CSP, visualización interactiva, exportación PDF/Excel, autenticación por roles y auditoría.
- **Fuera del alcance:** Integración con ERP externos, app móvil nativa, módulo de pagos, soporte multilenguaje.

---

## 4. Estrategia de Solución
Decisiones tecnológicas fundamentales y justificaciones.

- **Justificación Técnica:** [Documento de Selección del Enfoque](https://github.com/BryamsVL/TALLER-DE-PROYECTOS-2---202610) *(Entregable A del Sprint 0)*

| Capa | Tecnología seleccionada | Alternativa descartada |
|---|---|---|
| Frontend (SPA) | React 18 + TypeScript (Vite) | Vue 3 |
| Backend (API REST) | Express + Node.js | FastAPI |
| Microservicio CSP | FastAPI + OR-Tools | Backtracking en Node.js |
| Base de datos | PostgreSQL 16 | MySQL |
| ORM | Prisma | Sequelize |
| Caché | node-cache | Redis |
| Reportes | PDFKit + ExcelJS | Librerías manuales |
| Contenerización | Docker Compose | Despliegue manual |
| CI/CD | GitHub + GitHub Actions | GitLab CI |
| Hosting | Railway / Render | VPS tradicional |

---

## 5. Vista de Bloques
Descomposición lógica en módulos principales.

- **Frontend:** React 18 + TypeScript — SPA con vistas de calendario, formularios de registro, matrícula e integración con API REST. *(Responsable: Bryams Vilchez)*
- **Backend / API REST:** Express + Node.js — autenticación JWT, registro de entidades, validaciones de matrícula. *(Responsable: Andre De La Torre)*
- **Microservicio CSP:** FastAPI + OR-Tools — motor de satisfacción de restricciones para generación de horarios. *(Responsable: Brianna Cortez)*
- **Base de datos:** PostgreSQL 16 con ORM Prisma.
- **DevOps:** Docker Compose + GitHub Actions. *(Responsable: Jack Perez)*

> 📌 *El detalle de componentes internos se desarrollará en el Sprint 1.*

---

## 6. Vista de Ejecución
Interacción entre los bloques en tiempo de ejecución.

- **TBD:** Se definirá mediante diagramas de secuencia en el Sprint 1, incluyendo el flujo de generación de horario (coordinador → API REST → microservicio CSP → PostgreSQL → respuesta visual).

---

## 7. Vista de Despliegue
Infraestructura de hardware y software.

- **Frontend:** Vercel (tier gratuito)
- **Backend / API REST:** Render o Railway (tier gratuito)
- **Microservicio CSP:** Render (contenedor Docker)
- **Base de datos:** PostgreSQL en Railway o Render
- **Orquestación local:** Docker Compose
- **Requisito mínimo:** Servidor con al menos 4 GB RAM y acceso a internet *(Supuesto S6)*

> 📌 *Documentación detallada de despliegue en etapa de pruebas (Sprint 3–4).*

---

## 8. Conceptos Transversales
Reglas de negocio y arquitecturales de aplicación global.

- **Seguridad:** JWT con expiración de 8 h, HTTPS obligatorio, bcrypt (cost factor ≥ 12), datos sensibles enmascarados en logs. Cumplimiento OWASP Top 10 (2021).
- **Privacidad:** Cumplimiento Ley N.° 29733 (Protección de Datos Personales del Perú) — consentimiento explícito, política de privacidad visible, eliminación de datos a solicitud.
- **Manejo de Errores:** Toda la API retorna códigos HTTP estándar con mensaje descriptivo, sin exponer stack traces.
- **Logging / Auditoría:** Log inmutable de acciones críticas con usuario, timestamp ISO 8601 e integridad verificable mediante hash SHA-256.
- **Green Software:** Caché node-cache (TTL 24 h) para reducir ejecuciones CSP en ≥ 40%, lazy loading en frontend, early exit en el algoritmo CSP.
- **Accesibilidad:** WCAG 2.1 nivel AA verificado con axe-core.

---

## 9. Decisiones de Arquitectura (ADR)

- **ADR-01:** Separación del motor CSP en microservicio independiente (FastAPI + OR-Tools) para no limitar el rendimiento del backend principal en Node.js.
- **ADR-02:** Uso de PostgreSQL sobre MySQL por mayor robustez en consultas complejas y estructuras de datos avanzadas.
- **ADR-03:** Prisma como ORM por tipado nativo con TypeScript, reduciendo errores y mejorando mantenibilidad.
- **ADR-04:** node-cache sobre Redis por simplicidad de implementación, suficiente para los requerimientos actuales.
- **ADR-05:** Metodología Scrum — iteraciones cortas de 2–4 semanas con retroalimentación continua, alineada con requerimientos cambiantes.

---

## 10. Requerimientos de Calidad
Atributos de calidad formulados bajo el enfoque SMART.

- **Calidad de Software:** [Lista de RF y RNF](https://github.com/BryamsVL/TALLER-DE-PROYECTOS-2---202610) *(Entregable H del Sprint 0)*
- Estándar aplicado: **ISO/IEC 25010** — rendimiento, escalabilidad, usabilidad, seguridad, mantenibilidad, fiabilidad, portabilidad y eficiencia energética.

---

## 11. Riesgos y Deuda Técnica

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| El CSP no converge en tiempo aceptable para instancias grandes | Media | Alto | Limitar a 50 cursos; timeout con solución parcial; heurísticas MRV y AC3 |
| Distribución desigual del trabajo entre los 6 integrantes | Alta | Medio | Responsabilidades claras por módulo; daily standups asíncronos |
| Requerimientos ambiguos o cambiantes | Alta | Medio | Supuestos documentados; revisión al inicio de cada sprint |
| Curva de aprendizaje en OR-Tools o FastAPI | Media | Medio | Prototipos técnicos de prueba de concepto en Sprint 0 |
| Dificultad para integrar React con FastAPI | Baja | Medio | Contratos OpenAPI/Swagger previos; CORS configurado desde el inicio |

---

## 12. Glosario

| Término | Definición |
|---|---|
| CSP | Constraint Satisfaction Problem — modelo formal de satisfacción de restricciones usado para generar horarios |
| UTP | University Timetabling Problem — problema NP-completo de asignación de horarios universitarios |
| OR-Tools | Librería de Google para resolución de problemas de optimización y CSP |
| SPA | Single Page Application — arquitectura de frontend con React |
| JWT | JSON Web Token — mecanismo de autenticación sin estado |
| Restricción dura | Condición que no puede violarse (ej: un docente no puede estar en dos aulas al mismo tiempo) |
| Restricción blanda | Condición preferible pero no obligatoria (ej: preferencia de horario del estudiante) |
| SGOHA | Sistema de Generación Óptima de Horarios Académicos |
| MVP | Minimum Viable Product — versión mínima funcional del sistema |
| TTL | Time To Live — tiempo de vida de un elemento en caché |

> 📌 *Glosario en construcción — se ampliará en sprints posteriores.*

---

*Documentación completa siguiendo el estándar arc42 para el Proyecto SGOHA — PFA-TP2-2026-01 — Universidad Continental, Huancayo, Perú — 2026.*
