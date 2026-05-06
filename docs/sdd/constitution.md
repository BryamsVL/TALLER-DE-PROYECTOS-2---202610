# Constitution — SGOHA

**Proyecto:** Sistema de Generación Óptima de Horarios Académicos

---

## 1. Principios Rectores

1. **La Factibilidad ante todo:** Un horario con cruces reales (restricciones duras) es un horario inválido. Si el modelo no converge, preferimos un `INFEASIBLE` transparente antes que una asignación corrupta.
2. **SSOT (Single Source of Truth):** El esquema de base de datos de Prisma y el contrato de `SolveRequest/SolveResponse` rigen el modelo de datos.
3. **Fail Fast:** Todos los inputs deben validarse en la capa más externa (Zod en Node, Pydantic en FastAPI).

---

## 2. Reglas Globales de Desarrollo

### 2.1. Gestión de Ramas (Git Flow)
- `main`: Código en producción (solo releases).
- `develop`: Entorno de integración (QA).
- `feature/HU-XX-nombre`: Ramas para desarrollo de historias de usuario.
- `bugfix/HU-XX-nombre`: Para correcciones puntuales.

### 2.2. Commits Semánticos
Formato estricto: `tipo(scope): descripción`
- `feat(HU-11): añadir solver basico CP-SAT`
- `fix(HU-02): resolver expiracion de JWT a 8h`
- `docs(06-constitution): actualizar reglas de git`

### 2.3. Pull Requests (PR)
- Ningún código entra a `develop` sin PR.
- Requiere revisión de al menos **1 integrante** del equipo distinto al autor.
- Debe referenciar a la issue/HU correspondiente (`Closes #12`).

---

## 3. Estándares por Capa

### 3.1. Express / TypeScript (Backend Node)
- **Rutas y Controladores:** Separación lógica. Nunca realizar queries Prisma directamente en el enrutador.
- **Zod:** Validación estricta `schema.parse(req.body)` en la primera línea del request.
- Manejo de excepciones centralizado (Middleware de Errores).

### 3.2. FastAPI / Python (Microservicio CSP)
- **Pydantic:** Contratos de entrada y salida (`schemas.py`).
- **Separación del Solver:** El motor matemático (`solver.py`) no sabe de HTTP. Solo recibe y devuelve estructuras Pydantic.
- **Tipado Fuerte:** Uso de Type Hints de Python 3.11 en todas las funciones.

### 3.3. React / TypeScript (Frontend)
- **TanStack Router:** Para navegación type-safe y code splitting por archivo.
- **shadcn/ui:** Prohibido instalar librerías pesadas (como Material UI). Todo componente se construye con shadcn/Tailwind.
- Componentes funcionales, hooks `useQuery`/`useMutation` (TanStack Query) para el manejo asíncrono.

---

## 4. Modificación del Solver CP-SAT

El motor CSP es crítico. Reglas de modificación:
1. **No reemplazar OR-Tools:** No usar algoritmos Greedy ni librerías alternativas sin la aprobación formal en el archivo de Decisiones Técnicas (ADR).
2. **Comentar Restricciones:** Cada bloque matemático `model.Add(...)` debe llevar un comentario indicando la Restricción Funcional (ej. `# D1: Unicidad Docente`).
3. **Pruebas:** Cada restricción nueva requiere una prueba en `pytest` para verificar que falla si se le inyectan datos inválidos.

---

## 5. Documentación y Trazabilidad

- Cada cambio en la base de datos requiere regenerar el ERD o actualizar `docs/05-spec.md`.
- Todo PR debe mantener actualizada la `docs/07-trazabilidad.md`.

---

## 6. Definición de Terminado (DoD)

Para considerar una Historia de Usuario (HU) como "Terminada":
1. El código compila sin advertencias TypeScript/Python.
2. Todas las pruebas unitarias pasan (mínimo 70% de cobertura).
3. Las pruebas de End-to-End validan el flujo principal.
4. El PR ha sido revisado y fusionado a `develop`.
5. La documentación y Swagger (OpenAPI) ha sido actualizada.
