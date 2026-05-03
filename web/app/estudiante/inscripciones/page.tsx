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
import { InscribirseButton, RetirarseButton } from "./InscripcionesActions";

export default async function InscripcionesPage() {
  const { user } = await getSessionProfile();
  const supabase = await createClient();

  // Mi carrera y ciclo activo
  const [{ data: estudiante }, { data: ciclo }] = await Promise.all([
    supabase.from("estudiante").select("carrera_id").eq("id", user.id).single(),
    supabase
      .from("ciclo")
      .select("id, nombre")
      .eq("activo", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (!estudiante || !ciclo) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
            Mis inscripciones
          </h1>
        </header>
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            {!estudiante
              ? "No tienes carrera asignada."
              : "No hay ciclo academico activo."}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Cursos de mi carrera (filtrar NRCs por curso.carrera_id == mi carrera)
  const [
    { data: cursosCarrera },
    { data: misInscripciones },
    { data: profesores },
    { data: perfiles },
  ] = await Promise.all([
    supabase
      .from("curso")
      .select("id, codigo, nombre, nivel, horas_semanales, tipo_aula")
      .eq("carrera_id", estudiante.carrera_id)
      .eq("activo", true),
    supabase
      .from("inscripcion")
      .select("nrc, estado")
      .eq("estudiante_id", user.id)
      .eq("estado", "ACTIVA"),
    supabase.from("profesor").select("id"),
    supabase
      .from("perfil")
      .select("id, nombre")
      .eq("rol", "DOCENTE"),
  ]);

  const cursoIds = (cursosCarrera ?? []).map((c) => c.id);
  const cursoPorId = new Map((cursosCarrera ?? []).map((c) => [c.id, c]));
  const perfilNombre = new Map((perfiles ?? []).map((p) => [p.id, p.nombre]));
  const profesoresIds = new Set((profesores ?? []).map((p) => p.id));

  const { data: nrcsCarrera } = await supabase
    .from("nrc")
    .select("nrc, curso_id, profesor_id, cupo_max")
    .in("curso_id", cursoIds.length > 0 ? cursoIds : [-1])
    .eq("ciclo_id", ciclo.id);

  // Conteo de inscripciones activas por NRC (para mostrar cupo).
  const { data: todasInscripciones } = await supabase
    .from("inscripcion")
    .select("nrc")
    .in(
      "nrc",
      (nrcsCarrera ?? []).length > 0
        ? (nrcsCarrera ?? []).map((n) => n.nrc)
        : ["00000"],
    )
    .eq("estado", "ACTIVA");

  const cuposActuales = new Map<string, number>();
  for (const r of todasInscripciones ?? []) {
    cuposActuales.set(r.nrc, (cuposActuales.get(r.nrc) ?? 0) + 1);
  }

  const misNrcs = new Set((misInscripciones ?? []).map((i) => i.nrc));
  const misInscripcionesView = (nrcsCarrera ?? [])
    .filter((n) => misNrcs.has(n.nrc))
    .map((n) => {
      const curso = cursoPorId.get(n.curso_id);
      return {
        nrc: n.nrc,
        cursoCodigo: curso?.codigo ?? "?",
        cursoNombre: curso?.nombre ?? "?",
        nivel: curso?.nivel ?? 0,
        profesorNombre: n.profesor_id
          ? perfilNombre.get(n.profesor_id) ?? "(docente eliminado)"
          : "Sin asignar",
      };
    });

  const disponibles = (nrcsCarrera ?? [])
    .filter((n) => !misNrcs.has(n.nrc) && n.profesor_id && profesoresIds.has(n.profesor_id))
    .map((n) => {
      const curso = cursoPorId.get(n.curso_id);
      const ocupados = cuposActuales.get(n.nrc) ?? 0;
      return {
        nrc: n.nrc,
        cursoCodigo: curso?.codigo ?? "?",
        cursoNombre: curso?.nombre ?? "?",
        nivel: curso?.nivel ?? 0,
        profesorNombre: perfilNombre.get(n.profesor_id!) ?? "?",
        ocupados,
        cupoMax: n.cupo_max,
        lleno: ocupados >= n.cupo_max,
      };
    });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
          Mis inscripciones
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ciclo {ciclo.nombre}. Solo se muestran cursos de tu carrera.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base">Inscritos</CardTitle>
          <CardDescription>
            {misInscripcionesView.length} NRC
            {misInscripcionesView.length === 1 ? "" : "s"} activos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {misInscripcionesView.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Aun no tienes inscripciones activas.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[110px]">NRC</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead className="w-[80px]">Nivel</TableHead>
                  <TableHead>Docente</TableHead>
                  <TableHead className="w-[140px] text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {misInscripcionesView.map((row) => (
                  <TableRow key={row.nrc}>
                    <TableCell className="font-mono text-sm">{row.nrc}</TableCell>
                    <TableCell>
                      <div className="font-medium">{row.cursoCodigo}</div>
                      <div className="text-xs text-muted-foreground">{row.cursoNombre}</div>
                    </TableCell>
                    <TableCell>{row.nivel}</TableCell>
                    <TableCell>{row.profesorNombre}</TableCell>
                    <TableCell>
                      <RetirarseButton nrc={row.nrc} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base">Disponibles</CardTitle>
          <CardDescription>
            NRCs de tu carrera con docente asignado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {disponibles.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No hay NRCs disponibles para inscripcion.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[110px]">NRC</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead className="w-[80px]">Nivel</TableHead>
                  <TableHead>Docente</TableHead>
                  <TableHead className="w-[100px]">Cupo</TableHead>
                  <TableHead className="w-[180px] text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {disponibles.map((row) => (
                  <TableRow key={row.nrc}>
                    <TableCell className="font-mono text-sm">{row.nrc}</TableCell>
                    <TableCell>
                      <div className="font-medium">{row.cursoCodigo}</div>
                      <div className="text-xs text-muted-foreground">{row.cursoNombre}</div>
                    </TableCell>
                    <TableCell>{row.nivel}</TableCell>
                    <TableCell>{row.profesorNombre}</TableCell>
                    <TableCell>
                      <Badge variant={row.lleno ? "destructive" : "outline"}>
                        {row.ocupados}/{row.cupoMax}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {row.lleno ? (
                        <p className="text-right text-xs text-muted-foreground">Lleno</p>
                      ) : (
                        <InscribirseButton nrc={row.nrc} />
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
