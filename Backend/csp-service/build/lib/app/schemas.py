"""Esquemas Pydantic para el contrato HTTP del microservicio CSP."""

from typing import Literal

from pydantic import BaseModel, Field


class TimeSlot(BaseModel):
    """Franja horaria disponible. Dia ISO 8601 (1=Lunes, 7=Domingo)."""

    day: int = Field(ge=1, le=7, description="ISO day-of-week (1=Mon, 7=Sun)")
    start_minute: int = Field(ge=0, le=1440)
    end_minute: int = Field(ge=0, le=1440)


class CourseRequest(BaseModel):
    """Curso a asignar por el motor CSP."""

    id: str
    name: str
    credits: int = Field(ge=1, le=10)
    teacher_ids: list[str]
    classroom_ids: list[str]
    available_slots: list[TimeSlot]


class SolveRequest(BaseModel):
    """Payload del endpoint POST /solve."""

    period_id: str
    courses: list[CourseRequest]
    timeout_seconds: int = Field(default=30, ge=1, le=120)


class Assignment(BaseModel):
    """Asignacion resuelta curso-docente-aula-franja."""

    course_id: str
    teacher_id: str
    classroom_id: str
    slot: TimeSlot


SolveStatus = Literal["OPTIMAL", "FEASIBLE", "INFEASIBLE", "TIMEOUT"]


class SolveResponse(BaseModel):
    """Respuesta del endpoint POST /solve."""

    status: SolveStatus
    assignments: list[Assignment]
    elapsed_seconds: float
    conflicts: list[str] = Field(default_factory=list)
