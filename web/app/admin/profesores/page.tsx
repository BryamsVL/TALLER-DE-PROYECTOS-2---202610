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

interface Profesor {
  id: string;
  tipo: string;
}

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
    .filter((profesor): profesor is Profesor & { nombre: string; activo: boolean } => profesor !== null);

  const profesoresIds = new Set((profesores ?? []).map((profesor) => profesor.id));
  const perfilesDisponibles = (perfiles ?? []).filter((perfil) => !profesoresIds.has(perfil.id));
  const total = profesoresRegistrados.length;
  const activos = profesoresRegistrados.filter((profesor) => profesor.activo).length;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
          Profesores
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Vincula perfiles con rol DOCENTE y define el tipo de contrato del plantel.
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
            <CardDescription>Perfiles disponibles</CardDescription>
            <CardTitle className="font-display text-2xl">{perfilesDisponibles.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base">Registrar profesor</CardTitle>
          <CardDescription>
            Usa perfiles ya creados en Auth y promovidos a rol DOCENTE dentro de `perfil`.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ProfesorForm
            perfiles={perfilesDisponibles.map((perfil) => ({
              id: perfil.id,
              nombre: perfil.nombre,
              activo: perfil.activo,
            }))}
          />
          <p className="text-xs text-muted-foreground">
            Si no aparece un docente, primero debe existir como usuario autenticado y tener rol
            `DOCENTE` en la tabla `perfil`.
          </p>
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
              Aun no hay profesores registrados.
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
                    <TableCell>{profesor.tipo}</TableCell>
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
