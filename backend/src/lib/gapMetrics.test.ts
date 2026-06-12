import { describe, it, expect } from "vitest";
import {
  cuentaHuecos,
  pctReduccion,
  BLOQUES_START_MINUTES,
  type HuecoAssignment,
} from "./gapMetrics.js";

// Helper: arma una asignacion sobre el dia 1 (lunes) en el minuto de inicio dado.
function slot(teacher: string, start_minute: number, day = 1): HuecoAssignment {
  return { teacher_id: teacher, slot: { day, start_minute } };
}

describe("cuentaHuecos", () => {
  it("devuelve 0 sin asignaciones", () => {
    expect(cuentaHuecos([])).toBe(0);
  });

  it("devuelve 0 con una sola clase (no hay huecos posibles)", () => {
    expect(cuentaHuecos([slot("t1", 420)])).toBe(0);
  });

  it("devuelve 0 con dos bloques adyacentes (posiciones 0 y 1)", () => {
    expect(cuentaHuecos([slot("t1", 420), slot("t1", 520)])).toBe(0);
  });

  it("cuenta 1 hueco entre dos clases con un bloque vacio en medio", () => {
    // 420 (pos 0) y 620 (pos 2) => pos 1 (520) ociosa => 1 hueco
    expect(cuentaHuecos([slot("t1", 420), slot("t1", 620)])).toBe(1);
  });

  it("cuenta 2 huecos cuando hay dos bloques vacios entre clases", () => {
    // 420 (pos 0) y 720 (pos 3) => pos 1 y 2 ociosas => 2 huecos
    expect(cuentaHuecos([slot("t1", 420), slot("t1", 720)])).toBe(2);
  });

  it("NO cuenta el almuerzo como hueco (720 y 840 son posiciones adyacentes)", () => {
    // 720 (12:00, pos 3) y 840 (14:00, pos 4) => sin posiciones intermedias
    expect(cuentaHuecos([slot("t1", 720), slot("t1", 840)])).toBe(0);
  });

  it("agrega huecos de un mismo docente en distintos dias", () => {
    const asignaciones = [
      slot("t1", 420, 1), // lunes pos 0
      slot("t1", 620, 1), // lunes pos 2 -> 1 hueco
      slot("t1", 420, 2), // martes pos 0
      slot("t1", 720, 2), // martes pos 3 -> 2 huecos
    ];
    expect(cuentaHuecos(asignaciones)).toBe(3);
  });

  it("cuenta huecos por docente de forma independiente", () => {
    const asignaciones = [
      slot("t1", 420), // t1 pos 0
      slot("t1", 620), // t1 pos 2 -> 1 hueco
      slot("t2", 420), // t2 pos 0
      slot("t2", 520), // t2 pos 1 -> 0 huecos
    ];
    expect(cuentaHuecos(asignaciones)).toBe(1);
  });

  it("ignora minutos de inicio fuera del universo de bloques", () => {
    expect(cuentaHuecos([slot("t1", 999), slot("t1", 420)])).toBe(0);
  });

  it("expone los 9 bloques canonicos en orden", () => {
    expect(BLOQUES_START_MINUTES).toEqual([
      420, 520, 620, 720, 840, 940, 1040, 1140, 1240,
    ]);
  });
});

describe("pctReduccion", () => {
  it("calcula el porcentaje de reduccion", () => {
    expect(pctReduccion(10, 4)).toBe(60);
  });

  it("redondea a entero", () => {
    expect(pctReduccion(3, 1)).toBe(67); // 66.66 -> 67
  });

  it("devuelve 0 cuando el baseline es 0 (no habia huecos)", () => {
    expect(pctReduccion(0, 0)).toBe(0);
  });

  it("devuelve 0 cuando algun dato es null/undefined", () => {
    expect(pctReduccion(null, 5)).toBe(0);
    expect(pctReduccion(5, undefined)).toBe(0);
  });

  it("nunca devuelve negativo (optimizado > baseline se clampa a 0)", () => {
    expect(pctReduccion(2, 5)).toBe(0);
  });

  it("devuelve 100 cuando se eliminan todos los huecos", () => {
    expect(pctReduccion(8, 0)).toBe(100);
  });
});
