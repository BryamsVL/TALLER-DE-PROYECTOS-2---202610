import prisma from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { HorarioGrid, type HorarioCell } from "@/components/HorarioGrid";
import { ExportHorarioButtons } from "@/components/ExportHorarioButtons";

export const dynamic = "force-dynamic";

const DIA_LABELS: Record<string, string> = {
  LUN: "Lunes",
  MAR: "Martes",
  MIE: "Miércoles",
  JUE: "Jueves",
  VIE: "Viernes",
  SAB: "Sábado",
};

// DayOfWeek (Prisma) -> clave de día usada por HorarioGrid.
const DAY_ENUM_TO_DIA: Record<string, HorarioCell["dia"]> = {
  MONDAY: "LUN",
  TUESDAY: "MAR",
  WEDNESDAY: "MIE",
  THURSDAY: "JUE",
  FRIDAY: "VIE",
  SATURDAY: "SAB",
};

// 9 bloques fijos (mismo esquema que el panel admin / solver). id = slotOrder.
const BLOQUES = [
  { id: 1, orden: 1, hora_inicio: "07:00", hora_fin: "08:30" },
  { id: 2, orden: 2, hora_inicio: "08:40", hora_fin: "10:10" },
  { id: 3, orden: 3, hora_inicio: "10:20", hora_fin: "11:50" },
  { id: 4, orden: 4, hora_inicio: "12:00", hora_fin: "13:30" },
  { id: 5, orden: 5, hora_inicio: "14:00", hora_fin: "15:30" },
  { id: 6, orden: 6, hora_inicio: "15:40", hora_fin: "17:10" },
  { id: 7, orden: 7, hora_inicio: "17:20", hora_fin: "18:50" },
  { id: 8, orden: 8, hora_inicio: "19:00", hora_fin: "20:30" },
  { id: 9, orden: 9, hora_inicio: "20:40", hora_fin: "22:10" },
];

const CARGA_EXCESIVA_MIN = 240; // B2: alerta si supera 4h consecutivas

function toMin(time: string) {
  const [h, m] = time.split(":");
  return Number(h) * 60 + Number(m);
}

function fmtHoras(min: number) {
  return `${(min / 60).toFixed(min % 60 === 0 ? 0 : 1)} h`;
}

const DUR_BY_ORDEN = new Map(
  BLOQUES.map((b) => [b.orden, toMin(b.hora_fin) - toMin(b.hora_inicio)]),
);

function maxRunMin(ordenes: number[]) {
  const sorted = [...new Set(ordenes)].sort((a, b) => a - b);
  let best = 0;
  let run = 0;
  let prev = Number.NEGATIVE_INFINITY;
  for (const orden of sorted) {
    const dur = DUR_BY_ORDEN.get(orden) ?? 0;
    run = orden === prev + 1 ? run + dur : dur;
    best = Math.max(best, run);
    prev = orden;
  }
  return best;
}

interface SesionRow {
  dia: string;
  orden: number;
}

function computeCargaDocente(sesiones: SesionRow[]) {
  const minByDia = new Map<string, number>();
  const ordenByDia = new Map<string, number[]>();
  for (const s of sesiones) {
    const dur = DUR_BY_ORDEN.get(s.orden) ?? 0;
    minByDia.set(s.dia, (minByDia.get(s.dia) ?? 0) + dur);
    ordenByDia.set(s.dia, [...(ordenByDia.get(s.dia) ?? []), s.orden]);
  }
  const diasExcesivos = [...ordenByDia.entries()]
    .filter(([, ords]) => maxRunMin(ords) > CARGA_EXCESIVA_MIN)
    .map(([dia]) => dia);
  const porDia = [...minByDia.entries()]
    .map(([dia, min]) => ({ dia, min }))
    .sort(
      (a, b) =>
        Object.keys(DIA_LABELS).indexOf(a.dia) -
        Object.keys(DIA_LABELS).indexOf(b.dia),
    );
  const totalMin = porDia.reduce((acc, d) => acc + d.min, 0);
  return { totalMin, porDia, diasExcesivos };
}

export default async function DocenteHorarioPage() {
  const { user } = await getSessionProfile();

  const teacher = await prisma.teacher.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  const period = await prisma.academicPeriod.findFirst({
    where: { isActive: true },
    select: { id: true, name: true },
  });

  const schedule =
    teacher && period
      ? await prisma.teachingSchedule.findFirst({
          where: { academicPeriodId: period.id },
          orderBy: { createdAt: "desc" },
          select: { id: true },
        })
      : null;

  const slots =
    teacher && schedule
      ? await prisma.sectionAssignmentSlot.findMany({
          where: { teachingScheduleId: schedule.id, teacherId: teacher.id },
          select: {
            timeSlot: { select: { dayOfWeek: true, slotOrder: true } },
            classroom: { select: { name: true } },
            sectionAssignment: {
              select: {
                section: {
                  select: {
                    courseOffering: {
                      select: {
                        course: { select: { code: true, name: true } },
                      },
                    },
                  },
                },
              },
            },
          },
        })
      : [];

  const cells: HorarioCell[] = slots.map((s) => {
    const course = s.sectionAssignment.section.courseOffering.course;
    return {
      dia: DAY_ENUM_TO_DIA[s.timeSlot.dayOfWeek] ?? "LUN",
      bloque_id: s.timeSlot.slotOrder,
      cursoNombre: course.name,
      nrc: course.code,
      aula: s.classroom.name,
    };
  });

  const carga = computeCargaDocente(
    slots.map((s) => ({
      dia: DAY_ENUM_TO_DIA[s.timeSlot.dayOfWeek] ?? "LUN",
      orden: s.timeSlot.slotOrder,
    })),
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
            Mi horario
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {period
              ? `Sesiones programadas en ${period.name}.`
              : "No hay periodo academico activo."}
          </p>
        </div>
        {cells.length > 0 && <ExportHorarioButtons />}
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base">Semana</CardTitle>
          <CardDescription>
            {cells.length} sesion{cells.length === 1 ? "" : "es"} programada
            {cells.length === 1 ? "" : "s"}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!teacher && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Tu usuario aun no esta vinculado a un perfil de docente.
            </p>
          )}
          {teacher && cells.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Aun no tienes sesiones asignadas. Pide al admin que genere el
              horario en /admin/horarios.
            </p>
          )}
          {cells.length > 0 && (
            <div className="space-y-4">
              {carga.diasExcesivos.length > 0 && (
                <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  <span className="font-semibold">
                    Alerta de carga excesiva (B2):
                  </span>{" "}
                  más de 4 horas consecutivas el{" "}
                  {carga.diasExcesivos
                    .map((d) => DIA_LABELS[d] ?? d)
                    .join(", ")}
                  .
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-semibold">
                  Carga semanal: {fmtHoras(carga.totalMin)}
                </span>
                {carga.porDia.map((d) => (
                  <span
                    key={d.dia}
                    className="rounded-full border bg-muted/40 px-2.5 py-1 text-xs"
                  >
                    {DIA_LABELS[d.dia] ?? d.dia}: {fmtHoras(d.min)}
                  </span>
                ))}
              </div>

              <HorarioGrid bloques={BLOQUES} cells={cells} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
