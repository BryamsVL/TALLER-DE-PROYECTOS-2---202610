import prisma from "@/lib/prisma";
import { Power, Trash2, Shield, HelpCircle, CheckCircle2, Award, Landmark, Eye } from "lucide-react";
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

export default async function AulasPage() {
  let fetchError: string | null = null;
  let aulas: any[] = [];

  try {
    aulas = await prisma.classroom.findMany({
      orderBy: { name: "asc" },
    });
  } catch (error: any) {
    fetchError = error.message;
  }

  const total = aulas?.length ?? 0;
  const activas = aulas?.filter((a) => a.isActive).length ?? 0;
  const capacidadTotal = aulas?.reduce((sum, a) => sum + a.capacity, 0) ?? 0;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      <header className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-teal-50 text-teal-700">
          <Landmark className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl text-gray-900">
            Aulas y Laboratorios
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Administra los espacios físicos, sus capacidades de aforo y el tipo de equipamiento.
          </p>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="font-semibold uppercase tracking-wider text-xs">Total de Aulas</CardDescription>
            <CardTitle className="font-display text-3xl">{total}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="font-semibold uppercase tracking-wider text-xs">Aulas Activas</CardDescription>
            <CardTitle className="font-display text-3xl text-green-600 flex items-center gap-2">
              {activas} <CheckCircle2 className="h-5 w-5 opacity-50" />
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="font-semibold uppercase tracking-wider text-xs">Capacidad Total de Aforo</CardDescription>
            <CardTitle className="font-display text-3xl text-teal-600 flex items-center gap-2">
              {capacidadTotal} alumnos <Award className="h-5 w-5 opacity-50" />
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
        <div>
          <Card className="border-gray-100 shadow-sm sticky top-6">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
              <CardTitle className="font-display text-base">Crear nueva aula</CardTitle>
              <CardDescription>
                Define el nombre, capacidad y tipo de asignación del espacio físico.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <AulaForm />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100">
              <CardTitle className="font-display text-base">Aulas registradas</CardTitle>
              <CardDescription>
                Lista de espacios físicos disponibles para la programación horaria.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {fetchError && (
                <div className="p-6 flex items-center gap-3 text-red-600 bg-red-50">
                  <Power className="h-5 w-5" />
                  <p className="text-sm font-medium">Error cargando aulas: {fetchError}</p>
                </div>
              )}

              {!fetchError && total === 0 && (
                <div className="p-12 text-center">
                  <Landmark className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                  <p className="text-sm font-medium text-gray-500">
                    Aún no hay aulas registradas en el sistema.
                  </p>
                </div>
              )}

              {total > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-semibold text-gray-500 uppercase text-[11px] tracking-wider w-[150px]">Código</TableHead>
                      <TableHead className="font-semibold text-gray-500 uppercase text-[11px] tracking-wider">Nombre del Aula</TableHead>
                      <TableHead className="font-semibold text-gray-500 uppercase text-[11px] tracking-wider">Tipo de Aula</TableHead>
                      <TableHead className="font-semibold text-gray-500 uppercase text-[11px] tracking-wider w-[120px]">Aforo / Capacidad</TableHead>
                      <TableHead className="w-[120px] font-semibold text-gray-500 uppercase text-[11px] tracking-wider">Estado</TableHead>
                      <TableHead className="w-[150px] text-right font-semibold text-gray-500 uppercase text-[11px] tracking-wider">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {aulas.map((aula) => (
                      <TableRow key={aula.id} className="group hover:bg-gray-50/50 transition-colors">
                        <TableCell className="font-medium text-gray-900">{aula.code}</TableCell>
                        <TableCell className="font-semibold text-gray-700">{aula.name}</TableCell>
                        <TableCell>
                          {aula.roomType === "LAB" ? (
                            <Badge variant="outline" className="bg-purple-50/50 text-purple-700 border-purple-100 font-semibold">
                              Laboratorio / Especial
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-teal-50/50 text-teal-700 border-teal-100 font-semibold">
                              Teoría / General
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-semibold text-gray-700 text-center">
                          {aula.capacity} alumnos
                        </TableCell>
                        <TableCell>
                          {aula.isActive ? (
                            <Badge
                              variant="secondary"
                              className="bg-green-50 text-green-700 hover:bg-green-100 border-none flex items-center gap-1 w-fit"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                              Activa
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-400 border-gray-200 flex items-center gap-1 w-fit">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                              Inactiva
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <form action={toggleActivoAula}>
                              <input type="hidden" name="id" value={aula.id} />
                              <input
                                type="hidden"
                                name="activo"
                                value={String(aula.isActive)}
                              />
                              <Button type="submit" variant="ghost" size="icon" className={`h-8 w-8 ${aula.isActive ? 'text-gray-400 hover:text-orange-600 hover:bg-orange-50' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`}>
                                <Power className="h-4 w-4" />
                              </Button>
                            </form>
                            <form action={eliminarAula}>
                              <input type="hidden" name="id" value={aula.id} />
                              <Button
                                type="submit"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
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
      </div>
    </div>
  );
}
