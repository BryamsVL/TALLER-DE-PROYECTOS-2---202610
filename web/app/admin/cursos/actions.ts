"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { mapAdminWriteErrorMessage } from "../action-errors";
import type { Dia } from "@/lib/scheduler/types";

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

const DIAS_SET = new Set<Dia>(["LUN", "MAR", "MIE", "JUE", "VIE", "SAB"]);

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

const NrcProgramadoSchema = z.object({
  cursoId: z.coerce.number().int().positive(),
  profesorId: z.uuid(),
  seccion: z
    .string()
    .trim()
    .min(1, { error: "La seccion es obligatoria." })
    .max(5, { error: "La seccion admite hasta 5 caracteres." }),
  cupoMax: z.coerce
    .number()
    .int({ error: "El cupo debe ser entero." })
    .min(1, { error: "El cupo minimo es 1." })
    .max(30, { error: "El cupo maximo es 30." }),
  slotKeys: z.string().min(2, { error: "Selecciona al menos un bloque." }),
});

interface SlotSelection {
  dia: Dia;
  bloqueId: number;
}

// Genera el codigo NRC: [nivel:1][numeroCreacionCurso:2][instancia:2].
// Ej. nivel=3, numeroCreacion=5, instancia=1 -> "30501".
function buildNrcCode(nivel: number, numeroCreacionCurso: number, instancia: number): string {
  const d1 = String(nivel % 10);
  const d2 = String(numeroCreacionCurso).padStart(2, "0");
  const d3 = String(instancia).padStart(2, "0");
  return `${d1}${d2}${d3}`;
}

function buildNrcCodeFromCycle(prefijo: string, secuencia: number) {
  return `${prefijo}${String(secuencia).padStart(3, "0")}`;
}

function parseSlotKeys(raw: string): SlotSelection[] | null {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;

    const slots = parsed
      .map((item) => {
        if (
          typeof item === "object" &&
          item !== null &&
          typeof item.dia === "string" &&
          typeof item.bloqueId === "number"
        ) {
          return { dia: item.dia as Dia, bloqueId: item.bloqueId };
        }
        return null;
      })
      .filter((item): item is SlotSelection => item !== null);

    return slots;
  } catch {
    return null;
  }
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

  // 2. Calcular numero de creacion del curso (ordinal dentro de la carrera).
  const { data: todosCursos, error: todosCursosError } = await supabase
    .from("curso")
    .select("id")
    .eq("carrera_id", curso.carrera_id)
    .order("created_at", { ascending: true });

  if (todosCursosError) {
    return { ok: false, message: mapAdminWriteErrorMessage(todosCursosError.code, todosCursosError.message) };
  }

  const numeroCreacionCurso = ((todosCursos ?? []).findIndex((c) => c.id === curso.id) + 1) || 1;

  if (numeroCreacionCurso > 99) {
    return {
      ok: false,
      message: "La carrera supera 99 cursos y no cabe en el formato del NRC.",
    };
  }

  // 3. Ciclo activo (asumimos uno solo). Si hay varios, tomamos el mas reciente.
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

  // 4. Cohorte default (carrera, ciclo, nivel, seccion='A'). Get-or-create.
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

  // 5. Calcular siguiente instancia: max(ultimos 2 digitos de NRCs del curso) + 1.
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

  const nrcCode = buildNrcCode(curso.nivel, numeroCreacionCurso, siguienteInstancia);

  // 6. INSERT.
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
  const cursoId = Number(formData.get("cursoId"));
  if (Number.isInteger(cursoId) && cursoId > 0) {
    revalidatePath(`/admin/cursos/${cursoId}`);
  }
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

