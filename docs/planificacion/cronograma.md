# Cronograma, Dependencias y Ruta Crítica — SGOHA

**Proyecto:** Sistema de Generación Óptima de Horarios Académicos (SGOHA)
**Fase:** Ejecución (Sprints 1-3)

---

## 1. Modelo de Ejecución

El proyecto sigue una secuencia de ejecución lineal y estricta, debido a que el entregable de una fase (ej. modelado de bases de datos) es prerrequisito absoluto de la siguiente (ej. ejecución de restricciones en memoria).

### Dependencias Principales
- **Datos Base → Motor CSP:** OR-Tools no puede construirse si no existen los endpoints de ingesta (Aulas, Docentes, Cursos).
- **Motor Institucional → Vista de Docentes:** No se puede parsear un horario que aún no ha convergido en el solver principal.
- **Grilla React → Exportación:** Los submódulos de exportación PDF/Excel dependen del formato visual de la grilla.

---

## 2. Ruta Crítica (Critical Path)

La ruta crítica del proyecto está trazada por el desarrollo del Motor CSP y la interfaz de visualización. Cualquier retraso en estos hitos afecta directamente a la fecha de release final.

1. **Paso 1:** Gestión de Aulas, Docentes y Franjas (Sprint 1) — *Completado*
2. **Paso 2:** Modelado D1-D9 en OR-Tools (HU-11, Sprint 2). **[PUNTO DE BLOQUEO MAYOR]** — *En progreso*
3. **Paso 3:** Ejecución del algoritmo institucional (HU-12, Sprint 2).
4. **Paso 4:** Generación de horarios individuales de Estudiantes (HU-20, Sprint 3).
5. **Paso 5:** Renderizado interactivo en la Grilla Semanal (HU-23, Sprint 3).

---

## 3. Plan de Mitigación de Ruta Crítica

Cualquier desviación de tiempo en **HU-11 (Modelado D1-D9)** impactará en cadena a todo el Sprint 3, por lo que es la principal variable de riesgo controlada (ver registro de riesgos). 

**Acciones preventivas:**
- Asignación de los miembros con mayor capacidad analítica exclusivamente al microservicio FastAPI (OR-Tools) durante el Sprint 2.
- Mocking (simulación) de la respuesta del solver para que el equipo Frontend pueda avanzar con las HUs del Sprint 3 en paralelo.
