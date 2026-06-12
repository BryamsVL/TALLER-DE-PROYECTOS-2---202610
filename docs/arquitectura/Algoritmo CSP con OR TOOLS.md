# Algoritmo CSP con OR-Tools en 5 bloques

Este documento resume el flujo principal del proyecto en solo 5 bloques, desde que el backend recibe la solicitud hasta que devuelve la respuesta final.  
Cada bloque mantiene la misma estructura:

- **Entrada**: qué datos recibe ese algoritmo y qué significan.
- **Proceso**: el código principal real que ejecuta ese paso en el proyecto.
- **Salida**: qué resultado produce ese algoritmo y cómo deja preparado el siguiente bloque.

Fuentes usadas del proyecto:

- `src/routes/api/v1/solver.ts`
- `csp-service/app/main.py`
- `csp-service/app/schemas.py`
- `csp-service/app/solver.py`

## Ejemplo base que seguiremos

```json
{
  "period_id": "2026-I",
  "timeout_seconds": 30,
  "courses": [
    {
      "id": "MAT101",
      "name": "Matematica I",
      "credits": 4,
      "teacher_ids": ["T1", "T2"],
      "classroom_ids": ["A1"],
      "available_slots": [
        { "day": 1, "start_minute": 420, "end_minute": 510 },
        { "day": 2, "start_minute": 520, "end_minute": 610 }
      ]
    },
    {
      "id": "FIS101",
      "name": "Fisica I",
      "credits": 4,
      "teacher_ids": ["T1"],
      "classroom_ids": ["A1", "A2"],
      "available_slots": [
        { "day": 1, "start_minute": 420, "end_minute": 510 },
        { "day": 1, "start_minute": 520, "end_minute": 610 }
      ]
    }
  ],
  "teacher_availabilities": {
    "T1": [
      { "day": 1, "start_minute": 420, "end_minute": 510 },
      { "day": 1, "start_minute": 520, "end_minute": 610 }
    ],
    "T2": [
      { "day": 2, "start_minute": 520, "end_minute": 610 }
    ]
  }
}
```

---

## Bloque 1. Recolección de datos y construcción del problema en el backend

### Entrada

En este bloque entra la solicitud inicial al endpoint `POST /generate`.  
El dato principal que puede llegar es `academicPeriodId`, que sirve para indicar sobre qué periodo académico se quiere generar el horario.

Además, el backend necesita recuperar desde base de datos todos los datos que definen el problema CSP:

- el **periodo académico** que se usará
- los **cursos activos** que deben ser programados
- los **docentes activos** relacionados con esos cursos
- la **disponibilidad horaria** de cada docente
- las **aulas activas**
- el **tipo de aula requerido** por cada curso

En otras palabras, aquí todavía no se resuelve el horario; aquí se junta toda la información del mundo real que luego será convertida en restricciones.

### Proceso

```ts
router.post("/generate", async (req: Request, res: Response) => {
  try {
    const { academicPeriodId } = req.body;

    let period;
    if (academicPeriodId) {
      period = await prisma.academicPeriod.findUnique({ where: { id: academicPeriodId } });
    } else {
      period = await prisma.academicPeriod.findFirst({ where: { isActive: true } });
    }

    if (!period) {
      return res.status(404).json({ error: "Academic period not found" });
    }

    const actualPeriodId = period.id;

    const courses = await prisma.course.findMany({
      where: { isActive: true },
      include: {
        teacherCourses: { include: { teacher: true } },
      }
    });

    const teachers = await prisma.teacher.findMany({
      where: { isActive: true },
      include: {
        availability: {
          where: { isAvailable: true },
          include: { timeSlot: true }
        }
      }
    });

    const classrooms = await prisma.classroom.findMany({ where: { isActive: true } });
```

### Salida

La salida de este bloque es un conjunto de datos completos del dominio académico.

Después de este paso el sistema ya sabe:

- qué cursos deben entrar al horario
- qué docentes pueden participar
- qué disponibilidades tiene cada docente
- qué aulas existen
- qué periodo académico está siendo trabajado

Todavía no existe una solución, pero el problema ya quedó definido con datos reales.  
Esa salida alimenta al siguiente bloque, donde se transforma todo al formato exacto que el microservicio CSP necesita.

---

## Bloque 2. Transformación de los datos al formato SolveRequest

### Entrada

En este bloque entran las colecciones recuperadas en el bloque anterior:

- `courses`
- `teachers`
- `classrooms`
- `actualPeriodId`

También entra la lógica del negocio que define cómo convertir esos datos al modelo CSP:

