"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { mapAdminWriteErrorMessage } from "@/app/admin/action-errors";

const NrcSchema = z.object({ nrc: z.string().regex(/^[0-9]{5}$/) });

export type InscripcionResult = { ok: true } | { ok: false; message: string };

export async function inscribirseEnNrc(formData: FormData): Promise<InscripcionResult> {
  const parsed = NrcSchema.safeParse({ nrc: formData.get("nrc") });
  if (!parsed.success) return { ok: false, message: "NRC invalido." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Sesion expirada." };

  // Validar choque de horario contra inscripciones activas existentes.
  const { data: misInscripciones } = await supabase
    .from("inscripcion")
    .select("nrc")
    .eq("estudiante_id", user.id)
    .eq("estado", "ACTIVA");

  const nrcsActivos = (misInscripciones ?? []).map((i) => i.nrc);

  if (nrcsActivos.length > 0) {
    const { data: misSesiones } = await supabase
      .from("sesion_nrc")
      .select("dia, bloque_id")
      .in("nrc", nrcsActivos);

    const { data: sesionesNuevoNrc } = await supabase
      .from("sesion_nrc")
      .select("dia, bloque_id")
      .eq("nrc", parsed.data.nrc);

    const ocupados = new Set(
      (misSesiones ?? []).map((s) => `${s.dia}|${s.bloque_id}`),
    );
    const choque = (sesionesNuevoNrc ?? []).find((s) =>
      ocupados.has(`${s.dia}|${s.bloque_id}`),
    );
    if (choque) {
      return {
        ok: false,
        message: `Choque de horario en ${choque.dia} bloque ${choque.bloque_id}. Retira el NRC actual o elige otro.`,
      };
    }
  }

  // Cupo: contar inscripciones activas del NRC y comparar contra cupo_max.
  const { data: nrcInfo } = await supabase
    .from("nrc")
    .select("cupo_max")
    .eq("nrc", parsed.data.nrc)
    .maybeSingle();

  if (!nrcInfo) {
    return { ok: false, message: "NRC no encontrado." };
  }

  // RLS oculta filas de otros estudiantes, asi que un SELECT cliente cuenta
  // solo las propias. Usamos la funcion SECURITY DEFINER definida en
  // migrations/002 para obtener el conteo real saltando RLS.
  const { data: inscripcionesActivas } = await supabase.rpc(
    "inscripcion_activas_count",
    { p_nrc: parsed.data.nrc },
  );

  if ((inscripcionesActivas ?? 0) >= nrcInfo.cupo_max) {
    return { ok: false, message: "El NRC ya alcanzo su cupo maximo." };
  }

  const { error } = await supabase
    .from("inscripcion")
    .insert({ estudiante_id: user.id, nrc: parsed.data.nrc, estado: "ACTIVA" });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, message: "Ya estas inscrito en ese NRC." };
    }
    return { ok: false, message: mapAdminWriteErrorMessage(error.code, error.message) };
  }

  revalidatePath("/estudiante/inscripciones");
  revalidatePath("/estudiante/horario");
  return { ok: true };
}

export async function retirarseDeNrc(formData: FormData): Promise<InscripcionResult> {
  const parsed = NrcSchema.safeParse({ nrc: formData.get("nrc") });
  if (!parsed.success) return { ok: false, message: "NRC invalido." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Sesion expirada." };

  const { error } = await supabase
    .from("inscripcion")
    .update({ estado: "RETIRADA" })
    .eq("estudiante_id", user.id)
    .eq("nrc", parsed.data.nrc)
    .eq("estado", "ACTIVA");

  if (error) {
    return { ok: false, message: mapAdminWriteErrorMessage(error.code, error.message) };
  }

  revalidatePath("/estudiante/inscripciones");
  revalidatePath("/estudiante/horario");
  return { ok: true };
}
