import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  Users,
  GraduationCap,
  CalendarCheck2,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
  BarChart,
} from "recharts";
import { PageHeader } from "../components/layout/AppLayout";
import { StatCard } from "../components/ui/stat-card";
import { SectionCard, Pill } from "../components/ui/section-card";

export const Route = createFileRoute("/")({
  component: DashboardPage,
});

const performance = [
  { m: "Ene", v: 22 },
  { m: "Feb", v: 28 },
  { m: "Mar", v: 24 },
  { m: "Abr", v: 32 },
  { m: "May", v: 42 },
  { m: "Jun", v: 35 },
  { m: "Jul", v: 38 },
  { m: "Ago", v: 30 },
  { m: "Sep", v: 36 },
];

const mini = [
  { v: 4 },
  { v: 6 },
  { v: 5 },
  { v: 8 },
  { v: 7 },
  { v: 10 },
  { v: 9 },
];

function MiniBars({ color }: { color: string }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={mini}>
        <Bar dataKey="v" radius={[4, 4, 0, 0]} fill={color} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Resumen académico"
        subtitle="Período 2025-II · Métricas de matrícula y horarios"
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Matrícula activa"
          value="1,284"
          delta="+5.4%"
          trend="up"
          caption="Estudiantes matriculados este período"
          icon={GraduationCap}
          iconClass="bg-info/30 text-info-foreground"
          chart={<MiniBars color="oklch(0.78 0.16 155)" />}
        />
        <StatCard
          label="Cursos programados"
          value="312"
          delta="+3.7%"
          trend="up"
          caption="Asignados por el motor CSP"
          icon={CalendarCheck2}
          iconClass="bg-warning/40 text-warning-foreground"
          chart={<MiniBars color="oklch(0.78 0.16 155)" />}
        />
        <StatCard
          label="Docentes en aula"
          value="86"
          delta="-2.1%"
          trend="down"
          caption="Disponibilidades cargadas vs. requeridas"
          icon={Users}
          iconClass="bg-accent/30 text-accent-foreground"
          chart={<MiniBars color="oklch(0.78 0.16 155)" />}
        />
        <StatCard
          label="Ocupación de aulas"
          value="78%"
          delta="+6.3%"
          trend="up"
          caption="Promedio semanal Lun–Sáb"
          icon={Activity}
          iconClass="bg-success/30 text-success-foreground"
          chart={<MiniBars color="oklch(0.78 0.16 155)" />}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <SectionCard
          className="lg:col-span-2"
          title="Demanda de matrícula"
          description="Histórico mensual de matrículas confirmadas"
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performance} margin={{ left: -16, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.78 0.16 155)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.78 0.16 155)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="m"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "oklch(0.5 0.02 260)" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "oklch(0.5 0.02 260)" }}
                />
                <Tooltip
                  cursor={{ stroke: "oklch(0.78 0.16 155)", strokeDasharray: "4 4" }}
                  contentStyle={{
                    borderRadius: 12,
                    border: "none",
                    background: "oklch(0.22 0.015 260)",
                    color: "white",
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke="oklch(0.65 0.15 155)"
                  strokeWidth={3}
                  fill="url(#g1)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Acciones rápidas" description="Atajos del coordinador">
          <div className="space-y-3">
            {[
              { label: "Generar horario CSP", to: "Scheduler" },
              { label: "Exportar reporte PDF", to: "Reportes" },
              { label: "Activar período 2026-I", to: "Períodos" },
            ].map((item) => (
              <button
                key={item.label}
                className="flex w-full items-center justify-between rounded-2xl border border-border bg-background px-4 py-3 text-left transition-colors hover:border-accent hover:bg-accent/10"
              >
                <span className="text-sm font-medium">{item.label}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-2xl bg-primary p-5 text-primary-foreground">
            <div className="flex items-center gap-2 text-xs font-medium text-accent">
              <Sparkles className="h-3.5 w-3.5" />
              Optimización CSP
            </div>
            <p className="mt-3 text-sm leading-snug">
              Hay 12 docentes sin disponibilidad cargada. Resuélvelo antes de
              ejecutar el solver.
            </p>
            <button className="mt-4 w-full rounded-xl bg-accent py-2.5 text-sm font-semibold text-accent-foreground">
              Revisar pendientes
            </button>
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Matrículas recientes"
        description="Últimas confirmaciones registradas"
        action={<Pill tone="info">Período activo</Pill>}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="pb-3 font-medium">Código</th>
                <th className="pb-3 font-medium">Estudiante</th>
                <th className="pb-3 font-medium">Carrera</th>
                <th className="pb-3 font-medium">Créditos</th>
                <th className="pb-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                { c: "U2024-0182", n: "James Brown", car: "Ing. Sistemas", cr: 22, s: "ok" },
                { c: "U2024-0183", n: "Richard Clark", car: "Ing. Industrial", cr: 20, s: "warn" },
                { c: "U2024-0184", n: "David Taylor", car: "Ing. Civil", cr: 21, s: "ok" },
                { c: "U2024-0185", n: "Sara Pérez", car: "Arquitectura", cr: 18, s: "err" },
              ].map((r) => (
                <tr key={r.c}>
                  <td className="py-3 font-medium text-muted-foreground">{r.c}</td>
                  <td className="py-3 font-semibold">{r.n}</td>
                  <td className="py-3 text-muted-foreground">{r.car}</td>
                  <td className="py-3">{r.cr}</td>
                  <td className="py-3">
                    {r.s === "ok" && <Pill tone="success">Confirmada</Pill>}
                    {r.s === "warn" && <Pill tone="warning">Revisión</Pill>}
                    {r.s === "err" && <Pill tone="danger">Créditos &lt; 20</Pill>}
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