- cada curso debe convertirse en una estructura con `teacher_ids`
- las aulas deben filtrarse según compatibilidad de tipo
- deben generarse `available_slots` para cada curso
- la disponibilidad docente debe expresarse como `day`, `start_minute` y `end_minute`

Aquí la entrada ya no es solo información académica cruda, sino información que debe ser traducida a un contrato técnico entendible por el solver.

### Proceso

```ts
    const payload = {
      period_id: actualPeriodId,
      timeout_seconds: 30,
      courses: courses.map(c => ({
        id: c.id,
        name: c.name,
        credits: c.credits,
        teacher_ids: c.teacherCourses.map(tc => tc.teacherId),
        classroom_ids: classrooms.filter(
          cr => cr.roomType === c.requiredRoomType || cr.roomType === "GENERAL"
        ).map(cr => cr.id),
        available_slots: [1, 2, 3, 4, 5, 6].flatMap(day => [
          { day, start_minute: 420, end_minute: 510 },
          { day, start_minute: 520, end_minute: 610 },
          { day, start_minute: 620, end_minute: 710 },
          { day, start_minute: 720, end_minute: 810 },
          { day, start_minute: 840, end_minute: 930 },
          { day, start_minute: 940, end_minute: 1030 },
          { day, start_minute: 1040, end_minute: 1130 },
          { day, start_minute: 1140, end_minute: 1230 },
          { day, start_minute: 1240, end_minute: 1330 },
        ])
      })),
      teacher_availabilities: teachers.reduce((acc, t) => {
        if (t.availability && t.availability.length > 0) {
          acc[t.id] = t.availability.map(a => {
            const dStart = new Date(a.timeSlot.startTime);
            const dEnd = new Date(a.timeSlot.endTime);
            const dayMap: Record<string, number> = {
              MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3, THURSDAY: 4,
              FRIDAY: 5, SATURDAY: 6, SUNDAY: 7
            };
            return {
              day: dayMap[a.timeSlot.dayOfWeek as string] || 1,
              start_minute: dStart.getUTCHours() * 60 + dStart.getUTCMinutes(),
              end_minute: dEnd.getUTCHours() * 60 + dEnd.getUTCMinutes()
            };
          });
        }
        return acc;
      }, {} as Record<string, CspTimeSlot[]>)
    };

    const response = await fetch(`${CSP_SERVICE_URL}/solve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
```

### Salida

La salida de este bloque es un objeto `SolveRequest` serializado como JSON y enviado al microservicio Python.

Ese objeto ya contiene:

- el identificador del periodo
- el tiempo máximo de ejecución
- los cursos con docentes posibles
- las aulas compatibles por curso
- las franjas horarias candidatas
- la disponibilidad horaria de cada docente

Con esta salida, el problema deja de estar en formato de negocio y pasa a estar en formato matemático-preparatorio.  
Ahora el microservicio ya tiene lo necesario para validar y modelar el CSP.

---

## Bloque 3. Validación de entrada y preparación del solver

### Entrada

En este bloque entra el JSON `SolveRequest` enviado por el backend.  
Ese JSON debe respetar una estructura estricta:

- `period_id` debe existir
- `courses` debe ser una lista válida
- cada curso debe tener `id`, `name`, `credits`, `teacher_ids`, `classroom_ids` y `available_slots`
- cada `TimeSlot` debe tener día y minutos dentro de rangos válidos
- `teacher_availabilities` debe ser un diccionario válido
- `timeout_seconds` debe estar entre 1 y 120

También entra aquí una primera decisión importante del algoritmo: si no existen cursos, no hay problema que resolver y el solver debe responder inmediatamente.

### Proceso

```python
class TimeSlot(BaseModel):
    day: int = Field(ge=1, le=7, description="ISO day-of-week (1=Mon, 7=Sun)")
    start_minute: int = Field(ge=0, le=1440)
    end_minute: int = Field(ge=0, le=1440)


class CourseRequest(BaseModel):
    id: str
    name: str
    credits: int = Field(ge=1, le=10)
    teacher_ids: list[str]
    classroom_ids: list[str]
    available_slots: list[TimeSlot]


class SolveRequest(BaseModel):
    period_id: str
    courses: list[CourseRequest]
    teacher_availabilities: dict[str, list[TimeSlot]] = Field(default_factory=dict)
    timeout_seconds: int = Field(default=30, ge=1, le=120)


@app.post("/solve", response_model=SolveResponse)
def solve_endpoint(request: SolveRequest) -> SolveResponse:
    return solve(request)


def solve(request: SolveRequest) -> SolveResponse:
    start_time = perf_counter()
    courses = request.courses

    if not courses:
        return SolveResponse(
            status="OPTIMAL",
            assignments=[],
            elapsed_seconds=perf_counter() - start_time,
        )
