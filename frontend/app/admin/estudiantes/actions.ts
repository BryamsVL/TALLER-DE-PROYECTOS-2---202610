"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import prisma from "@/lib/prisma";
import { mapAdminWriteErrorMessage } from "../action-errors";

const EstudianteSchema = z.object({
  nombre: z
    .string()
    .min(2, { error: "El nombre debe tener al menos 2 caracteres." })
    .max(100, { error: "El nombre es muy largo." })
    .trim(),
  email: z.email({ error: "Correo inválido." }).trim().toLowerCase(),
  password: z
    .string()
    .min(8, { error: "Mínimo 8 caracteres." })
    .regex(/[a-zA-Z]/, { error: "Debe contener al menos una letra." })
    .regex(/[0-9]/, { error: "Debe contener al menos un número." })
    .trim(),
  carreraId: z.string().min(1, { error: "Seleccione una carrera." }),
  ciclo: z.coerce
    .number()
    .int()
    .min(1, { error: "El ciclo debe ser entre 1 y 10." })
    .max(10, { error: "El ciclo debe ser entre 1 y 10." }),
  limiteCreditos: z.coerce
    .number()
    .int()
    .min(1, { error: "Mínimo 1 crédito." })
    .max(30, { error: "Máximo 30 créditos." })
    .default(22),
});

export type EstudianteFormState =
  | {
      errors?: {
        nombre?: string[];
        email?: string[];
        password?: string[];
        carreraId?: string[];
        ciclo?: string[];
        limiteCreditos?: string[];
      };
      message?: string;
    }
  | undefined;

async function assertAdminCaller() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return false;

  const user = await prisma.user.findUnique({
    where: { id: userData.user.id },
    select: { role: true },
  });

  return user?.role === "ADMIN";
}

export async function crearEstudiante(
  _prev: EstudianteFormState,
  formData: FormData,
): Promise<EstudianteFormState> {
  const parsed = EstudianteSchema.safeParse({
    nombre: formData.get("nombre"),
    email: formData.get("email"),
    password: formData.get("password"),
    carreraId: formData.get("carreraId"),
    ciclo: formData.get("ciclo"),
    limiteCreditos: formData.get("limiteCreditos") || "22",
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  if (!(await assertAdminCaller())) {
    return { message: mapAdminWriteErrorMessage("42501") };
  }

  // Obtener la facultad asociada a la carrera
  const carrera = await prisma.carrera.findUnique({
    where: { id: parsed.data.carreraId },
    select: { facultadId: true, name: true },
  });

  if (!carrera) {
    return { message: "Carrera seleccionada inválida." };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    return { message: err instanceof Error ? err.message : "Configuración de Supabase inválida." };
  }

  const { data: created, error: authError } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: { nombre: parsed.data.nombre },
  });

  if (authError || !created.user) {
    const msg = authError?.message ?? "";
    if (/registered|exists|duplicate/i.test(msg)) {
      return { errors: { email: ["Ya existe un usuario con ese correo."] } };
    }
    return { message: msg || "No se pudo crear el usuario." };
  }

  const userId = created.user.id;

  try {
    // Generar un código único de estudiante
    const code = "EST" + Math.floor(100000 + Math.random() * 900000);

    await prisma.$transaction(async (tx) => {
      // Sincronizar el usuario en la base de datos local
      await tx.user.upsert({
        where: { id: userId },
        update: {
          email: parsed.data.email,
          fullName: parsed.data.nombre,
          role: "STUDENT",
          isActive: true,
        },
        create: {
          id: userId,
          email: parsed.data.email,
          fullName: parsed.data.nombre,
          role: "STUDENT",
          isActive: true,
        },
      });

      // Crear el registro de Student
      await tx.student.create({
        data: {
          userId: userId,
          code: code,
          fullName: parsed.data.nombre,
          cycle: parsed.data.ciclo,
          career: carrera.name,
          carreraId: parsed.data.carreraId,
          facultadId: carrera.facultadId,
          creditLimit: parsed.data.limiteCreditos,
          isActive: true,
        },
      });
    });
  } catch (dbError: any) {
    try {
      await admin.auth.admin.deleteUser(userId);
    } catch (delErr) {
      console.error("Error al borrar usuario tras fallo DB:", delErr);
    }
    return { message: dbError.message || "Error al registrar el estudiante en la base de datos." };
  }

  revalidatePath("/admin/estudiantes");
  return { message: "ok" };
}

export async function toggleActivoEstudiante(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const activo = formData.get("activo") === "true";

  if (!id) return;

  if (!(await assertAdminCaller())) return;

  try {
    const student = await prisma.student.findUnique({
      where: { id },
      select: { userId: true },
    });

    await prisma.student.update({
      where: { id },
      data: { isActive: !activo },
    });

    if (student?.userId) {
      await prisma.user.update({
        where: { id: student.userId },
        data: { isActive: !activo },
      });
    }
  } catch (err) {
    console.error("Error toggling student active state:", err);
  }

  revalidatePath("/admin/estudiantes");
}

export async function eliminarEstudiante(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  if (!(await assertAdminCaller())) return;

  try {
    const student = await prisma.student.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (student?.userId) {
      try {
        const admin = createAdminClient();
        await admin.auth.admin.deleteUser(student.userId);
      } catch (authErr) {
        console.error("Error deleting from Supabase Auth:", authErr);
      }

      await prisma.user.delete({
        where: { id: student.userId },
      });
    } else {
      await prisma.student.delete({
        where: { id },
      });
    }
  } catch (err) {
    console.error("Error deleting student:", err);
  }

  revalidatePath("/admin/estudiantes");
}
