import prisma from "@/lib/prisma";
import { Users, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TeacherGridClient } from "./TeacherGridClient";

export default async function ProfesoresPage() {
  let fetchError: string | null = null;
  let profesoresRegistrados: any[] = [];
  let todosLosCursos: any[] = [];
  let todasLasCarreras: any[] = [];
  let todosLosSlots: any[] = [];

  try {
    const [teachers, courses, careers, slots] = await Promise.all([
      prisma.teacher.findMany({
        include: {
          teacherCourses: {
            include: {
              course: true,
            },
          },
          availability: {
            include: {
              timeSlot: true,
            },
          },
        },
        orderBy: { fullName: "asc" },
      }),
      prisma.course.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
      }),
      prisma.carrera.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
      }),
      prisma.timeSlot.findMany({
        where: { isActive: true },
        orderBy: { slotOrder: "asc" },
      }),
    ]);

    profesoresRegistrados = teachers;
    todosLosCursos = courses;
    todasLasCarreras = careers;
    todosLosSlots = slots;
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
            Administra los perfiles, especialidades, asignaciones de cursos y horarios preferidos de los profesores.
          </p>
        </div>
      </header>

      {/* Summary Stats cards */}
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

      {/* Full-width premium Grid view; registration moved to modal in the search bar */}
      <div className="space-y-6">
        <div className="space-y-6">
          {fetchError ? (
            <div className="p-6 flex items-center gap-3 text-red-600 bg-red-50 rounded-xl border border-red-100">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm font-medium">Error cargando datos: {fetchError}</p>
            </div>
          ) : (
            <TeacherGridClient
              initialProfesores={profesoresRegistrados}
              todosLosCursos={todosLosCursos}
              todasLasCarreras={todasLasCarreras}
              todosLosSlots={todosLosSlots}
            />
          )}
        </div>
      </div>
    </div>
  );
}
