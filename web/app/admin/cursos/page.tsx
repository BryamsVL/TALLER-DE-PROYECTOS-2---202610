import prisma from "@/lib/prisma";
import { BookOpen, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CursoForm } from "./CursoForm";
import { CursosTable } from "./CursosTable";

export default async function CursosPage() {
  let fetchError: string | null = null;
  let cursos: any[] = [];
  let nrcs: any[] = [];

  try {
    [cursos, nrcs] = await Promise.all([
      prisma.course.findMany({
        select: {
          id: true,
          cycle: true,
          code: true,
          name: true,
          weeklyHours: true,
          requiredRoomType: true,
          isActive: true,
        },
        orderBy: [{ cycle: "asc" }, { name: "asc" }],
      }),
      // We don't have nrc in prisma, probably courseOffering?
      prisma.courseOffering.findMany({
        select: { id: true, courseId: true },
        orderBy: { id: "asc" },
      }),
    ]);
  } catch (error: any) {
    fetchError = error.message;
  }

  const total = cursos?.length ?? 0;
  const activos = cursos?.filter((c) => c.isActive).length ?? 0;

  const nrcsPorCurso: Record<string, { nrc: string }[]> = {};
  for (const row of nrcs ?? []) {
    (nrcsPorCurso[row.courseId] ??= []).push({ nrc: "Sección" });
  }

  const totalNrcs = (nrcs ?? []).length;
  // TODO: Add teacher counting based on actual model later
  const nrcsAsignados = totalNrcs; 

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      <header className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-purple-50 text-purple-700">
          <BookOpen className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl text-gray-900">
            Catálogo de Cursos
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona la malla curricular, créditos y configuración de NRCs por curso.
          </p>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="font-semibold uppercase tracking-wider text-xs">Total Cursos</CardDescription>
            <CardTitle className="font-display text-3xl">{total}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="font-semibold uppercase tracking-wider text-xs">Cursos Activos</CardDescription>
            <CardTitle className="font-display text-3xl text-green-600 flex items-center gap-2">
              {activos} <CheckCircle2 className="h-5 w-5 opacity-50" />
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="font-semibold uppercase tracking-wider text-xs">NRCs (Instancias)</CardDescription>
            <CardTitle className="font-display text-3xl">{totalNrcs}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="font-semibold uppercase tracking-wider text-xs">NRCs Asignados</CardDescription>
            <CardTitle className="font-display text-3xl text-purple-600">{nrcsAsignados}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <div className="space-y-6">
          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
              <CardTitle className="font-display text-base">Crear nuevo curso</CardTitle>
              <CardDescription>
                Registra el curso con su ciclo, carga horaria y tipo de aula.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <CursoForm carreras={[]} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100">
              <CardTitle className="font-display text-base">Cursos registrados</CardTitle>
              <CardDescription>
                Cada curso tiene una vista de detalle para gestionar sus NRCs y configuración.
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
                  <BookOpen className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                  <p className="text-sm font-medium text-gray-500">
                    Aún no hay cursos registrados en el sistema.
                  </p>
                </div>
              )}

              {total > 0 && (
                <div className="p-4">
                  <CursosTable
                    cursos={cursos}
                    nrcsPorCurso={nrcsPorCurso}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
