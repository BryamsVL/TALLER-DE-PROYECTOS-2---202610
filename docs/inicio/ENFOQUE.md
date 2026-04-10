## Entregable A — Selección del enfoque del proyecto

### 1. Enfoque metodológico: Scrum

El equipo adoptará Scrum como metodología de desarrollo ágil. La naturaleza del proyecto presenta requerimientos parcialmente definidos y susceptibles a cambios, múltiples interdependencias entre módulos y la necesidad de entregar valor de forma incremental. Estas características se alinean directamente con los principios de Scrum, el cual promueve iteraciones cortas, retroalimentación continua y adaptación constante durante el desarrollo.

| Criterio | Scrum (seleccionado) | Cascada (descartado) |
|----------|----------------------|----------------------|
| Requerimientos | Cambiantes e iterativos — alineado | Fijos desde el inicio — no aplica |
| Entrega de valor | Incremental por sprint | Al final del proyecto |
| Feedback | Continuo con stakeholders | Solo al final |
| Gestión de riesgos | Temprana por iteraciones | Tardía |
| Equipo pequeño (6) | Ideal para equipos de 3–9 | Adecuado para equipos grandes |

Los resultados muestran una tendencia hacia valores altos (4–5), lo que indica que el proyecto se ajusta mejor a un enfoque ágil/adaptativo. Por ello, se selecciona Scrum como metodología principal, permitiendo iteraciones, flexibilidad ante cambios y entrega incremental de valor.

---

### 2. Stack tecnológico seleccionado

> **Justificación de la selección:** El stack fue seleccionado priorizando tres criterios técnicos: (1) separación clara entre la API principal del sistema y el motor CSP especializado, permitiendo que cada componente use la tecnología más adecuada; (2) madurez del ecosistema para interfaces web modernas y lógica de negocio transaccional; (3) escalabilidad y rendimiento del motor de generación de horarios, considerando que una implementación manual en JavaScript no resulta suficiente para instancias grandes, por lo que se adopta un microservicio especializado con OR-Tools. Esta decisión permite mantener el sistema principal en Node.js y delegar la resolución de restricciones complejas a un servicio optimizado en Python.

| Capa | Tecnología seleccionada | Alternativa evaluada | Justificación de decisión |
|------|------------------------|----------------------|---------------------------|
| Frontend (SPA) | React 18 + TypeScript (Vite) | Vue 3 | Se selecciona React por su amplio ecosistema, compatibilidad con librerías especializadas como FullCalendar y el uso de TypeScript para reducir errores en aplicaciones complejas. |
| Backend (API REST) | Express + Node.js | FastAPI | Express permite mantener consistencia con el entorno JavaScript del frontend y facilita la integración general del sistema. |
| Microservicio CSP | FastAPI + OR-Tools | Backtracking en Node.js | Se descarta la implementación en JavaScript puro debido a limitaciones de rendimiento, optando por OR-Tools por su capacidad para resolver problemas CSP de mayor escala de forma eficiente. |
| Base de datos | PostgreSQL 16 | MySQL | PostgreSQL ofrece mayor robustez y mejor soporte para consultas complejas y estructuras de datos avanzadas. |
| ORM | Prisma | Sequelize | Prisma proporciona tipado nativo con TypeScript, lo que reduce errores y mejora la mantenibilidad del sistema. |
| Cache | node-cache | Redis | Se opta por node-cache por su simplicidad de implementación en memoria, suficiente para los requerimientos actuales del sistema. |
| Generación de reportes | PDFKit + ExcelJS | Librerías manuales de generación | Estas herramientas permiten generar documentos estructurados en PDF y Excel de forma eficiente y con menor complejidad de implementación. |
| Contenerización | Docker Compose | Despliegue manual | Docker Compose permite gestionar múltiples servicios de forma integrada, asegurando portabilidad y facilidad de despliegue. |
| Control de versiones / CI-CD | GitHub + GitHub Actions | GitLab CI | Se selecciona GitHub por su integración directa con el repositorio y facilidad para configurar flujos de integración continua. |
| Hosting | Railway / Render | VPS tradicional | Estas plataformas permiten un despliegue rápido y sencillo, sin necesidad de gestionar infraestructura manualmente. |
