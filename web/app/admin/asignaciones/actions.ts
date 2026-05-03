"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { mapAdminWriteErrorMessage } from "../action-errors";

const SetAsignacionSchema = z.object({
  cursoId: z.coerce.number().int().positive(),
  profesorId: z.uuid(),
  activar: z.union([z.literal("true"), z.literal("false")]).transform((v) => v === "true"),
});

export type AsignacionResult = { ok: true } | { ok: false; message: string };

// Idempotente: activar=true crea la relacion (ignora duplicado), activar=false la borra.
// La paridad con `curso_profesor` es la fuente de verdad de "este profe puede dictar este curso".
export async function setAsignacion(formData: FormData): Promise<AsignacionResult> {
  const parsed = SetAsignacionSchema.safeParse({
    cursoId: formData.get("cursoId"),
    profesorId: formData.get("profesorId"),
    activar: formData.get("activar"),
  });

  if (!parsed.success) {
    return { ok: false, message: "Datos invalidos." };
  }

  const supabase = await createClient();

  if (parsed.data.activar) {
    const { error } = await supabase
      .from("curso_profesor")
      .insert({ curso_id: parsed.data.cursoId, profesor_id: parsed.data.profesorId });

    // 23505 = unique_violation. Si ya existe, lo tomamos como exito (idempotencia).
    if (error && error.code !== "23505") {
      return { ok: false, message: mapAdminWriteErrorMessage(error.code, error.message) };
    }
  } else {
    const { error } = await supabase
      .from("curso_profesor")
      .delete()
      .eq("curso_id", parsed.data.cursoId)
      .eq("profesor_id", parsed.data.profesorId);

    if (error) {
      return { ok: false, message: mapAdminWriteErrorMessage(error.code, error.message) };
    }
  }

  revalidatePath("/admin/asignaciones");
  revalidatePath("/admin/cursos");
  return { ok: true };
}
