// Scheduler core: backtracking sobre las restricciones duras del CSP.
//
// Limitaciones del MVP (Sprint 1):
// - 1 solo profesor por (curso, cohorte). Se elige greedy el de mas disponibilidad.
//   Multi-profesor con branching es Sprint 2+.
// - Sincronico: corre en memoria de cabo a rabo. Para datos esperados de
//   Sprint 1 (1 carrera, 1 ciclo, ~20 cursos, ~80 sesiones) tarda ms.
// - El estado serializable (`SchedulerState` en types.ts) esta definido pero
//   NO se usa todavia. Se cableara en Sprint 2+ junto con la Edge Function
//   `generate-schedule` para soportar reanudacion tras timeout.
// - Devuelve la primera solucion factible (no optimiza).

import {
  aulaCompatible,
  aulaLibre,
  cohorteLibre,
  crearOcupacion,
  diaLibreParaNRC,
  type DisponibilidadIndex,
  indexDisponibilidad,
  liberarSlot,
  ocuparSlot,
  profesorDisponible,
  profesorLibre,
} from "./constraints";
import {
  DIAS,
  type AulaInput,
  type BloqueInput,
  type CursoInput,
  type DisponibilidadInput,
  type NRCAsignacion,
  type SchedulerInput,
  type SchedulerOutput,
  type SesionAsignacion,
  type Tarea,
} from "./types";

const HORAS_POR_BLOQUE = 1.5;

function generarNRC(prefijo: string, seq: number): string {
  if (!/^[0-9]{2}$/.test(prefijo)) {
    throw new Error(`prefijo_nrc invalido: ${prefijo}`);
  }
  if (seq < 1 || seq > 999) {
    throw new Error(`seq fuera de rango (1..999): ${seq}`);
  }
  return prefijo + seq.toString().padStart(3, "0");
}

function calcularPrioridad(
  curso: CursoInput,
  disponibilidadCount: number,
): number {
  // Mayor = se ataca primero (mas restrictivo).
  // - Cursos con mas horas son mas dificiles de encajar.
  // - Cursos de laboratorio tienen menos aulas candidatas.
  // - Profesor con poca disponibilidad limita opciones.
  const horasFactor = curso.horas_semanales * 10;
  const labFactor = curso.tipo_aula === "LABORATORIO" ? 50 : 0;
  // disponibilidadCount alto = menos restrictivo. Restamos para invertir.
  const dispFactor = -disponibilidadCount;
  return horasFactor + labFactor + dispFactor;
}

function elegirProfesor(
  curso_id: number,
  input: SchedulerInput,
): { profesor_id: string; disponibilidadCount: number } | null {
  const candidatos = input.curso_profesor
    .filter((cp) => cp.curso_id === curso_id)
    .map((cp) => cp.profesor_id);
  if (candidatos.length === 0) return null;

  const dispPorProf = new Map<string, number>();
  for (const d of input.disponibilidad) {
    if (candidatos.includes(d.profesor_id)) {
      dispPorProf.set(
        d.profesor_id,
        (dispPorProf.get(d.profesor_id) ?? 0) + 1,
      );
    }
  }

  // Tomar el de mas disponibilidad (greedy). Tiebreak: id alfabetico.
  let best: string | null = null;
  let bestCount = -1;
  for (const pid of candidatos) {
    const c = dispPorProf.get(pid) ?? 0;
    if (c > bestCount || (c === bestCount && best !== null && pid < best)) {
      best = pid;
      bestCount = c;
    }
  }
  if (best === null) return null;
  return { profesor_id: best, disponibilidadCount: bestCount };
}

function buildTareas(input: SchedulerInput): {
  tareas: Tarea[];
  errores: string[];
} {
  const tareas: Tarea[] = [];
  const errores: string[] = [];
  let seq = input.nrc_seq_start;

  for (const dem of input.demanda) {
    const curso = input.cursos.find((c) => c.id === dem.curso_id);
    if (!curso) {
      errores.push(`demanda referencia curso_id=${dem.curso_id} inexistente`);
      continue;
    }
    const cohorte = input.cohortes.find((c) => c.id === dem.cohorte_id);
    if (!cohorte) {
      errores.push(
        `demanda referencia cohorte_id=${dem.cohorte_id} inexistente`,
      );
      continue;
    }
    const eleccion = elegirProfesor(curso.id, input);
    if (!eleccion) {
      errores.push(
        `curso ${curso.codigo} no tiene profesores asignables (revisa curso_profesor)`,
      );
      continue;
    }
    const n_sesiones_total = Math.round(
      curso.horas_semanales / HORAS_POR_BLOQUE,
    );
    if (n_sesiones_total < 1) {
      errores.push(`curso ${curso.codigo} tiene horas_semanales invalidas`);
      continue;
    }

    tareas.push({
      curso_id: curso.id,
      cohorte_id: cohorte.id,
      profesor_id: eleccion.profesor_id,
      nrc: generarNRC(input.prefijo_nrc, seq++),
      n_sesiones_total,
      prioridad: calcularPrioridad(curso, eleccion.disponibilidadCount),
    });
  }

  // Heuristica fail-first: mas restringido primero.
  tareas.sort((a, b) => b.prioridad - a.prioridad);

  return { tareas, errores };
}

