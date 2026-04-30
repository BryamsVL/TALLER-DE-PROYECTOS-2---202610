import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, XCircle, AlertCircle, ShoppingCart } from "lucide-react";
import { PageHeader } from "../components/layout/AppLayout";
import { SectionCard, Pill } from "../components/ui/section-card";

export const Route = createFileRoute("/enrollment")({
  component: EnrollmentPage,
});

const courses = [
  { code: "MAT-201", name: "Cálculo II", credits: 4, prereq: "ok", room: "NORMAL", cupos: 12 },
  { code: "FIS-202", name: "Electromagnetismo", credits: 5, prereq: "ok", room: "LABORATORY", cupos: 4 },
  { code: "INF-302", name: "Algoritmos Avanzados", credits: 4, prereq: "ok", room: "LABORATORY", cupos: 8 },
  { code: "COM-210", name: "Redacción Académica", credits: 3, prereq: "warn", room: "AUDIOVISUAL", cupos: 22 },
  { code: "ING-321", name: "Termodinámica II", credits: 4, prereq: "err", room: "NORMAL", cupos: 0 },
  { code: "ARQ-410", name: "Modelado 3D", credits: 3, prereq: "ok", room: "LABORATORY", cupos: 6 },
];

const selected = ["MAT-201", "FIS-202", "INF-302", "COM-210"];

function EnrollmentPage() {
  const totalCredits = courses
    .filter((c) => selected.includes(c.code))
    .reduce((s, c) => s + c.credits, 0);
  const min = 20;
  const max = 22;
  const ok = totalCredits >= min && totalCredits <= max;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Matrícula 2025-II"
        subtitle="Selecciona entre 20 y 22 créditos respetando prerrequisitos"
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <SectionCard className="lg:col-span-2" title="Cursos disponibles">
          <div className="grid gap-3">
            {courses.map((c) => {
              const isSelected = selected.includes(c.code);
              const blocked = c.prereq === "err" || c.cupos === 0;
              return (
                <div
                  key={c.code}
                  className={`flex items-center justify-between rounded-2xl border p-4 transition-colors ${
                    isSelected
                      ? "border-accent bg-accent/10"
                      : blocked
                        ? "border-border bg-muted/40 opacity-60"
                        : "border-border bg-background hover:border-accent/50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      defaultChecked={isSelected}
                      disabled={blocked}
                      className="h-4 w-4 accent-[oklch(0.65_0.15_155)]"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{c.name}</p>
                        <span className="text-xs text-muted-foreground">{c.code}</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {c.credits} créditos · Aula {c.room} · {c.cupos} cupos
                      </p>
                    </div>
                  </div>
                  <div>
                    {c.prereq === "ok" && (
                      <Pill tone="success">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Prerreq. OK
                      </Pill>
                    )}
                    {c.prereq === "warn" && (
                      <Pill tone="warning">
                        <AlertCircle className="mr-1 h-3 w-3" />
                        Revisar
                      </Pill>
                    )}
                    {c.prereq === "err" && (
                      <Pill tone="danger">
                        <XCircle className="mr-1 h-3 w-3" />
                        Falta prerreq.
                      </Pill>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        <div className="space-y-5">
          <SectionCard title="Resumen">
            <div className="rounded-2xl bg-primary p-5 text-primary-foreground">
              <div className="flex items-center gap-2 text-xs text-accent">
                <ShoppingCart className="h-3.5 w-3.5" /> Carrito de matrícula
              </div>
              <p className="mt-3 font-display text-4xl font-bold">{totalCredits}</p>
              <p className="text-xs text-muted-foreground">de {max} créditos máximos</p>

              <div className="mt-4">
                <div className="h-2 w-full overflow-hidden rounded-full bg-sidebar-active">
                  <div
                    className="h-full rounded-full bg-accent transition-all"
                    style={{ width: `${(totalCredits / max) * 100}%` }}
                  />
                </div>
                <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
                  <span>min {min}</span>
                  <span>max {max}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              {selected.map((code) => {
                const c = courses.find((x) => x.code === code)!;
                return (
                  <div key={code} className="flex items-center justify-between">
                    <span className="text-muted-foreground">{c.name}</span>
                    <span className="font-semibold">{c.credits} cr</span>
                  </div>
                );
              })}
            </div>

            <button
              disabled={!ok}
              className={`mt-5 w-full rounded-xl py-3 text-sm font-semibold transition-opacity ${
                ok
                  ? "bg-accent text-accent-foreground hover:opacity-90"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {ok ? "Confirmar matrícula" : "Ajusta tus créditos"}
            </button>
          </SectionCard>

          <SectionCard title="Validaciones">
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-success-foreground" />
                Período activo
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-success-foreground" />
                Sin matrícula previa este período
              </li>
              <li className="flex items-center gap-2">
                {ok ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-success-foreground" />
                ) : (
                  <AlertCircle className="h-3.5 w-3.5 text-warning-foreground" />
                )}
                Créditos entre 20 y 22
              </li>
            </ul>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
