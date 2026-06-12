// Predicados puros (sin estado externo) para chequear restricciones duras
// antes de asignar una sesion. La BD tiene UNIQUEs equivalentes como red final.

import type {
  AulaInput,
  BloqueInput,
  Dia,
  DisponibilidadInput,
  TipoAula,
  Turno,
} from "./types";

// Indice rapido: "profesor_id|dia|turno" -> true si esta disponible.
export type DisponibilidadIndex = Set<string>;

export function indexDisponibilidad(
  disp: DisponibilidadInput[],
): DisponibilidadIndex {
  const idx = new Set<string>();
  for (const d of disp) {
    idx.add(`${d.profesor_id}|${d.dia}|${d.turno}`);
  }
  return idx;
}

export function profesorDisponible(
  idx: DisponibilidadIndex,
  profesor_id: string,
  dia: Dia,
  turno: Turno,
): boolean {
  return idx.has(`${profesor_id}|${dia}|${turno}`);
}

export function aulaCompatible(
  aula: AulaInput,
  tipo_requerido: TipoAula,
): boolean {
  return aula.tipo === tipo_requerido;
}

export function turnoDeBloque(
  bloques: BloqueInput[],
  bloque_id: number,
): Turno | null {
  const b = bloques.find((x) => x.id === bloque_id);
  return b ? b.turno : null;
}

// Ocupacion: registro de slots ya tomados durante el backtracking.
// Tres dimensiones (aula, profesor, cohorte) cada una con clave "dia|bloque".
export interface Ocupacion {
  aula: Map<number, Set<string>>; // aula_id -> {"dia|bloque"}
  profesor: Map<string, Set<string>>; // profesor_id -> {"dia|bloque"}
  cohorte: Map<number, Set<string>>; // cohorte_id -> {"dia|bloque"}
  // Por NRC: que dias ya estan usados (para evitar 2 sesiones del mismo NRC el mismo dia).
  nrcDias: Map<string, Set<Dia>>;
}

export function crearOcupacion(): Ocupacion {
  return {
    aula: new Map(),
    profesor: new Map(),
    cohorte: new Map(),
    nrcDias: new Map(),
  };
}

function slotKey(dia: Dia, bloque_id: number): string {
  return `${dia}|${bloque_id}`;
}

function libreEn<K>(
  map: Map<K, Set<string>>,
  key: K,
  slot: string,
): boolean {
  const set = map.get(key);
  return !set || !set.has(slot);
}

export function aulaLibre(
  oc: Ocupacion,
  aula_id: number,
  dia: Dia,
  bloque_id: number,
): boolean {
  return libreEn(oc.aula, aula_id, slotKey(dia, bloque_id));
}

export function profesorLibre(
  oc: Ocupacion,
  profesor_id: string,
  dia: Dia,
  bloque_id: number,
): boolean {
  return libreEn(oc.profesor, profesor_id, slotKey(dia, bloque_id));
}

export function cohorteLibre(
  oc: Ocupacion,
  cohorte_id: number,
  dia: Dia,
  bloque_id: number,
): boolean {
  return libreEn(oc.cohorte, cohorte_id, slotKey(dia, bloque_id));
}

// Restriccion suave-pero-recomendada: que un NRC no concentre todas sus
// sesiones el mismo dia. Si ya hay sesion del mismo NRC ese dia, se evita.
export function diaLibreParaNRC(
  oc: Ocupacion,
  nrc: string,
  dia: Dia,
): boolean {
  const set = oc.nrcDias.get(nrc);
  return !set || !set.has(dia);
}

// Mutaciones de la ocupacion (siempre balanceadas con un undo).
function addToMapSet<K>(map: Map<K, Set<string>>, key: K, val: string): void {
  let set = map.get(key);
  if (!set) {
    set = new Set();
    map.set(key, set);
  }
  set.add(val);
}

function removeFromMapSet<K>(
  map: Map<K, Set<string>>,
  key: K,
  val: string,
): void {
  const set = map.get(key);
  if (set) {
    set.delete(val);
    if (set.size === 0) map.delete(key);
  }
}

export function ocuparSlot(
  oc: Ocupacion,
  args: {
    aula_id: number;
    profesor_id: string;
    cohorte_id: number;
    nrc: string;
    dia: Dia;
    bloque_id: number;
  },
): void {
  const slot = slotKey(args.dia, args.bloque_id);
  addToMapSet(oc.aula, args.aula_id, slot);
  addToMapSet(oc.profesor, args.profesor_id, slot);
  addToMapSet(oc.cohorte, args.cohorte_id, slot);

  let dias = oc.nrcDias.get(args.nrc);
  if (!dias) {
    dias = new Set();
    oc.nrcDias.set(args.nrc, dias);
  }
  dias.add(args.dia);
}

export function liberarSlot(
  oc: Ocupacion,
  args: {
    aula_id: number;
    profesor_id: string;
    cohorte_id: number;
    nrc: string;
    dia: Dia;
    bloque_id: number;
  },
): void {
  const slot = slotKey(args.dia, args.bloque_id);
  removeFromMapSet(oc.aula, args.aula_id, slot);
  removeFromMapSet(oc.profesor, args.profesor_id, slot);
  removeFromMapSet(oc.cohorte, args.cohorte_id, slot);

  const dias = oc.nrcDias.get(args.nrc);
  if (dias) {
    dias.delete(args.dia);
    if (dias.size === 0) oc.nrcDias.delete(args.nrc);
  }
}