export function solve(input: SchedulerInput): SchedulerOutput {
  const { tareas, errores } = buildTareas(input);

  if (errores.length > 0) {
    return {
      ok: false,
      motivo: `Errores en datos de entrada: ${errores.join("; ")}`,
      asignaciones_parciales: 0,
    };
  }
  if (tareas.length === 0) {
    return {
      ok: false,
      motivo: "No hay demanda de cursos para programar.",
      asignaciones_parciales: 0,
    };
  }

  const oc = crearOcupacion();
  const idxDisp: DisponibilidadIndex = indexDisponibilidad(
    input.disponibilidad,
  );
  const sesiones: SesionAsignacion[] = [];
  const bloquesOrdenados: BloqueInput[] = [...input.bloques].sort(
    (a, b) => a.orden - b.orden,
  );
  const aulasOrdenadas: AulaInput[] = [...input.aulas].sort(
    (a, b) => a.id - b.id,
  );

  let ultimoFallo = "";

  function backtrack(taskIdx: number, sesionIdx: number): boolean {
    if (taskIdx >= tareas.length) return true;

    const t = tareas[taskIdx];
    if (sesionIdx >= t.n_sesiones_total) {
      return backtrack(taskIdx + 1, 0);
    }

    const curso = input.cursos.find((c) => c.id === t.curso_id);
    if (!curso) {
      ultimoFallo = `curso ${t.curso_id} desaparecido durante busqueda`;
      return false;
    }

    for (const dia of DIAS) {
      if (!diaLibreParaNRC(oc, t.nrc, dia)) continue;

      for (const bloque of bloquesOrdenados) {
        if (!profesorDisponible(idxDisp, t.profesor_id, dia, bloque.turno)) {
          continue;
        }
        if (!profesorLibre(oc, t.profesor_id, dia, bloque.id)) continue;
        if (!cohorteLibre(oc, t.cohorte_id, dia, bloque.id)) continue;

        for (const aula of aulasOrdenadas) {
          if (!aulaCompatible(aula, curso.tipo_aula)) continue;
          if (!aulaLibre(oc, aula.id, dia, bloque.id)) continue;

          const args = {
            aula_id: aula.id,
            profesor_id: t.profesor_id,
            cohorte_id: t.cohorte_id,
            nrc: t.nrc,
            dia,
            bloque_id: bloque.id,
          };
          ocuparSlot(oc, args);
          sesiones.push({
            nrc: t.nrc,
            dia,
            bloque_id: bloque.id,
            aula_id: aula.id,
          });

          if (backtrack(taskIdx, sesionIdx + 1)) return true;

          sesiones.pop();
          liberarSlot(oc, args);
        }
      }
    }

    ultimoFallo = `NRC ${t.nrc} (curso ${curso.codigo}, cohorte ${t.cohorte_id}): sin slot factible para sesion ${sesionIdx + 1}/${t.n_sesiones_total}`;
    return false;
  }

  const ok = backtrack(0, 0);

  if (!ok) {
    return {
      ok: false,
      motivo: `Imposible completar el horario. Ultimo bloqueo: ${ultimoFallo}`,
      asignaciones_parciales: sesiones.length,
    };
  }

  const nrcs: NRCAsignacion[] = tareas.map((t) => ({
    nrc: t.nrc,
    curso_id: t.curso_id,
    profesor_id: t.profesor_id,
    ciclo_id: input.ciclo_id,
    cohorte_id: t.cohorte_id,
  }));

  return { ok: true, nrcs, sesiones };
}

// ============================================================================
// Modelo 3 (admin asigna profesor manualmente; solver solo arma sesiones)
// ============================================================================

export interface NRCExistente {
  nrc: string;
  curso_id: number;
  profesor_id: string; // NOT NULL aqui: solo procesamos NRCs ya asignados
  cohorte_id: number;
}

export interface SchedulerInputModel3 {
  ciclo_id: number;
  nrcs: NRCExistente[];
  cursos: CursoInput[];
  aulas: AulaInput[];
  bloques: BloqueInput[];
  disponibilidad: DisponibilidadInput[];
}

