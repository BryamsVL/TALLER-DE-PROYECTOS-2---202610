"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { mapAdminWriteErrorMessage } from "../action-errors";

const CarreraSchema = z.object({
  nombre: z
    .string()
    .min(2, { error: "Mínimo 2 caracteres." })
    .max(100, { error: "Máximo 100 caracteres." })
    .trim(),
});

export type CarreraFormState =
  | {
      errors?: { nombre?: string[] };
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

export async function crearCarrera(
  _prev: CarreraFormState,
  formData: FormData,
): Promise<CarreraFormState> {
  const parsed = CarreraSchema.safeParse({
    nombre: formData.get("nombre"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  if (!(await assertAdminCaller())) {
    return { message: mapAdminWriteErrorMessage("42501") };
  }

  try {
    const code = parsed.data.nombre.toUpperCase().replace(/\s+/g, "-");

    // Buscar o bootstrapear una Facultad por defecto
    let facultad = await prisma.facultad.findFirst();
    if (!facultad) {
      facultad = await prisma.facultad.create({
        data: {
          code: "FING",
          name: "Facultad de Ingeniería",
          isActive: true,
        }
      });
    }

    await prisma.carrera.create({
      data: {
        code: code,
        name: parsed.data.nombre,
        facultadId: facultad.id,
        isActive: true,
      },
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      return { errors: { nombre: ["Ya existe una carrera con ese nombre."] } };
    }
    return { message: error.message || "Error al guardar la carrera." };
  }

  revalidatePath("/admin/carreras");
  return { message: "ok" };
}

export async function toggleActivoCarrera(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const activo = formData.get("activo") === "true";

  if (!id) return;

  if (!(await assertAdminCaller())) return;

  try {
    await prisma.carrera.update({
      where: { id },
      data: { isActive: !activo },
    });
  } catch (err) {
    console.error("Error toggling career active state:", err);
  }

  revalidatePath("/admin/carreras");
}

export async function eliminarCarrera(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");

  if (!id) return;

  if (!(await assertAdminCaller())) return;

  try {
    await prisma.carrera.delete({
      where: { id },
    });
  } catch (err) {
    console.error("Error deleting career:", err);
  }

  revalidatePath("/admin/carreras");
}
