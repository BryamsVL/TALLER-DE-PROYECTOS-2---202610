"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const CarreraSchema = z.object({
  nombre: z
    .string()
    .min(2, { error: "Minimo 2 caracteres." })
    .max(100, { error: "Maximo 100 caracteres." })
    .trim(),
});

export type CarreraFormState =
  | {
      errors?: { nombre?: string[] };
      message?: string;
    }
  | undefined;

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

  const supabase = await createClient();
  const { error } = await supabase.from("carrera").insert({
    nombre: parsed.data.nombre,
  });

  if (error) {
    // Codigo 23505 = unique_violation (nombre ya existe)
    if (error.code === "23505") {
      return { errors: { nombre: ["Ya existe una carrera con ese nombre."] } };
    }
    return { message: error.message };
  }

  revalidatePath("/admin/carreras");
  return { message: "ok" };
}

export async function toggleActivoCarrera(formData: FormData): Promise<void> {
  const id = Number(formData.get("id"));
  const activo = formData.get("activo") === "true";

  if (!Number.isInteger(id) || id <= 0) return;

  const supabase = await createClient();
  await supabase.from("carrera").update({ activo: !activo }).eq("id", id);
  revalidatePath("/admin/carreras");
}

export async function eliminarCarrera(formData: FormData): Promise<void> {
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) return;

  const supabase = await createClient();
  await supabase.from("carrera").delete().eq("id", id);
  revalidatePath("/admin/carreras");
}
