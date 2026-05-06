import { redirect } from "next/navigation";
import { AppShell, type NavItem } from "@/components/shell/AppShell";
import { getSessionProfile, isAdminRole } from "@/lib/auth/get-session-profile";

const NAV_ADMIN: NavItem[] = [
  { href: "/admin", label: "Inicio", icon: "layoutDashboard", exact: true },
  { href: "/admin/usuarios", label: "Usuarios", icon: "userCog" },
  { href: "/admin/profesores", label: "Profesores", icon: "users" },
  { href: "/admin/carreras", label: "Carreras", icon: "building" },
  { href: "/admin/aulas", label: "Aulas", icon: "door" },
  { href: "/admin/cursos", label: "Cursos", icon: "bookMarked" },
  { href: "/admin/horarios", label: "Generar horario", icon: "calendarClock" },
];


export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await getSessionProfile();

  if (!profile.activo || !isAdminRole(profile.rol)) {
    redirect("/dashboard");
  }

  return (
    <AppShell
      roleLabel="Admin / Coordinador"
      userEmail={user.email}
      navItems={NAV_ADMIN}
    >
      {children}
    </AppShell>
  );
}
