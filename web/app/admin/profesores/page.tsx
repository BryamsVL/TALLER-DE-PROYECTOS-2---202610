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
import { ProfesorForm } from "./ProfesorForm";
import { eliminarProfesor, toggleActivoProfesor } from "./actions";
import { TIPO_PROFESOR_OPTIONS } from "../catalog-options";

const TIPO_LABELS = Object.fromEntries(
  TIPO_PROFESOR_OPTIONS.map((option) => [option.value, option.label] as const),
);

export default async function ProfesoresPage() {
  const supabase = await createClient();

  const [{ data: perfiles, error: perfilesError }, { data: profesores, error: profesoresError }] =
    await Promise.all([
      supabase
        .from("perfil")
        .select("id, nombre, rol, activo")
        .eq("rol", "DOCENTE")
        .order("nombre", { ascending: true }),
      supabase.from("profesor").select("id, tipo").order("created_at", { ascending: true }),
    ]);

  const perfilesMap = new Map((perfiles ?? []).map((perfil) => [perfil.id, perfil]));
  const profesoresRegistrados = (profesores ?? [])
    .map((profesor) => {
      const perfil = perfilesMap.get(profesor.id);
      if (!perfil) return null;
      return {
        ...profesor,
        nombre: perfil.nombre,
        activo: perfil.activo,
      };
    })
    .filter(
      (profesor): profesor is { id: string; tipo: string; nombre: string; activo: boolean } =>
        profesor !== null,
    );

  const total = profesoresRegistrados.length;
  const activos = profesoresRegistrados.filter((profesor) => profesor.activo).length;
  const inactivos = total - activos;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
          Profesores
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Crea cuentas de docentes y administra el plantel del programa.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Registrados</CardDescription>
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
            <CardDescription>Inactivos</CardDescription>
            <CardTitle className="font-display text-2xl">{inactivos}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base">Registrar profesor</CardTitle>
          <CardDescription>
            Genera la cuenta de Auth, el perfil y el registro como docente en un solo paso.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfesorForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base">Plantel registrado</CardTitle>
          <CardDescription>
            {total} profesor{total === 1 ? "" : "es"} en total.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(perfilesError || profesoresError) && (
            <p className="mb-4 text-sm text-destructive">
              Error cargando profesores: {perfilesError?.message ?? profesoresError?.message}
            </p>
          )}

          {!perfilesError && !profesoresError && total === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Aun no hay profesores registrados. Usa el formulario de arriba para crear el primero.
            </p>
          )}

          {total > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Profesor</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="w-[120px]">Estado</TableHead>
                  <TableHead className="w-[200px] text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profesoresRegistrados.map((profesor) => (
                  <TableRow key={profesor.id}>
                    <TableCell>
                      <div className="font-medium">{profesor.nombre}</div>
                      <div className="text-xs text-muted-foreground">{profesor.id}</div>
                    </TableCell>
                    <TableCell>{TIPO_LABELS[profesor.tipo] ?? profesor.tipo}</TableCell>
                    <TableCell>
                      {profesor.activo ? (
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
                        <form action={toggleActivoProfesor}>
                          <input type="hidden" name="id" value={profesor.id} />
                          <input
                            type="hidden"
                            name="activo"
                            value={String(profesor.activo)}
                          />
                          <Button type="submit" variant="ghost" size="sm">
                            <Power className="h-3.5 w-3.5" />
                            {profesor.activo ? "Desactivar" : "Activar"}
                          </Button>
                        </form>
                        <form action={eliminarProfesor}>
                          <input type="hidden" name="id" value={profesor.id} />
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
