import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
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
            Matricula
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

  // Conteo de inscripciones activas por NRC (saltando RLS via SECURITY DEFINER).
  // Ver migrations/002_perfil_docente_read_y_cupo.sql.
  const cuposActuales = new Map<string, number>();
  if ((nrcsCarrera ?? []).length > 0) {
    const { data: cupoRows } = await supabase.rpc("nrc_cupo_actual", {
      p_nrcs: (nrcsCarrera ?? []).map((n) => n.nrc),
    });
    for (const r of (cupoRows ?? []) as { nrc: string; ocupados: number }[]) {
      cuposActuales.set(r.nrc, r.ocupados);
    }
  }

  const misNrcs = new Set((misInscripciones ?? []).map((i) => i.nrc));
  const misCursosIds = new Set(
    (nrcsCarrera ?? []).filter((n) => misNrcs.has(n.nrc)).map((n) => n.curso_id)
  );

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

  const cursosDisponibles = (cursosCarrera ?? [])
    .filter((c) => !misCursosIds.has(c.id))
    .filter((c) => {
      const nrcsDelCurso = (nrcsCarrera ?? []).filter(
        (n) => n.curso_id === c.id && n.profesor_id && profesoresIds.has(n.profesor_id)
      );
      return nrcsDelCurso.length > 0;
    })
    .map((c) => {
      const nrcsDelCurso = (nrcsCarrera ?? []).filter(
        (n) => n.curso_id === c.id && n.profesor_id && profesoresIds.has(n.profesor_id)
      );
      const nrcsDisponibles = nrcsDelCurso.filter(
        (n) => (cuposActuales.get(n.nrc) ?? 0) < n.cupo_max
      );

      return {
        id: c.id,
        codigo: c.codigo,
        nombre: c.nombre,
        nivel: c.nivel,
        nrcsCount: nrcsDelCurso.length,
        nrcsDisponibles: nrcsDisponibles.length,
      };
    });

  const tieneInscripciones = misInscripcionesView.length > 0;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
          Matricula
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ciclo {ciclo.nombre}. Solo se muestran cursos de tu carrera.
        </p>
      </header>

      {misInscripcionesView.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-base">Cursos matriculados</CardTitle>
            <CardDescription>
              {misInscripcionesView.length} curso{misInscripcionesView.length === 1 ? "" : "s"} inscritos en el ciclo actual.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[110px]">Código</TableHead>
                  <TableHead>Nombre del curso</TableHead>
                  <TableHead className="w-[80px]">Ciclo</TableHead>
                  <TableHead className="w-[110px]">NRC</TableHead>
                  <TableHead className="w-[140px] text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {misInscripcionesView.map((row) => (
                  <TableRow key={row.nrc}>
                    <TableCell className="font-mono text-sm">{row.cursoCodigo}</TableCell>
                    <TableCell>
                      <div className="font-medium">{row.cursoNombre}</div>
                    </TableCell>
                    <TableCell>{row.nivel}</TableCell>
                    <TableCell className="font-mono text-sm">{row.nrc}</TableCell>
                    <TableCell className="text-right">
                      <RetirarseButton nrc={row.nrc} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base">Disponibles</CardTitle>
          <CardDescription>Cursos de tu carrera con NRCs habilitados.</CardDescription>
        </CardHeader>
        <CardContent>
          {cursosDisponibles.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No hay NRCs disponibles para inscripcion.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[110px]">Codigo</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead className="w-[80px]">Ciclo</TableHead>
                  <TableHead className="w-[120px]">Disponibilidad</TableHead>
                  <TableHead className="w-[180px] text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cursosDisponibles.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono text-sm">{row.codigo}</TableCell>
                    <TableCell>
                      <div className="font-medium">{row.nombre}</div>
                    </TableCell>
                    <TableCell>{row.nivel}</TableCell>
                    <TableCell>
                      <Badge variant={row.nrcsDisponibles > 0 ? "outline" : "secondary"}>
                        {row.nrcsDisponibles} / {row.nrcsCount} opciones
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="secondary" size="sm" asChild>
                        <Link href={`/estudiante/inscripciones/${row.id}`}>
                          Detalle
                        </Link>
                      </Button>
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

