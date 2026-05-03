"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapAdminWriteErrorMessage } from "../action-errors";
import {
  solveForExistingNRCs,
  type AulaInput,
  type BloqueInput,
  type CursoInput,
  type DisponibilidadInput,
  type NRCExistente,
} from "@/lib/scheduler";

export type GenerarHorarioResult =
  | {
      ok: true;
      sesionesGeneradas: number;
      nrcsProgramados: number;
    }
  | { ok: false; message: string };

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

export async function generarHorario(): Promise<GenerarHorarioResult> {
  if (!(await assertAdminCaller())) {
    return { ok: false, message: mapAdminWriteErrorMessage("42501") };
  }

  const supabase = await createClient();

  // 1. Ciclo activo
  const { data: ciclo } = await supabase
    .from("ciclo")
    .select("id")
    .eq("activo", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!ciclo) {
    return { ok: false, message: "No hay ciclo academico activo." };
  }

  // 2. Carga de inputs
  const [
    { data: nrcsRows, error: nrcsError },
    { data: cursosRows, error: cursosError },
    { data: aulasRows, error: aulasError },
    { data: bloquesRows, error: bloquesError },
    { data: dispRows, error: dispError },
  ] = await Promise.all([
    supabase
      .from("nrc")
      .select("nrc, curso_id, profesor_id, cohorte_id")
      .eq("ciclo_id", ciclo.id)
      .not("profesor_id", "is", null),
    supabase
      .from("curso")
      .select("id, carrera_id, nivel, codigo, nombre, horas_semanales, tipo_aula")
      .eq("activo", true),
    supabase.from("aula").select("id, nombre, tipo, capacidad").eq("activo", true),
    supabase.from("bloque_horario").select("id, orden, hora_inicio, hora_fin, turno"),
    supabase.from("disponibilidad_profesor").select("profesor_id, dia, turno"),
  ]);

  const fetchError =
    nrcsError?.message ??
    cursosError?.message ??
    aulasError?.message ??
    bloquesError?.message ??
    dispError?.message;
  if (fetchError) return { ok: false, message: `Error cargando datos: ${fetchError}` };

  if (!nrcsRows || nrcsRows.length === 0) {
    return {
      ok: false,
      message: "No hay NRCs con docente asignado en el ciclo activo.",
    };
  }
  if (!aulasRows || aulasRows.length === 0) {
    return { ok: false, message: "No hay aulas activas." };
  }
  if (!bloquesRows || bloquesRows.length === 0) {
    return { ok: false, message: "No hay bloques horarios configurados." };
  }

  // 3. Convertir a tipos del solver
  const nrcs: NRCExistente[] = nrcsRows.map((r) => ({
    nrc: r.nrc,
    curso_id: r.curso_id,
    profesor_id: r.profesor_id as string,
    cohorte_id: r.cohorte_id,
  }));
  const cursos: CursoInput[] = (cursosRows ?? []).map((c) => ({
    id: c.id,
    carrera_id: c.carrera_id,
    nivel: c.nivel,
    codigo: c.codigo,
    nombre: c.nombre,
    horas_semanales: Number(c.horas_semanales),
    tipo_aula: c.tipo_aula,
  }));
  const aulas: AulaInput[] = aulasRows.map((a) => ({
    id: a.id,
    nombre: a.nombre,
    tipo: a.tipo,
    capacidad: a.capacidad,
  }));
  const bloques: BloqueInput[] = bloquesRows.map((b) => ({
    id: b.id,
    orden: b.orden,
    hora_inicio: b.hora_inicio,
    hora_fin: b.hora_fin,
    turno: b.turno,
  }));
  const disponibilidad: DisponibilidadInput[] = (dispRows ?? []).map((d) => ({
    profesor_id: d.profesor_id,
    dia: d.dia,
    turno: d.turno,
  }));

  // 4. Solver
  const result = solveForExistingNRCs({
    ciclo_id: ciclo.id,
    nrcs,
    cursos,
    aulas,
    bloques,
    disponibilidad,
  });

  if (!result.ok) {
    return {
      ok: false,
      message: `${result.motivo} (sesiones colocadas antes de fallar: ${result.asignaciones_parciales})`,
    };
  }

  // 5. Persistencia atomica: borrar sesiones del ciclo + insertar nuevas.
  // Usamos admin client para bypassar el trigger de denormalizacion en update.
  // Wipe solo afecta NRCs del ciclo activo.
  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Configuracion invalida.",
    };
  }

  const nrcCodes = nrcs.map((n) => n.nrc);
  const { error: deleteError } = await admin
    .from("sesion_nrc")
    .delete()
    .in("nrc", nrcCodes);

  if (deleteError) {
    return {
      ok: false,
      message: `No se pudieron limpiar sesiones previas: ${deleteError.message}`,
    };
  }

  // sesion_nrc.profesor_id y cohorte_id son denormalizados; el trigger
  // sync_sesion_denorm los rellena desde nrc.* en el INSERT.
  // Pero el trigger se ejecuta BEFORE INSERT y necesita que los valores existan.
  // Como tenemos los valores en `nrc`, podemos pasarlos directos para evitar el round-trip.
  const sesionesAInsertar = result.sesiones.map((s) => {
    const nrcInfo = nrcs.find((n) => n.nrc === s.nrc)!;
    return {
      nrc: s.nrc,
      profesor_id: nrcInfo.profesor_id,
      cohorte_id: nrcInfo.cohorte_id,
      dia: s.dia,
      bloque_id: s.bloque_id,
      aula_id: s.aula_id,
    };
  });

  const { error: insertError } = await admin.from("sesion_nrc").insert(sesionesAInsertar);

  if (insertError) {
    return {
      ok: false,
      message: `Error guardando sesiones: ${insertError.message}`,
    };
  }

  revalidatePath("/admin/horarios");
  revalidatePath("/docente/horario");
  revalidatePath("/estudiante/horario");

  return {
    ok: true,
    sesionesGeneradas: result.sesiones.length,
    nrcsProgramados: result.nrcs.length,
  };
}
