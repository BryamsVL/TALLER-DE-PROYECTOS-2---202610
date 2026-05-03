import { redirect } from "next/navigation";
import { AppShell, type NavItem } from "@/components/shell/AppShell";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { createClient } from "@/lib/supabase/server";

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

  // El trigger handle_new_user crea perfil pero NO crea fila en estudiante.
  // Sin esa fila el alumno no puede inscribirse a NRCs (FK violation).
  const supabase = await createClient();
  const { data: estudianteRow } = await supabase
    .from("estudiante")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (!estudianteRow) {
    redirect("/onboarding/estudiante");
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