```

### Salida

La salida de este bloque es una entrada ya validada y segura para el solver.

Después de este paso el sistema tiene dos posibles resultados:

- si la entrada es inválida, la petición es rechazada antes de modelar
- si `courses` está vacío, se devuelve una solución inmediata con `OPTIMAL`
- si la entrada es correcta y hay cursos, el problema pasa al modelado CSP

Esto es importante porque evita que el algoritmo trabaje con datos corruptos o con problemas vacíos.  
El siguiente bloque ya trabaja sobre una entrada limpia y confiable.

---

## Bloque 4. Modelado del CSP: variables y restricciones principales

### Entrada

En este bloque entran los cursos válidos ya listos para ser modelados.  
Cada curso aporta tres piezas clave:

- los docentes que podrían dictarlo
- las aulas donde podría programarse
- las franjas horarias donde podría colocarse

También entra la disponibilidad de cada docente, que permite descartar combinaciones imposibles.

La entrada real de este bloque es, entonces, el espacio de decisiones del problema.  
El solver debe convertir ese espacio en variables booleanas y restricciones formales para OR-Tools.

### Proceso

```python
    all_teachers: list[str] = sorted({t for c in courses for t in c.teacher_ids})
    all_classrooms: list[str] = sorted({a for c in courses for a in c.classroom_ids})
    all_slots: list[tuple[int, int, int]] = sorted(
        {_slot_key(s) for c in courses for s in c.available_slots}
    )

    teacher_idx: dict[str, int] = {t: i for i, t in enumerate(all_teachers)}
    classroom_idx: dict[str, int] = {a: i for i, a in enumerate(all_classrooms)}
    slot_idx: dict[tuple, int] = {s: i for i, s in enumerate(all_slots)}

    model = cp_model.CpModel()
    assign: dict[tuple[int, int, int, int], cp_model.IntVar] = {}

    vars_by_course: dict[int, list] = {ci: [] for ci in range(len(courses))}
    vars_by_teacher_slot: dict[tuple[int, int], list] = {}
    vars_by_classroom_slot: dict[tuple[int, int], list] = {}

    course_order = sorted(
        range(len(courses)),
        key=lambda ci: (
            len(courses[ci].teacher_ids)
            * len(courses[ci].classroom_ids)
            * len(courses[ci].available_slots)
        ),
    )

    for ci in course_order:
        course = courses[ci]
        valid_slots_keys = {_slot_key(s) for s in course.available_slots}

        for teacher_id in course.teacher_ids:
            ti = teacher_idx[teacher_id]
            t_avail_slots = request.teacher_availabilities.get(teacher_id)
            allowed_slots_keys = (
                valid_slots_keys & {_slot_key(s) for s in t_avail_slots}
                if t_avail_slots is not None
                else valid_slots_keys
            )

            for classroom_id in course.classroom_ids:
                ai = classroom_idx[classroom_id]
                for slot_key in allowed_slots_keys:
                    si = slot_idx[slot_key]
                    var = model.new_bool_var(f"x_{ci}_{ti}_{ai}_{si}")
                    assign[(ci, ti, ai, si)] = var

                    vars_by_course[ci].append(var)
                    vars_by_teacher_slot.setdefault((ti, si), []).append(var)
                    vars_by_classroom_slot.setdefault((ai, si), []).append(var)

    conflicts: list[str] = []

    for ci, course in enumerate(courses):
        cvars = vars_by_course[ci]
        if not cvars:
            conflicts.append(
                f"Curso '{course.name}' ({course.id}) no tiene ninguna combinacion "
                "docente-aula-franja valida. Revisa disponibilidad."
            )
            continue
        model.add_exactly_one(cvars)

    if conflicts:
        return SolveResponse(
            status="INFEASIBLE",
            assignments=[],
            elapsed_seconds=perf_counter() - start_time,
            conflicts=conflicts,
        )

    for vars_list in vars_by_teacher_slot.values():
        if len(vars_list) > 1:
            model.add_at_most_one(vars_list)

    for vars_list in vars_by_classroom_slot.values():
        if len(vars_list) > 1:
            model.add_at_most_one(vars_list)
