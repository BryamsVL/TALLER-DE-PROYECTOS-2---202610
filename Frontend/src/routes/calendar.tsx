import { createFileRoute } from "@tanstack/react-router";
import { Filter } from "lucide-react";
import { PageHeader } from "../components/layout/AppLayout";
import { SectionCard, Pill } from "../components/ui/section-card";

export const Route = createFileRoute("/calendar")({
  component: CalendarPage,
});

const DAYS = ["LUN", "MAR", "MIE", "JUE", "VIE", "SAB"];
const SLOTS = [
  "07:00", "08:30", "10:00", "11:30", "13:00", "14:30", "16:00", "17:30", "19:00",
];

type Event = {
  day: number;
  slot: number;
  span?: number;
  title: string;
  room: string;
  color: "accent" | "info" | "warning" | "primary";
};

const events: Event[] = [
  { day: 0, slot: 0, title: "Cálculo II", room: "A-101", color: "accent" },
  { day: 0, slot: 2, title: "Algoritmos", room: "LAB-12", color: "info" },
  { day: 1, slot: 1, title: "Física Mec.", room: "LAB-13", color: "primary" },
  { day: 1, slot: 4, title: "Redacción", room: "AV-301", color: "warning" },
  { day: 2, slot: 0, title: "Cálculo II", room: "A-101", color: "accent" },
  { day: 2, slot: 3, title: "Termodinámica", room: "A-204", color: "info" },
  { day: 3, slot: 2, title: "Algoritmos", room: "LAB-12", color: "info" },
  { day: 3, slot: 5, title: "Modelado 3D", room: "LAB-13", color: "primary" },
  { day: 4, slot: 1, title: "Física Mec.", room: "LAB-13", color: "primary" },
  { day: 4, slot: 4, title: "Redacción", room: "AV-301", color: "warning" },
  { day: 5, slot: 0, title: "Tutoría", room: "A-101", color: "accent" },
];

const colorMap: Record<Event["color"], string> = {
  accent: "bg-accent/30 text-accent-foreground border-accent/40",
  info: "bg-info/30 text-info-foreground border-info/40",
  warning: "bg-warning/40 text-warning-foreground border-warning/50",
  primary: "bg-primary text-primary-foreground border-primary",
};

function CalendarPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendario semanal"
        subtitle="Lun–Sáb · 07:00–20:30 · Franjas de 90 minutos"
      />

      <SectionCard
        title="Horario activo"
        description="Período 2025-II · Vista de coordinador"
        action={
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold">
              <Filter className="h-3.5 w-3.5" /> Filtrar
            </button>
            <Pill tone="success">Sincronizado</Pill>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <div className="min-w-[820px]">
            <div className="grid grid-cols-[80px_repeat(6,1fr)] gap-2">
              <div />
              {DAYS.map((d) => (
                <div
                  key={d}
                  className="rounded-xl bg-background py-2 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {d}
                </div>
              ))}

              {SLOTS.flatMap((slot, sIdx) => [
                <div
                  key={`s-${slot}`}
                  className="flex items-start justify-end pr-2 pt-1 text-[11px] font-medium text-muted-foreground"
                >
                  {slot}
                </div>,
                ...DAYS.map((_, dIdx) => {
                  const ev = events.find((e) => e.day === dIdx && e.slot === sIdx);
                  return (
                    <div
                      key={`${dIdx}-${sIdx}`}
                      className="min-h-[64px] rounded-xl bg-background p-1.5"
                    >
                      {ev && (
                        <div
                          className={`h-full rounded-lg border p-2 text-[11px] leading-tight ${colorMap[ev.color]}`}
                        >
                          <p className="font-semibold">{ev.title}</p>
                          <p className="opacity-70">{ev.room}</p>
                        </div>
                      )}
                    </div>
                  );
                }),
              ])}
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
