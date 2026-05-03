"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { mapAdminWriteErrorMessage } from "../action-errors";

const CursoSchema = z.object({
  carreraId: z.coerce.number().int().positive({ error: "Selecciona una carrera valida." }),
  nivel: z.coerce
    .number()
    .int({ error: "El nivel debe ser un entero." })
    .min(1, { error: "El nivel minimo es 1." })
    .max(10, { error: "El nivel maximo es 10." }),
  codigo: z
    .string()
    .min(2, { error: "Minimo 2 caracteres." })
    .max(15, { error: "Maximo 15 caracteres." })
    .trim(),
  nombre: z
    .string()
    .min(2, { error: "Minimo 2 caracteres." })
    .max(100, { error: "Maximo 100 caracteres." })
    .trim(),
  horasSemanales: z.coerce.number().positive({ error: "Debe ser mayor a 0." }),
  tipoAula: z.enum(["TEORIA", "LABORATORIO", "AUDITORIO"], {
    error: "Selecciona un tipo de aula valido.",
  }),
});

export type CursoFormState =
  | {
      errors?: {
        carreraId?: string[];
        nivel?: string[];
        codigo?: string[];
        nombre?: string[];
        horasSemanales?: string[];
        tipoAula?: string[];
      };
      message?: string;
    }
  | undefined;

function isMultipleOfOnePointFive(value: number) {
  return Number.isInteger((value * 10) / 15);
}

export async function crearCurso(
  _prev: CursoFormState,
  formData: FormData,
): Promise<CursoFormState> {
  const parsed = CursoSchema.safeParse({
    carreraId: formData.get("carreraId"),
    nivel: formData.get("nivel"),
    codigo: formData.get("codigo"),
    nombre: formData.get("nombre"),
    horasSemanales: formData.get("horasSemanales"),
    tipoAula: formData.get("tipoAula"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  if (!isMultipleOfOnePointFive(parsed.data.horasSemanales)) {
    return {
      errors: {
        horasSemanales: ["Las horas semanales deben ser multiplo de 1.5."],
      },
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("curso").insert({
    carrera_id: parsed.data.carreraId,
    nivel: parsed.data.nivel,
    codigo: parsed.data.codigo,
    nombre: parsed.data.nombre,
    horas_semanales: parsed.data.horasSemanales,
    tipo_aula: parsed.data.tipoAula,
  });

  if (error) {
    if (error.code === "23505") {
      return { errors: { codigo: ["Ya existe un curso con ese codigo."] } };
    }
    return { message: mapAdminWriteErrorMessage(error.code, error.message) };
  }

  revalidatePath("/admin/cursos");
  return { message: "ok" };
}

export async function toggleActivoCurso(formData: FormData): Promise<void> {
  const id = Number(formData.get("id"));
  const activo = formData.get("activo") === "true";

  if (!Number.isInteger(id) || id <= 0) return;

  const supabase = await createClient();
  await supabase.from("curso").update({ activo: !activo }).eq("id", id);
  revalidatePath("/admin/cursos");
}

export async function eliminarCurso(formData: FormData): Promise<void> {
  const id = Number(formData.get("id"));

  if (!Number.isInteger(id) || id <= 0) return;

  const supabase = await createClient();
  await supabase.from("curso").delete().eq("id", id);
  revalidatePath("/admin/cursos");
}
