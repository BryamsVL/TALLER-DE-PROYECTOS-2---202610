import prisma from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GenerarHorarioPanel } from "./GenerarHorarioPanel";
import { ExportHorarioButtons } from "@/components/ExportHorarioButtons";
import { 
  CalendarClock, 
  DoorOpen, 
  BookMarked, 
  Users, 
  CheckCircle, 
  AlertTriangle,
  Play
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HorariosPage() {
  // Query statistics using Prisma Client
  const [
    activePeriod,
    classroomsTotal,
    teachersTotal,
    coursesTotal,
    timeSlotsTotal,
    coursesWithTeacher,
  ] = await Promise.all([
    prisma.academicPeriod.findFirst({
      where: { isActive: true },
    }),
    prisma.classroom.count({
      where: { isActive: true },
    }),
    prisma.teacher.count({
      where: { isActive: true },
    }),
    prisma.course.count({
      where: { isActive: true },
    }),
    prisma.timeSlot.count({
      where: { isActive: true },
    }),
    prisma.course.count({
      where: {
        isActive: true,
        teacherCourses: {
          some: {},
        },
      },
    }),
  ]);

  const coursesWithoutTeacher = coursesTotal - coursesWithTeacher;
  const isReady = classroomsTotal > 0 && timeSlotsTotal > 0 && coursesWithTeacher > 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 md:p-6">
      {/* Header section with clean design */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-700 p-6 md:p-8 text-white shadow-lg">
        <div className="absolute right-0 top-0 -mr-12 -mt-12 h-40 w-40 rounded-full bg-white/10 blur-xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-100 text-sm font-semibold tracking-wider uppercase">
              <CalendarClock className="h-4 w-4 text-indigo-300" />
              Solver CSP de Inteligencia Artificial
            </div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl text-white">
              Generar Horario Académico
            </h1>
            <p className="mt-2 text-indigo-100 max-w-2xl text-sm md:text-base">
              {activePeriod
                ? `Resuelve la asignación óptima de día, bloque y aula para los cursos del periodo activo: "${activePeriod.name}" (Límite: ${activePeriod.maxStudentCredits} créditos por estudiante).`
                : "No se detectó un periodo académico activo en el sistema. Registra o activa uno antes de proceder."}
            </p>
          </div>
          {activePeriod && (
            <span className="self-start md:self-auto bg-white/20 backdrop-blur-md text-white border border-white/20 px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold tracking-wide">
              Periodo Activo: {activePeriod.code}
            </span>
          )}
        </div>
      </div>

      {/* Statistics section with premium icons & gradients */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <div className="space-y-1">
              <CardDescription className="text-xs font-semibold text-gray-500 uppercase">Cursos con Docente</CardDescription>
              <CardTitle className="text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                {coursesWithTeacher}
              </CardTitle>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl">
              <BookMarked className="h-6 w-6" />
            </div>
          </CardHeader>
        </Card>

        <Card className="border-none bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <div className="space-y-1">
              <CardDescription className="text-xs font-semibold text-gray-500 uppercase">Cursos sin Docente</CardDescription>
              <CardTitle className={`text-3xl font-bold tracking-tight ${coursesWithoutTeacher > 0 ? "text-amber-500" : "text-gray-400"}`}>
                {coursesWithoutTeacher}
              </CardTitle>
            </div>
            <div className={`p-3 rounded-2xl ${coursesWithoutTeacher > 0 ? "bg-amber-50 dark:bg-amber-950/40 text-amber-500" : "bg-gray-50 dark:bg-gray-800 text-gray-400"}`}>
              <AlertTriangle className="h-6 w-6" />
            </div>
          </CardHeader>
        </Card>

        <Card className="border-none bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <div className="space-y-1">
              <CardDescription className="text-xs font-semibold text-gray-500 uppercase">Aulas Habilitadas</CardDescription>
              <CardTitle className="text-3xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
                {classroomsTotal}
              </CardTitle>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl">
              <DoorOpen className="h-6 w-6" />
            </div>
          </CardHeader>
        </Card>

        <Card className="border-none bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <div className="space-y-1">
              <CardDescription className="text-xs font-semibold text-gray-500 uppercase">Bloques Horarios</CardDescription>
              <CardTitle className="text-3xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">
                {timeSlotsTotal}
              </CardTitle>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl">
              <CalendarClock className="h-6 w-6" />
            </div>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Generate / Execute Panel (Full width) */}
        <Card className="lg:col-span-3 border-none shadow-md bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
          <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-4">
            <CardTitle className="font-display text-lg font-bold flex items-center gap-2 text-gray-800 dark:text-gray-100">
              <Play className="h-5 w-5 text-indigo-500" />
              Resolución y Resultados del Horario
            </CardTitle>
            <CardDescription className="text-xs">
              Ejecuta el Solver CSP de Python para compilar y visualizar el calendario óptimo.
            </CardDescription>
            <div className="pt-3">
              <ExportHorarioButtons />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <GenerarHorarioPanel />
          </CardContent>
        </Card>

        {/* Pre-flight Checks (Bottom, full width) */}
        <Card className="lg:col-span-3 border-none shadow-md bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
          <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-4">
            <CardTitle className="font-display text-lg font-bold flex items-center gap-2 text-gray-800 dark:text-gray-100">
              <CheckCircle className="h-5 w-5 text-indigo-500" />
              Verificación Pre-Flight
            </CardTitle>
            <CardDescription className="text-xs">
              Validaciones críticas del Solver de horarios antes de ejecutar el cómputo.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {coursesWithoutTeacher > 0 && (
              <div className="flex items-start gap-3 p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs md:text-sm text-amber-700 dark:text-amber-400">
                <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0 text-amber-500" />
                <div>
                  <span className="font-bold block mb-0.5">Cursos sin docente asignado</span>
                  Un total de {coursesWithoutTeacher} curso(s) no registran profesores elegibles y serán omitidos de la programación.
                </div>
              </div>
            )}

            {classroomsTotal === 0 && (
              <div className="flex items-start gap-3 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs md:text-sm text-rose-700 dark:text-rose-400">
                <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0 text-rose-500" />
                <div>
                  <span className="font-bold block mb-0.5">Sin aulas registradas</span>
                  No existen aulas activas en el sistema. Debes registrar al menos una aula en el panel correspondiente.
                </div>
              </div>
            )}

            {timeSlotsTotal === 0 && (
              <div className="flex items-start gap-3 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs md:text-sm text-rose-700 dark:text-rose-400">
                <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0 text-rose-500" />
                <div>
                  <span className="font-bold block mb-0.5">Sin bloques configurados</span>
                  No se detectaron bloques horarios (time slots) de Lunes a Viernes. Ejecuta el script de seeding para inicializarlos.
                </div>
              </div>
            )}

            {coursesWithTeacher === 0 && (
              <div className="flex items-start gap-3 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs md:text-sm text-rose-700 dark:text-rose-400">
                <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0 text-rose-500" />
                <div>
                  <span className="font-bold block mb-0.5">Faltan asignaciones de docente</span>
                  No hay ningún curso con docente elegible asignado. Agrega relaciones en el módulo "Curso ↔ Profesor".
                </div>
              </div>
            )}

            {isReady && (
              <div className="flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-emerald-500/30 rounded-2xl bg-emerald-500/5">
                <CheckCircle className="h-10 w-10 text-emerald-500 mb-2" />
                <h4 className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">¡Todo Listo!</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-[200px]">
                  La base de datos cumple con todos los requisitos para realizar el cálculo matemático.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

