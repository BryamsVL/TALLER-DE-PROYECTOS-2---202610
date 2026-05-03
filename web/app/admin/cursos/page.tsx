import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CursoForm } from "./CursoForm";
import { CursosTable } from "./CursosTable";

interface Curso {
  id: number;
  carrera_id: number;
  nivel: number;
  codigo: string;
  nombre: string;
  horas_semanales: number;
  tipo_aula: string;
  activo: boolean;
}

interface NrcRow {
  nrc: string;
  curso_id: number;
  profesor_id: string | null;
  profesor_nombre: string | null;
}

export default async function CursosPage() {
  const supabase = await createClient();

  const [
    { data: carreras, error: carrerasError },
    { data: cursos, error: cursosError },
    { data: nrcs, error: nrcsError },
    { data: perfilesDocentes, error: perfilesError },
    { data: profesores, error: profesoresError },
    { data: asignaciones, error: asignacionesError },
  ] = await Promise.all([
    supabase
      .from("carrera")
      .select("id, nombre, activo")
      .order("nombre", { ascending: true }),
    supabase
      .from("curso")
      .select("id, carrera_id, nivel, codigo, nombre, horas_semanales, tipo_aula, activo")
      .order("nivel", { ascending: true })
      .order("nombre", { ascending: true }),
    supabase
      .from("nrc")
      .select("nrc, curso_id, profesor_id")
      .order("nrc", { ascending: true }),
    supabase
      .from("perfil")
      .select("id, nombre, activo")
      .eq("rol", "DOCENTE")
      .eq("activo", true)
      .order("nombre", { ascending: true }),
    supabase.from("profesor").select("id"),
    supabase.from("curso_profesor").select("curso_id, profesor_id"),
  ]);

  const carrerasMap = Object.fromEntries(
    (carreras ?? []).map((c) => [c.id, c.nombre] as const),
  );
  const total = cursos?.length ?? 0;
  const activos = cursos?.filter((c) => c.activo).length ?? 0;

  // Solo perfiles DOCENTE que tambien existen en `profesor` (registrados completos).
  const profesoresIds = new Set((profesores ?? []).map((p) => p.id));
  const profesoresActivos = (perfilesDocentes ?? [])
    .filter((p) => profesoresIds.has(p.id))
    .map((p) => ({ id: p.id, nombre: p.nombre }));
  const profesorPorId = new Map(profesoresActivos.map((p) => [p.id, p]));

  // Eligibles por curso: solo los profesores marcados en `curso_profesor`.
  const profesoresEligiblesPorCurso: Record<number, { id: string; nombre: string }[]> = {};
  for (const a of asignaciones ?? []) {
    const prof = profesorPorId.get(a.profesor_id);
    if (!prof) continue;
    (profesoresEligiblesPorCurso[a.curso_id] ??= []).push(prof);
  }

  const perfilNombre = new Map((perfilesDocentes ?? []).map((p) => [p.id, p.nombre]));
  const nrcsPorCurso: Record<number, NrcRow[]> = {};
  for (const row of nrcs ?? []) {
    const enriched: NrcRow = {
      nrc: row.nrc,
      curso_id: row.curso_id,
      profesor_id: row.profesor_id,
      profesor_nombre: row.profesor_id ? perfilNombre.get(row.profesor_id) ?? null : null,
    };
    (nrcsPorCurso[row.curso_id] ??= []).push(enriched);
  }

  const totalNrcs = (nrcs ?? []).length;
  const nrcsAsignados = (nrcs ?? []).filter((n) => n.profesor_id).length;
  const fetchError =
    carrerasError?.message ??
    cursosError?.message ??
    nrcsError?.message ??
    perfilesError?.message ??
    profesoresError?.message ??
    asignacionesError?.message;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
          Cursos
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gestiona la malla curricular y los NRCs (instancias) que se dictan cada ciclo.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Cursos</CardDescription>
            <CardTitle className="font-display text-2xl">{total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Cursos activos</CardDescription>
            <CardTitle className="font-display text-2xl">{activos}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>NRCs creados</CardDescription>
            <CardTitle className="font-display text-2xl">{totalNrcs}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>NRCs con docente</CardDescription>
            <CardTitle className="font-display text-2xl">{nrcsAsignados}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base">Crear nuevo</CardTitle>
          <CardDescription>
            Registra el curso con su carrera, nivel, carga horaria y tipo de aula.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CursoForm
            carreras={(carreras ?? [])
              .filter((carrera) => carrera.activo)
              .map((carrera) => ({ id: carrera.id, nombre: carrera.nombre }))}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base">Cursos registrados</CardTitle>
          <CardDescription>
            Expande una fila para ver y gestionar sus NRCs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {fetchError && (
            <p className="mb-4 text-sm text-destructive">
              Error cargando datos: {fetchError}
            </p>
          )}

          {!fetchError && total === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Aun no hay cursos registrados.
            </p>
          )}

          {total > 0 && (
            <CursosTable
              cursos={cursos as Curso[]}
              carrerasMap={carrerasMap}
              nrcsPorCurso={nrcsPorCurso}
              profesoresEligiblesPorCurso={profesoresEligiblesPorCurso}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
