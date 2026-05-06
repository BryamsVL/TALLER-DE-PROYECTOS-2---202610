# Análisis Esperado de Riesgos

**Proyecto:** SGOHA (Sistema de Generación Óptima de Horarios Académicos)  
**Mapeo Rúbrica:** 3.3.b

El proyecto SGOHA no enfrenta riesgos tradicionales de software de gestión administrativa, sino **riesgos algorítmicos**. A continuación se presenta el análisis (1º) que relaciona directamente los riesgos identificados en el registro con las limitantes inherentes del problema.

---

### i. Relación con Restricciones del problema (CSP)

La naturaleza NP-Completa del problema de satisfacción de restricciones (CSP) es nuestra mayor amenaza técnica (**R001** y **R002**). 

* **Relación analítica:** Si las restricciones duras D1 (Unicidad Docente) y D2 (Unicidad Aula) son matemáticamente inflexibles frente a una demanda masiva de cursos cruzados en el mismo período, el espacio de búsqueda colapsa de forma exponencial.
* **Toma de decisiones:** El riesgo se asume como inevitable. La decisión arquitectónica es utilizar un Timeout estricto de 30 segundos; priorizamos retornar una configuración sub-óptima pero salvable (`FEASIBLE`) por OR-Tools, en lugar de bloquear el servidor de producción buscando el óptimo inalcanzable.

---

### ii. Relación con Limitaciones técnicas

El equipo utiliza arquitecturas de nube gratuitas (*Serverless* y *PaaS*) y microservicios separados (Node.js vs Python), lo cual inyecta alta complejidad de orquestación (**R003** y **R004**).

* **Relación analítica:** Al contar con un microservicio separado (FastAPI) exclusivamente para el motor CSP, existe un riesgo inminente de latencia de red, serialización de datos y desconexiones en el protocolo HTTP. Paralelamente, la resolución matricial en memoria puede exceder los límites de RAM (512MB) de la capa gratuita (Free Tier).
* **Toma de decisiones:** Esto forzó la creación de contratos fuertemente tipados utilizando esquemas `Zod` (TypeScript) y `Pydantic` (Python) en ambas fronteras, de modo que cualquier limitación o desconexión aborte tempranamente la petición y no sature la memoria.

---

### iii. Relación con Dependencias externas

SGOHA depende estrictamente de servicios administrados en la nube y bibliotecas de terceros que requieren un entorno nativo (C++) por debajo de Python para el OR-Tools (**R006** y **R007**).

* **Relación analítica:** Las caídas regionales del servicio de internet en la ubicación del equipo, así como el agotamiento de minutos de compilación en GitHub Actions o la suspensión de clústeres en Supabase amenazan la integración continua (CI) en los Sprints 2 y 3.
* **Toma de decisiones:** Dado que el motor necesita binarios C++, somos extremadamente dependientes del entorno. La estrategia de mitigación requirió configurar obligatoriamente un entorno `docker-compose` local que simule la base de datos y la API sin internet, blindando el desarrollo.
