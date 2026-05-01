import { createFileRoute } from "@tanstack/react-router";
import { Search, Filter, Shield } from "lucide-react";
import { PageHeader } from "../components/layout/AppLayout";
import { SectionCard, Pill } from "../components/ui/section-card";

export const Route = createFileRoute("/audit")({
  component: AuditPage,
});

const logs = [
  {
    user: "David Taylor",
    action: "SCHEDULE_GENERATED",
    entity: "Schedule#2025-II",
    desc: "Solver CSP ejecutado · 312 asignaciones",
    when: "hace 38 min",
    tone: "info",
  },
  {
    user: "Coordinación",
    action: "PERIOD_ACTIVATED",
    entity: "Period#2025-II",
    desc: "Período 2025-II activado · 2025-I cerrado",
    when: "hace 2 h",
    tone: "success",
  },
  {
    user: "James Brown",
    action: "ENROLLMENT_CONFIRMED",
    entity: "Enrollment#U2024-0182",
    desc: "Matrícula confirmada · 22 créditos",
    when: "hace 4 h",
    tone: "success",
  },
  {
    user: "Admin",
    action: "USER_DEACTIVATED",
    entity: "User#1284",
    desc: "Cuenta desactivada por inactividad",
    when: "ayer",
    tone: "warning",
  },
  {
    user: "David Taylor",
    action: "ASSIGNMENT_MODIFIED",
    entity: "Assignment#9821",
    desc: "Aula cambiada de A-101 a A-204",
    when: "ayer",
    tone: "info",
  },
  {
    user: "Admin",
    action: "REPORT_EXPORTED",
    entity: "Report#schedule.pdf",
    desc: "Horario exportado en PDF",
    when: "2 días",
    tone: "neutral",
  },
] as const;

function AuditPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Auditoría del sistema"
        subtitle="Log inmutable de acciones críticas"
      />

      <div className="grid gap-5 md:grid-cols-4">
        {[
          { l: "Eventos hoy", v: "84" },
          { l: "Esta semana", v: "612" },
          { l: "Modificaciones", v: "27" },
          { l: "Exportaciones", v: "11" },
        ].map((s) => (
          <SectionCard key={s.l} title={s.l}>
            <p className="font-display text-3xl font-bold">{s.v}</p>
          </SectionCard>
        ))}
      </div>

      <SectionCard
        title="Bitácora"
        description="Filtra por fecha, usuario o acción"
        action={
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 md:flex">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <input
                placeholder="Buscar acción…"
                className="w-44 bg-transparent text-xs outline-none"
              />
            </div>
            <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold">
              <Filter className="h-3.5 w-3.5" /> Filtros
            </button>
          </div>
        }
      >
        <ul className="space-y-3">
          {logs.map((l, i) => (
            <li
              key={i}
              className="flex items-start gap-4 rounded-2xl border border-border bg-background p-4"
            >
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
                <Shield className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{l.user}</p>
                  <Pill tone={l.tone as "info" | "success" | "warning" | "neutral"}>
                    {l.action}
                  </Pill>
                  <span className="text-xs text-muted-foreground">{l.entity}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{l.desc}</p>
              </div>
              <span className="whitespace-nowrap text-xs text-muted-foreground">
                {l.when}
              </span>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
