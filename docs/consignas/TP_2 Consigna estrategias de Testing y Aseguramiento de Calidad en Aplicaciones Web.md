![][image1]  
**Taller de proyectos 2 – Ingeniería de Sistemas e Informática** 

**CONSIGNA ESTRATEGIAS DE TESTING Y ASEGURAMIENTO DE CALIDAD  EN APLICACIONES WEB** 

**1\. Objetivo general** 

Diseñar, implementar y validar una estrategia integral de pruebas automatizadas para una aplicación  Web Full Stack basada en arquitectura MERN, aplicando herramientas modernas de testing,  aseguramiento de calidad y análisis de cobertura, con el propósito de garantizar la confiabilidad,  mantenibilidad y estabilidad funcional del sistema. 

1.1. Implementación de Pruebas Unitarias 

Validar el comportamiento aislado de funciones, módulos y lógica de negocio. 

a. Actividades Obligatorias 

El equipo deberá: 

1º Implementar pruebas unitarias sobre servicios, controladores y utilitarios. 

2º Validar reglas de negocio y operaciones críticas. 

3º Implementar mocks, stubs o spies cuando corresponda. 

4º Verificar manejo de excepciones y errores. 

5º Validar respuestas esperadas y comportamientos límite. 

b. Herramientas Obligatorias 

| Área  | Herramienta |
| ----- | ----- |
| Frontend  | Jest \+ React Testing Library |
| Backend  | Jest o Vitest |

c. Evidencias Requeridas 

1º Código fuente de pruebas unitarias. 

2º Reportes de ejecución. 

3º Logs de pruebas. 

4º Evidencia de pruebas exitosas y fallidas. 

5º Capturas de terminal o consola. 

1.2. Implementación de Pruebas de Componentes React 

Verificar comportamiento funcional y visual de componentes React. 

a. Actividades Obligatorias 

El equipo deberá: 

1º Validar renderizado de componentes. 

2º Verificar interacción mediante eventos. 

3º Comprobar actualización de estados. 

4º Validar renderizado condicional. 

5º Probar formularios y validaciones. 

6º Simular dependencias externas. 

b. Herramientas Obligatorias

1/9   
![][image2]  
**Taller de proyectos 2 – Ingeniería de Sistemas e Informática** 

| Tipo  | Herramienta |
| ----- | ----- |
| Component Testing  | React Testing Library |
| Mocking API  | MSW |

c. Escenarios Obligatorios 

1º Componentes con carga asincrónica. 

2º Formularios con validaciones. 

3º Estados de error. 

4º Estados vacíos. 

5º Estados de carga. 

d. Evidencias Requeridas 

1º Código de pruebas. 

2º Capturas de ejecución. 

3º Logs generados. 

4º Reportes de pruebas. 

1.3. Implementación de Pruebas de Integración 

Validar integración entre módulos, APIs y persistencia de datos. a. Actividades Obligatorias 

El equipo deberá: 

1º Verificar endpoints REST. 

2º Validar operaciones CRUD. 

3º Probar autenticación y autorización. 

4º Verificar códigos HTTP. 

5º Validar respuestas JSON. 

6º Comprobar persistencia en base de datos. 

7º Validar manejo de errores y excepciones. 

b. Herramientas Obligatorias 

| Tipo  | Herramienta |
| ----- | ----- |
| Integración API  | Supertest |
| Integración Frontend  | RTL \+ MSW |

c. Escenarios Obligatorios 

1º Peticiones válidas. 

2º Peticiones inválidas. 

3º Acceso no autorizado. 

4º Datos inconsistentes. 

5º Manejo de errores del servidor. 

d. Evidencias Requeridas

2/9   
![][image3]  
**Taller de proyectos 2 – Ingeniería de Sistemas e Informática** 

1º Scripts de pruebas. 

2º Resultados de ejecución. 

3º Logs de API. 

4º Reportes generados. 

1.4. Implementación de Pruebas de Aceptación 

Validar requisitos funcionales desde la perspectiva del usuario. 

a. Actividades Obligatorias 

El equipo deberá: 

1º Automatizar escenarios funcionales completos. 

2º Verificar reglas de negocio críticas. 

3º Validar flujos funcionales principales. 

4º Simular interacción real del usuario. 

5º Validar formularios, navegación y respuestas del sistema. 

b. Herramienta Obligatoria 

| Tipo  | Herramienta |
| :---- | :---- |
| Aceptación  | Cypress |

c. Escenarios Obligatorios 