```

### Salida

La salida de este bloque es un modelo CSP completo listo para resolverse.

Después de este paso el sistema ya tiene:

- variables booleanas del tipo `curso-docente-aula-franja`
- una restricción que obliga a que cada curso se asigne exactamente una vez
- una restricción que evita choques de docentes
- una restricción que evita choques de aulas
- detección temprana de cursos que no tienen ninguna combinación válida

Si un curso ya nace sin opciones válidas, el sistema termina aquí con `INFEASIBLE`.  
Si el modelo es consistente, pasa al siguiente bloque para que OR-Tools busque una solución concreta.

---

## Bloque 5. Resolución con OR-Tools y construcción de la respuesta final

### Entrada

En este bloque entra el modelo CSP ya construido.  
Es decir, entra un problema formal que OR-Tools ya puede resolver porque contiene:

- variables de decisión
- restricciones de unicidad
- restricciones de no solapamiento
- disponibilidad docente ya aplicada

También entra el `timeout_seconds`, que define cuánto tiempo máximo puede buscar el solver.

### Proceso

```python
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = float(request.timeout_seconds)
    solver.parameters.num_search_workers = 8
    solver.parameters.search_branching = cp_model.PORTFOLIO_WITH_QUICK_RESTART_SEARCH

    status_code = solver.solve(model)

    status_map = {
        cp_model.OPTIMAL: "OPTIMAL",
        cp_model.FEASIBLE: "FEASIBLE",
        cp_model.INFEASIBLE: "INFEASIBLE",
        cp_model.UNKNOWN: "TIMEOUT",
        cp_model.MODEL_INVALID: "INFEASIBLE",
    }
    status = status_map.get(status_code, "TIMEOUT")

    if status_code not in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        return SolveResponse(
            status=status,
            assignments=[],
            elapsed_seconds=perf_counter() - start_time,
            conflicts=["No se encontro horario valido con las restricciones dadas."],
        )

    assignments: list[Assignment] = []

    for (ci, ti, ai, si), var in assign.items():
        if solver.value(var) == 1:
            day, start_minute, end_minute = all_slots[si]
            assignments.append(
                Assignment(
                    course_id=courses[ci].id,
                    teacher_id=all_teachers[ti],
                    classroom_id=all_classrooms[ai],
                    slot=TimeSlot(day=day, start_minute=start_minute, end_minute=end_minute),
                )
            )

    return SolveResponse(
        status=status,
        assignments=assignments,
        elapsed_seconds=perf_counter() - start_time,
    )
```

```ts
    const enrichedAssignments = (result.assignments ?? []).map((assignment) => {
      const course = courses.find(c => c.id === assignment.course_id);
      const teacher = teachers.find(t => t.id === assignment.teacher_id);
      const classroom = classrooms.find(cr => cr.id === assignment.classroom_id);
      return {
        ...assignment,
        course_name: course ? course.name : "Desconocido",
        teacher_name: teacher ? teacher.fullName : "Desconocido",
        classroom_name: classroom ? classroom.name : "Desconocida"
      };
    });

    res.json({
      success: true,
      status: result.status,
      assignments: enrichedAssignments,
      conflicts: result.conflicts
    });
```

### Salida

La salida de este bloque es la respuesta final del proyecto.

Primero OR-Tools produce uno de estos estados:

- `OPTIMAL`
- `FEASIBLE`
- `INFEASIBLE`
- `TIMEOUT`

Si encuentra solución, salen asignaciones concretas donde cada curso queda unido a:

- un docente
- un aula
- una franja horaria

Luego el backend enriquece esa salida con nombres legibles para que la respuesta final sea útil para el frontend o para cualquier cliente de la API.

La respuesta final ya puede decir claramente:

- si se encontró o no un horario válido
- qué cursos fueron ubicados
- con qué docente quedó cada curso
- en qué aula quedó
- en qué horario quedó
- si hubo conflictos o imposibilidad de solución

En este punto el proceso completo del proyecto termina.

---

## Ejemplo de salida final

```json
{
  "success": true,
  "status": "FEASIBLE",
  "assignments": [
    {
      "course_id": "MAT101",
      "teacher_id": "T2",
      "classroom_id": "A1",
      "slot": { "day": 2, "start_minute": 520, "end_minute": 610 },
      "course_name": "Matematica I",
      "teacher_name": "Docente T2",
      "classroom_name": "Aula A1"
    },
    {
      "course_id": "FIS101",
      "teacher_id": "T1",
      "classroom_id": "A2",
      "slot": { "day": 1, "start_minute": 420, "end_minute": 510 },
      "course_name": "Fisica I",
      "teacher_name": "Docente T1",
      "classroom_name": "Aula A2"
    }
  ],
  "conflicts": []
}
```

## Resumen final

En solo 5 bloques, el flujo completo queda así:

1. El backend recoge los datos reales del problema.
2. El backend transforma esos datos al contrato `SolveRequest`.
3. FastAPI y Pydantic validan la entrada y preparan el solver.
4. El solver construye el modelo CSP con variables y restricciones.
5. OR-Tools resuelve el modelo y el backend devuelve la respuesta final enriquecida.

