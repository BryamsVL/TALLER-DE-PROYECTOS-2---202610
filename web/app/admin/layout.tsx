import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  DoorOpen,
  Users,
  BookMarked,
  GraduationCap,
  Link2,
  CalendarClock,
} from "lucide-react";
import { AppShell, type NavItem } from "@/components/shell/AppShell";
import { createClient } from "@/lib/supabase/server";

const NAV_ADMIN: NavItem[] = [
  { href: "/admin", label: "Inicio", icon: LayoutDashboard, exact: true },
  { href: "/admin/carreras", label: "Carreras", icon: Building2 },
  { href: "/admin/aulas", label: "Aulas", icon: DoorOpen },
  { href: "/admin/profesores", label: "Profesores", icon: Users },
  { href: "/admin/cursos", label: "Cursos", icon: BookMarked },
  { href: "/admin/cohortes", label: "Cohortes", icon: GraduationCap },
  { href: "/admin/asignaciones", label: "Curso ↔ Profesor", icon: Link2 },
  { href: "/admin/horarios", label: "Generar horario", icon: CalendarClock },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <AppShell
      roleLabel="Admin / Coordinador"
      userEmail={user.email ?? ""}
      navItems={NAV_ADMIN}
    >
      {children}
    </AppShell>
  );
}