1º Registro e inicio de sesión. 

2º Gestión de datos. 

3º Navegación funcional. 

4º Manejo de errores. 

5º Validaciones funcionales. 

d. Evidencias Requeridas 

1º Videos automáticos generados por Cypress. 

2º Capturas automáticas. 

3º Logs de ejecución. 

4º Resultados exportados. 

1.5. Implementación de Pruebas End-to-End (E2E) 

Validar flujos completos del sistema bajo escenarios reales de operación. 

a. Actividades Obligatorias 

1º El equipo deberá implementar pruebas E2E utilizando Playwright o cypress que incluyan: 2º Golden Path. Validación del flujo principal y crítico del negocio sin errores. 

3º Happy Path. Validación de escenarios exitosos esperados. 

4º Unhappy Path. Validación de errores, restricciones y fallos controlados. 

b. Herramienta Obligatoria

| Tipo  | Herramienta |
| :---: | :---: |

3/9   
![][image4]  
**Taller de proyectos 2 – Ingeniería de Sistemas e Informática** 

| Tipo  | Herramienta |
| ----- | ----- |
| E2E  | Playwright o Cypress |

c. Escenarios Obligatorios 

1º Navegación completa del sistema. 

2º Persistencia de información. 

3º Validaciones de seguridad. 

4º Manejo de errores. 

5º Recuperación ante fallos. 

6º Interacción multiusuario cuando aplique. 

d. Evidencias Requeridas 

1º Videos de ejecución. 

2º Capturas automáticas. 

3º Logs. 

4º Reportes E2E. 

5º Evidencia de escenarios exitosos y fallidos. 

1.6. Análisis de Cobertura y Calidad del Software 

Evaluar cuantitativamente la calidad y confiabilidad del sistema. 

a. Actividades Obligatorias 

El equipo deberá: 

1º Generar reportes de cobertura. 

2º Analizar módulos cubiertos y no cubiertos. 

3º Identificar componentes críticos sin validación. 

4º Justificar exclusiones de cobertura. 

5º Analizar riesgos asociados. 

6º Identificar defectos encontrados. 

b. Requisitos Mínimos 

| Métrica  | Valor mínimo |
| ----- | ----- |
| Cobertura global  | 70% |
| Cobertura lógica crítica  | 85% |

c. Evidencias Requeridas 

1º Reportes HTML o LCOV. 

2º Capturas de cobertura. 

3º Análisis técnico documentado. 

4º Justificación de exclusiones. 

**2\. Herramientas Obligatorias**

| Tipo de prueba  | Herramienta |
| :---: | :---: |

4/9   
![][image5]  
**Taller de proyectos 2 – Ingeniería de Sistemas e Informática** 

| Tipo de prueba  | Herramienta |
| ----- | ----- |
| Unitarias Frontend  | Jest \+ React Testing Library |
| Unitarias Backend  | Jest o Vitest |
| Integración API  | Supertest |
| Integración Frontend  | RTL \+ MSW |
| Aceptación  | Cypress |
| E2E  | Playwright o Cypress |

**3\. Requisitos de Repositorio** 

El repositorio GitHub deberá: 

a. Mantener estructura organizada. 

b. Utilizar ramas de desarrollo. 

c. Incorporar commits descriptivos. 

d. Mantener separación clara entre código fuente y pruebas. e. Incluir README técnico. 

f. Incorporar instrucciones de ejecución.

5/9   
![][image6]  
**Taller de proyectos 2 – Ingeniería de Sistemas e Informática** 

**Rúbrica de evaluación \- estrategias de testing y aseguramiento de calidad en aplicaciones web** 

