import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AsignacionesTable } from "./AsignacionesTable";

export default async function AsignacionesPage() {
  const supabase = await createClient();

  const [
    { data: cursos, error: cursosError },
    { data: carreras, error: carrerasError },
    { data: profesores, error: profesoresError },
    { data: perfiles, error: perfilesError },
    { data: asignaciones, error: asignacionesError },
  ] = await Promise.all([
    supabase
      .from("curso")
      .select("id, codigo, nombre, carrera_id, nivel, activo")
      .order("nivel", { ascending: true })
      .order("codigo", { ascending: true }),
    supabase.from("carrera").select("id, nombre"),
    supabase.from("profesor").select("id, tipo"),
    supabase
      .from("perfil")
      .select("id, nombre, activo")
      .eq("rol", "DOCENTE")
      .eq("activo", true)
      .order("nombre", { ascending: true }),
    supabase.from("curso_profesor").select("curso_id, profesor_id"),
  ]);

  const carreraNombre = new Map((carreras ?? []).map((c) => [c.id, c.nombre]));
  const perfilNombre = new Map((perfiles ?? []).map((p) => [p.id, p.nombre]));
  const profesoresIds = new Set((profesores ?? []).map((p) => p.id));

  // Solo profesores que (1) tienen perfil DOCENTE activo y (2) estan registrados en `profesor`.
  const profesoresActivos = (profesores ?? [])
    .filter((p) => perfilNombre.has(p.id))
    .map((p) => ({
      id: p.id,
      nombre: perfilNombre.get(p.id) ?? "(sin nombre)",
      tipo: p.tipo,
    }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  const cursosVista = (cursos ?? []).map((c) => ({
    id: c.id,
    codigo: c.codigo,
    nombre: c.nombre,
    carrera_nombre: carreraNombre.get(c.carrera_id) ?? "Sin carrera",
    nivel: c.nivel,
    activo: c.activo,
  }));

  const asignados = new Set(
    (asignaciones ?? [])
      .filter((a) => profesoresIds.has(a.profesor_id))
      .map((a) => `${a.curso_id}-${a.profesor_id}`),
  );

  const totalAsignaciones = asignados.size;
  const cursosSinAsignaciones = cursosVista.filter(
    (c) => c.activo && !Array.from(asignados).some((k) => k.startsWith(`${c.id}-`)),
  ).length;
  const fetchError =
    cursosError?.message ??
    carrerasError?.message ??
    profesoresError?.message ??
    perfilesError?.message ??
    asignacionesError?.message;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
          Curso a Profesor
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Marca que docentes pueden dictar cada curso. El selector de NRC en /admin/cursos
          solo permite asignar docentes elegibles.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Asignaciones totales</CardDescription>
            <CardTitle className="font-display text-2xl">{totalAsignaciones}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Cursos activos sin docentes</CardDescription>
            <CardTitle className="font-display text-2xl">{cursosSinAsignaciones}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Docentes disponibles</CardDescription>
            <CardTitle className="font-display text-2xl">{profesoresActivos.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base">Matriz de elegibilidad</CardTitle>
          <CardDescription>
            Expande un curso para marcar los docentes habilitados a dictarlo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {fetchError && (
            <p className="mb-4 text-sm text-destructive">
              Error cargando datos: {fetchError}
            </p>
          )}

          {!fetchError && cursosVista.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Aun no hay cursos. Registra cursos en /admin/cursos.
            </p>
          )}

          {cursosVista.length > 0 && (
            <AsignacionesTable
              cursos={cursosVista}
              profesores={profesoresActivos}
              asignados={asignados}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
