import { redirect } from "next/navigation";
import { LayoutDashboard, BookMarked, Calendar, FileText } from "lucide-react";
import { AppShell, type NavItem } from "@/components/shell/AppShell";
import { createClient } from "@/lib/supabase/server";

const NAV_ESTUDIANTE: NavItem[] = [
  { href: "/estudiante", label: "Inicio", icon: LayoutDashboard, exact: true },
  {
    href: "/estudiante/inscripciones",
    label: "Mis inscripciones",
    icon: BookMarked,
  },
  { href: "/estudiante/horario", label: "Mi horario", icon: Calendar },
  {
    href: "/estudiante/solicitudes",
    label: "Solicitudes",
    icon: FileText,
  },
];

export default async function EstudianteLayout({
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
      roleLabel="Estudiante"
      userEmail={user.email ?? ""}
      navItems={NAV_ESTUDIANTE}
    >
      {children}
    </AppShell>
  );
}
