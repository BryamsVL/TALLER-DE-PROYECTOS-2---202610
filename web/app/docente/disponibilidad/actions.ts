"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { mapAdminWriteErrorMessage } from "@/app/admin/action-errors";

const SetDisponibilidadSchema = z.object({
  dia: z.enum(["LUN", "MAR", "MIE", "JUE", "VIE", "SAB"]),
  turno: z.enum(["MANANA", "TARDE", "NOCHE"]),
  activar: z.union([z.literal("true"), z.literal("false")]).transform((v) => v === "true"),
});

export type DisponibilidadResult = { ok: true } | { ok: false; message: string };

// Idempotente: el docente actual marca/desmarca un (dia, turno) en el que puede dictar.
// La RLS `disp_write` (schema.sql:381-383) deja al docente escribir su propia fila.
export async function setDisponibilidad(formData: FormData): Promise<DisponibilidadResult> {
  const parsed = SetDisponibilidadSchema.safeParse({
    dia: formData.get("dia"),
    turno: formData.get("turno"),
    activar: formData.get("activar"),
  });

  if (!parsed.success) {
    return { ok: false, message: "Datos invalidos." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Sesion expirada." };
  }

  if (parsed.data.activar) {
    const { error } = await supabase.from("disponibilidad_profesor").insert({
      profesor_id: user.id,
      dia: parsed.data.dia,
      turno: parsed.data.turno,
    });

    // 23505 = unique_violation. Si ya existia, lo tomamos como exito (idempotencia).
    if (error && error.code !== "23505") {
      return { ok: false, message: mapAdminWriteErrorMessage(error.code, error.message) };
    }
  } else {
    const { error } = await supabase
      .from("disponibilidad_profesor")
      .delete()
      .eq("profesor_id", user.id)
      .eq("dia", parsed.data.dia)
      .eq("turno", parsed.data.turno);

    if (error) {
      return { ok: false, message: mapAdminWriteErrorMessage(error.code, error.message) };
    }
  }

  revalidatePath("/docente/disponibilidad");
  return { ok: true };
}
