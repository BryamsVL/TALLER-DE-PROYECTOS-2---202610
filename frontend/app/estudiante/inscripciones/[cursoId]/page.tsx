import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionProfile } from "@/lib/auth/get-session-profile";
import { StudentCourseWorkspace } from "./StudentCourseWorkspace";
import type { Dia } from "@/lib/scheduler/types";

interface PageProps {
  params: Promise<{ cursoId: string }>;
}

export default async function EstudianteCursoDetailPage({ params }: PageProps) {
  const { cursoId } = await params;
  const cursoIdNum = Number(cursoId);

  if (!Number.isInteger(cursoIdNum) || cursoIdNum <= 0) {
    notFound();
  }

  const { user } = await getSessionProfile();
  const supabase = await createClient();

  const [{ data: estudiante }, { data: ciclo }] = await Promise.all([
    supabase.from("estudiante").select("carrera_id").eq("id", user.id).single(),
    supabase
      .from("ciclo")
      .select("id, nombre")
      .eq("activo", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (!estudiante || !ciclo) {
    notFound();
  }

  const { data: course } = await supabase
    .from("curso")
    .select("id, codigo, nombre, nivel, horas_semanales, tipo_aula, carrera_id, activo")
    .eq("id", cursoIdNum)
    .eq("carrera_id", estudiante.carrera_id)
    .single();

  if (!course) {
    notFound();
  }

  const [
    { data: bloques },
    { data: nrcsCarrera },
    { data: misInscripciones },
  ] = await Promise.all([
    supabase
      .from("bloque_horario")
      .select("id, orden, hora_inicio, hora_fin, turno")
      .order("orden", { ascending: true }),
    supabase
      .from("nrc")
      .select("nrc, profesor_id, cupo_max, cohorte_id, profesor:profesor_id ( perfil ( nombre ) )")
      .eq("curso_id", course.id)
      .eq("ciclo_id", ciclo.id),
    supabase
      .from("inscripcion")
      .select("nrc, estado")
      .eq("estudiante_id", user.id)
      .eq("estado", "ACTIVA"),
  ]);

  const nrcCodes = (nrcsCarrera ?? []).map((n) => n.nrc);
  
  const profesorIds = [...new Set((nrcsCarrera ?? []).map((n) => n.profesor_id).filter(Boolean))] as string[];
  const adminSupabase = createAdminClient();
  const { data: perfiles } = profesorIds.length > 0 
    ? await adminSupabase.from("perfil").select("id, nombre").in("id", profesorIds)
    : { data: [] };
  const perfilNombre = new Map((perfiles ?? []).map((p) => [p.id, p.nombre]));

  // Get active enrollment for this course specifically (to know if already enrolled)
  const misNrcs = new Set((misInscripciones ?? []).map((i) => i.nrc));
  const enrolledNrc = nrcCodes.find((nrc) => misNrcs.has(nrc)) ?? null;

  // Cupos
  const cuposActuales = new Map<string, number>();
  if (nrcCodes.length > 0) {
    const { data: cupoRows } = await supabase.rpc("nrc_cupo_actual", {
      p_nrcs: nrcCodes,
    });
    for (const r of (cupoRows ?? []) as { nrc: string; ocupados: number }[]) {
      cuposActuales.set(r.nrc, r.ocupados);
    }
  }

  const [
    { data: sesiones },
    { data: aulas },
  ] = await Promise.all([
    nrcCodes.length > 0
      ? supabase
          .from("sesion_nrc")
          .select("nrc, dia, bloque_id, aula_id")
          .in("nrc", nrcCodes)
      : Promise.resolve({ data: [] as Array<{ nrc: string; dia: Dia; bloque_id: number; aula_id: number }> }),
    supabase.from("aula").select("id, nombre"),
  ]);

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

  const nrcCards = (nrcsCarrera ?? [])
    // Solo mostrar NRCs con profesor asignado para que los estudiantes se inscriban
    .filter((nrc) => nrc.profesor_id)
    .map((nrc) => {
      const ocupados = cuposActuales.get(nrc.nrc) ?? 0;
      const nombre = nrc.profesor_id ? perfilNombre.get(nrc.profesor_id) : undefined;
      return {
        nrc: nrc.nrc,
        profesor_nombre: nombre ? nombre.trim() : "Docente",
        cupo_max: nrc.cupo_max,
        ocupados,
        lleno: ocupados >= nrc.cupo_max,
        sesiones: sessionsByNrc.get(nrc.nrc) ?? [],
      };
    });

  return (
    <StudentCourseWorkspace
      course={{
        id: course.id,
        codigo: course.codigo,
        nombre: course.nombre,
        nivel: course.nivel,
      }}
      bloques={bloques ?? []}
      nrcs={nrcCards}
      enrolledNrc={enrolledNrc}
    />
  );
}
