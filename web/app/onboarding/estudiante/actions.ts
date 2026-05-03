"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { mapAdminWriteErrorMessage } from "@/app/admin/action-errors";

const Schema = z.object({
  carreraId: z.coerce.number().int().positive(),
});

export type OnboardingResult = { ok: true } | { ok: false; message: string };

export async function seleccionarCarrera(
  _prev: OnboardingResult | undefined,
  formData: FormData,
): Promise<OnboardingResult | undefined> {
  const parsed = Schema.safeParse({ carreraId: formData.get("carreraId") });
  if (!parsed.success) {
    return { ok: false, message: "Selecciona una carrera valida." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Sesion expirada." };

  const { error } = await supabase
    .from("estudiante")
    .upsert({ id: user.id, carrera_id: parsed.data.carreraId });

  if (error) {
    return { ok: false, message: mapAdminWriteErrorMessage(error.code, error.message) };
  }

  revalidatePath("/estudiante", "layout");
  redirect("/estudiante");
}
