import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

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

const ROLE_MAP: Record<string, AppRole> = {
  ADMIN: "ADMIN",
  COORDINATOR: "COORDINADOR",
  TEACHER: "DOCENTE",
  STUDENT: "ESTUDIANTE",
};

export async function getSessionProfile(): Promise<SessionProfile> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Buscar el usuario en la nueva base de datos usando Prisma
  let dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  // Auto-aprovisionar si no existe en la base de datos de Prisma para evitar bucles de redirección
  if (!dbUser) {
    try {
      dbUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email ?? "",
          fullName: (user.user_metadata?.nombre as string) || (user.user_metadata?.full_name as string) || "Administrador",
          role: "ADMIN", // Forzar ADMIN para desarrollo
          isActive: true,
        },
      });
    } catch (error) {
      console.error("Error auto-provisioning user in Prisma:", error);
      redirect("/login");
    }
  }

  const mappedRole = ROLE_MAP[dbUser.role] || "ESTUDIANTE";

  return {
    user: {
      id: user.id,
      email: user.email ?? "",
    },
    profile: {
      nombre: dbUser.fullName,
      rol: mappedRole,
      activo: dbUser.isActive,
    },
  };
}

export function isAdminRole(role: AppRole) {
  return role === "ADMIN" || role === "COORDINADOR";
}

