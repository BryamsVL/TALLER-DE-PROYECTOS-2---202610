import prisma from "@/lib/prisma";
import Link from "next/link";
import { Users, AlertCircle, CheckCircle2, UserPlus, FileEdit, Trash2, Power } from "lucide-react";
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

export default async function ProfesoresPage() {
  let fetchError: string | null = null;
  let profesoresRegistrados: any[] = [];

  try {
    profesoresRegistrados = await prisma.teacher.findMany({
      select: {
        id: true,
        code: true,
        fullName: true,
        specialty: true,
        isActive: true,
      },
      orderBy: { fullName: "asc" },
    });
  } catch (error: any) {
    fetchError = error.message;
  }

  const total = profesoresRegistrados?.length ?? 0;
  const activos = profesoresRegistrados?.filter((p) => p.isActive).length ?? 0;
  const inactivos = total - activos;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      <header className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50 text-blue-700">
          <Users className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl text-gray-900">
            Plantel Docente
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Administra los perfiles, especialidades y estado de los profesores.
          </p>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="font-semibold uppercase tracking-wider text-xs">Total Profesores</CardDescription>
            <CardTitle className="font-display text-3xl">{total}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="font-semibold uppercase tracking-wider text-xs">Profesores Activos</CardDescription>
            <CardTitle className="font-display text-3xl text-green-600 flex items-center gap-2">
              {activos} <CheckCircle2 className="h-5 w-5 opacity-50" />
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="font-semibold uppercase tracking-wider text-xs">Inactivos / Suspendidos</CardDescription>
            <CardTitle className="font-display text-3xl text-gray-400">{inactivos}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <div className="space-y-6">
          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
              <CardTitle className="font-display text-base">Registrar profesor</CardTitle>
              <CardDescription>
                Añade un nuevo docente indicando su código y especialidad principal.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ProfesorForm />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100">
              <CardTitle className="font-display text-base">Docentes registrados</CardTitle>
              <CardDescription>
                Lista completa del profesorado disponible en el sistema.
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
                  <Users className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                  <p className="text-sm font-medium text-gray-500">
                    Aún no hay profesores registrados en el sistema.
                  </p>
                </div>
              )}

              {total > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-semibold text-gray-500 uppercase text-[11px] tracking-wider w-[100px]">Código</TableHead>
                      <TableHead className="font-semibold text-gray-500 uppercase text-[11px] tracking-wider">Profesor</TableHead>
                      <TableHead className="font-semibold text-gray-500 uppercase text-[11px] tracking-wider">Especialidad</TableHead>
                      <TableHead className="w-[120px] font-semibold text-gray-500 uppercase text-[11px] tracking-wider">Estado</TableHead>
                      <TableHead className="w-[200px] text-right font-semibold text-gray-500 uppercase text-[11px] tracking-wider">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profesoresRegistrados.map((profesor) => (
                      <TableRow key={profesor.id} className="group hover:bg-gray-50/50 transition-colors">
                        <TableCell className="font-medium text-gray-900">{profesor.code}</TableCell>
                        <TableCell className="font-medium text-gray-700">{profesor.fullName}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-white font-medium text-gray-600">
                            {profesor.specialty}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {profesor.isActive ? (
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
                            <form action={toggleActivoProfesor}>
                              <input type="hidden" name="id" value={profesor.id} />
                              <input
                                type="hidden"
                                name="activo"
                                value={String(profesor.isActive)}
                              />
                              <Button type="submit" variant="ghost" size="icon" className={`h-8 w-8 ${profesor.isActive ? 'text-gray-400 hover:text-orange-600 hover:bg-orange-50' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`}>
                                <Power className="h-4 w-4" />
                              </Button>
                            </form>
                            <form action={eliminarProfesor}>
                              <input type="hidden" name="id" value={profesor.id} />
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
