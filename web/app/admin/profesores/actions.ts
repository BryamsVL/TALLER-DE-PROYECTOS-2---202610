"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { mapAdminWriteErrorMessage } from "../action-errors";

const ProfesorSchema = z.object({
  perfilId: z.uuid({ error: "Selecciona un perfil valido." }),
  tipo: z.enum(["TIEMPO_COMPLETO", "MEDIO_TIEMPO"], {
    error: "Selecciona un tipo de contrato valido.",
  }),
});

export type ProfesorFormState =
  | {
      errors?: {
        perfilId?: string[];
        tipo?: string[];
      };
      message?: string;
    }
  | undefined;

export async function crearProfesor(
  _prev: ProfesorFormState,
  formData: FormData,
): Promise<ProfesorFormState> {
  const parsed = ProfesorSchema.safeParse({
    perfilId: formData.get("perfilId"),
    tipo: formData.get("tipo"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();

  const { data: perfil, error: perfilError } = await supabase
    .from("perfil")
    .select("id, rol")
    .eq("id", parsed.data.perfilId)
    .single();

  if (perfilError || !perfil) {
    return { errors: { perfilId: ["No se encontro el perfil seleccionado."] } };
  }

  if (perfil.rol !== "DOCENTE") {
    return { errors: { perfilId: ["El perfil debe tener rol DOCENTE."] } };
  }

  const { error } = await supabase.from("profesor").insert({
    id: parsed.data.perfilId,
    tipo: parsed.data.tipo,
  });

  if (error) {
    if (error.code === "23505") {
      return { errors: { perfilId: ["Ese perfil ya esta registrado como profesor."] } };
    }
    return { message: mapAdminWriteErrorMessage(error.code, error.message) };
  }

  revalidatePath("/admin/profesores");
  return { message: "ok" };
}

export async function toggleActivoProfesor(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const activo = formData.get("activo") === "true";

  if (!id) return;

  const supabase = await createClient();
  await supabase.from("perfil").update({ activo: !activo }).eq("id", id);
  revalidatePath("/admin/profesores");
}

export async function eliminarProfesor(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");

  if (!id) return;

  const supabase = await createClient();
  await supabase.from("profesor").delete().eq("id", id);
  revalidatePath("/admin/profesores");
}
