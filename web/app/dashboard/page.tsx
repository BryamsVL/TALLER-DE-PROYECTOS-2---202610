import Link from "next/link";
import { redirect } from "next/navigation";
import { Settings2, GraduationCap, BookUser, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { signOut } from "@/app/actions/auth";
import { getSessionProfile, isAdminRole, type AppRole } from "@/lib/auth/get-session-profile";

const ROLES = [
  {
    href: "/admin",
    role: "ADMIN",
    titulo: "Admin / Coordinador",
    descripcion:
      "Gestiona carreras, cursos, aulas, profesores y genera horarios.",
    icon: Settings2,
  },
  {
    href: "/docente",
    role: "DOCENTE",
    titulo: "Docente",
    descripcion: "Consulta tu horario y registra tu disponibilidad semanal.",
    icon: BookUser,
  },
  {
    href: "/estudiante",
    role: "ESTUDIANTE",
    titulo: "Estudiante",
    descripcion: "Ve tus inscripciones, tu horario y solicita cambios.",
    icon: GraduationCap,
  },
] as const;

function canAccess(role: AppRole, targetRole: (typeof ROLES)[number]["role"]) {
  if (targetRole === "ADMIN") {
    return isAdminRole(role);
  }

  return role === targetRole;
}

export default async function DashboardPage() {
  const { user, profile } = await getSessionProfile();
  if (!user) redirect("/login");

  const availableRoles = ROLES.filter((role) => profile.activo && canAccess(profile.rol, role.role));

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
            Acceso por rol
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Ingresa a tu espacio de trabajo
          </h1>
          <p className="text-muted-foreground mb-12">
            La plataforma ahora respeta el rol real registrado en tu perfil y
            solo muestra los modulos que tu usuario puede usar.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {availableRoles.map((r) => {
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
                          {r.role}
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

          {availableRoles.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Tu usuario no tiene un rol activo con acceso a modulos en este momento.
            </p>
          )}

          <p className="mt-10 text-xs text-muted-foreground">
            Sesion activa: {user.email} | Rol: {profile.rol}
          </p>
        </div>
      </main>
    </div>
  );
}
