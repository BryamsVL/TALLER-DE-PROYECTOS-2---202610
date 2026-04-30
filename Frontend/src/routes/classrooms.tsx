import { createFileRoute } from "@tanstack/react-router";
import { DoorOpen, Plus, Users } from "lucide-react";
import { PageHeader } from "../components/layout/AppLayout";
import { SectionCard, Pill } from "../components/ui/section-card";

export const Route = createFileRoute("/classrooms")({
  component: ClassroomsPage,
});

const classrooms = [
  { code: "A-101", type: "NORMAL", capacity: 40, ocupacion: 82, status: "Activa" },
  { code: "A-204", type: "NORMAL", capacity: 35, ocupacion: 64, status: "Activa" },
  { code: "LAB-12", type: "LABORATORY", capacity: 24, ocupacion: 91, status: "Activa" },
  { code: "LAB-13", type: "LABORATORY", capacity: 24, ocupacion: 50, status: "Mantenimiento" },
  { code: "AV-301", type: "AUDIOVISUAL", capacity: 60, ocupacion: 76, status: "Activa" },
  { code: "AV-302", type: "AUDIOVISUAL", capacity: 60, ocupacion: 22, status: "Activa" },
];

const typeTone = {
  NORMAL: "neutral",
  LABORATORY: "info",
  AUDIOVISUAL: "warning",
} as const;

function ClassroomsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Inventario de aulas" subtitle="Capacidades y ocupación promedio" />

      <div className="grid gap-5 md:grid-cols-4">
        {[
          { label: "Total", value: "42", tag: "Aulas registradas" },
          { label: "Normales", value: "26", tag: "Aulas teoría" },
          { label: "Laboratorios", value: "10", tag: "Equipados" },
          { label: "Audiovisuales", value: "6", tag: "Con proyector" },
        ].map((s) => (
          <SectionCard key={s.label} title={s.label}>
            <p className="font-display text-3xl font-bold">{s.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{s.tag}</p>
          </SectionCard>
        ))}
      </div>

      <SectionCard
        title="Aulas registradas"
        description="Distribución por tipo y ocupación semanal"
        action={
          <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">
            <Plus className="h-3.5 w-3.5" /> Nueva aula
          </button>
        }
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {classrooms.map((c) => (
            <div
              key={c.code}
              className="rounded-2xl border border-border bg-background p-5 transition-shadow hover:shadow-card"
            >
              <div className="flex items-start justify-between">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent/20 text-accent-foreground">
                  <DoorOpen className="h-5 w-5" />
                </div>
                <Pill tone={typeTone[c.type as keyof typeof typeTone]}>{c.type}</Pill>
              </div>
              <p className="mt-4 font-display text-xl font-bold">{c.code}</p>
              <p className="text-xs text-muted-foreground">{c.status}</p>

              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5" /> Capacidad {c.capacity}
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Ocupación</span>
                  <span className="font-semibold">{c.ocupacion}%</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${c.ocupacion}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
