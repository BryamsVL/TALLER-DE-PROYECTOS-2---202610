import Link from "next/link";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Modulo {
  href: string;
  titulo: string;
  descripcion: string;
  estado: "disponible" | "proximamente";
}

const MODULOS: Modulo[] = [
  {
    href: "/admin/carreras",
    titulo: "Carreras",
    descripcion: "Catalogo de carreras de la facultad.",
    estado: "disponible",
  },
  {
    href: "/admin/aulas",
    titulo: "Aulas",
    descripcion: "Espacios fisicos: teoria, laboratorio, auditorio.",
    estado: "proximamente",
  },
  {
    href: "/admin/profesores",
    titulo: "Profesores",
    descripcion: "Plantel docente y tipo de contrato.",
    estado: "proximamente",
  },
  {
    href: "/admin/cursos",
    titulo: "Cursos",
    descripcion: "Malla curricular: nombre, horas semanales, tipo de aula.",
    estado: "proximamente",
  },
  {
    href: "/admin/cohortes",
    titulo: "Cohortes",
    descripcion: "Secciones de alumnos por carrera, ciclo y nivel.",
    estado: "proximamente",
  },
  {
    href: "/admin/asignaciones",
    titulo: "Curso a Profesor",
    descripcion: "Que profesor puede dictar que curso.",
    estado: "proximamente",
  },
  {
    href: "/admin/horarios",
    titulo: "Generar horario",
    descripcion: "Disparar el algoritmo CSP y revisar el resultado.",
    estado: "proximamente",
  },
];

export default function AdminHomePage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
          Resumen
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Modulos de gestion academica. Selecciona uno para empezar.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MODULOS.map((m) => {
          const isDisponible = m.estado === "disponible";
          const inner = (
            <Card
              className={
                isDisponible
                  ? "h-full transition-colors hover:border-accent"
                  : "h-full opacity-60 cursor-not-allowed"
              }
            >
              <CardContent className="space-y-2">
                <CardTitle className="font-display text-base">
                  {m.titulo}
                </CardTitle>
                <CardDescription>{m.descripcion}</CardDescription>
                <div className="pt-2">
                  {isDisponible ? (
                    <Badge variant="secondary" className="bg-success/20 text-success-foreground">
                      Disponible
                    </Badge>
                  ) : (
                    <Badge variant="outline">Proximamente</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
          return isDisponible ? (
            <Link key={m.href} href={m.href} className="block">
              {inner}
            </Link>
          ) : (
            <div key={m.href}>{inner}</div>
          );
        })}
      </div>
    </div>
  );
}
