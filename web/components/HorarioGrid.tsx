type Dia = "LUN" | "MAR" | "MIE" | "JUE" | "VIE" | "SAB";

const DIAS: { key: Dia; label: string }[] = [
  { key: "LUN", label: "Lun" },
  { key: "MAR", label: "Mar" },
  { key: "MIE", label: "Mie" },
  { key: "JUE", label: "Jue" },
  { key: "VIE", label: "Vie" },
  { key: "SAB", label: "Sab" },
];

export interface BloqueRow {
  id: number;
  orden: number;
  hora_inicio: string;
  hora_fin: string;
}

export interface HorarioCell {
  dia: Dia;
  bloque_id: number;
  titulo: string;
  subtitulo?: string;
  detalle?: string;
}

interface HorarioGridProps {
  bloques: BloqueRow[];
  cells: HorarioCell[];
}

// Genera un color estable por titulo (hash simple). Usa hsl con saturacion fija.
function colorPorTitulo(titulo: string): string {
  let h = 0;
  for (let i = 0; i < titulo.length; i++) {
    h = (h * 31 + titulo.charCodeAt(i)) % 360;
  }
  return `hsl(${h} 70% 92%)`;
}

export function HorarioGrid({ bloques, cells }: HorarioGridProps) {
  const ordenadas = [...bloques].sort((a, b) => a.orden - b.orden);

  const indice = new Map<string, HorarioCell>();
  for (const c of cells) {
    indice.set(`${c.dia}|${c.bloque_id}`, c);
  }

  return (
    <div className="overflow-x-auto rounded-lg border bg-background">
      <div className="min-w-[720px] grid grid-cols-[120px_repeat(6,minmax(0,1fr))]">
        <div className="border-b border-r bg-muted/40 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Bloque
        </div>
        {DIAS.map((d) => (
          <div
            key={d.key}
            className="border-b px-2 py-2 text-center text-xs font-semibold uppercase tracking-wider bg-muted/40 text-muted-foreground"
          >
            {d.label}
          </div>
        ))}

        {ordenadas.map((b, idx) => {
          const isLast = idx === ordenadas.length - 1;
          return (
            <div key={b.id} className="contents">
              <div
                className={`flex flex-col gap-0.5 border-r px-3 py-3 text-xs ${
                  isLast ? "" : "border-b"
                }`}
              >
                <div className="font-medium">B{b.orden}</div>
                <div className="text-[10px] text-muted-foreground">
                  {b.hora_inicio.slice(0, 5)} - {b.hora_fin.slice(0, 5)}
                </div>
              </div>

              {DIAS.map((d) => {
                const cell = indice.get(`${d.key}|${b.id}`);
                return (
                  <div
                    key={`${d.key}-${b.id}`}
                    className={`px-1 py-1 ${isLast ? "" : "border-b"}`}
                  >
                    {cell ? (
                      <div
                        className="rounded-md p-2"
                        style={{ backgroundColor: colorPorTitulo(cell.titulo) }}
                      >
                        <div className="text-xs font-semibold leading-tight">
                          {cell.titulo}
                        </div>
                        {cell.subtitulo && (
                          <div className="text-[10px] text-muted-foreground">
                            {cell.subtitulo}
                          </div>
                        )}
                        {cell.detalle && (
                          <div className="text-[10px] text-muted-foreground">
                            {cell.detalle}
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
