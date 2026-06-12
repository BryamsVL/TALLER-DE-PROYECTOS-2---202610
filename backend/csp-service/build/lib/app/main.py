"""FastAPI entrypoint del microservicio CSP."""

from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .schemas import SolveRequest, SolveResponse
from .solver import solve

app = FastAPI(
    title="SGOHA CSP Service",
    version="0.1.0",
    description=(
        "Microservicio de Satisfaccion de Restricciones para horarios academicos. "
        "Consume un conjunto de cursos, docentes y aulas y devuelve una asignacion "
        "valida sin conflictos (RF-07, RF-08)."
    ),
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {
        "status": "ok",
        "service": "sgoha-csp-service",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.post("/solve", response_model=SolveResponse)
def solve_endpoint(request: SolveRequest) -> SolveResponse:
    return solve(request)
