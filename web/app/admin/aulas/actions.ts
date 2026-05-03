"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { mapAdminWriteErrorMessage } from "../action-errors";

const AulaSchema = z.object({
  nombre: z
    .string()
    .min(2, { error: "Minimo 2 caracteres." })
    .max(50, { error: "Maximo 50 caracteres." })
    .trim(),
  tipo: z.enum(["TEORIA", "LABORATORIO", "AUDITORIO"], {
    error: "Selecciona un tipo valido.",
  }),
  capacidad: z.coerce
    .number()
    .int({ error: "Debe ser un numero entero." })
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

  const supabase = await createClient();
  const { error } = await supabase.from("aula").insert(parsed.data);

  if (error) {
    if (error.code === "23505") {
      return { errors: { nombre: ["Ya existe un aula con ese nombre."] } };
    }
    return { message: mapAdminWriteErrorMessage(error.code, error.message) };
  }

  revalidatePath("/admin/aulas");
  return { message: "ok" };
}

export async function toggleActivoAula(formData: FormData): Promise<void> {
  const id = Number(formData.get("id"));
  const activo = formData.get("activo") === "true";

  if (!Number.isInteger(id) || id <= 0) return;

  const supabase = await createClient();
  await supabase.from("aula").update({ activo: !activo }).eq("id", id);
  revalidatePath("/admin/aulas");
}

export async function eliminarAula(formData: FormData): Promise<void> {
  const id = Number(formData.get("id"));

  if (!Number.isInteger(id) || id <= 0) return;

  const supabase = await createClient();
  await supabase.from("aula").delete().eq("id", id);
  revalidatePath("/admin/aulas");
}
