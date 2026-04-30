import { createFileRoute } from "@tanstack/react-router";
import { CalendarRange, CheckCircle2, Clock, Plus } from "lucide-react";
import { PageHeader } from "../components/layout/AppLayout";
import { SectionCard, Pill } from "../components/ui/section-card";

export const Route = createFileRoute("/periods")({
  component: PeriodsPage,
});

const periods = [
  { code: "2025-II", from: "12 Ago 2025", to: "20 Dic 2025", status: "ACTIVE" },
  { code: "2025-I", from: "10 Mar 2025", to: "30 Jul 2025", status: "CLOSED" },
  { code: "2024-II", from: "12 Ago 2024", to: "20 Dic 2024", status: "CLOSED" },
  { code: "2026-I", from: "09 Mar 2026", to: "29 Jul 2026", status: "DRAFT" },
];

function PeriodsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Períodos académicos"
        subtitle="Solo un período puede estar activo a la vez"
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <SectionCard
          className="lg:col-span-2"
          title="Período activo"
          description="2025-II — Matrícula abierta hasta el 30 Ago"
          action={<Pill tone="success">ACTIVE</Pill>}
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-background p-4">
              <p className="text-xs text-muted-foreground">Inicio</p>
              <p className="mt-1 font-display text-lg font-bold">12 Ago 2025</p>
            </div>
            <div className="rounded-2xl bg-background p-4">
              <p className="text-xs text-muted-foreground">Cierre</p>
              <p className="mt-1 font-display text-lg font-bold">20 Dic 2025</p>
            </div>
            <div className="rounded-2xl bg-background p-4">
              <p className="text-xs text-muted-foreground">Días restantes</p>
              <p className="mt-1 font-display text-lg font-bold">112</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <button className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">
              Cerrar matrícula
            </button>
            <button className="rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold">
              Extender plazo
            </button>
          </div>
        </SectionCard>

        <SectionCard title="Reglas">
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-success-foreground" />
              Solo un período en estado ACTIVE.
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-success-foreground" />
              Activar uno nuevo desactiva el anterior.
            </li>
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 text-warning-foreground" />
              Cerrar bloquea nuevas matrículas.
            </li>
          </ul>
        </SectionCard>
      </div>

      <SectionCard
        title="Historial de períodos"
        action={
          <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">
            <Plus className="h-3.5 w-3.5" /> Nuevo período
          </button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="pb-3 font-medium">Código</th>
                <th className="pb-3 font-medium">Inicio</th>
                <th className="pb-3 font-medium">Cierre</th>
                <th className="pb-3 font-medium">Estado</th>
                <th />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {periods.map((p) => (
                <tr key={p.code}>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-xl bg-info/20 text-info-foreground">
                        <CalendarRange className="h-4 w-4" />
                      </div>
                      <span className="font-semibold">{p.code}</span>
                    </div>
                  </td>
                  <td className="py-3 text-muted-foreground">{p.from}</td>
                  <td className="py-3 text-muted-foreground">{p.to}</td>
                  <td className="py-3">
                    {p.status === "ACTIVE" && <Pill tone="success">ACTIVE</Pill>}
                    {p.status === "CLOSED" && <Pill tone="neutral">CLOSED</Pill>}
                    {p.status === "DRAFT" && <Pill tone="warning">DRAFT</Pill>}
                  </td>
                  <td className="py-3 text-right">
                    <button className="text-xs font-semibold text-muted-foreground hover:text-foreground">
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
