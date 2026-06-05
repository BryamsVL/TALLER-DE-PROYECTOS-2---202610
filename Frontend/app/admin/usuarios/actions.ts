"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import prisma from "@/lib/prisma";
import { mapAdminWriteErrorMessage } from "../action-errors";

// La UI usa roles en español; Prisma usa el enum UserRole en inglés.
type RolUi = "ADMIN" | "COORDINADOR" | "DOCENTE" | "ESTUDIANTE";
type RolDb = "ADMIN" | "COORDINATOR" | "TEACHER" | "STUDENT";

const UI_A_DB: Record<RolUi, RolDb> = {
  ADMIN: "ADMIN",
  COORDINADOR: "COORDINATOR",
  DOCENTE: "TEACHER",
  ESTUDIANTE: "STUDENT",
};

// El "tipo" de docente no existe en el modelo Teacher: se persiste en `specialty`
// (mismo criterio que crearProfesor en el modulo profesores).
const TIPO_A_SPECIALTY = {
  TIEMPO_COMPLETO: "Tiempo Completo",
  MEDIO_TIEMPO: "Medio Tiempo",
} as const;

const RolEnum = z.enum(["ADMIN", "DOCENTE", "ESTUDIANTE"]);
const TipoProfesorEnum = z.enum(["TIEMPO_COMPLETO", "MEDIO_TIEMPO"]);

const ActualizarUsuarioSchema = z
  .object({
    perfilId: z.string().min(1),
    nombre: z.string().min(2).max(100).trim(),
    rol: RolEnum,
    activo: z.union([z.literal("true"), z.literal("false")]).transform((v) => v === "true"),
    tipo: TipoProfesorEnum.optional(),
    carreraId: z.string().min(1).optional(),
  })
  .refine((d) => d.rol !== "DOCENTE" || d.tipo !== undefined, {
    message: "Selecciona el tipo de docente.",
    path: ["tipo"],
  })
  .refine((d) => d.rol !== "ESTUDIANTE" || d.carreraId !== undefined, {
    message: "Selecciona la carrera del estudiante.",
    path: ["carreraId"],
  });

export type UsuarioActionResult = { ok: true } | { ok: false; message: string };

async function assertAdminCaller(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  return dbUser?.role === "ADMIN";
}

export async function actualizarUsuario(formData: FormData): Promise<UsuarioActionResult> {
  const parsed = ActualizarUsuarioSchema.safeParse({
    perfilId: formData.get("perfilId"),
    nombre: formData.get("nombre"),
    rol: formData.get("rol"),
    activo: formData.get("activo"),
    tipo: formData.get("tipo") || undefined,
    carreraId: formData.get("carreraId") || undefined,
  });

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, message: issue?.message ?? "Datos invalidos." };
  }

  if (!(await assertAdminCaller())) {
    return { ok: false, message: mapAdminWriteErrorMessage("42501") };
  }

  const { perfilId, nombre, rol, activo, tipo, carreraId } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: perfilId },
        data: { fullName: nombre, role: UI_A_DB[rol], isActive: activo },
      });

      // Si el nuevo rol requiere fila hija, hacer upsert. La existente (de un rol
      // previo) se conserva: permite volver al rol sin perder datos asociados.
      if (rol === "DOCENTE" && tipo) {
        const teacher = await tx.teacher.findUnique({
          where: { userId: perfilId },
          select: { id: true },
        });
        if (teacher) {
          await tx.teacher.update({
            where: { id: teacher.id },
            data: { fullName: nombre, specialty: TIPO_A_SPECIALTY[tipo] },
          });
        } else {
          await tx.teacher.create({
            data: {
              userId: perfilId,
              code: "DOC" + Math.floor(10000 + Math.random() * 90000),
              fullName: nombre,
              specialty: TIPO_A_SPECIALTY[tipo],
              isActive: true,
            },
          });
        }
      } else if (rol === "ESTUDIANTE" && carreraId) {
        const student = await tx.student.findUnique({
          where: { userId: perfilId },
          select: { id: true },
        });
        if (student) {
          await tx.student.update({
            where: { id: student.id },
            data: { fullName: nombre, carreraId },
          });
        } else {
          await tx.student.create({
            data: {
              userId: perfilId,
              code: "EST" + Math.floor(10000 + Math.random() * 90000),
              fullName: nombre,
              cycle: 1,
              carreraId,
              isActive: true,
            },
          });
        }
      }
    });
  } catch (err: any) {
    return {
      ok: false,
      message: mapAdminWriteErrorMessage(err?.code, err?.message),
    };
  }

  revalidatePath("/admin/usuarios");
  revalidatePath("/admin/profesores");
  return { ok: true };
}

export async function toggleActivoUsuario(formData: FormData): Promise<UsuarioActionResult> {
  const perfilId = String(formData.get("perfilId") ?? "");
  const activo = formData.get("activo") === "true";

  if (!perfilId) return { ok: false, message: "Usuario invalido." };
  if (!(await assertAdminCaller())) {
    return { ok: false, message: mapAdminWriteErrorMessage("42501") };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: perfilId },
        data: { isActive: !activo },
      });
      await tx.teacher.updateMany({
        where: { userId: perfilId },
        data: { isActive: !activo },
      });
      await tx.student.updateMany({
        where: { userId: perfilId },
        data: { isActive: !activo },
      });
    });
  } catch (err: any) {
    return {
      ok: false,
      message: mapAdminWriteErrorMessage(err?.code, err?.message),
    };
  }

  revalidatePath("/admin/usuarios");
  revalidatePath("/admin/profesores");
  return { ok: true };
}

export async function eliminarUsuario(formData: FormData): Promise<UsuarioActionResult> {
  const perfilId = String(formData.get("perfilId") ?? "");
  if (!perfilId) return { ok: false, message: "Usuario invalido." };

  if (!(await assertAdminCaller())) {
    return { ok: false, message: mapAdminWriteErrorMessage("42501") };
  }

  // No te puedes eliminar a ti mismo.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user?.id === perfilId) {
    return { ok: false, message: "No puedes eliminar tu propio usuario." };
  }

  // Borrar de Supabase Auth (si existe) y luego de Prisma. La FK de
  // teacher/student a User es onDelete: SetNull, asi que no se pierde
  // historial de NRC/horarios.
  try {
    const admin = createAdminClient();
    await admin.auth.admin.deleteUser(perfilId);
  } catch (authErr) {
    console.error("Error al borrar de Supabase Auth:", authErr);
  }

  try {
    await prisma.user.delete({ where: { id: perfilId } });
  } catch (err: any) {
    return {
      ok: false,
      message: mapAdminWriteErrorMessage(err?.code, err?.message),
    };
  }

  revalidatePath("/admin/usuarios");
  revalidatePath("/admin/profesores");
  return { ok: true };
}
