"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

const SetDisponibilidadSchema = z.object({
  dia: z.enum(["LUN", "MAR", "MIE", "JUE", "VIE", "SAB"]),
  turno: z.enum(["MANANA", "TARDE", "NOCHE"]),
  activar: z.union([z.literal("true"), z.literal("false")]).transform((v) => v === "true"),
});

export type DisponibilidadResult = { ok: true } | { ok: false; message: string };

// Dia -> DayOfWeek (Prisma). Turno -> bloques (slotOrder), mismo criterio
// que el dialog del modulo admin (Manana B1-B4, Tarde B5-B7, Noche B8-B9).
const DIA_A_DOW: Record<string, string> = {
  LUN: "MONDAY",
  MAR: "TUESDAY",
  MIE: "WEDNESDAY",
  JUE: "THURSDAY",
  VIE: "FRIDAY",
  SAB: "SATURDAY",
};
const TURNO_A_ORDENES: Record<string, number[]> = {
  MANANA: [1, 2, 3, 4],
  TARDE: [5, 6, 7],
  NOCHE: [8, 9],
};

// Fuente unica de verdad: TeacherAvailability (Prisma). Lo escribe tambien el
// dialog admin (editarProfesor) y lo lee el solver. Asi el horario preferente
// queda sincronizado entre la vista docente y la vista admin.
export async function setDisponibilidad(formData: FormData): Promise<DisponibilidadResult> {
  const parsed = SetDisponibilidadSchema.safeParse({
    dia: formData.get("dia"),
    turno: formData.get("turno"),
    activar: formData.get("activar"),
  });

  if (!parsed.success) {
    return { ok: false, message: "Datos invalidos." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Sesion expirada." };
  }

  const teacher = await prisma.teacher.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!teacher) {
    return { ok: false, message: "Tu usuario no esta vinculado a un perfil de docente." };
  }

  const dayOfWeek = DIA_A_DOW[parsed.data.dia];
  const ordenes = TURNO_A_ORDENES[parsed.data.turno];

  try {
    const timeSlots = await prisma.timeSlot.findMany({
      where: { dayOfWeek: dayOfWeek as any, slotOrder: { in: ordenes } },
      select: { id: true },
    });

    if (timeSlots.length === 0) {
      return { ok: false, message: "No hay bloques horarios configurados para ese turno." };
    }

    if (parsed.data.activar) {
      await prisma.$transaction(
        timeSlots.map((ts) =>
          prisma.teacherAvailability.upsert({
            where: {
              teacherId_timeSlotId: { teacherId: teacher.id, timeSlotId: ts.id },
            },
            create: { teacherId: teacher.id, timeSlotId: ts.id, isAvailable: true },
            update: { isAvailable: true },
          }),
        ),
      );
    } else {
      await prisma.teacherAvailability.deleteMany({
        where: {
          teacherId: teacher.id,
          timeSlotId: { in: timeSlots.map((ts) => ts.id) },
        },
      });
    }
  } catch (err: any) {
    return { ok: false, message: err?.message ?? "No se pudo guardar la disponibilidad." };
  }

  revalidatePath("/docente/disponibilidad");
  revalidatePath("/admin/profesores");
  return { ok: true };
}

const MasivoSchema = z.object({
  turno: z.enum(["MANANA", "TARDE", "NOCHE", "ALL"]),
  activar: z.union([z.literal("true"), z.literal("false")]).transform((v) => v === "true"),
});

// Atajo: aplica un turno completo (o todos los turnos) a los 6 dias de golpe.
export async function setDisponibilidadMasivo(
  formData: FormData,
): Promise<DisponibilidadResult> {
  const parsed = MasivoSchema.safeParse({
    turno: formData.get("turno"),
    activar: formData.get("activar"),
  });

  if (!parsed.success) {
    return { ok: false, message: "Datos invalidos." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Sesion expirada." };
  }

  const teacher = await prisma.teacher.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!teacher) {
    return { ok: false, message: "Tu usuario no esta vinculado a un perfil de docente." };
  }

  const ordenes =
    parsed.data.turno === "ALL"
      ? [1, 2, 3, 4, 5, 6, 7, 8, 9]
      : TURNO_A_ORDENES[parsed.data.turno];

  try {
    const timeSlots = await prisma.timeSlot.findMany({
      where: {
        dayOfWeek: { in: Object.values(DIA_A_DOW) as any },
        slotOrder: { in: ordenes },
      },
      select: { id: true },
    });

    if (timeSlots.length === 0) {
      return { ok: false, message: "No hay bloques horarios configurados." };
    }

    if (parsed.data.activar) {
      await prisma.$transaction(
        timeSlots.map((ts) =>
          prisma.teacherAvailability.upsert({
            where: {
              teacherId_timeSlotId: { teacherId: teacher.id, timeSlotId: ts.id },
            },
            create: { teacherId: teacher.id, timeSlotId: ts.id, isAvailable: true },
            update: { isAvailable: true },
          }),
        ),
      );
    } else {
      await prisma.teacherAvailability.deleteMany({
        where: {
          teacherId: teacher.id,
          timeSlotId: { in: timeSlots.map((ts) => ts.id) },
        },
      });
    }
  } catch (err: any) {
    return { ok: false, message: err?.message ?? "No se pudo guardar la disponibilidad." };
  }

  revalidatePath("/docente/disponibilidad");
  revalidatePath("/admin/profesores");
  return { ok: true };
}
