import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AsignacionForm } from "./AsignacionForm";
import { eliminarAsignacion } from "./actions";

interface Asignacion {
  curso_id: number;
  profesor_id: string;
}

export default async function AsignacionesPage() {
  const supabase = await createClient();

  const [
    { data: cursos, error: cursosError },
    { data: profesores, error: profesoresError },
    { data: perfiles, error: perfilesPerError },
    { data: asignaciones, error: asignacionesError },
  ] = await Promise.all([
    supabase
      .from("curso")
      .select("id, codigo, nombre, activo")
      .order("codigo", { ascending: true }),
    supabase.from("profesor").select("id, tipo").order("created_at", { ascending: true }),
    supabase
      .from("perfil")
      .select("id, nombre, activo")
      .eq("rol", "DOCENTE")
      .order("nombre", { ascending: true }),
    supabase
      .from("curso_profesor")
      .select("curso_id, profesor_id")
      .order("curso_id", { ascending: true }),
  ]);

  const perfilesMap = new Map((perfiles ?? []).map((perfil) => [perfil.id, perfil]));
  const cursosMap = new Map((cursos ?? []).map((curso) => [curso.id, curso]));
  const profesoresActivos = (profesores ?? [])
    .map((profesor) => {
      const perfil = perfilesMap.get(profesor.id);
      if (!perfil || !perfil.activo) return null;

      return {
        id: profesor.id,
        nombre: perfil.nombre,
        tipo: profesor.tipo,
      };
    })
    .filter((profesor): profesor is { id: string; nombre: string; tipo: string } => profesor !== null);

  const asignacionesVista = (asignaciones ?? [])
    .map((asignacion) => {
      const curso = cursosMap.get(asignacion.curso_id);
      const perfil = perfilesMap.get(asignacion.profesor_id);
      const profesor = (profesores ?? []).find((item) => item.id === asignacion.profesor_id);

      if (!curso || !perfil || !profesor) return null;

      return {
        ...asignacion,
        cursoCodigo: curso.codigo,
        cursoNombre: curso.nombre,
        cursoActivo: curso.activo,
        profesorNombre: perfil.nombre,
        profesorActivo: perfil.activo,
        tipoProfesor: profesor.tipo,
      };
    })
    .filter(
      (
        asignacion,
      ): asignacion is Asignacion & {
        cursoCodigo: string;
        cursoNombre: string;
        cursoActivo: boolean;
        profesorNombre: string;
        profesorActivo: boolean;
        tipoProfesor: string;
      } => asignacion !== null,
    );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
          Curso a Profesor
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Define que profesores pueden dictar cada curso antes de generar horarios.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Asignaciones activas</CardDescription>
            <CardTitle className="font-display text-2xl">{asignacionesVista.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Cursos disponibles</CardDescription>
            <CardTitle className="font-display text-2xl">
              {(cursos ?? []).filter((curso) => curso.activo).length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Profesores disponibles</CardDescription>
            <CardTitle className="font-display text-2xl">{profesoresActivos.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base">Nueva asignacion</CardTitle>
          <CardDescription>
            Relaciona un curso activo con un profesor registrado y activo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AsignacionForm
            cursos={(cursos ?? [])
              .filter((curso) => curso.activo)
              .map((curso) => ({
                id: curso.id,
                codigo: curso.codigo,
                nombre: curso.nombre,
              }))}
            profesores={profesoresActivos.map((profesor) => ({
              id: profesor.id,
              nombre: profesor.nombre,
            }))}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base">Relaciones registradas</CardTitle>
          <CardDescription>
            Asignaciones entre la tabla `curso` y la tabla `profesor`.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(cursosError || profesoresError || perfilesPerError || asignacionesError) && (
            <p className="mb-4 text-sm text-destructive">
              Error cargando asignaciones:{" "}
              {cursosError?.message ??
                profesoresError?.message ??
                perfilesPerError?.message ??
                asignacionesError?.message}
            </p>
          )}

          {!cursosError &&
            !profesoresError &&
            !perfilesPerError &&
            !asignacionesError &&
            asignacionesVista.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Aun no hay asignaciones registradas.
              </p>
            )}

          {asignacionesVista.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Curso</TableHead>
                  <TableHead>Profesor</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="w-[120px]">Estado curso</TableHead>
                  <TableHead className="w-[140px]">Estado profesor</TableHead>
                  <TableHead className="w-[140px] text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {asignacionesVista.map((asignacion) => (
                  <TableRow key={`${asignacion.curso_id}-${asignacion.profesor_id}`}>
                    <TableCell>
                      <div className="font-medium">{asignacion.cursoCodigo}</div>
                      <div className="text-xs text-muted-foreground">{asignacion.cursoNombre}</div>
                    </TableCell>
                    <TableCell>{asignacion.profesorNombre}</TableCell>
                    <TableCell>{asignacion.tipoProfesor}</TableCell>
                    <TableCell>{asignacion.cursoActivo ? "Activo" : "Inactivo"}</TableCell>
                    <TableCell>{asignacion.profesorActivo ? "Activo" : "Inactivo"}</TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <form action={eliminarAsignacion}>
                          <input type="hidden" name="cursoId" value={asignacion.curso_id} />
                          <input type="hidden" name="profesorId" value={asignacion.profesor_id} />
                          <Button
                            type="submit"
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Quitar
                          </Button>
                        </form>
                      </div>
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
