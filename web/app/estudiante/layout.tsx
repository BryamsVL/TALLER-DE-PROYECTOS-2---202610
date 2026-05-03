import { redirect } from "next/navigation";
import { AppShell, type NavItem } from "@/components/shell/AppShell";
import { getSessionProfile } from "@/lib/auth/get-session-profile";

const NAV_ESTUDIANTE: NavItem[] = [
  { href: "/estudiante", label: "Inicio", icon: "layoutDashboard", exact: true },
  {
    href: "/estudiante/inscripciones",
    label: "Mis inscripciones",
    icon: "bookMarked",
  },
  { href: "/estudiante/horario", label: "Mi horario", icon: "calendar" },
  {
    href: "/estudiante/solicitudes",
    label: "Solicitudes",
    icon: "fileText",
  },
];

export default async function EstudianteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await getSessionProfile();

  if (!profile.activo || profile.rol !== "ESTUDIANTE") {
    redirect("/dashboard");
  }

  return (
    <AppShell
      roleLabel="Estudiante"
      userEmail={user.email}
      navItems={NAV_ESTUDIANTE}
    >
      {children}
    </AppShell>
  );
}
