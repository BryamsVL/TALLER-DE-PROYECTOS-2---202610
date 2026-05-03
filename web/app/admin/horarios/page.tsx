import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GenerarHorarioPanel } from "./GenerarHorarioPanel";

export default async function HorariosPage() {
  const supabase = await createClient();

  const { data: ciclo } = await supabase
    .from("ciclo")
    .select("id, nombre")
    .eq("activo", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const cicloId = ciclo?.id;

  const [
    { data: nrcs },
    { data: profesores },
    { data: disp },
    { count: aulas },
    { count: bloques },
    { data: sesionesActuales },
  ] = await Promise.all([
    cicloId
      ? supabase
          .from("nrc")
          .select("nrc, profesor_id")
          .eq("ciclo_id", cicloId)
      : Promise.resolve({ data: null }),
    supabase.from("profesor").select("id"),
    supabase.from("disponibilidad_profesor").select("profesor_id"),
    supabase.from("aula").select("*", { count: "exact", head: true }).eq("activo", true),
    supabase.from("bloque_horario").select("*", { count: "exact", head: true }),
    cicloId
      ? supabase
          .from("sesion_nrc")
          .select("nrc")
          .in(
            "nrc",
            (
              await supabase
                .from("nrc")
                .select("nrc")
                .eq("ciclo_id", cicloId)
            ).data?.map((r) => r.nrc) ?? [],
          )
      : Promise.resolve({ data: null }),
  ]);

  const totalNrcs = nrcs?.length ?? 0;
  const nrcsConProfe = (nrcs ?? []).filter((n) => n.profesor_id).length;
  const nrcsSinProfe = totalNrcs - nrcsConProfe;
  const totalProfes = profesores?.length ?? 0;
  const profesConDisp = new Set((disp ?? []).map((d) => d.profesor_id)).size;
  const sinDisp = totalProfes - profesConDisp;
  const sesionesYaProgramadas = sesionesActuales?.length ?? 0;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
          Generar horario
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {ciclo
            ? `Resuelve dia / bloque / aula para los NRCs del ciclo ${ciclo.nombre}.`
            : "No hay ciclo academico activo."}
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>NRCs con docente</CardDescription>
            <CardTitle className="font-display text-2xl">{nrcsConProfe}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>NRCs sin docente</CardDescription>
            <CardTitle className="font-display text-2xl">{nrcsSinProfe}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Profes sin disponibilidad</CardDescription>
            <CardTitle className="font-display text-2xl">{sinDisp}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Sesiones programadas</CardDescription>
            <CardTitle className="font-display text-2xl">{sesionesYaProgramadas}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base">Pre-flight</CardTitle>
          <CardDescription>
            Revisa los warnings antes de generar. El solver puede fallar si:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {nrcsSinProfe > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="outline">Aviso</Badge>
              <span>
                {nrcsSinProfe} NRC{nrcsSinProfe === 1 ? "" : "s"} sin docente seran
                ignorados.
              </span>
            </div>
          )}
          {sinDisp > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="outline">Aviso</Badge>
              <span>
                {sinDisp} docente{sinDisp === 1 ? "" : "s"} sin horario preferente
                marcado: NRCs asignados a ellos no se podran programar.
              </span>
            </div>
          )}
          {(aulas ?? 0) === 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="destructive">Bloqueador</Badge>
              <span>No hay aulas activas. Registra al menos una en /admin/aulas.</span>
            </div>
          )}
          {(bloques ?? 0) === 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="destructive">Bloqueador</Badge>
              <span>No hay bloques horarios. Esto deberia venir del seed.</span>
            </div>
          )}
          {nrcsConProfe === 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="destructive">Bloqueador</Badge>
              <span>
                No hay NRCs con docente asignado. Crea NRCs en /admin/cursos y asigna
                docentes elegibles primero.
              </span>
            </div>
          )}
          {nrcsConProfe > 0 &&
            sinDisp === 0 &&
            (aulas ?? 0) > 0 &&
            (bloques ?? 0) > 0 && (
              <p className="text-muted-foreground">
                Todo listo. Click en Generar para resolver el horario.
              </p>
            )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base">Ejecutar</CardTitle>
          <CardDescription>
            Borra las sesiones previas del ciclo activo y resuelve de cero.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GenerarHorarioPanel />
        </CardContent>
      </Card>
    </div>
  );
}