| Criterio / Indicador  | Sobresaliente (3)  | Suficiente (2)  | En desarrollo (1)  | Insatisfactorio (0) |
| :---- | :---- | :---- | :---- | ----- |
| **Implementación de pruebas  unitarias sobre servicios,   controladores y utilitarios;  validación de reglas de negocio,  manejo de excepciones, mocks,  stubs, spies y casos límite.** | Implementa pruebas unitarias  completas y organizadas; cubre  lógica crítica, excepciones y casos  límite; utiliza correctamente mocks,  stubs y spies; evidencia ejecución  exitosa y aporta casos adicionales  relevantes. | Implementa pruebas   unitarias funcionales sobre  componentes principales;  valida reglas críticas y  manejo básico de errores  sin fallos graves. | Las pruebas unitarias son  parciales, incompletas o  con errores; cobertura  limitada de lógica y manejo deficiente de excepciones. | No implementa   pruebas unitarias o  presentan errores   críticos que impiden su  ejecución. |
| **Uso correcto de herramientas  obligatorias para pruebas  unitarias; integración adecuada  de Jest, React Testing Library,  Jest o Vitest según frontend y  backend.** | Configura e integra correctamente  todas las herramientas requeridas;  automatiza ejecución y mantiene  estructura profesional del entorno de testing. | Utiliza las herramientas  obligatorias con   configuración funcional  básica. | Configuración incompleta  o con errores recurrentes;  integración parcial de  herramientas. | No utiliza las   herramientas   requeridas o la   configuración es   inoperante. |
| **Evidencias de pruebas unitarias; código fuente, logs, reportes,  capturas de consola y pruebas  exitosas/fallidas   documentadas.** | Presenta todas las evidencias  requeridas, organizadas y   verificables; reportes claros y  completos con trazabilidad de  resultados. | Presenta la mayoría de  evidencias requeridas con  documentación suficiente. | Evidencias incompletas,  desordenadas o difíciles de  verificar. | No presenta evidencias o son inválidas. |
| **Implementación de pruebas de  componentes React; validación  de renderizado, interacción,  estados, formularios y   dependencias externas.** | Valida correctamente renderizado,  eventos, estados, formularios y  renderizado condicional; simula  dependencias externas y contempla  múltiples escenarios funcionales. | Implementa pruebas   funcionales básicas sobre  componentes y formularios  principales. | Las pruebas cubren   parcialmente los   componentes; existen  fallos en eventos, estados o validaciones. | No implementa   pruebas de   componentes o fallan  completamente. |
| **Cobertura de escenarios   obligatorios en componentes  React; estados de carga, error,**  | Implementa todos los escenarios  obligatorios y agrega pruebas  adicionales de robustez y resiliencia. | Implementa los escenarios  obligatorios mínimos sin  errores críticos. | Solo cubre algunos   escenarios o presenta  inconsistencias  | No implementa   escenarios requeridos. |

1/9   
![][image7]  
**Taller de proyectos 2 – Ingeniería de Sistemas e Informática** 

| Criterio / Indicador  | Sobresaliente (3)  | Suficiente (2)  | En desarrollo (1)  | Insatisfactorio (0) |
| :---- | :---- | :---- | :---- | ----- |
| **vacío, validaciones y   operaciones asincrónicas.** |  |  | funcionales. |  |
| **Uso de herramientas React  Testing Library y MSW para  pruebas de componentes y  mocking de APIs.** | Integra correctamente RTL y MSW;  simula APIs complejas y   dependencias externas con buenas  prácticas. | Usa RTL y MSW de forma  funcional para pruebas  básicas. | Uso parcial o incorrecto de  herramientas y   simulaciones. | No utiliza las   herramientas   requeridas. |
| **Implementación de pruebas de  integración sobre APIs,   módulos y persistencia;   validación CRUD, autenticación, autorización y respuestas  HTTP/JSON.** | Implementa pruebas de integración  completas y automatizadas; valida  CRUD, seguridad, persistencia y  manejo robusto de errores. | Implementa pruebas   funcionales sobre   operaciones principales y  validaciones esenciales. | Cobertura parcial de   endpoints o persistencia;  errores frecuentes en  validaciones. | No implementa   pruebas de integración  funcionales. |
| **Cobertura de escenarios de  integración; peticiones válidas e inválidas, acceso no autorizado,  inconsistencias y errores del  servidor.** | Implementa todos los escenarios  requeridos con validación exhaustiva  y manejo adecuado de excepciones. | Implementa escenarios  mínimos obligatorios sin  errores graves. | Escenarios incompletos o  mal implementados. | No implementa   escenarios requeridos. |
| **Uso correcto de Supertest, RTL  y MSW en pruebas de   integración.** | Configuración profesional y   automatizada; pruebas reproducibles y correctamente desacopladas. | Herramientas configuradas  y funcionales para pruebas  básicas. | Configuración parcial o con errores recurrentes. | No utiliza las   herramientas   obligatorias. |
| **Implementación de pruebas de  aceptación con Cypress;   automatización de escenarios  funcionales y validación de  flujos de usuario.** | Automatiza completamente   escenarios funcionales críticos;  simula comportamiento real del  usuario y valida reglas complejas del  negocio. | Implementa pruebas   funcionales básicas sobre  flujos principales del   sistema. | Automatización incompleta o con errores funcionales  importantes. | No implementa   pruebas de aceptación. |
| **Cobertura de escenarios de  aceptación; login, navegación,**  | Implementa todos los escenarios  obligatorios y agrega validaciones  complementarias relevantes. | Implementa los escenarios  mínimos requeridos   correctamente. | Escenarios parcialmente  cubiertos o inconsistentes. | No cubre los escenarios obligatorios. |

