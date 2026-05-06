import prisma from "@/lib/prisma";
import { Trash2, Power, BookOpen, GraduationCap, CheckCircle2, Award, Briefcase, Plus } from "lucide-react";
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

export default async function CarrerasPage() {
  let fetchError: string | null = null;
  let carreras: any[] = [];
  let totalCursos = 0;

  try {
    carreras = await prisma.carrera.findMany({
      include: {
        _count: {
          select: {
            students: true,
          }
        }
      },
      orderBy: { name: "asc" },
    });

    totalCursos = await prisma.course.count({
      where: { isActive: true }
    });
  } catch (error: any) {
    fetchError = error.message;
  }

  const total = carreras?.length ?? 0;
  const activas = carreras?.filter((c) => c.isActive).length ?? 0;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      <header className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-violet-50 text-violet-700">
          <Briefcase className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl text-gray-900">
            Carreras y Programas
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Administra los programas de pregrado, carreras profesionales y el estado de su oferta académica.
          </p>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="font-semibold uppercase tracking-wider text-xs">Total Carreras</CardDescription>
            <CardTitle className="font-display text-3xl">{total}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="font-semibold uppercase tracking-wider text-xs">Carreras Activas</CardDescription>
            <CardTitle className="font-display text-3xl text-green-600 flex items-center gap-2">
              {activas} <CheckCircle2 className="h-5 w-5 opacity-50" />
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="font-semibold uppercase tracking-wider text-xs">Asignaturas Totales</CardDescription>
            <CardTitle className="font-display text-3xl text-violet-600 flex items-center gap-2">
              {totalCursos} <BookOpen className="h-5 w-5 opacity-50" />
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
        <div>
          <Card className="border-gray-100 shadow-sm sticky top-6">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
              <CardTitle className="font-display text-base">Crear nueva carrera</CardTitle>
              <CardDescription>
                Añade una nueva carrera profesional al catálogo oficial de la facultad.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <CarreraForm />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100">
              <CardTitle className="font-display text-base">Programas académicos registrados</CardTitle>
              <CardDescription>
                Lista completa de carreras pregrado y sus correspondientes conteos de estudiantes.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {fetchError && (
                <div className="p-6 flex items-center gap-3 text-red-600 bg-red-50">
                  <Power className="h-5 w-5" />
                  <p className="text-sm font-medium">Error cargando carreras: {fetchError}</p>
                </div>
              )}

              {!fetchError && total === 0 && (
                <div className="p-12 text-center">
                  <Briefcase className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                  <p className="text-sm font-medium text-gray-500">
                    Aún no hay carreras registradas en el sistema.
                  </p>
                </div>
              )}

              {total > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-semibold text-gray-500 uppercase text-[11px] tracking-wider w-[150px]">Código</TableHead>
                      <TableHead className="font-semibold text-gray-500 uppercase text-[11px] tracking-wider">Nombre del Programa</TableHead>
                      <TableHead className="font-semibold text-gray-500 uppercase text-[11px] tracking-wider">Estadísticas</TableHead>
                      <TableHead className="w-[120px] font-semibold text-gray-500 uppercase text-[11px] tracking-wider">Estado</TableHead>
                      <TableHead className="w-[150px] text-right font-semibold text-gray-500 uppercase text-[11px] tracking-wider">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {carreras.map((c) => (
                      <TableRow key={c.id} className="group hover:bg-gray-50/50 transition-colors">
                        <TableCell className="font-medium text-gray-900">{c.code || "S/C"}</TableCell>
                        <TableCell className="font-semibold text-gray-700">{c.name}</TableCell>
                        <TableCell>
                          <div className="flex gap-2 items-center">
                            <Badge variant="secondary" className="bg-gray-100 text-gray-700 font-semibold flex items-center gap-1 border-none">
                              <GraduationCap className="h-3 w-3" />
                              {c._count?.students ?? 0} {c._count?.students === 1 ? "alumno" : "alumnos"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {c.isActive ? (
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
                            <form action={toggleActivoCarrera}>
                              <input type="hidden" name="id" value={c.id} />
                              <input
                                type="hidden"
                                name="activo"
                                value={String(c.isActive)}
                              />
                              <Button type="submit" variant="ghost" size="icon" className={`h-8 w-8 ${c.isActive ? 'text-gray-400 hover:text-orange-600 hover:bg-orange-50' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`}>
                                <Power className="h-4 w-4" />
                              </Button>
                            </form>
                            <form action={eliminarCarrera}>
                              <input type="hidden" name="id" value={c.id} />
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
