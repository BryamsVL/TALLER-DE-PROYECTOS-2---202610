"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { mapAdminWriteErrorMessage } from "../action-errors";

const AsignacionSchema = z.object({
  cursoId: z.coerce.number().int().positive({ error: "Selecciona un curso valido." }),
  profesorId: z.uuid({ error: "Selecciona un profesor valido." }),
});

export type AsignacionFormState =
  | {
      errors?: {
        cursoId?: string[];
        profesorId?: string[];
      };
      message?: string;
    }
  | undefined;

export async function crearAsignacion(
  _prev: AsignacionFormState,
  formData: FormData,
): Promise<AsignacionFormState> {
  const parsed = AsignacionSchema.safeParse({
    cursoId: formData.get("cursoId"),
    profesorId: formData.get("profesorId"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("curso_profesor").insert({
    curso_id: parsed.data.cursoId,
    profesor_id: parsed.data.profesorId,
  });

  if (error) {
    if (error.code === "23505") {
      return {
        message: "Esa relacion curso-profesor ya existe.",
      };
    }
    return { message: mapAdminWriteErrorMessage(error.code, error.message) };
  }

  revalidatePath("/admin/asignaciones");
  return { message: "ok" };
}

export async function eliminarAsignacion(formData: FormData): Promise<void> {
  const cursoId = Number(formData.get("cursoId"));
  const profesorId = String(formData.get("profesorId") ?? "");

  if (!Number.isInteger(cursoId) || cursoId <= 0 || !profesorId) return;

  const supabase = await createClient();
  await supabase
    .from("curso_profesor")
    .delete()
    .eq("curso_id", cursoId)
    .eq("profesor_id", profesorId);
  revalidatePath("/admin/asignaciones");
}
