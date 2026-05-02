import Link from "next/link";
import { redirect } from "next/navigation";
import { Settings2, GraduationCap, BookUser, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";

const ROLES = [
  {
    href: "/admin",
    label: "ROL 1",
    titulo: "Admin / Coordinador",
    descripcion:
      "Gestiona carreras, cursos, aulas, profesores y genera horarios.",
    icon: Settings2,
  },
  {
    href: "/docente",
    label: "ROL 2",
    titulo: "Docente",
    descripcion: "Consulta tu horario y registra tu disponibilidad semanal.",
    icon: BookUser,
  },
  {
    href: "/estudiante",
    label: "ROL 3",
    titulo: "Estudiante",
    descripcion: "Ve tus inscripciones, tu horario y solicita cambios.",
    icon: GraduationCap,
  },
] as const;

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto w-full px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-accent-foreground font-bold">
              S
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight">SGOHA</p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Academic OS
              </p>
            </div>
          </div>
          <form action={signOut}>
            <Button variant="ghost" size="sm" type="submit">
              Cerrar sesion
            </Button>
          </form>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="text-center max-w-3xl w-full">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Modo prototipo
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Selecciona el rol a previsualizar
          </h1>
          <p className="text-muted-foreground mb-12">
            Cada vista muestra la interfaz que vera ese tipo de usuario. Las
            restricciones reales por rol se activaran mas adelante.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {ROLES.map((r) => {
              const Icon = r.icon;
              return (
                <Link key={r.href} href={r.href} className="block">
                  <Card className="h-full text-left transition-colors hover:border-accent">
                    <CardContent className="p-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent/20 text-accent-foreground">
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {r.label}
                        </span>
                      </div>
                      <CardTitle className="font-display text-lg">
                        {r.titulo}
                      </CardTitle>
                      <CardDescription className="leading-snug">
                        {r.descripcion}
                      </CardDescription>
                      <div className="flex items-center gap-1 text-sm font-medium pt-2">
                        Ingresar
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          <p className="mt-10 text-xs text-muted-foreground">
            Sesion activa: {user.email}
          </p>
        </div>
      </main>
    </div>
  );
}
