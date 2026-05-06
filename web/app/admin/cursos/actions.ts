"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const CursoSchema = z.object({
  cycle: z.coerce
    .number()
    .int({ error: "El ciclo debe ser un entero." })
    .min(1, { error: "El ciclo minimo es 1." })
    .max(10, { error: "El ciclo maximo es 10." }),
  credits: z.coerce
    .number()
    .int({ error: "Los créditos deben ser un entero." })
    .min(1, { error: "Mínimo 1 crédito." }),
  code: z
    .string()
    .min(2, { error: "Minimo 2 caracteres." })
    .max(15, { error: "Maximo 15 caracteres." })
    .trim(),
  name: z
    .string()
    .min(2, { error: "Minimo 2 caracteres." })
    .max(100, { error: "Maximo 100 caracteres." })
    .trim(),
  weeklyHours: z.coerce.number().positive({ error: "Debe ser mayor a 0." }),
  requiredRoomType: z.enum(["TEORIA", "LABORATORIO", "AUDITORIO"], {
    error: "Selecciona un tipo de aula valido.",
  }),
});

export type CursoFormState =
  | {
      errors?: {
        cycle?: string[];
        credits?: string[];
        code?: string[];
        name?: string[];
        weeklyHours?: string[];
        requiredRoomType?: string[];
      };
      message?: string;
    }
  | undefined;

function isMultipleOfOnePointFive(value: number) {
  return Number.isInteger((value * 10) / 15);
}

export async function crearCurso(
  _prev: CursoFormState,
  formData: FormData,
): Promise<CursoFormState> {
  const parsed = CursoSchema.safeParse({
    cycle: formData.get("cycle"),
    credits: formData.get("credits"),
    code: formData.get("code"),
    name: formData.get("name"),
    weeklyHours: formData.get("weeklyHours"),
    requiredRoomType: formData.get("requiredRoomType"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  if (!isMultipleOfOnePointFive(parsed.data.weeklyHours)) {
    return {
      errors: {
        weeklyHours: ["Las horas semanales deben ser multiplo de 1.5."],
      },
    };
  }

  try {
    await prisma.course.create({
      data: {
        cycle: parsed.data.cycle,
        credits: parsed.data.credits,
        code: parsed.data.code,
        name: parsed.data.name,
        weeklyHours: parsed.data.weeklyHours,
        requiredRoomType: parsed.data.requiredRoomType,
      },
    });
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return { errors: { code: ["Ya existe un curso con ese codigo."] } };
      }
    }
    return { message: "Error interno al crear el curso." };
  }

  revalidatePath("/admin/cursos");
  return { message: "ok" };
}

export async function toggleActivoCurso(formData: FormData): Promise<void> {
  const id = formData.get("id") as string;
  const activo = formData.get("activo") === "true";

  if (!id) return;

  await prisma.course.update({
    where: { id },
    data: { isActive: !activo },
  });
  revalidatePath("/admin/cursos");
}

export async function eliminarCurso(formData: FormData): Promise<void> {
  const id = formData.get("id") as string;

  if (!id) return;

  await prisma.course.delete({ where: { id } });
  revalidatePath("/admin/cursos");
}
