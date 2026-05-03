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
import { SolicitudButtons } from "./SolicitudButtons";

const ESTADO_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  PENDIENTE: "outline",
  APROBADA: "secondary",
  RECHAZADA: "destructive",
};

export default async function AdminSolicitudesPage() {
  const supabase = await createClient();

  const { data: solicitudes } = await supabase
    .from("solicitud_cambio")
    .select("id, estudiante_id, nrc_actual, nrc_nuevo, estado, motivo, created_at")
    .order("created_at", { ascending: false });

  const nrcCodes = Array.from(
    new Set(
      (solicitudes ?? []).flatMap((s) => [s.nrc_actual, s.nrc_nuevo]),
    ),
  );

  const [{ data: nrcs }, { data: cursos }, { data: perfiles }] = await Promise.all([
    nrcCodes.length
      ? supabase.from("nrc").select("nrc, curso_id").in("nrc", nrcCodes)
      : Promise.resolve({ data: [] }),
    supabase.from("curso").select("id, codigo"),
    supabase
      .from("perfil")
      .select("id, nombre")
      .in("id", Array.from(new Set((solicitudes ?? []).map((s) => s.estudiante_id)))),
  ]);

  const cursoCodigo = new Map((cursos ?? []).map((c) => [c.id, c.codigo]));
  const cursoPorNrc = new Map((nrcs ?? []).map((n) => [n.nrc, n.curso_id]));
  const nombrePorPerfil = new Map((perfiles ?? []).map((p) => [p.id, p.nombre]));

  const total = (solicitudes ?? []).length;
  const pendientes = (solicitudes ?? []).filter((s) => s.estado === "PENDIENTE").length;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
          Solicitudes de cambio
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Aprueba o rechaza pedidos de cambio de NRC.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total</CardDescription>
            <CardTitle className="font-display text-2xl">{total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pendientes</CardDescription>
            <CardTitle className="font-display text-2xl">{pendientes}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Procesadas</CardDescription>
            <CardTitle className="font-display text-2xl">{total - pendientes}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base">Solicitudes</CardTitle>
          <CardDescription>
            Aprobar mueve la inscripcion al NRC nuevo automaticamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {total === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No hay solicitudes registradas.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estudiante</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead>Cambio</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead className="w-[120px]">Estado</TableHead>
                  <TableHead className="w-[200px] text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(solicitudes ?? []).map((s) => {
                  const cursoId = cursoPorNrc.get(s.nrc_actual);
                  const cursoCod = cursoId ? cursoCodigo.get(cursoId) : "?";
                  return (
                    <TableRow key={s.id}>
                      <TableCell>
                        {nombrePorPerfil.get(s.estudiante_id) ?? "—"}
                      </TableCell>
                      <TableCell>{cursoCod}</TableCell>
                      <TableCell>
                        <span className="font-mono text-xs">{s.nrc_actual}</span>
                        {" → "}
                        <span className="font-mono text-xs">{s.nrc_nuevo}</span>
                      </TableCell>
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
                          <SolicitudButtons id={s.id} />
                        ) : (
                          <p className="text-right text-xs text-muted-foreground">—</p>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
