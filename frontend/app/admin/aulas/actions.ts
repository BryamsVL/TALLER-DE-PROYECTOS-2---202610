"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { mapAdminWriteErrorMessage } from "../action-errors";

const AulaSchema = z.object({
  nombre: z
    .string()
    .min(2, { error: "Mínimo 2 caracteres." })
    .max(50, { error: "Máximo 50 caracteres." })
    .trim(),
  tipo: z.enum(["GENERAL", "LAB"], {
    error: "Selecciona un tipo válido.",
  }),
  capacidad: z.coerce
    .number()
    .int({ error: "Debe ser un número entero." })
    .min(1, { error: "La capacidad debe ser mayor a 0." }),
});

export type AulaFormState =
  | {
      errors?: {
        nombre?: string[];
        tipo?: string[];
        capacidad?: string[];
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

export async function crearAula(
  _prev: AulaFormState,
  formData: FormData,
): Promise<AulaFormState> {
  const parsed = AulaSchema.safeParse({
    nombre: formData.get("nombre"),
    tipo: formData.get("tipo"),
    capacidad: formData.get("capacidad"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  if (!(await assertAdminCaller())) {
    return { message: mapAdminWriteErrorMessage("42501") };
  }

  try {
    const code = parsed.data.nombre.toUpperCase().replace(/\s+/g, "-");

    await prisma.classroom.create({
      data: {
        code: code,
        name: parsed.data.nombre,
        roomType: parsed.data.tipo,
        capacity: parsed.data.capacidad,
        isActive: true,
      },
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      return { errors: { nombre: ["Ya existe un aula con ese nombre."] } };
    }
    return { message: error.message || "Error al guardar el aula." };
  }

  revalidatePath("/admin/aulas");
  return { message: "ok" };
}

export async function toggleActivoAula(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const activo = formData.get("activo") === "true";

  if (!id) return;

  if (!(await assertAdminCaller())) return;

  try {
    await prisma.classroom.update({
      where: { id },
      data: { isActive: !activo },
    });
  } catch (err) {
    console.error("Error toggling classroom active state:", err);
  }

  revalidatePath("/admin/aulas");
}

export async function eliminarAula(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");

  if (!id) return;

  if (!(await assertAdminCaller())) return;

  try {
    await prisma.classroom.delete({
      where: { id },
    });
  } catch (err) {
    console.error("Error deleting classroom:", err);
  }

  revalidatePath("/admin/aulas");
}
