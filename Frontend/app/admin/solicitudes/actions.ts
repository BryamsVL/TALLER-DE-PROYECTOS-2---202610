"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapAdminWriteErrorMessage } from "../action-errors";

const ProcesarSchema = z.object({ id: z.coerce.number().int().positive() });

export type ProcesarResult = { ok: true } | { ok: false; message: string };

async function assertAdminCaller(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: perfil } = await supabase
    .from("perfil")
    .select("rol")
    .eq("id", user.id)
    .single();
  return perfil?.rol === "ADMIN" || perfil?.rol === "COORDINADOR";
}

// Aprueba la solicitud y hace el swap de inscripcion en una sola pasada.
// Si el cupo del NRC nuevo esta lleno o falla algo, deja el estado en PENDIENTE.
export async function aprobarSolicitud(formData: FormData): Promise<ProcesarResult> {
  const parsed = ProcesarSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) return { ok: false, message: "Solicitud invalida." };
  if (!(await assertAdminCaller())) {
    return { ok: false, message: mapAdminWriteErrorMessage("42501") };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Configuracion invalida." };
  }

  const { data: solicitud } = await admin
    .from("solicitud_cambio")
    .select("id, estudiante_id, nrc_actual, nrc_nuevo, estado")
    .eq("id", parsed.data.id)
    .maybeSingle();

  if (!solicitud) return { ok: false, message: "Solicitud no encontrada." };
  if (solicitud.estado !== "PENDIENTE") {
    return { ok: false, message: "La solicitud ya fue procesada." };
  }

  // Verificar cupo del NRC nuevo.
  const { data: nrcNuevo } = await admin
    .from("nrc")
    .select("cupo_max")
    .eq("nrc", solicitud.nrc_nuevo)
    .maybeSingle();
  if (!nrcNuevo) return { ok: false, message: "El NRC nuevo ya no existe." };

  const { count: actuales } = await admin
    .from("inscripcion")
    .select("*", { count: "exact", head: true })
    .eq("nrc", solicitud.nrc_nuevo)
    .eq("estado", "ACTIVA");

  if ((actuales ?? 0) >= nrcNuevo.cupo_max) {
    return { ok: false, message: "El NRC nuevo ya esta lleno." };
  }

  // Retirar inscripcion vieja.
  const { error: e1 } = await admin
    .from("inscripcion")
    .update({ estado: "RETIRADA" })
    .eq("estudiante_id", solicitud.estudiante_id)
    .eq("nrc", solicitud.nrc_actual)
    .eq("estado", "ACTIVA");
  if (e1) return { ok: false, message: e1.message };

  // Crear inscripcion nueva.
  const { error: e2 } = await admin.from("inscripcion").insert({
    estudiante_id: solicitud.estudiante_id,
    nrc: solicitud.nrc_nuevo,
    estado: "ACTIVA",
  });
  if (e2 && e2.code !== "23505") {
    // Rollback parcial: re-activar la vieja.
    await admin
      .from("inscripcion")
      .update({ estado: "ACTIVA" })
      .eq("estudiante_id", solicitud.estudiante_id)
      .eq("nrc", solicitud.nrc_actual);
    return { ok: false, message: e2.message };
  }

  // Marcar aprobada.
  const { error: e3 } = await admin
    .from("solicitud_cambio")
    .update({ estado: "APROBADA" })
    .eq("id", solicitud.id);
  if (e3) return { ok: false, message: e3.message };

  revalidatePath("/admin/solicitudes");
  revalidatePath("/estudiante/solicitudes");
  revalidatePath("/estudiante/inscripciones");
  return { ok: true };
}

export async function rechazarSolicitud(formData: FormData): Promise<ProcesarResult> {
  const parsed = ProcesarSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) return { ok: false, message: "Solicitud invalida." };
  if (!(await assertAdminCaller())) {
    return { ok: false, message: mapAdminWriteErrorMessage("42501") };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("solicitud_cambio")
    .update({ estado: "RECHAZADA" })
    .eq("id", parsed.data.id)
    .eq("estado", "PENDIENTE");

  if (error) {
    return { ok: false, message: mapAdminWriteErrorMessage(error.code, error.message) };
  }

  revalidatePath("/admin/solicitudes");
  revalidatePath("/estudiante/solicitudes");
  return { ok: true };
}
