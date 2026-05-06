"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import prisma from "@/lib/prisma";
import { mapAdminWriteErrorMessage } from "../action-errors";

const ProfesorSchema = z.object({
  nombre: z
    .string()
    .min(2, { error: "El nombre debe tener al menos 2 caracteres." })
    .max(100, { error: "El nombre es muy largo." })
    .trim(),
  email: z.email({ error: "Correo invalido." }).trim().toLowerCase(),
  password: z
    .string()
    .min(8, { error: "Minimo 8 caracteres." })
    .regex(/[a-zA-Z]/, { error: "Debe contener al menos una letra." })
    .regex(/[0-9]/, { error: "Debe contener al menos un numero." })
    .trim(),
  tipo: z.enum(["TIEMPO_COMPLETO", "MEDIO_TIEMPO"], {
    error: "Selecciona un tipo de contrato valido.",
  }),
});

export type ProfesorFormState =
  | {
      errors?: {
        nombre?: string[];
        email?: string[];
        password?: string[];
        tipo?: string[];
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

  return user?.role === "ADMIN" || user?.role === "COORDINATOR";
}

export async function crearProfesor(
  _prev: ProfesorFormState,
  formData: FormData,
): Promise<ProfesorFormState> {
  const parsed = ProfesorSchema.safeParse({
    nombre: formData.get("nombre"),
    email: formData.get("email"),
    password: formData.get("password"),
    tipo: formData.get("tipo"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  if (!(await assertAdminCaller())) {
    return { message: mapAdminWriteErrorMessage("42501") };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    return { message: err instanceof Error ? err.message : "Configuracion invalida." };
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
    // Generamos un código único para el docente
    const code = "DOC" + Math.floor(10000 + Math.random() * 90000);

    await prisma.$transaction(async (tx) => {
      // Sincronizamos / creamos el registro de User en Prisma
      await tx.user.upsert({
        where: { id: userId },
        update: {
          email: parsed.data.email,
          fullName: parsed.data.nombre,
          role: "TEACHER",
          isActive: true,
        },
        create: {
          id: userId,
          email: parsed.data.email,
          fullName: parsed.data.nombre,
          role: "TEACHER",
          isActive: true,
        },
      });

      // Creamos el registro del Teacher asociado
      await tx.teacher.create({
        data: {
          userId: userId,
          code: code,
          fullName: parsed.data.nombre,
          specialty: parsed.data.tipo === "TIEMPO_COMPLETO" ? "Tiempo Completo" : "Medio Tiempo",
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
    return { message: dbError.message || "Error al registrar el profesor en la base de datos." };
  }

  revalidatePath("/admin/profesores");
  return { message: "ok" };
}

export async function toggleActivoProfesor(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const activo = formData.get("activo") === "true";

  if (!id) return;

  if (!(await assertAdminCaller())) return;

  try {
    const teacher = await prisma.teacher.findUnique({
      where: { id },
      select: { userId: true },
    });

    await prisma.teacher.update({
      where: { id },
      data: { isActive: !activo },
    });

    if (teacher?.userId) {
      await prisma.user.update({
        where: { id: teacher.userId },
        data: { isActive: !activo },
      });
    }
  } catch (err) {
    console.error("Error toggling active state:", err);
  }

  revalidatePath("/admin/profesores");
}

export async function eliminarProfesor(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  if (!(await assertAdminCaller())) return;

  try {
    const teacher = await prisma.teacher.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (teacher?.userId) {
      try {
        const admin = createAdminClient();
        await admin.auth.admin.deleteUser(teacher.userId);
      } catch (authErr) {
        console.error("Error deleting from Supabase Auth:", authErr);
      }

      await prisma.user.delete({
        where: { id: teacher.userId },
      });
    } else {
      await prisma.teacher.delete({
        where: { id },
      });
    }
  } catch (err) {
    console.error("Error deleting teacher:", err);
  }

  revalidatePath("/admin/profesores");
}

export async function editarProfesor(
  teacherId: string,
  nombre: string,
  specialty: string,
  courseIds: string[],
  timeSlotIds: string[]
): Promise<{ success: boolean; error?: string }> {
  if (!(await assertAdminCaller())) {
    return { success: false, error: "No autorizado." };
  }

  if (!teacherId || !nombre.trim() || !specialty.trim()) {
    return { success: false, error: "Datos de entrada inválidos o incompletos." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Obtener profesor para ver si tiene userId
      const teacher = await tx.teacher.findUnique({
        where: { id: teacherId },
        select: { userId: true },
      });

      if (!teacher) {
        throw new Error("Profesor no encontrado.");
      }

      // 2. Actualizar el docente (nombre completo y especialidad/carrera)
      await tx.teacher.update({
        where: { id: teacherId },
        data: {
          fullName: nombre.trim(),
          specialty: specialty.trim(),
        },
      });

      // 3. Si tiene userId, sincronizar el User también para mantener consistencia en login/perfiles
      if (teacher.userId) {
        await tx.user.update({
          where: { id: teacher.userId },
          data: {
            fullName: nombre.trim(),
          },
        });
      }

      // 4. Gestión de Cursos (TeacherCourse)
      // Primero eliminamos las asignaciones anteriores
      await tx.teacherCourse.deleteMany({
        where: { teacherId: teacherId },
      });

      // Insertamos las nuevas asignaciones
      if (courseIds.length > 0) {
        await tx.teacherCourse.createMany({
          data: courseIds.map((courseId) => ({
            teacherId: teacherId,
            courseId: courseId,
          })),
        });
      }

      // 5. Gestión de Disponibilidad (TeacherAvailability)
      // Primero eliminamos la disponibilidad horaria preferida anterior
      await tx.teacherAvailability.deleteMany({
        where: { teacherId: teacherId },
      });

      // Insertamos los nuevos bloques seleccionados
      if (timeSlotIds.length > 0) {
        await tx.teacherAvailability.createMany({
          data: timeSlotIds.map((timeSlotId) => ({
            teacherId: teacherId,
            timeSlotId: timeSlotId,
            isAvailable: true,
          })),
        });
      }
    });

    revalidatePath("/admin/profesores");
    return { success: true };
  } catch (error: any) {
    console.error("Error editing teacher:", error);
    return {
      success: false,
      error: error.message || "Error al actualizar el profesor en la base de datos.",
    };
  }
}

