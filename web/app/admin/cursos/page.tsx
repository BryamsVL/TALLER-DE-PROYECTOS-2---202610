import { Power, Trash2 } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CursoForm } from "./CursoForm";
import { eliminarCurso, toggleActivoCurso } from "./actions";

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

export default async function CursosPage() {
  const supabase = await createClient();

  const [{ data: carreras, error: carrerasError }, { data: cursos, error: cursosError }] =
    await Promise.all([
      supabase
        .from("carrera")
        .select("id, nombre, activo")
        .order("nombre", { ascending: true }),
      supabase
        .from("curso")
        .select("id, carrera_id, nivel, codigo, nombre, horas_semanales, tipo_aula, activo")
        .order("nivel", { ascending: true })
        .order("nombre", { ascending: true }),
    ]);

  const carrerasMap = new Map((carreras ?? []).map((carrera) => [carrera.id, carrera.nombre]));
  const total = cursos?.length ?? 0;
  const activos = cursos?.filter((curso) => curso.activo).length ?? 0;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
          Cursos
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gestiona la malla curricular, el nivel academico y el tipo de aula requerido.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total registrados</CardDescription>
            <CardTitle className="font-display text-2xl">{total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Activos</CardDescription>
            <CardTitle className="font-display text-2xl">{activos}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Carreras disponibles</CardDescription>
            <CardTitle className="font-display text-2xl">
              {carreras?.filter((carrera) => carrera.activo).length ?? 0}
            </CardTitle>
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
            {total} curso{total === 1 ? "" : "s"} en total.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(carrerasError || cursosError) && (
            <p className="mb-4 text-sm text-destructive">
              Error cargando cursos: {carrerasError?.message ?? cursosError?.message}
            </p>
          )}

          {!carrerasError && !cursosError && total === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Aun no hay cursos registrados.
            </p>
          )}

          {cursos && cursos.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Codigo</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead>Carrera</TableHead>
                  <TableHead className="w-[80px]">Nivel</TableHead>
                  <TableHead className="w-[110px]">Horas</TableHead>
                  <TableHead>Tipo aula</TableHead>
                  <TableHead className="w-[120px]">Estado</TableHead>
                  <TableHead className="w-[200px] text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(cursos as Curso[]).map((curso) => (
                  <TableRow key={curso.id}>
                    <TableCell className="font-medium">{curso.codigo}</TableCell>
                    <TableCell>{curso.nombre}</TableCell>
                    <TableCell>{carrerasMap.get(curso.carrera_id) ?? "Sin carrera"}</TableCell>
                    <TableCell>{curso.nivel}</TableCell>
                    <TableCell>{curso.horas_semanales}</TableCell>
                    <TableCell>{curso.tipo_aula}</TableCell>
                    <TableCell>
                      {curso.activo ? (
                        <Badge
                          variant="secondary"
                          className="bg-success/20 text-success-foreground"
                        >
                          Activo
                        </Badge>
                      ) : (
                        <Badge variant="outline">Inactivo</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <form action={toggleActivoCurso}>
                          <input type="hidden" name="id" value={curso.id} />
                          <input
                            type="hidden"
                            name="activo"
                            value={String(curso.activo)}
                          />
                          <Button type="submit" variant="ghost" size="sm">
                            <Power className="h-3.5 w-3.5" />
                            {curso.activo ? "Desactivar" : "Activar"}
                          </Button>
                        </form>
                        <form action={eliminarCurso}>
                          <input type="hidden" name="id" value={curso.id} />
                          <Button
                            type="submit"
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Eliminar
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
