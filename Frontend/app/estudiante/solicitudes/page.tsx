import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { CancelarButton, NuevaSolicitudForm } from "./SolicitudClient";

const ESTADO_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  PENDIENTE: "outline",
  APROBADA: "secondary",
  RECHAZADA: "destructive",
};

export default async function SolicitudesPage() {
  const { user } = await getSessionProfile();
  const supabase = await createClient();

  const { data: ciclo } = await supabase
    .from("ciclo")
    .select("id")
    .eq("activo", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const [
    { data: misInscripciones },
    { data: solicitudes },
  ] = await Promise.all([
    supabase
      .from("inscripcion")
      .select("nrc")
      .eq("estudiante_id", user.id)
      .eq("estado", "ACTIVA"),
    supabase
      .from("solicitud_cambio")
      .select("id, nrc_actual, nrc_nuevo, estado, motivo, created_at")
      .eq("estudiante_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const nrcCodes = (misInscripciones ?? []).map((i) => i.nrc);

  // Para cada NRC inscrito, traer otros NRCs del mismo curso (alternativas).
  const { data: misNrcs } = nrcCodes.length
    ? await supabase
        .from("nrc")
        .select("nrc, curso_id")
        .in("nrc", nrcCodes)
    : { data: [] };

  const cursoIdsDeMisNrcs = Array.from(
    new Set((misNrcs ?? []).map((n) => n.curso_id)),
  );

  const { data: nrcsAlternativos } = cursoIdsDeMisNrcs.length
    ? await supabase
        .from("nrc")
        .select("nrc, curso_id, profesor_id")
        .in("curso_id", cursoIdsDeMisNrcs)
        .eq("ciclo_id", ciclo?.id ?? -1)
        .not("profesor_id", "is", null)
    : { data: [] };

  const { data: cursos } = await supabase.from("curso").select("id, codigo, nombre");
  const cursoPorId = new Map((cursos ?? []).map((c) => [c.id, c]));

  const nrcsActuales = (misNrcs ?? []).map((n) => {
    const c = cursoPorId.get(n.curso_id);
    return {
      nrc: n.nrc,
      cursoCodigo: c?.codigo ?? "?",
      cursoNombre: c?.nombre ?? "?",
    };
  });

  // Para cada NRC actual, sus alternativas (mismo curso, otro NRC).
  const cursoPorNrc = new Map((misNrcs ?? []).map((n) => [n.nrc, n.curso_id]));
  const alternativasPorNrc: Record<string, typeof nrcsActuales> = {};
  for (const n of nrcsActuales) {
    const cid = cursoPorNrc.get(n.nrc);
    alternativasPorNrc[n.nrc] = (nrcsAlternativos ?? [])
      .filter((alt) => alt.curso_id === cid && alt.nrc !== n.nrc)
      .map((alt) => {
        const c = cursoPorId.get(alt.curso_id);
        return {
          nrc: alt.nrc,
          cursoCodigo: c?.codigo ?? "?",
          cursoNombre: c?.nombre ?? "?",
        };
      });
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
          Solicitudes
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pide cambio de NRC dentro del mismo curso.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base">Nueva solicitud</CardTitle>
          <CardDescription>
            Selecciona el NRC actual y el NRC nuevo del mismo curso.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NuevaSolicitudForm
            nrcsActuales={nrcsActuales}
            alternativasPorNrc={alternativasPorNrc}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base">Mis solicitudes</CardTitle>
          <CardDescription>
            {(solicitudes ?? []).length} solicitud
            {(solicitudes ?? []).length === 1 ? "" : "es"} en historial.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(solicitudes ?? []).length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No tienes solicitudes.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>NRC actual</TableHead>
                  <TableHead>NRC nuevo</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead className="w-[120px]">Estado</TableHead>
                  <TableHead className="w-[120px] text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(solicitudes ?? []).map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-sm">{s.nrc_actual}</TableCell>
                    <TableCell className="font-mono text-sm">{s.nrc_nuevo}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {s.motivo ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={ESTADO_VARIANT[s.estado] ?? "outline"}>
                        {s.estado}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {s.estado === "PENDIENTE" ? (
                        <CancelarButton id={s.id} />
                      ) : (
                        <p className="text-right text-xs text-muted-foreground">—</p>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
