"""Stub del motor CSP. La logica real se implementa en Sprint 2-3 (RF-07/RF-08)."""

from time import perf_counter

from ortools.sat.python import cp_model

from .schemas import SolveRequest, SolveResponse


def solve(request: SolveRequest) -> SolveResponse:
    """Resuelve la asignacion curso-docente-aula-franja para un periodo.

    Sprint 0: stub que devuelve INFEASIBLE. Sprint 2-3: implementacion completa
    con cp_model.CpModel, variables booleanas curso-docente-aula-franja y
    restricciones duras (no solapamiento docente, no solapamiento aula,
    disponibilidad).
    """
    start = perf_counter()
    _ = cp_model.CpModel()
    return SolveResponse(
        status="INFEASIBLE",
        assignments=[],
        elapsed_seconds=perf_counter() - start,
        conflicts=[
            f"Solver no implementado todavia (Sprint 2-3). Recibidos {len(request.courses)} cursos."
        ],
    )
