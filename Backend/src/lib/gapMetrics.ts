// Metricas de "huecos" (bloques ociosos) en horarios docentes.
//
// Funciones PURAS, sin IO ni dependencias: el objetivo blando de compactacion
// vive en el solver CSP (Python); aqui se cuenta y reporta el resultado para
// la UI y se verifica de forma independiente. Diseñado para unit testing.
//
// Un "hueco" es un bloque ocioso entre la primera y la ultima sesion de un
// docente en un mismo dia. Se cuenta por POSICION de bloque (no por minutos):
// el almuerzo no es un bloque declarado, por lo que nunca cuenta como hueco.

// Minutos de inicio canonicos de los 9 bloques academicos, en orden.
// Reflejan los slots que el puente Node envia al solver. El salto 720 -> 840
// (12:00 -> 14:00) es el almuerzo: posiciones adyacentes, no genera hueco.
export const BLOQUES_START_MINUTES: readonly number[] = [
  420, 520, 620, 720, 840, 940, 1040, 1140, 1240,
];

export interface HuecoSlot {
  day: number;
  start_minute: number;
}

export interface HuecoAssignment {
  teacher_id: string;
  slot: HuecoSlot;
}

// Cuenta el total de huecos sobre todas las asignaciones, agregando por
// (docente, dia). `bloques` define el orden y universo de bloques posibles;
// por defecto usa los 9 bloques canonicos.
export function cuentaHuecos(
  asignaciones: HuecoAssignment[],
  bloques: readonly number[] = BLOQUES_START_MINUTES,
): number {
  const posicionDeMinuto = new Map<number, number>();
  bloques.forEach((minuto, indice) => posicionDeMinuto.set(minuto, indice));

  // (docente|dia) -> set de posiciones de bloque ocupadas.
  const ocupadasPorDia = new Map<string, Set<number>>();
  for (const { teacher_id, slot } of asignaciones) {
    const posicion = posicionDeMinuto.get(slot.start_minute);
    if (posicion === undefined) continue; // bloque fuera del universo: se ignora
    const clave = `${teacher_id}|${slot.day}`;
    let posiciones = ocupadasPorDia.get(clave);
    if (!posiciones) {
      posiciones = new Set();
      ocupadasPorDia.set(clave, posiciones);
    }
    posiciones.add(posicion);
  }

  let total = 0;
  for (const posiciones of ocupadasPorDia.values()) {
    total += huecosEnUnDia(posiciones);
  }
  return total;
}

// Huecos en un solo dia de un docente: posiciones vacias entre la primera y la
// ultima posicion ocupada.
function huecosEnUnDia(posiciones: Set<number>): number {
  if (posiciones.size < 2) return 0; // 0 o 1 clase => sin huecos posibles
  const minimo = Math.min(...posiciones);
  const maximo = Math.max(...posiciones);
  const ocupadas = posiciones.size;
  const tramo = maximo - minimo + 1; // bloques entre extremos (inclusive)
  return tramo - ocupadas;
}

// Porcentaje de reduccion de huecos: (antes - despues) / antes * 100.
// Devuelve 0 cuando no habia huecos que reducir (baseline 0/null) o cuando
// falta algun dato. Nunca devuelve negativo. Redondeado a entero.
export function pctReduccion(
  antes: number | null | undefined,
  despues: number | null | undefined,
): number {
  if (antes == null || despues == null) return 0;
  if (antes <= 0) return 0;
  const reduccion = ((antes - despues) / antes) * 100;
  return Math.max(0, Math.round(reduccion));
}
