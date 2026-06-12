"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { mapAdminWriteErrorMessage } from "../action-errors";

const ReglasSchema = z
  .object({
    minCreditos: z.coerce
      .number()
      .int()
      .min(1, { error: "Mínimo 1 crédito." })
      .max(30, { error: "Máximo 30 créditos." }),
    maxCreditos: z.coerce
      .number()
      .int()
      .min(1, { error: "Mínimo 1 crédito." })
      .max(30, { error: "Máximo 30 créditos." }),
  })
  .refine((d) => d.minCreditos <= d.maxCreditos, {
    error: "El mínimo no puede superar al máximo.",
    path: ["minCreditos"],
  });

export type ReglasFormState =
  | {
      errors?: { minCreditos?: string[]; maxCreditos?: string[] };
      message?: string;
    }
  | undefined;

async function assertAdminCaller() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return false;

  const user = await prisma.user.findUnique({
    where: { id: userData.user.id },
    select: { role: true },
  });

  return user?.role === "ADMIN";
}

export async function actualizarReglasCreditos(
  _prev: ReglasFormState,
  formData: FormData,
): Promise<ReglasFormState> {
  const parsed = ReglasSchema.safeParse({
    minCreditos: formData.get("minCreditos"),
    maxCreditos: formData.get("maxCreditos"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  if (!(await assertAdminCaller())) {
    return { message: mapAdminWriteErrorMessage("42501") };
  }

  const period = await prisma.academicPeriod.findFirst({
    where: { isActive: true },
    select: { id: true },
  });

  if (!period) {
    return { message: "No hay un periodo academico activo." };
  }

  try {
    await prisma.academicPeriod.update({
      where: { id: period.id },
      data: {
        minStudentCredits: parsed.data.minCreditos,
        maxStudentCredits: parsed.data.maxCreditos,
      },
    });
  } catch (err) {
    const code = (err as { code?: string }).code;
    return { message: mapAdminWriteErrorMessage(code) };
  }

  revalidatePath("/admin/reglas");
  return { message: "ok" };
}
