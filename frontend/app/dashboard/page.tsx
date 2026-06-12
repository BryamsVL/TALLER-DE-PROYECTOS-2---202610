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
    titulo: "Administrador",
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

  if (availableRoles.length > 0) {
    redirect(availableRoles[0].href);
  }

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
        <div className="text-center max-w-xl w-full">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Acceso denegado
          </p>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight mb-3">
            No tienes acceso a modulos activos
          </h1>
          <p className="text-muted-foreground mb-8">
            Tu usuario no tiene un rol activo con acceso a modulos en este momento.
          </p>
          
          <form action={signOut}>
            <Button type="submit">
              Cerrar sesion y volver al inicio
            </Button>
          </form>

          <p className="mt-10 text-xs text-muted-foreground">
            Sesion activa: {user.email} | Rol: {profile.rol}
          </p>
        </div>
      </main>
    </div>
  );
}
