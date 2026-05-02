import { Trash2, Power } from "lucide-react";
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
import { CarreraForm } from "./CarreraForm";
import { eliminarCarrera, toggleActivoCarrera } from "./actions";

interface Carrera {
  id: number;
  nombre: string;
  activo: boolean;
  created_at: string;
}

export default async function CarrerasPage() {
  const supabase = await createClient();
  const { data: carreras, error } = await supabase
    .from("carrera")
    .select("id, nombre, activo, created_at")
    .order("id", { ascending: true });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
          Carreras
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Catalogo de carreras de la facultad. Activa o desactiva segun corresponda.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base">Crear nueva</CardTitle>
          <CardDescription>
            Anade una carrera al catalogo. Debe tener un nombre unico.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CarreraForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base">Registradas</CardTitle>
          <CardDescription>
            {carreras?.length ?? 0} carrera{(carreras?.length ?? 0) === 1 ? "" : "s"} en total.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="text-sm text-destructive mb-4">
              Error cargando carreras: {error.message}
            </p>
          )}

          {!error && (!carreras || carreras.length === 0) && (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Aun no hay carreras registradas.
            </p>
          )}

          {carreras && carreras.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="w-[120px]">Estado</TableHead>
                  <TableHead className="w-[200px] text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(carreras as Carrera[]).map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="text-muted-foreground">{c.id}</TableCell>
                    <TableCell className="font-medium">{c.nombre}</TableCell>
                    <TableCell>
                      {c.activo ? (
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
                      <div className="flex gap-2 justify-end">
                        <form action={toggleActivoCarrera}>
                          <input type="hidden" name="id" value={c.id} />
                          <input
                            type="hidden"
                            name="activo"
                            value={String(c.activo)}
                          />
                          <Button type="submit" variant="ghost" size="sm">
                            <Power className="h-3.5 w-3.5" />
                            {c.activo ? "Desactivar" : "Activar"}
                          </Button>
                        </form>
                        <form action={eliminarCarrera}>
                          <input type="hidden" name="id" value={c.id} />
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
