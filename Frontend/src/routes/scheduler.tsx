import { createFileRoute } from "@tanstack/react-router";
import { Play, AlertTriangle, CheckCircle2, Clock, Sparkles } from "lucide-react";
import { PageHeader } from "../components/layout/AppLayout";
import { SectionCard, Pill } from "../components/ui/section-card";

export const Route = createFileRoute("/scheduler")({
  component: SchedulerPage,
});

const unassigned = [
  { code: "ING-321", reason: "Sin docente disponible" },
  { code: "ARQ-410", reason: "Sin aula tipo LAB" },
];

const conflicts = [
  { course: "MAT-201", detail: "Cruce con FIS-202 — Lun 08:30" },
];

function SchedulerPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Generador CSP"
        subtitle="Optimización con OR-Tools — Período 2025-II"
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <SectionCard className="lg:col-span-2" title="Ejecutar solver">
          <div className="rounded-3xl bg-primary p-6 text-primary-foreground">
            <div className="flex items-center gap-2 text-xs text-accent">
              <Sparkles className="h-3.5 w-3.5" /> CSP Engine · OR-Tools
            </div>
            <h3 className="mt-3 font-display text-2xl font-bold">
              Listo para generar el horario
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              312 cursos · 86 docentes · 42 aulas · timeout 6s
            </p>

            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { l: "Restricciones duras", v: "4" },
                { l: "Solución previa", v: "98%" },
                { l: "Tiempo medio", v: "1.2s" },
              ].map((s) => (
                <div key={s.l} className="rounded-2xl bg-sidebar-active p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {s.l}
                  </p>
                  <p className="mt-1 font-display text-xl font-bold">{s.v}</p>
                </div>
              ))}
            </div>

            <button className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground">
              <Play className="h-4 w-4" /> Ejecutar generador
            </button>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-background p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-success-foreground">
                <CheckCircle2 className="h-3.5 w-3.5" /> Última ejecución
              </div>
              <p className="mt-2 font-display text-lg font-bold">COMPLETE</p>
              <p className="text-xs text-muted-foreground">
                hace 38 minutos · 1240 ms
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-background p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-warning-foreground">
                <Clock className="h-3.5 w-3.5" /> Cache
              </div>
              <p className="mt-2 font-display text-lg font-bold">42 min</p>
              <p className="text-xs text-muted-foreground">TTL restante</p>
            </div>
          </div>
        </SectionCard>

        <div className="space-y-5">
          <SectionCard
            title="Conflictos detectados"
            action={<Pill tone="danger">{conflicts.length}</Pill>}
          >
            {conflicts.map((c) => (
              <div
                key={c.course}
                className="rounded-2xl border border-destructive/30 bg-destructive/5 p-3"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <p className="text-sm font-semibold">{c.course}</p>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{c.detail}</p>
              </div>
            ))}
          </SectionCard>

          <SectionCard
            title="Cursos sin asignar"
            action={<Pill tone="warning">{unassigned.length}</Pill>}
          >
            <ul className="space-y-2">
              {unassigned.map((u) => (
                <li
                  key={u.code}
                  className="flex items-center justify-between rounded-xl bg-background p-3 text-sm"
                >
                  <span className="font-semibold">{u.code}</span>
                  <span className="text-xs text-muted-foreground">{u.reason}</span>
                </li>
              ))}
            </ul>
            <button className="mt-3 w-full rounded-xl border border-border py-2 text-xs font-semibold">
              Asignar manualmente
            </button>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
