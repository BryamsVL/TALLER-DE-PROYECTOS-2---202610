import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CourseScheduleWorkspace } from "./CourseScheduleWorkspace";

type Dia = "LUN" | "MAR" | "MIE" | "JUE" | "VIE" | "SAB";

interface PageProps {
  params: Promise<{ id: string }>;
}

function nextSectionValue(existingSections: string[]) {
  const normalized = existingSections
    .map((section) => section.trim().toUpperCase())
    .filter(Boolean);

  for (const candidate of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") {
    if (!normalized.includes(candidate)) {
      return candidate;
    }
  }

  return "A";
}

export default async function CursoDetailPage({ params }: PageProps) {
  const { id } = await params;
  const cursoId = Number(id);

  if (!Number.isInteger(cursoId) || cursoId <= 0) {
    notFound();
  }

  const supabase = await createClient();

  const { data: course, error: courseError } = await supabase
    .from("curso")
    .select("id, codigo, nombre, nivel, horas_semanales, tipo_aula, carrera_id, activo")
    .eq("id", cursoId)
    .single();

  if (courseError || !course) {
    notFound();
  }

  const [
    { data: carrera },
    { data: cycle },
    { data: bloques },
    { data: eligibleAssignments },
    { data: profesores },
  ] = await Promise.all([
    supabase.from("carrera").select("nombre").eq("id", course.carrera_id).maybeSingle(),
    supabase
      .from("ciclo")
      .select("id, nombre")
      .eq("activo", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("bloque_horario")
      .select("id, orden, hora_inicio, hora_fin, turno")
      .order("orden", { ascending: true }),
    supabase.from("curso_profesor").select("profesor_id").eq("curso_id", course.id),
    supabase
      .from("perfil")
      .select("id, nombre, activo")
      .eq("rol", "DOCENTE")
      .order("nombre", { ascending: true }),
  ]);

  const eligibleIds = new Set((eligibleAssignments ?? []).map((item) => item.profesor_id));
  const profesoresRegistrados = eligibleIds.size
    ? await supabase.from("profesor").select("id").in("id", [...eligibleIds])
    : { data: [] as Array<{ id: string }> };

  const activeProfessorIds = new Set((profesoresRegistrados.data ?? []).map((item) => item.id));
  const professors = (profesores ?? [])
    .filter((profesor) => profesor.activo && eligibleIds.has(profesor.id) && activeProfessorIds.has(profesor.id))
    .map((profesor) => ({
      id: profesor.id,
      nombre: profesor.nombre,
    }));

  // Calcular numero de creacion del curso (ordinal dentro de la carrera)
  const { data: todosCursosCarrera } = await supabase
    .from("curso")
    .select("id")
    .eq("carrera_id", course.carrera_id)
    .order("created_at", { ascending: true });

  const numeroCreacionCurso = ((todosCursosCarrera ?? []).findIndex((c) => c.id === course.id) + 1) || 1;

  const nrcs = cycle
    ? await supabase
        .from("nrc")
        .select("nrc, profesor_id, cohorte_id, cupo_max")
        .eq("curso_id", course.id)
        .eq("ciclo_id", cycle.id)
        .order("nrc", { ascending: true })
    : { data: [] as Array<{ nrc: string; profesor_id: string; cohorte_id: number; cupo_max: number }> };

  const cohorteIds = [...new Set((nrcs.data ?? []).map((nrc) => nrc.cohorte_id))];
  const profesorIds = [...new Set((nrcs.data ?? []).map((nrc) => nrc.profesor_id))];
  const nrcCodes = (nrcs.data ?? []).map((nrc) => nrc.nrc);

  const [
    { data: cohortes },
    { data: perfilesDocentes },
    { data: sesiones },
    { data: aulas },
    { data: cohortesCurso },
  ] = await Promise.all([
    cohorteIds.length > 0
      ? supabase.from("cohorte").select("id, seccion").in("id", cohorteIds)
      : Promise.resolve({ data: [] as Array<{ id: number; seccion: string }> }),
    profesorIds.length > 0
      ? supabase.from("perfil").select("id, nombre").in("id", profesorIds)
      : Promise.resolve({ data: [] as Array<{ id: string; nombre: string }> }),
    nrcCodes.length > 0
      ? supabase
          .from("sesion_nrc")
          .select("nrc, dia, bloque_id, aula_id")
          .in("nrc", nrcCodes)
      : Promise.resolve({ data: [] as Array<{ nrc: string; dia: Dia; bloque_id: number; aula_id: number }> }),
    supabase.from("aula").select("id, nombre"),
    cycle
      ? supabase
          .from("cohorte")
          .select("seccion")
          .eq("carrera_id", course.carrera_id)
          .eq("ciclo_id", cycle.id)
          .eq("nivel", course.nivel)
      : Promise.resolve({ data: [] as Array<{ seccion: string }> }),
  ]);

  const cohortById = new Map((cohortes ?? []).map((cohorte) => [cohorte.id, cohorte.seccion]));
  const teacherById = new Map((perfilesDocentes ?? []).map((perfil) => [perfil.id, perfil.nombre]));
  const classroomById = new Map((aulas ?? []).map((aula) => [aula.id, aula.nombre]));

  const sessionsByNrc = new Map<string, Array<{ dia: Dia; bloque_id: number; aula_nombre: string }>>();
  for (const session of sesiones ?? []) {
    const list = sessionsByNrc.get(session.nrc) ?? [];
    list.push({
      dia: session.dia,
      bloque_id: session.bloque_id,
      aula_nombre: classroomById.get(session.aula_id) ?? "Aula",
    });
    sessionsByNrc.set(session.nrc, list);
  }

  const nrcCards = (nrcs.data ?? []).map((nrc) => ({
    nrc: nrc.nrc,
    profesor_nombre: teacherById.get(nrc.profesor_id) ?? "Docente",
    seccion: cohortById.get(nrc.cohorte_id) ?? "A",
    cupo_max: nrc.cupo_max,
    sesiones: sessionsByNrc.get(nrc.nrc) ?? [],
  }));

  return (
    <CourseScheduleWorkspace
      course={{
        id: course.id,
        codigo: course.codigo,
        nombre: course.nombre,
        nivel: course.nivel,
        horas_semanales: Number(course.horas_semanales),
        tipo_aula: course.tipo_aula,
        carrera_nombre: carrera?.nombre ?? "Carrera",
      }}
      cycleName={cycle?.nombre ?? null}
      bloques={bloques ?? []}
      professors={professors}
      defaultSection={nextSectionValue((cohortesCurso ?? []).map((cohorte) => cohorte.seccion))}
      nrcs={nrcCards}
      numeroCreacionCurso={numeroCreacionCurso}
      canCreate={!!cycle && professors.length > 0 && course.activo}
    />
  );
}
