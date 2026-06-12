import prisma from "@/lib/prisma";
import { GraduationCap, AlertCircle, CheckCircle2, UserPlus, FileEdit, Trash2, Power, BookOpen } from "lucide-react";
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
import { StudentForm } from "./StudentForm";
import { eliminarEstudiante, toggleActivoEstudiante } from "./actions";

export default async function EstudiantesPage() {
  let fetchError: string | null = null;
  let estudiantesRegistrados: any[] = [];
  let carreras: any[] = [];

  try {
    estudiantesRegistrados = await prisma.student.findMany({
      include: {
        user: {
          select: {
            email: true,
          }
        },
        carrera: {
          select: {
            name: true,
          }
        }
      },
      orderBy: { fullName: "asc" },
    });

    carreras = await prisma.carrera.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
  } catch (error: any) {
    fetchError = error.message;
  }

  const total = estudiantesRegistrados?.length ?? 0;
  const activos = estudiantesRegistrados?.filter((e) => e.isActive).length ?? 0;
  const promedioCreditos = total > 0
    ? Math.round(estudiantesRegistrados.reduce((acc, curr) => acc + curr.creditLimit, 0) / total)
    : 22;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      <header className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-indigo-50 text-indigo-700">
          <GraduationCap className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl text-gray-900">
            Alumnado y Estudiantes
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Administra las fichas académicas, carreras, ciclos y límites de créditos de los estudiantes.
          </p>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="font-semibold uppercase tracking-wider text-xs">Total Estudiantes</CardDescription>
            <CardTitle className="font-display text-3xl">{total}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="font-semibold uppercase tracking-wider text-xs">Estudiantes Activos</CardDescription>
            <CardTitle className="font-display text-3xl text-green-600 flex items-center gap-2">
              {activos} <CheckCircle2 className="h-5 w-5 opacity-50" />
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="font-semibold uppercase tracking-wider text-xs">Límite Promedio de Créditos</CardDescription>
            <CardTitle className="font-display text-3xl text-indigo-600 flex items-center gap-2">
              {promedioCreditos} <BookOpen className="h-5 w-5 opacity-50" />
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
        <div>
          <Card className="border-gray-100 shadow-sm sticky top-6">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
              <CardTitle className="font-display text-base">Registrar estudiante</CardTitle>
              <CardDescription>
                Añade un nuevo estudiante indicando su ciclo y asignando su carrera respectiva.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <StudentForm carreras={carreras} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100">
              <CardTitle className="font-display text-base">Estudiantes registrados</CardTitle>
              <CardDescription>
                Lista completa de los alumnos inscritos en el sistema académico.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {fetchError && (
                <div className="p-6 flex items-center gap-3 text-red-600 bg-red-50">
                  <AlertCircle className="h-5 w-5" />
                  <p className="text-sm font-medium">Error cargando datos: {fetchError}</p>
                </div>
              )}

              {!fetchError && total === 0 && (
                <div className="p-12 text-center">
                  <GraduationCap className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                  <p className="text-sm font-medium text-gray-500">
                    Aún no hay estudiantes registrados en el sistema.
                  </p>
                </div>
              )}

              {total > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-semibold text-gray-500 uppercase text-[11px] tracking-wider w-[120px]">Código</TableHead>
                      <TableHead className="font-semibold text-gray-500 uppercase text-[11px] tracking-wider">Nombre</TableHead>
                      <TableHead className="font-semibold text-gray-500 uppercase text-[11px] tracking-wider">Carrera / Ciclo</TableHead>
                      <TableHead className="font-semibold text-gray-500 uppercase text-[11px] tracking-wider w-[100px]">Límite Cred.</TableHead>
                      <TableHead className="w-[120px] font-semibold text-gray-500 uppercase text-[11px] tracking-wider">Estado</TableHead>
                      <TableHead className="w-[150px] text-right font-semibold text-gray-500 uppercase text-[11px] tracking-wider">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {estudiantesRegistrados.map((student) => (
                      <TableRow key={student.id} className="group hover:bg-gray-50/50 transition-colors">
                        <TableCell className="font-medium text-gray-900">{student.code}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-700">{student.fullName}</p>
                            <p className="text-xs text-muted-foreground">{student.user?.email || "Sin email"}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium text-gray-600">{student.carrera?.name || student.career || "General"}</span>
                            <Badge variant="outline" className="w-fit font-semibold bg-indigo-50/50 text-indigo-700 border-indigo-100">
                              Ciclo {student.cycle}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-gray-700 text-center">
                          {student.creditLimit}
                        </TableCell>
                        <TableCell>
                          {student.isActive ? (
                            <Badge
                              variant="secondary"
                              className="bg-green-50 text-green-700 hover:bg-green-100 border-none flex items-center gap-1 w-fit"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                              Activo
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-400 border-gray-200 flex items-center gap-1 w-fit">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                              Inactivo
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <form action={toggleActivoEstudiante}>
                              <input type="hidden" name="id" value={student.id} />
                              <input
                                type="hidden"
                                name="activo"
                                value={String(student.isActive)}
                              />
                              <Button type="submit" variant="ghost" size="icon" className={`h-8 w-8 ${student.isActive ? 'text-gray-400 hover:text-orange-600 hover:bg-orange-50' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`}>
                                <Power className="h-4 w-4" />
                              </Button>
                            </form>
                            <form action={eliminarEstudiante}>
                              <input type="hidden" name="id" value={student.id} />
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
