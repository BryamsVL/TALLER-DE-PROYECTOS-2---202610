"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { mapAdminWriteErrorMessage } from "@/app/admin/action-errors";

const CrearSchema = z.object({
  nrcActual: z.string().regex(/^[0-9]{5}$/),
  nrcNuevo: z.string().regex(/^[0-9]{5}$/),
  motivo: z.string().max(500).optional(),
});

const CancelarSchema = z.object({ id: z.coerce.number().int().positive() });

export type SolicitudResult = { ok: true } | { ok: false; message: string };

export async function crearSolicitud(formData: FormData): Promise<SolicitudResult> {
  const parsed = CrearSchema.safeParse({
    nrcActual: formData.get("nrcActual"),
    nrcNuevo: formData.get("nrcNuevo"),
    motivo: formData.get("motivo")?.toString() || undefined,
  });
  if (!parsed.success) return { ok: false, message: "Datos invalidos." };
  if (parsed.data.nrcActual === parsed.data.nrcNuevo) {
    return { ok: false, message: "El NRC nuevo debe ser distinto al actual." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Sesion expirada." };

  const { error } = await supabase.from("solicitud_cambio").insert({
    estudiante_id: user.id,
    nrc_actual: parsed.data.nrcActual,
    nrc_nuevo: parsed.data.nrcNuevo,
    motivo: parsed.data.motivo,
    estado: "PENDIENTE",
  });

  if (error) {
    return { ok: false, message: mapAdminWriteErrorMessage(error.code, error.message) };
  }

  revalidatePath("/estudiante/solicitudes");
  revalidatePath("/admin/solicitudes");
  return { ok: true };
}

export async function cancelarSolicitud(formData: FormData): Promise<SolicitudResult> {
  const parsed = CancelarSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) return { ok: false, message: "Solicitud invalida." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Sesion expirada." };

  const { error } = await supabase
    .from("solicitud_cambio")
    .delete()
    .eq("id", parsed.data.id)
    .eq("estudiante_id", user.id)
    .eq("estado", "PENDIENTE");

  if (error) {
    return { ok: false, message: mapAdminWriteErrorMessage(error.code, error.message) };
  }

  revalidatePath("/estudiante/solicitudes");
  revalidatePath("/admin/solicitudes");
  return { ok: true };
}
