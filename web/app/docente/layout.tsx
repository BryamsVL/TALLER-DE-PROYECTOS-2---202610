import { redirect } from "next/navigation";
import { AppShell, type NavItem } from "@/components/shell/AppShell";
import { getSessionProfile } from "@/lib/auth/get-session-profile";

const NAV_DOCENTE: NavItem[] = [
  { href: "/docente", label: "Inicio", icon: "layoutDashboard", exact: true },
  { href: "/docente/horario", label: "Mi horario", icon: "calendar" },
  { href: "/docente/disponibilidad", label: "Horario preferente", icon: "clock" },
];

export default async function DocenteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await getSessionProfile();

  if (!profile.activo || profile.rol !== "DOCENTE") {
    redirect("/dashboard");
  }

  return (
    <AppShell
      roleLabel="Docente"
      userEmail={user.email}
      navItems={NAV_DOCENTE}
    >
      {children}
    </AppShell>
  );
}
