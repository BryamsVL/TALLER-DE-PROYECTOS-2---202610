"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  LoginSchema,
  SignupSchema,
  type AuthFormState,
} from "@/app/lib/definitions";

export async function signIn(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { message: "Credenciales invalidas." };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signUp(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = SignupSchema.safeParse({
    nombre: formData.get("nombre"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { nombre: parsed.data.nombre },
    },
  });

  if (error) {
    return { message: error.message };
  }

  // Crear fila en `perfil` con rol por defecto ESTUDIANTE.
  // ADMIN/COORDINADOR cambian el rol manualmente en Supabase Studio.
  if (data.user) {
    const { error: perfilError } = await supabase.from("perfil").insert({
      id: data.user.id,
      nombre: parsed.data.nombre,
      rol: "ESTUDIANTE",
    });
    if (perfilError) {
      return {
        message: `Cuenta creada pero fallo perfil: ${perfilError.message}`,
      };
    }
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
