import { redirect } from "next/navigation";
import { LayoutDashboard, Calendar, Clock } from "lucide-react";
import { AppShell, type NavItem } from "@/components/shell/AppShell";
import { createClient } from "@/lib/supabase/server";

const NAV_DOCENTE: NavItem[] = [
  { href: "/docente", label: "Inicio", icon: LayoutDashboard, exact: true },
  { href: "/docente/horario", label: "Mi horario", icon: Calendar },
  { href: "/docente/disponibilidad", label: "Mi disponibilidad", icon: Clock },
];

export default async function DocenteLayout({
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
      roleLabel="Docente"
      userEmail={user.email ?? ""}
      navItems={NAV_DOCENTE}
    >
      {children}
    </AppShell>
  );
}
