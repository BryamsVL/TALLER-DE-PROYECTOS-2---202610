import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Modulo {
  href: string;
  titulo: string;
  descripcion: string;
}

const MODULOS: Modulo[] = [
  {
    href: "/docente/horario",
    titulo: "Mi horario",
    descripcion: "Cursos asignados, dias, bloques y aulas para el ciclo activo.",
  },
  {
    href: "/docente/disponibilidad",
    titulo: "Mi disponibilidad",
    descripcion:
      "Marca los turnos por dia (manana / tarde / noche) en los que puedes dictar clase.",
  },
];

export default function DocenteHomePage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
          Tu vista como docente
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Consulta tu horario y registra los turnos en los que estas disponible.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {MODULOS.map((m) => (
          <Card key={m.href} className="h-full opacity-60 cursor-not-allowed">
            <CardContent className="space-y-2">
              <CardTitle className="font-display text-base">{m.titulo}</CardTitle>
              <CardDescription>{m.descripcion}</CardDescription>
              <div className="pt-2">
                <Badge variant="outline">Proximamente</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
