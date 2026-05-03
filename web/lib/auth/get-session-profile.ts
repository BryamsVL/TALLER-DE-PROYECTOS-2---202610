import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AppRole = "ADMIN" | "COORDINADOR" | "DOCENTE" | "ESTUDIANTE";

interface SessionProfile {
  user: {
    id: string;
    email: string;
  };
  profile: {
    nombre: string;
    rol: AppRole;
    activo: boolean;
  };
}

export async function getSessionProfile(): Promise<SessionProfile> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("perfil")
    .select("nombre, rol, activo")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  return {
    user: {
      id: user.id,
      email: user.email ?? "",
    },
    profile: {
      nombre: profile.nombre,
      rol: profile.rol as AppRole,
      activo: profile.activo,
    },
  };
}

export function isAdminRole(role: AppRole) {
  return role === "ADMIN" || role === "COORDINADOR";
}
