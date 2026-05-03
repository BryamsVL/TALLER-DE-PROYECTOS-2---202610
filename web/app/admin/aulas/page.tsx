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
import { AulaForm } from "./AulaForm";
import { eliminarAula, toggleActivoAula } from "./actions";

interface Aula {
  id: number;
  nombre: string;
  tipo: string;
  capacidad: number;
  activo: boolean;
}

export default async function AulasPage() {
  const supabase = await createClient();
  const { data: aulas, error } = await supabase
    .from("aula")
    .select("id, nombre, tipo, capacidad, activo")
    .order("id", { ascending: true });

  const total = aulas?.length ?? 0;
  const activas = aulas?.filter((a) => a.activo).length ?? 0;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
          Aulas
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Administra los espacios fisicos disponibles para el horario academico.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total registradas</CardDescription>
            <CardTitle className="font-display text-2xl">{total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Aulas activas</CardDescription>
            <CardTitle className="font-display text-2xl">{activas}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Capacidad acumulada</CardDescription>
            <CardTitle className="font-display text-2xl">
              {aulas?.reduce((sum, aula) => sum + aula.capacidad, 0) ?? 0}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base">Crear nueva</CardTitle>
          <CardDescription>
            Define el nombre, el tipo de aula y la capacidad maxima.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AulaForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base">Registradas</CardTitle>
          <CardDescription>
            {total} aula{total === 1 ? "" : "s"} en total.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="mb-4 text-sm text-destructive">
              Error cargando aulas: {error.message}
            </p>
          )}

          {!error && (!aulas || aulas.length === 0) && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Aun no hay aulas registradas.
            </p>
          )}

          {aulas && aulas.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="w-[120px]">Capacidad</TableHead>
                  <TableHead className="w-[120px]">Estado</TableHead>
                  <TableHead className="w-[200px] text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(aulas as Aula[]).map((aula) => (
                  <TableRow key={aula.id}>
                    <TableCell className="text-muted-foreground">{aula.id}</TableCell>
                    <TableCell className="font-medium">{aula.nombre}</TableCell>
                    <TableCell>{aula.tipo}</TableCell>
                    <TableCell>{aula.capacidad}</TableCell>
                    <TableCell>
                      {aula.activo ? (
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
                        <form action={toggleActivoAula}>
                          <input type="hidden" name="id" value={aula.id} />
                          <input type="hidden" name="activo" value={String(aula.activo)} />
                          <Button type="submit" variant="ghost" size="sm">
                            <Power className="h-3.5 w-3.5" />
                            {aula.activo ? "Desactivar" : "Activar"}
                          </Button>
                        </form>
                        <form action={eliminarAula}>
                          <input type="hidden" name="id" value={aula.id} />
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
