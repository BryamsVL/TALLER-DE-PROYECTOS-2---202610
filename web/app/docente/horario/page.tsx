import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { HorarioGrid, type HorarioCell } from "@/components/HorarioGrid";

export default async function DocenteHorarioPage() {
  const { user } = await getSessionProfile();
  const supabase = await createClient();

  const { data: ciclo } = await supabase
    .from("ciclo")
    .select("id, nombre")
    .eq("activo", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: misNrcs } = await supabase
    .from("nrc")
    .select("nrc, curso_id, cohorte_id")
    .eq("profesor_id", user.id)
    .eq("ciclo_id", ciclo?.id ?? -1);

  const nrcCodes = (misNrcs ?? []).map((n) => n.nrc);

  const [
    { data: sesiones },
    { data: bloques },
    { data: aulas },
    { data: cursos },
    { data: cohortes },
  ] = await Promise.all([
    nrcCodes.length > 0
      ? supabase
          .from("sesion_nrc")
          .select("nrc, dia, bloque_id, aula_id")
          .in("nrc", nrcCodes)
      : Promise.resolve({ data: null }),
    supabase.from("bloque_horario").select("id, orden, hora_inicio, hora_fin"),
    supabase.from("aula").select("id, nombre"),
    supabase.from("curso").select("id, codigo, nombre"),
    supabase.from("cohorte").select("id, nivel, seccion"),
  ]);

  const cursoPorId = new Map((cursos ?? []).map((c) => [c.id, c]));
  const aulaPorId = new Map((aulas ?? []).map((a) => [a.id, a.nombre]));
  const cohortePorId = new Map((cohortes ?? []).map((c) => [c.id, c]));
  const nrcPorId = new Map((misNrcs ?? []).map((n) => [n.nrc, n]));

  const cells: HorarioCell[] = (sesiones ?? []).map((s) => {
    const nrcInfo = nrcPorId.get(s.nrc);
    const curso = nrcInfo ? cursoPorId.get(nrcInfo.curso_id) : null;
    const cohorte = nrcInfo ? cohortePorId.get(nrcInfo.cohorte_id) : null;
    return {
      dia: s.dia,
      bloque_id: s.bloque_id,
      cursoNombre: curso?.nombre ?? s.nrc,
      nrc: s.nrc,
      aula: aulaPorId.get(s.aula_id) ?? "?",
      docente: cohorte ? `Ciclo ${cohorte.nivel}-${cohorte.seccion}` : undefined,
    };
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
          Mi horario
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {ciclo
            ? `Sesiones programadas en ${ciclo.nombre}.`
            : "No hay ciclo activo."}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base">Semana</CardTitle>
          <CardDescription>
            {nrcCodes.length} NRC{nrcCodes.length === 1 ? "" : "s"} a tu cargo,{" "}
            {(sesiones ?? []).length} sesion
            {(sesiones ?? []).length === 1 ? "" : "es"} programadas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {nrcCodes.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No tienes NRCs asignados aun.
            </p>
          )}
          {nrcCodes.length > 0 && (sesiones ?? []).length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Tus NRCs aun no tienen horario generado. Pide al admin que ejecute
              /admin/horarios.
            </p>
          )}
          {(sesiones ?? []).length > 0 && (
            <HorarioGrid bloques={bloques ?? []} cells={cells} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
