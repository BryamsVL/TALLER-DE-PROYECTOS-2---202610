"""Motor CSP para generacion de horarios academicos sin conflictos.

Implementacion con OR-Tools CP-SAT:
  - Variables booleanas: assign[curso][docente][aula][franja]
  - Restricciones hard:
      1. Cada curso asignado exactamente una vez
      2. Sin solapamiento de docente (docente no puede estar en dos lugares al mismo tiempo)
      3. Sin solapamiento de aula (aula no puede tener dos cursos simultaneamente)
      4. Solo se usan las franjas disponibles declaradas para cada curso
      5. Solo se asigna a docentes y aulas validos para el curso
"""

from time import perf_counter

from ortools.sat.python import cp_model

from .schemas import Assignment, SolveRequest, SolveResponse, TimeSlot


def _slot_key(slot: TimeSlot) -> tuple[int, int, int]:
    """Convierte un TimeSlot a una tupla hashable (dia, inicio, fin)."""
    return (slot.day, slot.start_minute, slot.end_minute)


def solve(request: SolveRequest) -> SolveResponse:
    """Resuelve la asignacion curso-docente-aula-franja para el periodo dado.

    Algoritmo: CP-SAT (Constraint Programming - Boolean Satisfiability) de Google OR-Tools.
    Complejidad: NP-hard en el caso general; OR-Tools aplica branch-and-bound + DPLL
    con heuristicas de propagacion que lo hacen practico para instancias <= 50 cursos.

    Args:
        request: Datos del periodo con cursos, docentes, aulas y franjas disponibles.

    Returns:
        SolveResponse con status OPTIMAL/FEASIBLE/INFEASIBLE/TIMEOUT y la lista
        de asignaciones si se encontro solucion.
    """
    start_time = perf_counter()
    courses = request.courses

    if not courses:
        return SolveResponse(
            status="OPTIMAL",
            assignments=[],
            elapsed_seconds=perf_counter() - start_time,
        )

    # ------------------------------------------------------------------ #
    #  Recopilar universo de recursos (docentes, aulas, franjas)          #
    # ------------------------------------------------------------------ #
    all_teachers: list[str] = sorted({t for c in courses for t in c.teacher_ids})
    all_classrooms: list[str] = sorted({a for c in courses for a in c.classroom_ids})
    all_slots: list[tuple[int, int, int]] = sorted(
        {_slot_key(s) for c in courses for s in c.available_slots}
    )

    teacher_idx: dict[str, int] = {t: i for i, t in enumerate(all_teachers)}
    classroom_idx: dict[str, int] = {a: i for i, a in enumerate(all_classrooms)}
    slot_idx: dict[tuple, int] = {s: i for i, s in enumerate(all_slots)}

    # ------------------------------------------------------------------ #
    #  Construir el modelo CSP                                            #
    # ------------------------------------------------------------------ #
    model = cp_model.CpModel()

    # assign[(ci, ti, ai, si)] = True  ⟺  el curso ci se asigna al docente ti,
    # en el aula ai, en la franja horaria si.
    # Solo se crean variables para combinaciones validas segun los datos del curso.
    assign: dict[tuple[int, int, int, int], cp_model.IntVar] = {}

    for ci, course in enumerate(courses):
        valid_slots_keys = {_slot_key(s) for s in course.available_slots}

        for teacher_id in course.teacher_ids:
            ti = teacher_idx[teacher_id]
            
            t_avail_slots = request.teacher_availabilities.get(teacher_id)
            if t_avail_slots is not None:
                t_avail_keys = {_slot_key(s) for s in t_avail_slots}
                allowed_slots_keys = valid_slots_keys.intersection(t_avail_keys)
            else:
                allowed_slots_keys = valid_slots_keys

            for classroom_id in course.classroom_ids:
                ai = classroom_idx[classroom_id]
                for slot_key in allowed_slots_keys:
                    si = slot_idx[slot_key]
                    assign[(ci, ti, ai, si)] = model.new_bool_var(
                        f"x_c{ci}_t{ti}_a{ai}_s{si}"
                    )

    # ------------------------------------------------------------------ #
    #  Restriccion 1: Cada curso debe asignarse exactamente una vez       #
    # ------------------------------------------------------------------ #
    conflicts: list[str] = []

    for ci, course in enumerate(courses):
        course_vars = [v for (c, _t, _a, _s), v in assign.items() if c == ci]
        if not course_vars:
            conflicts.append(
                f"Curso '{course.name}' ({course.id}) no tiene ninguna combinacion "
                "docente-aula-franja valida. Revisa disponibilidad."
            )
            continue
        model.add_exactly_one(course_vars)

    if conflicts:
        # Si algun curso no tiene variables, el problema es infeasible de entrada.
        return SolveResponse(
            status="INFEASIBLE",
            assignments=[],
            elapsed_seconds=perf_counter() - start_time,
            conflicts=conflicts,
        )

    # ------------------------------------------------------------------ #
    #  Restriccion 2: Un docente no puede estar en dos cursos al mismo    #
    #  tiempo (sin solapamiento de docente).                              #
    # ------------------------------------------------------------------ #
    for ti in range(len(all_teachers)):
        for si in range(len(all_slots)):
            teacher_slot_vars = [
                v for (c, t, a, s), v in assign.items() if t == ti and s == si
            ]
            if len(teacher_slot_vars) > 1:
                model.add_at_most_one(teacher_slot_vars)

    # ------------------------------------------------------------------ #
    #  Restriccion 3: Un aula no puede tener dos cursos al mismo tiempo   #
    #  (sin solapamiento de aula).                                        #
    # ------------------------------------------------------------------ #
    for ai in range(len(all_classrooms)):
        for si in range(len(all_slots)):
            classroom_slot_vars = [
                v for (c, t, a, s), v in assign.items() if a == ai and s == si
            ]
            if len(classroom_slot_vars) > 1:
                model.add_at_most_one(classroom_slot_vars)

    # ------------------------------------------------------------------ #
    #  Resolver                                                           #
    # ------------------------------------------------------------------ #
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = float(request.timeout_seconds)
    # Buscar solucion optima (minimizar tiempo de busqueda para instancias pequenas)
    solver.parameters.num_search_workers = 4

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

    # ------------------------------------------------------------------ #
    #  Extraer asignaciones de la solucion                                #
    # ------------------------------------------------------------------ #
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
