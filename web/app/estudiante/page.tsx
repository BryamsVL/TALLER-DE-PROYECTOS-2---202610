import Link from "next/link";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Modulo {
  href: string;
  titulo: string;
  descripcion: string;
}

const MODULOS: Modulo[] = [
  {
    href: "/estudiante/inscripciones",
    titulo: "Mis inscripciones",
    descripcion: "Cursos en los que estas inscrito en el ciclo activo.",
  },
  {
    href: "/estudiante/horario",
    titulo: "Mi horario",
    descripcion: "Vista semanal con dias, bloques y aulas de tus NRCs.",
  },
  {
    href: "/estudiante/solicitudes",
    titulo: "Solicitudes de cambio",
    descripcion: "Pedir cambio de NRC o seccion. Estado de tus solicitudes.",
  },
];

export default function EstudianteHomePage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
          Tu vista como estudiante
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tus cursos, horario semanal y solicitudes de cambio.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MODULOS.map((m) => (
          <Link key={m.href} href={m.href} className="block">
            <Card className="h-full transition-colors hover:border-accent">
              <CardContent className="space-y-2">
                <CardTitle className="font-display text-base">{m.titulo}</CardTitle>
                <CardDescription>{m.descripcion}</CardDescription>
                <div className="pt-2">
                  <Badge variant="secondary">Disponible</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