export async function crearNrcProgramado(formData: FormData): Promise<NrcActionResult> {
  const parsed = NrcProgramadoSchema.safeParse({
    cursoId: formData.get("cursoId"),
    profesorId: formData.get("profesorId"),
    seccion: formData.get("seccion"),
    cupoMax: formData.get("cupoMax"),
    slotKeys: formData.get("slotKeys"),
  });

  if (!parsed.success) {
    const firstError = Object.values(parsed.error.flatten().fieldErrors).flat()[0];
    return { ok: false, message: firstError ?? "Datos invalidos." };
  }

  const slots = parseSlotKeys(parsed.data.slotKeys);
  if (!slots || slots.length === 0) {
    return { ok: false, message: "Selecciona al menos un bloque horario." };
  }

  const slotMap = new Map<string, SlotSelection>();
  for (const slot of slots) {
    if (!DIAS_SET.has(slot.dia) || !Number.isInteger(slot.bloqueId) || slot.bloqueId <= 0) {
      return { ok: false, message: "Hay bloques horarios invalidos en la seleccion." };
    }
    slotMap.set(`${slot.dia}|${slot.bloqueId}`, slot);
  }

  const uniqueSlots = [...slotMap.values()];
  const supabase = await createClient();

  const { data: curso, error: cursoError } = await supabase
    .from("curso")
    .select("id, carrera_id, nivel, horas_semanales, tipo_aula, activo")
    .eq("id", parsed.data.cursoId)
    .single();

  if (cursoError || !curso) {
    return { ok: false, message: "No se encontro el curso." };
  }

  if (!curso.activo) {
    return { ok: false, message: "El curso esta inactivo. Activalo antes de programar NRCs." };
  }

  const requiredSessions = Number(curso.horas_semanales) / 1.5;
  if (uniqueSlots.length !== requiredSessions) {
    return {
      ok: false,
      message: `Este curso requiere ${requiredSessions} bloque(s) de 1.5 horas.`,
    };
  }

  const { data: ciclo, error: cicloError } = await supabase
    .from("ciclo")
    .select("id, prefijo_nrc")
    .eq("activo", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (cicloError) {
    return { ok: false, message: mapAdminWriteErrorMessage(cicloError.code, cicloError.message) };
  }

  if (!ciclo) {
    return { ok: false, message: "No hay un ciclo academico activo." };
  }

  const { data: asignacion } = await supabase
    .from("curso_profesor")
    .select("curso_id")
    .eq("curso_id", curso.id)
    .eq("profesor_id", parsed.data.profesorId)
    .maybeSingle();

  if (!asignacion) {
    return {
      ok: false,
      message: "El profesor seleccionado no esta habilitado para dictar este curso.",
    };
  }

  const { data: profesorPerfil } = await supabase
    .from("perfil")
    .select("activo, nombre")
    .eq("id", parsed.data.profesorId)
    .eq("rol", "DOCENTE")
    .maybeSingle();

  if (!profesorPerfil?.activo) {
    return { ok: false, message: "El profesor seleccionado no esta activo." };
  }

  const seccion = parsed.data.seccion.toUpperCase();
  const { data: cohorteExistente } = await supabase
    .from("cohorte")
    .select("id")
    .eq("carrera_id", curso.carrera_id)
    .eq("ciclo_id", ciclo.id)
    .eq("nivel", curso.nivel)
    .eq("seccion", seccion)
    .maybeSingle();

  let cohorteId = cohorteExistente?.id;

  if (!cohorteId) {
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

  const { data: bloques, error: bloquesError } = await supabase
    .from("bloque_horario")
    .select("id, hora_inicio, hora_fin")
    .in(
      "id",
      uniqueSlots.map((slot) => slot.bloqueId),
    );

  if (bloquesError || !bloques || bloques.length !== uniqueSlots.length) {
    return { ok: false, message: "Uno o mas bloques horarios ya no existen." };
  }

  const { data: aulas, error: aulasError } = await supabase
    .from("aula")
    .select("id, nombre")
    .eq("activo", true)
    .eq("tipo", curso.tipo_aula)
    .order("id", { ascending: true });

  if (aulasError) {
    return { ok: false, message: mapAdminWriteErrorMessage(aulasError.code, aulasError.message) };
  }

  if (!aulas || aulas.length === 0) {
    return {
      ok: false,
      message: `No hay aulas activas del tipo ${curso.tipo_aula} para este curso.`,
    };
  }

  const diasSeleccionados = [...new Set(uniqueSlots.map((slot) => slot.dia))];
  const bloqueIdsSeleccionados = [...new Set(uniqueSlots.map((slot) => slot.bloqueId))];

  const { data: sesionesExistentes, error: sesionesError } = await supabase
    .from("sesion_nrc")
    .select("dia, bloque_id, aula_id, profesor_id, cohorte_id")
    .in("dia", diasSeleccionados)
    .in("bloque_id", bloqueIdsSeleccionados);

  if (sesionesError) {
    return {
      ok: false,
      message: mapAdminWriteErrorMessage(sesionesError.code, sesionesError.message),
    };
  }

  for (const slot of uniqueSlots) {
    const conflictingProfessor = (sesionesExistentes ?? []).find(
      (session) =>
        session.dia === slot.dia &&
        session.bloque_id === slot.bloqueId &&
        session.profesor_id === parsed.data.profesorId,
    );

    if (conflictingProfessor) {
      return {
        ok: false,
        message: `${profesorPerfil.nombre} ya tiene una sesion programada en ${slot.dia}.`,
      };
    }

    const conflictingCohorte = (sesionesExistentes ?? []).find(
      (session) =>
        session.dia === slot.dia &&
        session.bloque_id === slot.bloqueId &&
        session.cohorte_id === cohorteId,
    );

    if (conflictingCohorte) {
      return {
        ok: false,
        message: `La cohorte ${curso.nivel}-${seccion} ya tiene una sesion en ${slot.dia}.`,
      };
    }
  }

  const sesionesPreparadas: Array<{
    dia: Dia;
    bloque_id: number;
    aula_id: number;
  }> = [];

  for (const slot of uniqueSlots) {
    const aulasOcupadas = new Set(
      (sesionesExistentes ?? [])
        .filter((session) => session.dia === slot.dia && session.bloque_id === slot.bloqueId)
        .map((session) => session.aula_id),
    );

    const aulaDisponible = aulas.find((aula) => !aulasOcupadas.has(aula.id));
    if (!aulaDisponible) {
      const bloque = bloques.find((item) => item.id === slot.bloqueId);
      return {
        ok: false,
        message: `No hay aulas libres para ${slot.dia} ${bloque?.hora_inicio.slice(0, 5) ?? ""}-${bloque?.hora_fin.slice(0, 5) ?? ""}.`,
      };
    }

    sesionesPreparadas.push({
      dia: slot.dia,
      bloque_id: slot.bloqueId,
      aula_id: aulaDisponible.id,
    });
  }

  // Calcular numero de creacion del curso (ordinal dentro de la carrera).
  const { data: todosCursos, error: todosCursosError } = await supabase
    .from("curso")
    .select("id")
    .eq("carrera_id", curso.carrera_id)
    .order("created_at", { ascending: true });

  if (todosCursosError) {
    return { ok: false, message: mapAdminWriteErrorMessage(todosCursosError.code, todosCursosError.message) };
  }

  const numeroCreacionCurso = ((todosCursos ?? []).findIndex((c) => c.id === curso.id) + 1) || 1;

  if (numeroCreacionCurso > 99) {
    return {
      ok: false,
      message: "La carrera supera 99 cursos y no cabe en el formato del NRC.",
    };
  }

  // Calcular siguiente instancia del NRC: max(ultimos 2 digitos de NRCs del curso) + 1.
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

  const nrcCode = buildNrcCode(curso.nivel, numeroCreacionCurso, siguienteInstancia);
  const { error: nrcInsertError } = await supabase.from("nrc").insert({
    nrc: nrcCode,
    curso_id: curso.id,
    profesor_id: parsed.data.profesorId,
    ciclo_id: ciclo.id,
    cohorte_id: cohorteId,
    cupo_max: parsed.data.cupoMax,
  });

  if (nrcInsertError) {
    return {
      ok: false,
      message: mapAdminWriteErrorMessage(nrcInsertError.code, nrcInsertError.message),
    };
  }

  const { error: sesionesInsertError } = await supabase.from("sesion_nrc").insert(
    sesionesPreparadas.map((session) => ({
      nrc: nrcCode,
      profesor_id: parsed.data.profesorId,
      cohorte_id: cohorteId,
      dia: session.dia,
      bloque_id: session.bloque_id,
      aula_id: session.aula_id,
    })),
  );

  if (sesionesInsertError) {
    await supabase.from("nrc").delete().eq("nrc", nrcCode);
    return {
      ok: false,
      message: mapAdminWriteErrorMessage(sesionesInsertError.code, sesionesInsertError.message),
    };
  }

  revalidatePath("/admin/cursos");
  revalidatePath(`/admin/cursos/${curso.id}`);
  revalidatePath("/admin/horarios");

  return { ok: true };
}