// Variante del solver para el flujo donde el admin ya creo los NRCs y eligio
// los profesores. El solver solo decide dia/bloque/aula para cada sesion.
export function solveForExistingNRCs(input: SchedulerInputModel3): SchedulerOutput {
  const tareas: Tarea[] = [];
  const errores: string[] = [];

  for (const nrcRow of input.nrcs) {
    const curso = input.cursos.find((c) => c.id === nrcRow.curso_id);
    if (!curso) {
      errores.push(`NRC ${nrcRow.nrc} referencia curso ${nrcRow.curso_id} inexistente`);
      continue;
    }
    const n_sesiones_total = Math.round(curso.horas_semanales / HORAS_POR_BLOQUE);
    if (n_sesiones_total < 1) {
      errores.push(`Curso ${curso.codigo} tiene horas_semanales invalidas`);
      continue;
    }

    // Cuenta de turnos disponibles del profesor (heuristica de prioridad).
    const dispCount = input.disponibilidad.filter(
      (d) => d.profesor_id === nrcRow.profesor_id,
    ).length;

    tareas.push({
      curso_id: curso.id,
      cohorte_id: nrcRow.cohorte_id,
      profesor_id: nrcRow.profesor_id,
      nrc: nrcRow.nrc,
      n_sesiones_total,
      prioridad: calcularPrioridad(curso, dispCount),
    });
  }

  if (errores.length > 0) {
    return {
      ok: false,
      motivo: `Errores en datos de entrada: ${errores.join("; ")}`,
      asignaciones_parciales: 0,
    };
  }
  if (tareas.length === 0) {
    return {
      ok: false,
      motivo: "No hay NRCs con profesor asignado para programar.",
      asignaciones_parciales: 0,
    };
  }

  // Heuristica fail-first: mas restringido primero.
  tareas.sort((a, b) => b.prioridad - a.prioridad);

  const oc = crearOcupacion();
  const idxDisp: DisponibilidadIndex = indexDisponibilidad(input.disponibilidad);
  const sesiones: SesionAsignacion[] = [];
  const bloquesOrdenados: BloqueInput[] = [...input.bloques].sort(
    (a, b) => a.orden - b.orden,
  );
  const aulasOrdenadas: AulaInput[] = [...input.aulas].sort((a, b) => a.id - b.id);

  let ultimoFallo = "";

  function backtrack(taskIdx: number, sesionIdx: number): boolean {
    if (taskIdx >= tareas.length) return true;

    const t = tareas[taskIdx];
    if (sesionIdx >= t.n_sesiones_total) {
      return backtrack(taskIdx + 1, 0);
    }

    const curso = input.cursos.find((c) => c.id === t.curso_id);
    if (!curso) {
      ultimoFallo = `curso ${t.curso_id} desaparecido durante busqueda`;
      return false;
    }

    for (const dia of DIAS) {
      if (!diaLibreParaNRC(oc, t.nrc, dia)) continue;

      for (const bloque of bloquesOrdenados) {
        if (!profesorDisponible(idxDisp, t.profesor_id, dia, bloque.turno)) continue;
        if (!profesorLibre(oc, t.profesor_id, dia, bloque.id)) continue;
        if (!cohorteLibre(oc, t.cohorte_id, dia, bloque.id)) continue;

        for (const aula of aulasOrdenadas) {
          if (!aulaCompatible(aula, curso.tipo_aula)) continue;
          if (!aulaLibre(oc, aula.id, dia, bloque.id)) continue;

          const args = {
            aula_id: aula.id,
            profesor_id: t.profesor_id,
            cohorte_id: t.cohorte_id,
            nrc: t.nrc,
            dia,
            bloque_id: bloque.id,
          };
          ocuparSlot(oc, args);
          sesiones.push({
            nrc: t.nrc,
            dia,
            bloque_id: bloque.id,
            aula_id: aula.id,
          });

          if (backtrack(taskIdx, sesionIdx + 1)) return true;

          sesiones.pop();
          liberarSlot(oc, args);
        }
      }
    }

    ultimoFallo = `NRC ${t.nrc} (curso ${curso.codigo}, cohorte ${t.cohorte_id}): sin slot factible para sesion ${sesionIdx + 1}/${t.n_sesiones_total}. Posibles causas: docente sin disponibilidad suficiente, aulas del tipo requerido ocupadas, o cohorte saturada.`;
    return false;
  }

  const ok = backtrack(0, 0);

  if (!ok) {
    return {
      ok: false,
      motivo: `Imposible completar el horario. ${ultimoFallo}`,
      asignaciones_parciales: sesiones.length,
    };
  }

  // En modelo 3 los NRCs ya existen; reutilizamos la info que vino en el input.
  const nrcs: NRCAsignacion[] = input.nrcs.map((n) => ({
    nrc: n.nrc,
    curso_id: n.curso_id,
    profesor_id: n.profesor_id,
    ciclo_id: input.ciclo_id,
    cohorte_id: n.cohorte_id,
  }));

  return { ok: true, nrcs, sesiones };
}

// Auxiliares exportadas para tests unitarios.
export const _internals = {
  generarNRC,
  buildTareas,
  calcularPrioridad,
  elegirProfesor,
};
