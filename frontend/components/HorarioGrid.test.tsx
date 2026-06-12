import { render, screen } from "@testing-library/react";
import { HorarioGrid, type BloqueRow, type HorarioCell } from "./HorarioGrid";

const bloques: BloqueRow[] = [
  { id: 1, orden: 1, hora_inicio: "07:00", hora_fin: "08:30" },
  { id: 2, orden: 2, hora_inicio: "08:40", hora_fin: "10:10" },
];

describe("HorarioGrid", () => {
  it("renderiza las cabeceras de los 6 dias", () => {
    render(<HorarioGrid bloques={bloques} cells={[]} />);
    for (const dia of ["Lun", "Mar", "Miércoles", "Jue", "Vie", "Sábado"]) {
      expect(screen.getByText(dia)).toBeInTheDocument();
    }
  });

  it("muestra los datos de una sesion asignada (curso, NRC, aula, docente)", () => {
    const cells: HorarioCell[] = [
      {
        dia: "LUN",
        bloque_id: 1,
        cursoNombre: "Calculo I",
        nrc: "61001",
        aula: "A101",
        docente: "Maria Lopez",
      },
    ];
    render(<HorarioGrid bloques={bloques} cells={cells} />);
    expect(screen.getByText("Calculo I")).toBeInTheDocument();
    expect(screen.getByText("NRC: 61001")).toBeInTheDocument();
    expect(screen.getByText("Aula - A101")).toBeInTheDocument();
    expect(screen.getByText("Maria Lopez")).toBeInTheDocument();
  });

  it("estado vacio: sin celdas no renderiza ninguna sesion", () => {
    render(<HorarioGrid bloques={bloques} cells={[]} />);
    expect(screen.queryByText(/NRC:/)).not.toBeInTheDocument();
  });

  it("renderizado condicional: omite el docente cuando no viene", () => {
    const cells: HorarioCell[] = [
      { dia: "MAR", bloque_id: 2, cursoNombre: "Fisica", nrc: "61002", aula: "B202" },
    ];
    render(<HorarioGrid bloques={bloques} cells={cells} />);
    expect(screen.getByText("Fisica")).toBeInTheDocument();
    // No hay docente en esta celda: el nombre no debe aparecer.
    expect(screen.queryByText("Maria Lopez")).not.toBeInTheDocument();
  });
});
