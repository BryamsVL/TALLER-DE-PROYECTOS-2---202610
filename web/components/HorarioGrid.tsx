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
  cursoNombre: string;
  nrc: string;
  aula: string;
  docente?: string;
}

interface HorarioGridProps {
  bloques: BloqueRow[];
  cells: HorarioCell[];
}

function formatTimeAMPM(time24: string) {
  const [h, m] = time24.split(":");
  let hours = parseInt(h, 10);
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  return `${hours}:${m} ${ampm}`;
}

export function HorarioGrid({ bloques, cells }: HorarioGridProps) {
  const ordenadas = [...bloques].sort((a, b) => a.orden - b.orden);

  const indice = new Map<string, HorarioCell>();
  for (const c of cells) {
    indice.set(`${c.dia}|${c.bloque_id}`, c);
  }

  return (
    <div className="overflow-x-auto bg-background">
      <div className="min-w-[720px] grid grid-cols-[80px_repeat(6,minmax(0,1fr))]">
        <div className="bg-[#28a745] px-2 py-3"></div>
        {DIAS.map((d) => (
          <div
            key={d.key}
            className="px-2 py-3 text-center text-sm font-bold text-white bg-[#28a745]"
          >
            {d.label === "Mie" ? "Miércoles" : d.label === "Sab" ? "Sábado" : d.label}
          </div>
        ))}

        {ordenadas.map((b, idx) => {
          const isLast = idx === ordenadas.length - 1;
          const [h] = b.hora_inicio.split(":");
          return (
            <div key={b.id} className="contents group">
              <div
                className={`flex items-start justify-center border-r px-2 py-4 text-xs font-semibold ${
                  isLast ? "" : "border-b"
                }`}
              >
                {h}:00
              </div>

              {DIAS.map((d) => {
                const cell = indice.get(`${d.key}|${b.id}`);
                return (
                  <div
                    key={`${d.key}-${b.id}`}
                    className={`p-1 ${isLast ? "" : "border-b"} border-r border-slate-200 last:border-r-0 relative`}
                  >
                    {cell ? (
                      <div
                        className="h-full w-full bg-[#ff7f0e] text-white p-2 flex flex-col items-center justify-center text-center shadow-sm"
                      >
                        <div className="text-[10px] font-bold uppercase leading-tight mb-1">
                          {cell.cursoNombre}
                        </div>
                        <div className="text-[10px] mb-1">NRC: {cell.nrc}</div>
                        <div className="text-[10px] mb-1">
                          {formatTimeAMPM(b.hora_inicio)} - {formatTimeAMPM(b.hora_fin)}
                        </div>
                        <div className="text-[10px] mb-1">Aula - {cell.aula}</div>
                        {cell.docente && (
                          <div className="text-[9px] italic mt-1">
                            {cell.docente}
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
