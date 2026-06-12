import prisma from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { HorarioPreferente } from "./HorarioPreferente";

export const dynamic = "force-dynamic";

const DOW_A_DIA: Record<string, string> = {
  MONDAY: "LUN",
  TUESDAY: "MAR",
  WEDNESDAY: "MIE",
  THURSDAY: "JUE",
  FRIDAY: "VIE",
  SATURDAY: "SAB",
};
const ORDEN_A_TURNO: Record<number, string> = {
  1: "MANANA", 2: "MANANA", 3: "MANANA", 4: "MANANA",
  5: "TARDE", 6: "TARDE", 7: "TARDE",
  8: "NOCHE", 9: "NOCHE",
};
const TURNO_TOTAL: Record<string, number> = { MANANA: 4, TARDE: 3, NOCHE: 2 };

export default async function DisponibilidadPage() {
  const { user } = await getSessionProfile();

  const teacher = await prisma.teacher.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  let errorMsg: string | null = null;
  let initial = new Set<string>();

  if (teacher) {
    try {
      const disponibles = await prisma.teacherAvailability.findMany({
        where: { teacherId: teacher.id, isAvailable: true },
        select: { timeSlot: { select: { dayOfWeek: true, slotOrder: true } } },
      });

      // Un (dia, turno) se considera marcado solo si TODOS sus bloques
      // estan disponibles (consistente con el dialog admin por-bloque).
      const conteo = new Map<string, number>();
      for (const d of disponibles) {
        const dia = DOW_A_DIA[d.timeSlot.dayOfWeek];
        const turno = ORDEN_A_TURNO[d.timeSlot.slotOrder];
        if (!dia || !turno) continue;
        const k = `${dia}-${turno}`;
        conteo.set(k, (conteo.get(k) ?? 0) + 1);
      }
      initial = new Set(
        [...conteo.entries()]
          .filter(([k, n]) => {
            const turno = k.split("-")[1] ?? "";
            return n >= (TURNO_TOTAL[turno] ?? 99);
          })
          .map(([k]) => k),
      );
    } catch (err: any) {
      errorMsg = err?.message ?? "Error cargando tu disponibilidad.";
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
          Horario preferente
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Marca los turnos en los que prefieres dictar clase. El generador de horarios
          solo te asignara sesiones dentro de tus turnos marcados.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base">Turnos disponibles</CardTitle>
          <CardDescription>
            Cada celda marcada se guarda al instante y se sincroniza con la vista del
            administrador. Domingo no esta disponible.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!teacher && (
            <p className="mb-4 text-sm text-muted-foreground">
              Tu usuario aun no esta vinculado a un perfil de docente.
            </p>
          )}
          {errorMsg && (
            <p className="mb-4 text-sm text-destructive">
              Error cargando tu disponibilidad: {errorMsg}
            </p>
          )}
          {teacher && <HorarioPreferente initial={initial} />}
        </CardContent>
      </Card>
    </div>
  );
}
