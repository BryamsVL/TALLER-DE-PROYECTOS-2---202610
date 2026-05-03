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

export default async function EstudianteHorarioPage() {
  const { user } = await getSessionProfile();
  const supabase = await createClient();

  const { data: ciclo } = await supabase
    .from("ciclo")
    .select("id, nombre")
    .eq("activo", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: inscripciones } = await supabase
    .from("inscripcion")
    .select("nrc")
    .eq("estudiante_id", user.id)
    .eq("estado", "ACTIVA");

  const misNrcs = (inscripciones ?? []).map((i) => i.nrc);

  const [
    { data: nrcsRows },
    { data: sesiones },
    { data: bloques },
    { data: aulas },
    { data: cursos },
    { data: perfiles },
  ] = await Promise.all([
    misNrcs.length > 0
      ? supabase
          .from("nrc")
          .select("nrc, curso_id, profesor_id")
          .in("nrc", misNrcs)
          .eq("ciclo_id", ciclo?.id ?? -1)
      : Promise.resolve({ data: null }),
    misNrcs.length > 0
      ? supabase
          .from("sesion_nrc")
          .select("nrc, dia, bloque_id, aula_id")
          .in("nrc", misNrcs)
      : Promise.resolve({ data: null }),
    supabase.from("bloque_horario").select("id, orden, hora_inicio, hora_fin"),
    supabase.from("aula").select("id, nombre"),
    supabase.from("curso").select("id, codigo"),
    supabase
      .from("perfil")
      .select("id, nombre")
      .eq("rol", "DOCENTE"),
  ]);

  const cursoPorId = new Map((cursos ?? []).map((c) => [c.id, c.codigo]));
  const aulaPorId = new Map((aulas ?? []).map((a) => [a.id, a.nombre]));
  const perfilNombre = new Map((perfiles ?? []).map((p) => [p.id, p.nombre]));
  const nrcPorId = new Map((nrcsRows ?? []).map((n) => [n.nrc, n]));

  const cells: HorarioCell[] = (sesiones ?? []).map((s) => {
    const nrcInfo = nrcPorId.get(s.nrc);
    return {
      dia: s.dia,
      bloque_id: s.bloque_id,
      titulo: nrcInfo ? cursoPorId.get(nrcInfo.curso_id) ?? s.nrc : s.nrc,
      subtitulo: aulaPorId.get(s.aula_id) ?? "?",
      detalle: nrcInfo?.profesor_id
        ? perfilNombre.get(nrcInfo.profesor_id) ?? undefined
        : undefined,
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
            ? `Sesiones de tus inscripciones activas en ${ciclo.nombre}.`
            : "No hay ciclo activo."}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base">Semana</CardTitle>
          <CardDescription>
            {misNrcs.length} inscripcion{misNrcs.length === 1 ? "" : "es"} activa
            {misNrcs.length === 1 ? "" : "s"}, {(sesiones ?? []).length} sesion
            {(sesiones ?? []).length === 1 ? "" : "es"} programadas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {misNrcs.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No tienes inscripciones. Ve a /estudiante/inscripciones para inscribirte.
            </p>
          )}
          {misNrcs.length > 0 && (sesiones ?? []).length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Tus NRCs aun no tienen horario generado.
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
