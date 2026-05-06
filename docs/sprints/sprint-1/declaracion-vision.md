## Entregable B — Declaración de la visión del proyecto

### Enunciado de visión

Para los coordinadores académicos, docentes y estudiantes de la Universidad Continental que enfrentan dificultades en la planificación y consulta de horarios bajo un currículo flexible, el Sistema de Generación Óptima de Horarios Académicos (SGOHA) es una aplicación web inteligente que genera automáticamente horarios válidos y sin conflictos, respetando restricciones académicas, operativas y de disponibilidad. A diferencia de los procesos manuales o sistemas rígidos actuales, SGOHA incorpora un motor de satisfacción de restricciones (CSP) que produce soluciones óptimas en segundos, ofrece visualización interactiva por rol y permite ajustes manuales con revalidación en tiempo real.

---

### Valor del sistema por actor

| Actor | Valor aportado |
|-------|---------------|
| **Estudiantes** | Acceden a su horario personalizado, realizan matrícula con validación automática de prerrequisitos y créditos, y visualizan conflictos antes de confirmar su inscripción. |
| **Docentes** | Registran su disponibilidad y consultan su carga horaria asignada, reduciendo la coordinación manual con la secretaría académica. |
| **Coordinadores académicos** | Generan horarios completos para toda la facultad en segundos, con herramientas de ajuste manual y detección automática de conflictos. |
| **Administradores** | Gestionan períodos académicos, configuran el sistema y acceden a reportes de ocupación y auditoría de cambios. |

---

### Alcance del sistema (Sprint 0)

**DENTRO del alcance:**
- Registro y gestión de estudiantes, docentes, cursos y aulas
- Validación de matrícula: prerrequisitos y límite de créditos (20–22)
- Motor CSP de generación automática de horarios
- Visualización interactiva del horario en formato calendario semanal
- Detección y notificación de conflictos
- Exportación de horarios en PDF y Excel
- Autenticación por roles y auditoría de cambios

**FUERA del alcance (versión inicial):**
- Integración con sistemas ERP o académicos externos (Banner, SAP)
- Aplicación móvil nativa (iOS/Android)
- Módulo de pagos o matrículas financieras
- Soporte multilenguaje
