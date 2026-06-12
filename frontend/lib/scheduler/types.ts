// Tipos del dominio del scheduler. Espejo simplificado de las tablas en
// `web/supabase/schema.sql`, recortado a lo que el algoritmo CSP necesita.

export type Dia = "LUN" | "MAR" | "MIE" | "JUE" | "VIE" | "SAB";
export type Turno = "MANANA" | "TARDE" | "NOCHE";
export type TipoAula = "TEORIA" | "LABORATORIO" | "AUDITORIO";

export const DIAS: ReadonlyArray<Dia> = [
  "LUN",
  "MAR",
  "MIE",
  "JUE",
  "VIE",
  "SAB",
] as const;

// ---------- Inputs (lo que la Edge Function pasa al solver) ----------

export interface CursoInput {
  id: number;
  carrera_id: number;
  nivel: number;
  codigo: string;
  nombre: string;
  horas_semanales: number; // multiplo de 1.5
  tipo_aula: TipoAula;
}

export interface ProfesorInput {
  id: string; // UUID
  nombre: string;
}

export interface AulaInput {
  id: number;
  nombre: string;
  tipo: TipoAula;
  capacidad: number;
}

export interface BloqueInput {
  id: number;
  orden: number; // 1..9
  hora_inicio: string; // 'HH:MM'
  hora_fin: string;
  turno: Turno;
}

export interface CohorteInput {
  id: number;
  carrera_id: number;
  ciclo_id: number;
  nivel: number;
  seccion: string;
}

export interface DisponibilidadInput {
  profesor_id: string;
  dia: Dia;
  turno: Turno;
}

export interface CursoProfesorInput {
  curso_id: number;
  profesor_id: string;
}

// Una "demanda" de la malla: que un curso debe dictarse para una cohorte.
// El solver decide profesor y sesiones (dia/bloque/aula).
export interface DemandaCurso {
  curso_id: number;
  cohorte_id: number;
}

export interface SchedulerInput {
  ciclo_id: number;
  // Prefijo de 2 chars del ciclo (ej. "61" para 2026-1). Se concatena con
  // un correlativo de 3 chars (zero-padded) para formar el NRC de 5 chars.
  prefijo_nrc: string;
  // Primer correlativo a usar. Se reclama atomicamente desde `nrc_secuencia`
  // antes de invocar al solver (UPDATE ... RETURNING).
  nrc_seq_start: number;
  cursos: CursoInput[];
  profesores: ProfesorInput[];
  aulas: AulaInput[];
  bloques: BloqueInput[];
  cohortes: CohorteInput[];
  disponibilidad: DisponibilidadInput[];
  curso_profesor: CursoProfesorInput[];
  demanda: DemandaCurso[];
}

// ---------- Outputs (lo que se persiste en BD al final) ----------

export interface NRCAsignacion {
  nrc: string; // 5 chars numericos
  curso_id: number;
  profesor_id: string;
  ciclo_id: number;
  cohorte_id: number;
}

export interface SesionAsignacion {
  nrc: string;
  dia: Dia;
  bloque_id: number;
  aula_id: number;
}

export type SchedulerOutput =
  | {
      ok: true;
      nrcs: NRCAsignacion[];
      sesiones: SesionAsignacion[];
    }
  | {
      ok: false;
      motivo: string;
      asignaciones_parciales: number;
    };

// ---------- Estado serializable para reanudar (JSONB en generation_job) ----------

// Una "tarea" es un NRC pendiente de programar (curso para cohorte) y
// requiere `n_sesiones_total` slots (dia,bloque,aula).
export interface Tarea {
  curso_id: number;
  cohorte_id: number;
  profesor_id: string;
  nrc: string;
  n_sesiones_total: number;
  // Heuristica precomputada para el orden (mas alta = mas restringida = se ataca primero)
  prioridad: number;
}

// Una decision = una sesion ya colocada, en la pila de backtracking.
export interface Decision {
  tarea_idx: number; // posicion en `tareas`
  sesion_idx: number; // 0..n_sesiones_total-1
  dia: Dia;
  bloque_id: number;
  aula_id: number;
}

export interface SchedulerState {
  ciclo_id: number;
  tareas: Tarea[];
  // Indice de la tarea que estamos resolviendo actualmente.
  cursor_tarea: number;
  // Cuantas sesiones ya colocamos para `tareas[cursor_tarea]`.
  cursor_sesion: number;
  // Pila de decisiones en orden cronologico de colocacion. Permite deshacer.
  pila: Decision[];
  // Contador de iteraciones para corte cooperativo (evitar timeout).
  iteraciones: number;
  // Limite suave para hacer flush a BD y permitir reanudar.
  limite_iteraciones_por_tick: number;
}
