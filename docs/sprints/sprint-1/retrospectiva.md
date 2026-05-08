# Retrospectiva del Sprint 1

**Fecha de la reunión:** 22/04/2026
**Sprint:** 1 (08/04/2026 – 22/04/2026)
**Facilitador:** Andre De La Torre Segura (Scrum Master)

## 1. Resumen Ejecutivo
El Sprint 1 finalizó con un éxito rotundo, alcanzando el **100% de cumplimiento**. El objetivo era asentar las bases del sistema SGOHA, logrando implementar la autenticación, los CRUDs de las entidades fundamentales y la configuración base del ciclo académico. La velocidad alcanzó los 35 story points planificados, y el equipo terminó el trabajo un día antes de lo previsto (Día 9).

## 2. Historias de Usuario (HU) Completadas

| ID | Historia de Usuario | Responsable | Estado | Puntos |
|---|---|---|---|---|
| HU-01 | Registro de usuarios | Brianna Cortez | ✅ Terminado | 3 |
| HU-02 | Login con JWT | Brianna Cortez | ✅ Terminado | 5 |
| HU-03 | Control de acceso por rol | Brianna Cortez | ✅ Terminado | 3 |
| HU-04 | CRUD Estudiantes | Alberto Patiño | ✅ Terminado | 3 |
| HU-05 | CRUD Docentes | Alberto Patiño | ✅ Terminado | 3 |
| HU-06 | Disponibilidad docentes | Brianna Cortez | ✅ Terminado | 5 |
| HU-07 | CRUD Cursos y componentes | Alberto Patiño | ✅ Terminado | 5 |
| HU-08 | CRUD Aulas | Alberto Patiño | ✅ Terminado | 3 |
| HU-09 | Franjas horarias | Andre De La Torre | ✅ Terminado | 3 |
| HU-10 | Tiempos traslado y parámetros | Andre De La Torre | ✅ Terminado | 2 |
| **Total**| | | | **35 pts** |

## 3. ¿Qué salió bien?
1. **Modelado en Prisma:** La definición inicial en `schema.prisma` fue sólida y nos evitó tener que hacer migraciones destructivas durante el desarrollo de los CRUDs.
2. **Integración UI/Backend:** La adopción temprana de shadcn/ui aceleró dramáticamente la creación de formularios para los CRUD de aulas y cursos en el frontend.
3. **Manejo de Errores Global:** La implementación del middleware de errores en Express centralizó las respuestas HTTP, manteniendo consistencia en los códigos de estado retornados a React.
4. **Colaboración Cruzada:** La comunicación entre Bryams (Frontend) y Brianna/Alberto (Backend) fluyó sin fricciones gracias a los contratos Swagger (OpenAPI) definidos al inicio.

## 4. ¿Qué podemos mejorar?
1. **Seguridad JWT:** Inicialmente, el JWT no rechazaba tokens expirados correctamente. Esto fue corregido, pero evidenció una falta de pruebas automatizadas en la capa de seguridad.
2. **Políticas RLS en Supabase:** Hubo incompatibilidades con Row Level Security de Supabase que bloquearon las pruebas en local, forzando a desactivarlas temporalmente en el entorno de desarrollo.
3. **Revisiones de Código (PRs):** Algunos Pull Requests se aprobaron sin una revisión profunda, lo que causó conflictos de merge menores al final del sprint.

## 5. Plan de Acción

| Acción a tomar | Responsable | Fecha Límite |
|---|---|---|
| Configurar pruebas unitarias con Jest para el middleware JWT. | Brianna Cortez | 25/04/2026 |
| Investigar y configurar políticas RLS correctas para los roles en Supabase. | Jack Perez | 28/04/2026 |
| Imponer regla en GitHub de al menos 1 review obligatorio por PR antes del merge. | Andre De La Torre | 23/04/2026 |

## 6. Revisión de Métricas
- **Velocidad Planificada vs Real:** 35 pts / 35 pts (100%).
- **Cycle Time Promedio:** 4.2 días (muy eficiente, las historias no se estancaron).
- **Lead Time Promedio:** 4.8 días.
- **Burndown:** Día 1: 35pts → Día 5: 20pts → Día 8: 8pts → Día 10: 0pts. Se terminó en el día 9.

## 7. Acuerdos para el Sprint 2
- El equipo se compromete a no subestimar la complejidad matemática de OR-Tools.
- Alberto tendrá prioridad para consultar dudas de arquitectura, ya que liderará el núcleo del motor CSP.
- Jack iniciará sus actividades de QA más temprano para no acumular pruebas el último día.
