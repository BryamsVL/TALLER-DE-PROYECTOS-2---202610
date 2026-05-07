"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapAdminWriteErrorMessage } from "../action-errors";

const RolEnum = z.enum(["ADMIN", "COORDINADOR", "DOCENTE", "ESTUDIANTE"]);
const TipoProfesorEnum = z.enum(["TIEMPO_COMPLETO", "MEDIO_TIEMPO"]);

const ActualizarUsuarioSchema = z
  .object({
    perfilId: z.uuid(),
    nombre: z.string().min(2).max(100).trim(),
    rol: RolEnum,
    activo: z.union([z.literal("true"), z.literal("false")]).transform((v) => v === "true"),
    tipo: TipoProfesorEnum.optional(),
    carreraId: z.coerce.number().int().positive().optional(),
  })
  .refine((d) => d.rol !== "DOCENTE" || d.tipo !== undefined, {
    message: "Selecciona el tipo de docente.",
    path: ["tipo"],
  })
  .refine((d) => d.rol !== "ESTUDIANTE" || d.carreraId !== undefined, {
    message: "Selecciona la carrera del estudiante.",
    path: ["carreraId"],
  });

export type UsuarioActionResult = { ok: true } | { ok: false; message: string };

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

export async function actualizarUsuario(formData: FormData): Promise<UsuarioActionResult> {
  const parsed = ActualizarUsuarioSchema.safeParse({
    perfilId: formData.get("perfilId"),
    nombre: formData.get("nombre"),
    rol: formData.get("rol"),
    activo: formData.get("activo"),
    tipo: formData.get("tipo") || undefined,
    carreraId: formData.get("carreraId") || undefined,
  });

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, message: issue?.message ?? "Datos invalidos." };
  }

  if (!(await assertAdminCaller())) {
    return { ok: false, message: mapAdminWriteErrorMessage("42501") };
  }

  const supabase = await createClient();

  const { error: perfilError } = await supabase
    .from("perfil")
    .update({
      nombre: parsed.data.nombre,
      rol: parsed.data.rol,
      activo: parsed.data.activo,
    })
    .eq("id", parsed.data.perfilId);

  if (perfilError) {
    return { ok: false, message: mapAdminWriteErrorMessage(perfilError.code, perfilError.message) };
  }

  // Si el nuevo rol requiere fila hija, hacer upsert. La existente (de un rol previo)
  // se conserva (decision A): permite volver al rol sin perder NRCs/inscripciones.
  if (parsed.data.rol === "DOCENTE" && parsed.data.tipo) {
    const { error } = await supabase
      .from("profesor")
      .upsert({ id: parsed.data.perfilId, tipo: parsed.data.tipo });
    if (error) {
      return { ok: false, message: mapAdminWriteErrorMessage(error.code, error.message) };
    }
  } else if (parsed.data.rol === "ESTUDIANTE" && parsed.data.carreraId) {
    const { error } = await supabase
      .from("estudiante")
      .upsert({ id: parsed.data.perfilId, carrera_id: parsed.data.carreraId });
    if (error) {
      return { ok: false, message: mapAdminWriteErrorMessage(error.code, error.message) };
    }
  }

  revalidatePath("/admin/usuarios");
  revalidatePath("/admin/profesores");
  return { ok: true };
}

export async function toggleActivoUsuario(formData: FormData): Promise<UsuarioActionResult> {
  const perfilId = String(formData.get("perfilId") ?? "");
  const activo = formData.get("activo") === "true";

  if (!perfilId) return { ok: false, message: "Usuario invalido." };
  if (!(await assertAdminCaller())) {
    return { ok: false, message: mapAdminWriteErrorMessage("42501") };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("perfil")
    .update({ activo: !activo })
    .eq("id", perfilId);

  if (error) {
    return { ok: false, message: mapAdminWriteErrorMessage(error.code, error.message) };
  }

  revalidatePath("/admin/usuarios");
  revalidatePath("/admin/profesores");
  return { ok: true };
}

export async function eliminarUsuario(formData: FormData): Promise<UsuarioActionResult> {
  const perfilId = String(formData.get("perfilId") ?? "");
  if (!perfilId) return { ok: false, message: "Usuario invalido." };

  if (!(await assertAdminCaller())) {
    return { ok: false, message: mapAdminWriteErrorMessage("42501") };
  }

  // No te puedes eliminar a ti mismo.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user?.id === perfilId) {
    return { ok: false, message: "No puedes eliminar tu propio usuario." };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Configuracion invalida." };
  }

  // CASCADE: auth.users -> perfil -> profesor/estudiante -> curso_profesor/inscripcion.
  // nrc.profesor_id queda con SET NULL (migracion 001).
  const { error } = await admin.auth.admin.deleteUser(perfilId);
  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/admin/usuarios");
  revalidatePath("/admin/profesores");
  return { ok: true };
}
