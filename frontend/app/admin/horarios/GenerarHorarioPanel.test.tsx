import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { GenerarHorarioPanel } from "./GenerarHorarioPanel";
import { server } from "@/mocks/server";
import { SOLVER_GENERATE_URL } from "@/mocks/handlers";

// El panel es el unico componente que consume la API REST del motor CSP
// (`fetch ${NEXT_PUBLIC_API_URL}/api/v1/solver/generate`). La dependencia externa
// se simula con MSW (interceptando la peticion a nivel de red) para validar los
// estados async: exito, infactibilidad y error del servicio.
// (El resto de formularios usan server actions, mockeadas con jest.mock.)

afterEach(() => {
  localStorage.clear();
});

describe("GenerarHorarioPanel", () => {
  it("genera el horario y muestra el % de reduccion de huecos", async () => {
    // Usa el handler base de mocks/handlers.ts (respuesta OPTIMAL).
    render(<GenerarHorarioPanel />);
    await userEvent.click(
      screen.getByRole("button", { name: /Generar Horario Óptimo/i }),
    );

    expect(await screen.findByText(/Horario Compilado/i)).toBeInTheDocument();
    expect(screen.getByText(/60% reducción/)).toBeInTheDocument();
  });

  it("muestra los conflictos cuando el modelo es infactible", async () => {
    server.use(
      http.post(SOLVER_GENERATE_URL, () =>
        HttpResponse.json({
          success: true,
          status: "INFEASIBLE",
          assignments: [],
          conflicts: ["Sin aulas suficientes"],
        }),
      ),
    );

    render(<GenerarHorarioPanel />);
    await userEvent.click(
      screen.getByRole("button", { name: /Generar Horario Óptimo/i }),
    );

    expect(await screen.findByText(/Conflictos Detectados/i)).toBeInTheDocument();
    expect(screen.getByText(/Sin aulas suficientes/)).toBeInTheDocument();
  });

  it("muestra el estado de error cuando la API falla", async () => {
    server.use(
      http.post(SOLVER_GENERATE_URL, () =>
        HttpResponse.json({ error: "CSP Service Error" }, { status: 500 }),
      ),
    );

    render(<GenerarHorarioPanel />);
    await userEvent.click(
      screen.getByRole("button", { name: /Generar Horario Óptimo/i }),
    );

    expect(await screen.findByText(/CSP Service Error/i)).toBeInTheDocument();
  });
});
