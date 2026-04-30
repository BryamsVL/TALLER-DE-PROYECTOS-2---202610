import { createFileRoute } from "@tanstack/react-router";
import { FileText, FileSpreadsheet, Download, BarChart3 } from "lucide-react";
import { PageHeader } from "../components/layout/AppLayout";
import { SectionCard, Pill } from "../components/ui/section-card";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/reports")({
  component: ReportsPage,
});

const occupation = [
  { aula: "A-101", v: 82 },
  { aula: "A-204", v: 64 },
  { aula: "LAB-12", v: 91 },
  { aula: "LAB-13", v: 50 },
  { aula: "AV-301", v: 76 },
  { aula: "AV-302", v: 22 },
];

const docs = [
  {
    icon: FileText,
    title: "Horario completo (PDF)",
    desc: "Documento institucional con paginación",
    fmt: "PDF",
  },
  {
    icon: FileSpreadsheet,
    title: "Horario por turnos (Excel)",
    desc: "Hoja por turno · headers congelados",
    fmt: "XLSX",
  },
  {
    icon: BarChart3,
    title: "Carga horaria por docente",
    desc: "Total de horas por semana",
    fmt: "PDF",
  },
  {
    icon: BarChart3,
    title: "Ocupación de aulas",
    desc: "Promedio semanal por aula",
    fmt: "XLSX",
  },
];

function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reportes"
        subtitle="Exportables institucionales del período activo"
      />

      <div className="grid gap-5 md:grid-cols-2">
        {docs.map((d) => (
          <SectionCard key={d.title}>
            <div className="flex items-start justify-between">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-accent/20 text-accent-foreground">
                <d.icon className="h-5 w-5" />
              </div>
              <Pill tone={d.fmt === "PDF" ? "danger" : "success"}>{d.fmt}</Pill>
            </div>
            <h3 className="mt-4 font-display text-lg font-bold">{d.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{d.desc}</p>
            <button className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground">
              <Download className="h-3.5 w-3.5" /> Descargar
            </button>
          </SectionCard>
        ))}
      </div>

      <SectionCard
        title="Ocupación semanal de aulas"
        description="Porcentaje promedio Lun–Sáb"
      >
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={occupation} margin={{ left: -12, right: 8, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.92 0.008 250)" />
              <XAxis
                dataKey="aula"
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
                cursor={{ fill: "oklch(0.96 0.006 250)" }}
                contentStyle={{
                  borderRadius: 12,
                  border: "none",
                  background: "oklch(0.22 0.015 260)",
                  color: "white",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="v" radius={[8, 8, 0, 0]} fill="oklch(0.78 0.16 155)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>
    </div>
  );
}
