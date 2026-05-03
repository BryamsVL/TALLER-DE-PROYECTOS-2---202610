"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapAdminWriteErrorMessage } from "../action-errors";

const ProfesorSchema = z.object({
  nombre: z
    .string()
    .min(2, { error: "El nombre debe tener al menos 2 caracteres." })
    .max(100, { error: "El nombre es muy largo." })
    .trim(),
  email: z.email({ error: "Correo invalido." }).trim().toLowerCase(),
  password: z
    .string()
    .min(8, { error: "Minimo 8 caracteres." })
    .regex(/[a-zA-Z]/, { error: "Debe contener al menos una letra." })
    .regex(/[0-9]/, { error: "Debe contener al menos un numero." })
    .trim(),
  tipo: z.enum(["TIEMPO_COMPLETO", "MEDIO_TIEMPO"], {
    error: "Selecciona un tipo de contrato valido.",
  }),
});

export type ProfesorFormState =
  | {
      errors?: {
        nombre?: string[];
        email?: string[];
        password?: string[];
        tipo?: string[];
      };
      message?: string;
    }
  | undefined;

async function assertAdminCaller() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return false;

  const { data: perfil } = await supabase
    .from("perfil")
    .select("rol")
    .eq("id", userData.user.id)
    .single();

  return perfil?.rol === "ADMIN" || perfil?.rol === "COORDINADOR";
}

export async function crearProfesor(
  _prev: ProfesorFormState,
  formData: FormData,
): Promise<ProfesorFormState> {
  const parsed = ProfesorSchema.safeParse({
    nombre: formData.get("nombre"),
    email: formData.get("email"),
    password: formData.get("password"),
    tipo: formData.get("tipo"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  if (!(await assertAdminCaller())) {
    return { message: mapAdminWriteErrorMessage("42501") };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    return { message: err instanceof Error ? err.message : "Configuracion invalida." };
  }

  const { data: created, error: authError } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: { nombre: parsed.data.nombre },
  });

  if (authError || !created.user) {
    const msg = authError?.message ?? "";
    if (/registered|exists|duplicate/i.test(msg)) {
      return { errors: { email: ["Ya existe un usuario con ese correo."] } };
    }
    return { message: msg || "No se pudo crear el usuario." };
  }

  const userId = created.user.id;

  // El trigger on_auth_user_created creo `perfil` con rol ESTUDIANTE; lo promovemos.
  const { error: perfilError } = await admin
    .from("perfil")
    .update({ nombre: parsed.data.nombre, rol: "DOCENTE", activo: true })
    .eq("id", userId);

  if (perfilError) {
    await admin.auth.admin.deleteUser(userId);
    return { message: mapAdminWriteErrorMessage(perfilError.code, perfilError.message) };
  }

  const { error: profesorError } = await admin
    .from("profesor")
    .insert({ id: userId, tipo: parsed.data.tipo });

  if (profesorError) {
    await admin.auth.admin.deleteUser(userId);
    return { message: mapAdminWriteErrorMessage(profesorError.code, profesorError.message) };
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

  if (!(await assertAdminCaller())) return;

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return;
  }

  // ON DELETE CASCADE en perfil/profesor limpia todo al borrar el auth.user.
  await admin.auth.admin.deleteUser(id);
  revalidatePath("/admin/profesores");
}
