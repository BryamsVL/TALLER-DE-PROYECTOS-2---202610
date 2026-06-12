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

export type MatricularResult =
  | { ok: true; count: number }
  | { ok: false; message: string };

export async function matricularCarrito(
  nrcs: string[],
): Promise<MatricularResult> {
  if (!nrcs || nrcs.length === 0)
    return { ok: false, message: "No hay NRCs en el carrito." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Sesion expirada." };

  // --- 1. Traer sesiones de los NRCs solicitados ---
  const { data: sesionesNuevos, error: errSesiones } = await supabase
    .from("sesion_nrc")
    .select("nrc, dia, bloque_id")
    .in("nrc", nrcs);

  if (errSesiones)
    return { ok: false, message: "Error al verificar sesiones." };

  // --- 2. Verificar cruce contra inscripciones activas existentes ---
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

    const ocupados = new Set(
      (misSesiones ?? []).map((s) => `${s.dia}|${s.bloque_id}`),
    );

    const choque = (sesionesNuevos ?? []).find((s) =>
      ocupados.has(`${s.dia}|${s.bloque_id}`),
    );

    if (choque) {
      return {
        ok: false,
        message: `Cruce de horario detectado en el NRC ${choque.nrc}. Revisa tu seleccion.`,
      };
    }
  }

  // --- 3. Verificar cruce entre los propios NRCs del carrito ---
  const slotMap = new Map<string, string>();
  for (const s of sesionesNuevos ?? []) {
    const key = `${s.dia}|${s.bloque_id}`;
    if (slotMap.has(key)) {
      return {
        ok: false,
        message: `Cruce interno: NRC ${s.nrc} y NRC ${slotMap.get(key)} coinciden en horario.`,
      };
    }
    slotMap.set(key, s.nrc);
  }

  // --- 4. Verificar cupo de cada NRC ---
  const { data: nrcInfos } = await supabase
    .from("nrc")
    .select("nrc, cupo_max")
    .in("nrc", nrcs);

  for (const nrcInfo of nrcInfos ?? []) {
    const { data: count } = await supabase.rpc("inscripcion_activas_count", {
      p_nrc: nrcInfo.nrc,
    });
    if ((count ?? 0) >= nrcInfo.cupo_max) {
      return {
        ok: false,
        message: `El NRC ${nrcInfo.nrc} ya alcanzo su cupo maximo.`,
      };
    }
  }

  // --- 5. Insertar todas las inscripciones ---
  const rows = nrcs.map((nrc) => ({
    estudiante_id: user.id,
    nrc,
    estado: "ACTIVA",
  }));

  const { error: errInsert } = await supabase.from("inscripcion").insert(rows);

  if (errInsert) {
    if (errInsert.code === "23505") {
      return { ok: false, message: "Ya estabas inscrito en alguno de esos NRCs." };
    }
    return {
      ok: false,
      message: mapAdminWriteErrorMessage(errInsert.code, errInsert.message),
    };
  }

  revalidatePath("/estudiante/inscripciones");
  revalidatePath("/estudiante/horario");
  return { ok: true, count: nrcs.length };
}

