# Registro de Riesgos

**Nombre del Proyecto:**  

---

## Tabla de Riesgos

| ID Riesgo | Descripción del Riesgo | Área de Impacto | Causa | Impacto | Probabilidad | Puntuación de Riesgo | Detectabilidad | Estado | Asignado a | Evento que lo Dispara |
|:---------:|------------------------|-----------------|-------|:-------:|:------------:|:-------------------:|:--------------:|:------:|:----------:|----------------------|
| R001 | Motor CSP no converge en tiempo esperado | Cronograma | Complejidad NP-completa | Crítico | Muy Alto | 8.4 | Medio | Activo | Brianna Cortez | Pruebas >30 seg |
| R002 | Cambios en requerimientos académicos | Alcance | Restricciones ambiguas | Serio | Alto | 6.5 | Alto | Activo | Product Owner | Cambio solicitado por docente |
| R003 | Fallas integración React-API-FastAPI | Técnico | Problemas interfaces | Serio | Alto | 6.2 | Medio | Activo | Bryams Vilchez | Errores integración APIs |
| R004 | Baja cobertura de pruebas | Calidad | Falta tiempo QA | Moderado | Medio | 3.8 | Alto | Activo | Jack Perez | Cobertura <70% |
| R005 | Caída servicios Render/Railway | Infraestructura | Dependencia terceros | Serio | Medio | 4.6 | Medio | Activo | Andre De La Torre | Servicio no disponible |
| R006 | Curva aprendizaje OR-Tools | Recursos | Tecnología nueva | Serio | Alto | 5.9 | Bajo | Activo | Brianna Cortez | Retrasos desarrollo solver |
| R007 | Sobrecarga académica del equipo | Recursos | Cursos paralelos | Moderado | Alto | 4.2 | Alto | Activo | Scrum Master | Incumplimiento tareas sprint |
| R008 | Vulnerabilidades seguridad OWASP | Seguridad | Errores implementación | Crítico | Medio | 5.7 | Medio | Activo | Edward Flores | Hallazgos ZAP |
| R009 | Datos de matrícula inconsistentes | Operacional | Errores entrada datos | Moderado | Medio | 3.4 | Alto | Activo | Edward Flores | Validaciones fallidas |
| R010 | Demora en generación de horarios | Rendimiento | Instancias grandes | Crítico | Alto | 7.6 | Medio | Activo | Equipo CSP | Pruebas stress fallidas |
| R011 | Conflictos no detectados en horarios | Calidad | Restricciones incompletas | Serio | Medio | 4.9 | Medio | Activo | Bryams/Brianna | Solapamientos detectados |
| R012 | Pérdida código o errores repositorio | Gestión | Mal uso Git | Moderado | Medio | 3.1 | Alto | Activo | Scrum Master | Merge conflict grave |
| R013 | Cortes eléctricos/internet Huancayo | Externo | Clima/servicios | Menor | Medio | 2.4 | Alto | Observado | Equipo | Interrupciones trabajo remoto |

---

## Plan de Respuesta a Riesgos

| ID Riesgo | Estrategia de Respuesta | Reserva de Contingencia / Ajustes al Presupuesto y Cronograma | Fecha de Aprobación | Comentarios |
|:---------:|------------------------|--------------------------------------------------------------|:-------------------:|-------------|
| R001 | Mitigar con heurísticas MRV/AC-3 y timeout | S/250 + 1 semana buffer | 2026-04-15 | Riesgo principal |
| R002 | Revisiones por sprint y backlog refinamiento | S/100 reserva cambios | 2026-04-15 | Control en planning |
| R003 | Swagger/OpenAPI + pruebas integración | S/150 y 3 días buffer | 2026-04-16 | Dependencia crítica |
| R004 | Automatizar pruebas CI/CD | S/120 | 2026-04-16 | Seguimiento por sprint |
| R005 | Plan respaldo Docker local | S/180 contingencia | 2026-04-17 | Infraestructura |
| R006 | Capacitación y PoC Sprint 0 | S/200 capacitación | 2026-04-17 | Mitigación temprana |
| R007 | Redistribuir carga y buffers | +1 semana reserva | 2026-04-18 | Muy probable |
| R008 | Pruebas seguridad y hardening | S/180 | 2026-04-18 | Alta prioridad |
| R009 | Reglas validación y auditoría | S/90 | 2026-04-19 | Relacionado RF-04 |
| R010 | Optimización + caché | S/220 | 2026-04-19 | Relacionado RNF-01 |
| R011 | Validadores automáticos | S/130 | 2026-04-20 | Impacto usuario |
| R012 | Branch protection + backups | S/60 | 2026-04-20 | Controlable |
| R013 | Trabajo offline y buffers | S/80 | 2026-04-20 | Riesgo local |

---

## Umbrales de Riesgo

| Categoría | Nivel |
|-----------|-------|
| **Umbral para Amenazas** | Alto |
| **Umbral para Oportunidades** | Alto |
