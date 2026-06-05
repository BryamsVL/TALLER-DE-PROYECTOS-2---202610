import { http, HttpResponse } from "msw";

// Endpoint del motor CSP que consume GenerarHorarioPanel.
// Debe coincidir con `${NEXT_PUBLIC_API_URL}/api/v1/solver/generate`.
export const SOLVER_GENERATE_URL =
  "http://localhost:3001/api/v1/solver/generate";

// Respuesta exitosa por defecto: horario OPTIMAL con reduccion de huecos.
export const respuestaSolverOptima = {
  success: true,
  status: "OPTIMAL",
  assignments: [
    {
      course_id: "c1",
      course_name: "Calculo I",
      teacher_id: "t1",
      teacher_name: "Maria Lopez",
      classroom_id: "a1",
      classroom_name: "A101",
      slot: { day: 1, start_minute: 420, end_minute: 510 },
    },
  ],
  conflicts: [],
  huecos: { baseline: 5, optimizado: 2, pct_reduccion: 60 },
};

// Handler base usado por todos los tests; cada escenario puede sobrescribirlo
// con server.use(...) para simular infactibilidad o error del servicio.
export const handlers = [
  http.post(SOLVER_GENERATE_URL, () =>
    HttpResponse.json(respuestaSolverOptima),
  ),
];
