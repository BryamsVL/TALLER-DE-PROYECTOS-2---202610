"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { mapAdminWriteErrorMessage } from "../action-errors";

const CursoSchema = z.object({
  carreraId: z.coerce.number().int().positive({ error: "Selecciona una carrera valida." }),
  nivel: z.coerce
    .number()
    .int({ error: "El nivel debe ser un entero." })
    .min(1, { error: "El nivel minimo es 1." })
    .max(10, { error: "El nivel maximo es 10." }),
  codigo: z
    .string()
    .min(2, { error: "Minimo 2 caracteres." })
    .max(15, { error: "Maximo 15 caracteres." })
    .trim(),
  nombre: z
    .string()
    .min(2, { error: "Minimo 2 caracteres." })
    .max(100, { error: "Maximo 100 caracteres." })
    .trim(),
  horasSemanales: z.coerce.number().positive({ error: "Debe ser mayor a 0." }),
  tipoAula: z.enum(["TEORIA", "LABORATORIO", "AUDITORIO"], {
    error: "Selecciona un tipo de aula valido.",
  }),
});

export type CursoFormState =
  | {
      errors?: {
        carreraId?: string[];
        nivel?: string[];
        codigo?: string[];
        nombre?: string[];
        horasSemanales?: string[];
        tipoAula?: string[];
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
    carreraId: formData.get("carreraId"),
    nivel: formData.get("nivel"),
    codigo: formData.get("codigo"),
    nombre: formData.get("nombre"),
    horasSemanales: formData.get("horasSemanales"),
    tipoAula: formData.get("tipoAula"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  if (!isMultipleOfOnePointFive(parsed.data.horasSemanales)) {
    return {
      errors: {
        horasSemanales: ["Las horas semanales deben ser multiplo de 1.5."],
      },
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("curso").insert({
    carrera_id: parsed.data.carreraId,
    nivel: parsed.data.nivel,
    codigo: parsed.data.codigo,
    nombre: parsed.data.nombre,
    horas_semanales: parsed.data.horasSemanales,
    tipo_aula: parsed.data.tipoAula,
  });

  if (error) {
    if (error.code === "23505") {
      return { errors: { codigo: ["Ya existe un curso con ese codigo."] } };
    }
    return { message: mapAdminWriteErrorMessage(error.code, error.message) };
  }

  revalidatePath("/admin/cursos");
  return { message: "ok" };
}

export async function toggleActivoCurso(formData: FormData): Promise<void> {
  const id = Number(formData.get("id"));
  const activo = formData.get("activo") === "true";

  if (!Number.isInteger(id) || id <= 0) return;

  const supabase = await createClient();
  await supabase.from("curso").update({ activo: !activo }).eq("id", id);
  revalidatePath("/admin/cursos");
}

export async function eliminarCurso(formData: FormData): Promise<void> {
  const id = Number(formData.get("id"));

  if (!Number.isInteger(id) || id <= 0) return;

  const supabase = await createClient();
  await supabase.from("curso").delete().eq("id", id);
  revalidatePath("/admin/cursos");
}

// ============================================================================
// Acciones de NRC (instancias del curso, una por seccion/horario)
// ============================================================================

export type NrcActionResult = { ok: true } | { ok: false; message: string };

const NrcCrearSchema = z.object({
  cursoId: z.coerce.number().int().positive(),
});

const NrcEliminarSchema = z.object({
  nrc: z.string().regex(/^[0-9]{5}$/),
});

const NrcAsignarSchema = z.object({
  nrc: z.string().regex(/^[0-9]{5}$/),
  // Cadena vacia => desasignar (profesor_id = null).
  profesorId: z.union([z.uuid(), z.literal("")]).optional(),
});

// Genera el codigo NRC: [nivel%10][cursoId padded:2][instancia padded:2].
// Ej. nivel=3, cursoId=5, instancia=1 -> "30501".
function buildNrcCode(nivel: number, cursoId: number, instancia: number): string {
  const d1 = String(nivel % 10);
  const d2 = String(cursoId).padStart(2, "0");
  const d3 = String(instancia).padStart(2, "0");
  return `${d1}${d2}${d3}`;
}

export async function crearNrc(formData: FormData): Promise<NrcActionResult> {
  const parsed = NrcCrearSchema.safeParse({ cursoId: formData.get("cursoId") });
  if (!parsed.success) {
    return { ok: false, message: "Curso invalido." };
  }

  const supabase = await createClient();

  // 1. Curso (necesitamos carrera_id y nivel para la cohorte y el codigo).
  const { data: curso, error: cursoError } = await supabase
    .from("curso")
    .select("id, carrera_id, nivel")
    .eq("id", parsed.data.cursoId)
    .single();

  if (cursoError || !curso) {
    return { ok: false, message: "No se encontro el curso." };
  }

  if (curso.id > 99) {
    return {
      ok: false,
      message: "El id del curso supera 99 y no cabe en el formato del NRC (prototipo).",
    };
  }

  // 2. Ciclo activo (asumimos uno solo). Si hay varios, tomamos el mas reciente.
  const { data: ciclo, error: cicloError } = await supabase
    .from("ciclo")
    .select("id")
    .eq("activo", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (cicloError) {
    return { ok: false, message: mapAdminWriteErrorMessage(cicloError.code, cicloError.message) };
  }
  if (!ciclo) {
    return { ok: false, message: "No hay un ciclo academico activo. Activa uno primero." };
  }

  // 3. Cohorte default (carrera, ciclo, nivel, seccion='A'). Get-or-create.
  const seccion = "A";
  const { data: cohorteExistente } = await supabase
    .from("cohorte")
    .select("id")
    .eq("carrera_id", curso.carrera_id)
    .eq("ciclo_id", ciclo.id)
    .eq("nivel", curso.nivel)
    .eq("seccion", seccion)
    .maybeSingle();

  let cohorteId: number;
  if (cohorteExistente) {
    cohorteId = cohorteExistente.id;
  } else {
    const { data: cohorteNueva, error: cohorteError } = await supabase
      .from("cohorte")
      .insert({
        carrera_id: curso.carrera_id,
        ciclo_id: ciclo.id,
        nivel: curso.nivel,
        seccion,
      })
      .select("id")
      .single();

    if (cohorteError || !cohorteNueva) {
      return {
        ok: false,
        message: mapAdminWriteErrorMessage(cohorteError?.code, cohorteError?.message),
      };
    }
    cohorteId = cohorteNueva.id;
  }

  // 4. Calcular siguiente instancia: max(ultimos 2 digitos de NRCs del curso) + 1.
  const { data: nrcsExistentes, error: nrcsError } = await supabase
    .from("nrc")
    .select("nrc")
    .eq("curso_id", curso.id);

  if (nrcsError) {
    return { ok: false, message: mapAdminWriteErrorMessage(nrcsError.code, nrcsError.message) };
  }

  const instancias = (nrcsExistentes ?? [])
    .map((r) => Number.parseInt(r.nrc.slice(3, 5), 10))
    .filter((n) => Number.isInteger(n));
  const siguienteInstancia = instancias.length === 0 ? 1 : Math.max(...instancias) + 1;

  if (siguienteInstancia > 99) {
    return { ok: false, message: "Limite de 99 instancias por curso alcanzado." };
  }

  const nrcCode = buildNrcCode(curso.nivel, curso.id, siguienteInstancia);

  // 5. INSERT.
  const { error: insertError } = await supabase.from("nrc").insert({
    nrc: nrcCode,
    curso_id: curso.id,
    profesor_id: null,
    ciclo_id: ciclo.id,
    cohorte_id: cohorteId,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      return { ok: false, message: `El NRC ${nrcCode} ya existe.` };
    }
    return {
      ok: false,
      message: mapAdminWriteErrorMessage(insertError.code, insertError.message),
    };
  }

  revalidatePath("/admin/cursos");
  return { ok: true };
}

export async function eliminarNrc(formData: FormData): Promise<NrcActionResult> {
  const parsed = NrcEliminarSchema.safeParse({ nrc: formData.get("nrc") });
  if (!parsed.success) return { ok: false, message: "NRC invalido." };

  const supabase = await createClient();
  const { error } = await supabase.from("nrc").delete().eq("nrc", parsed.data.nrc);

  if (error) {
    return { ok: false, message: mapAdminWriteErrorMessage(error.code, error.message) };
  }

  revalidatePath("/admin/cursos");
  return { ok: true };
}

export async function asignarProfesorANrc(formData: FormData): Promise<NrcActionResult> {
  const parsed = NrcAsignarSchema.safeParse({
    nrc: formData.get("nrc"),
    profesorId: formData.get("profesorId") ?? "",
  });
  if (!parsed.success) return { ok: false, message: "Datos invalidos." };

  const supabase = await createClient();
  const profesorId = parsed.data.profesorId === "" ? null : parsed.data.profesorId ?? null;

  const { error } = await supabase
    .from("nrc")
    .update({ profesor_id: profesorId })
    .eq("nrc", parsed.data.nrc);

  if (error) {
    return { ok: false, message: mapAdminWriteErrorMessage(error.code, error.message) };
  }

  revalidatePath("/admin/cursos");
  return { ok: true };
}