2/9   
![][image8]  
**Taller de proyectos 2 – Ingeniería de Sistemas e Informática** 

| Criterio / Indicador  | Sobresaliente (3)  | Suficiente (2)  | En desarrollo (1)  | Insatisfactorio (0) |
| :---- | :---- | :---- | :---- | :---- |
| **gestión de datos, errores y  validaciones funcionales.** |  |  |  |  |
| **Evidencias de pruebas de  aceptación; videos   automáticos, capturas, logs y  resultados exportados.** | Presenta todas las evidencias  generadas automáticamente y  correctamente organizadas. | Presenta evidencias   mínimas suficientes para  validar la ejecución. | Evidencias incompletas o  desordenadas. | No presenta evidencias válidas. |
| **Implementación de pruebas E2E con Playwright o Cypress;  validación Golden Path, Happy  Path y Unhappy Path.** | Implementa flujos E2E completos y  robustos; valida escenarios exitosos y fallidos con recuperación controlada  ante errores. | Implementa los escenarios  E2E principales requeridos  correctamente. | Cobertura parcial de   escenarios o   automatización inestable. | No implementa   pruebas E2E   funcionales. |
| **Cobertura de escenarios E2E;  navegación completa,   persistencia, seguridad, errores, recuperación e interacción  multiusuario.** | Implementa todos los escenarios  requeridos con pruebas confiables y  repetibles. | Implementa escenarios  mínimos obligatorios sin  errores críticos. | Cobertura insuficiente o  validaciones   inconsistentes. | No implementa   escenarios E2E   requeridos. |
| **Evidencias E2E; videos,   capturas, logs, reportes y  evidencia de escenarios   exitosos y fallidos.** | Evidencias completas, organizadas y  verificables; reportes profesionales y  trazables. | Presenta evidencias   suficientes para validar las  pruebas E2E. | Evidencias incompletas o  poco claras. | No presenta evidencias válidas. |
| **Análisis de cobertura y calidad  del software; generación de  reportes, identificación de  módulos críticos y análisis de  riesgos.** | Genera reportes detallados y análisis  técnico profundo; identifica riesgos,  defectos y exclusiones justificadas  con criterio técnico. | Genera reportes de   cobertura y análisis básico  de módulos cubiertos/no  cubiertos. | Reportes incompletos o  análisis superficial de  cobertura. | No genera reportes ni  análisis de cobertura. |
| **Cumplimiento de métricas  mínimas de cobertura;   cobertura global mínima de**  | Supera ampliamente las métricas  mínimas; mantiene cobertura  consistente y justificada. | Cumple las métricas   mínimas establecidas en la  consigna. | No alcanza una de las  métricas mínimas o   presenta inconsistencias en medición. | No alcanza las métricas  mínimas requeridas. |

 

3/9   
![][image9]  
**Taller de proyectos 2 – Ingeniería de Sistemas e Informática** 

| Criterio / Indicador  | Sobresaliente (3)  | Suficiente (2)  | En desarrollo (1)  | Insatisfactorio (0) |
| :---- | :---- | :---- | :---- | :---- |
| **70% y lógica crítica mínima de  85%.** |  |  |  |  |
| **Organización del repositorio  GitHub; estructura, ramas,  commits descriptivos,   separación de pruebas y   README técnico.** | Repositorio profesional y organizado; uso correcto de ramas, commits  claros, documentación completa e  instrucciones reproducibles. | Repositorio funcional con  estructura y documentación básica suficiente. | Organización deficiente o  documentación   incompleta. | Repositorio   desordenado o   inexistente. |
| **Calidad técnica global de la  solución; mantenibilidad,  estabilidad funcional,   automatización y buenas   prácticas de ingeniería.** | Solución robusta, mantenible y  profesional; demuestra dominio  avanzado de testing y aseguramiento  de calidad. | Solución funcional que  cumple los requisitos   principales de calidad. | Solución parcialmente  funcional con problemas  de mantenibilidad o   estabilidad. | Solución deficiente o  no funcional. |

4/9