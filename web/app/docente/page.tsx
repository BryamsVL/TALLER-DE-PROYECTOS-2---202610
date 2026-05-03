import Link from "next/link";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Modulo {
  href: string;
  titulo: string;
  descripcion: string;
  disponible: boolean;
}

const MODULOS: Modulo[] = [
  {
    href: "/docente/horario",
    titulo: "Mi horario",
    descripcion: "Cursos asignados, dias, bloques y aulas para el ciclo activo.",
    disponible: false,
  },
  {
    href: "/docente/disponibilidad",
    titulo: "Horario preferente",
    descripcion:
      "Marca los turnos por dia (manana / tarde / noche) en los que prefieres dictar clase.",
    disponible: true,
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
        {MODULOS.map((m) => {
          const card = (
            <Card
              key={m.href}
              className={`h-full ${m.disponible ? "transition-colors hover:border-accent" : "opacity-60 cursor-not-allowed"}`}
            >
              <CardContent className="space-y-2">
                <CardTitle className="font-display text-base">{m.titulo}</CardTitle>
                <CardDescription>{m.descripcion}</CardDescription>
                <div className="pt-2">
                  <Badge variant={m.disponible ? "secondary" : "outline"}>
                    {m.disponible ? "Disponible" : "Proximamente"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );

          return m.disponible ? (
            <Link key={m.href} href={m.href} className="block">
              {card}
            </Link>
          ) : (
            <div key={m.href}>{card}</div>
          );
        })}
      </div>
    </div>
  );
}
