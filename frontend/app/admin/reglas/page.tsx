import prisma from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ReglasForm } from "./ReglasForm";

export const dynamic = "force-dynamic";

export default async function ReglasPage() {
  const period = await prisma.academicPeriod.findFirst({
    where: { isActive: true },
    select: {
      name: true,
      minStudentCredits: true,
      maxStudentCredits: true,
    },
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
          Reglas académicas
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {period
            ? `Reglas aplicadas al periodo activo: ${period.name}.`
            : "No hay un periodo academico activo."}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base">
            Créditos por estudiante
          </CardTitle>
          <CardDescription>
            Define el mínimo y el máximo de créditos que un estudiante puede
            matricular en el periodo activo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {period ? (
            <ReglasForm
              defaultMin={period.minStudentCredits}
              defaultMax={period.maxStudentCredits}
            />
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Activa un periodo académico antes de configurar reglas.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
