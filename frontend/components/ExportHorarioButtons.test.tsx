import { render, screen } from "@testing-library/react";
import { ExportHorarioButtons } from "./ExportHorarioButtons";

describe("ExportHorarioButtons", () => {
  it("renderiza los enlaces de exportar PDF y Excel", () => {
    render(<ExportHorarioButtons />);
    expect(screen.getByText("Exportar PDF")).toBeInTheDocument();
    expect(screen.getByText("Exportar Excel")).toBeInTheDocument();
  });

  it("apunta a la ruta de export con el formato correcto", () => {
    render(<ExportHorarioButtons />);
    const pdf = screen.getByRole("link", { name: /Exportar PDF/i });
    const excel = screen.getByRole("link", { name: /Exportar Excel/i });
    expect(pdf).toHaveAttribute("href", "/api/horario/export?formato=pdf");
    expect(excel).toHaveAttribute("href", "/api/horario/export?formato=excel");
  });

  it("marca los enlaces como descarga", () => {
    render(<ExportHorarioButtons />);
    for (const link of screen.getAllByRole("link")) {
      expect(link).toHaveAttribute("download");
    }
  });
});
