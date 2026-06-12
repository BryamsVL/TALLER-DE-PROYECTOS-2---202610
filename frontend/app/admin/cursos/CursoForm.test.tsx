import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CursoForm } from "./CursoForm";
import { crearCurso } from "./actions";

// En este stack los formularios invocan SERVER ACTIONS (no fetch REST), por lo
// que el "mocking de dependencias externas" que la consigna pide con MSW se
// cumple aqui mockeando la server action con jest.mock. (MSW se usa en los
// componentes que si hacen fetch, p. ej. el panel de generacion de horario.)
jest.mock("./actions", () => ({
  crearCurso: jest.fn(),
}));

const mockCrearCurso = crearCurso as jest.MockedFunction<typeof crearCurso>;

async function llenarCampos() {
  await userEvent.type(screen.getByPlaceholderText("Código"), "MAT101");
  await userEvent.type(screen.getByPlaceholderText("Nombre del curso"), "Calculo I");
  await userEvent.type(screen.getByPlaceholderText("Ciclo"), "1");
  await userEvent.type(screen.getByPlaceholderText("Créditos"), "4");
  await userEvent.type(screen.getByPlaceholderText("Horas semanales"), "1.5");
}

beforeEach(() => {
  mockCrearCurso.mockReset();
});

describe("CursoForm", () => {
  it("renderiza todos los campos y el boton", () => {
    render(<CursoForm />);
    expect(screen.getByPlaceholderText("Código")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Nombre del curso")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Ciclo")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Créditos")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Horas semanales")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Crear curso/i })).toBeInTheDocument();
  });

  it("muestra errores de validacion devueltos por la action", async () => {
    mockCrearCurso.mockResolvedValue({
      errors: { code: ["Ya existe un curso con ese codigo."] },
    });
    render(<CursoForm />);
    await llenarCampos();
    await userEvent.click(screen.getByRole("button", { name: /Crear curso/i }));

    expect(
      await screen.findByText("Ya existe un curso con ese codigo."),
    ).toBeInTheDocument();
    expect(mockCrearCurso).toHaveBeenCalledTimes(1);
  });

  it("muestra el mensaje de error general", async () => {
    mockCrearCurso.mockResolvedValue({ message: "Error interno al crear el curso." });
    render(<CursoForm />);
    await llenarCampos();
    await userEvent.click(screen.getByRole("button", { name: /Crear curso/i }));

    expect(
      await screen.findByText("Error interno al crear el curso."),
    ).toBeInTheDocument();
  });

  it("invoca onSuccess cuando la action responde ok", async () => {
    mockCrearCurso.mockResolvedValue({ message: "ok" });
    const onSuccess = jest.fn();
    render(<CursoForm onSuccess={onSuccess} />);
    await llenarCampos();
    await userEvent.click(screen.getByRole("button", { name: /Crear curso/i }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
  });
});
