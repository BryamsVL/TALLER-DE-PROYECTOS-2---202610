import { createFileRoute } from "@tanstack/react-router";
import { Plus, Filter, BookOpen, MoreHorizontal } from "lucide-react";
import { PageHeader } from "../components/layout/AppLayout";
import { SectionCard, Pill } from "../components/ui/section-card";

export const Route = createFileRoute("/courses")({
  component: CoursesPage,
});

const courses = [
  { code: "MAT-101", name: "Cálculo I", credits: 4, room: "NORMAL", prereq: 0, active: true },
  { code: "FIS-201", name: "Física Mecánica", credits: 5, room: "LABORATORY", prereq: 1, active: true },
  { code: "INF-301", name: "Estructuras de Datos", credits: 4, room: "LABORATORY", prereq: 2, active: true },
  { code: "COM-110", name: "Comunicación Oral", credits: 3, room: "AUDIOVISUAL", prereq: 0, active: true },
  { code: "ING-220", name: "Termodinámica", credits: 4, room: "NORMAL", prereq: 1, active: false },
  { code: "ARQ-310", name: "Diseño Asistido", credits: 3, room: "LABORATORY", prereq: 1, active: true },
];

const roomTone = {
  NORMAL: "neutral",
  LABORATORY: "info",
  AUDIOVISUAL: "warning",
} as const;

function CoursesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Catálogo de cursos"
        subtitle="Gestiona cursos, créditos y prerrequisitos"
      />

      <div className="grid gap-5 md:grid-cols-3">
        <SectionCard title="Cursos activos">
          <p className="font-display text-3xl font-bold">128</p>
          <p className="mt-1 text-xs text-muted-foreground">+8 este período</p>
        </SectionCard>
        <SectionCard title="Con prerrequisitos">
          <p className="font-display text-3xl font-bold">74</p>
          <p className="mt-1 text-xs text-muted-foreground">58% del catálogo</p>
        </SectionCard>
        <SectionCard title="Promedio créditos">
          <p className="font-display text-3xl font-bold">3.8</p>
          <p className="mt-1 text-xs text-muted-foreground">Rango 1–6</p>
        </SectionCard>
      </div>

      <SectionCard
        title="Lista de cursos"
        description="Filtra por aula requerida o estado"
        action={
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold">
              <Filter className="h-3.5 w-3.5" /> Filtros
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">
              <Plus className="h-3.5 w-3.5" /> Nuevo curso
            </button>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="pb-3 font-medium">Código</th>
                <th className="pb-3 font-medium">Curso</th>
                <th className="pb-3 font-medium">Créditos</th>
                <th className="pb-3 font-medium">Aula requerida</th>
                <th className="pb-3 font-medium">Prerreq.</th>
                <th className="pb-3 font-medium">Estado</th>
                <th />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {courses.map((c) => (
                <tr key={c.code}>
                  <td className="py-3 font-medium text-muted-foreground">{c.code}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-xl bg-accent/20 text-accent-foreground">
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <span className="font-semibold">{c.name}</span>
                    </div>
                  </td>
                  <td className="py-3">{c.credits}</td>
                  <td className="py-3">
                    <Pill tone={roomTone[c.room as keyof typeof roomTone]}>{c.room}</Pill>
                  </td>
                  <td className="py-3 text-muted-foreground">{c.prereq}</td>
                  <td className="py-3">
                    {c.active ? (
                      <Pill tone="success">Activo</Pill>
                    ) : (
                      <Pill tone="danger">Inactivo</Pill>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    <button className="rounded-lg p-1.5 hover:bg-muted">
                      <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
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
