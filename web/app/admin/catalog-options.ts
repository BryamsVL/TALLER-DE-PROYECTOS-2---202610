export const TIPO_AULA_OPTIONS = [
  { value: "TEORIA", label: "Teoria" },
  { value: "LABORATORIO", label: "Laboratorio" },
  { value: "AUDITORIO", label: "Auditorio" },
] as const;

export const TIPO_PROFESOR_OPTIONS = [
  { value: "TIEMPO_COMPLETO", label: "Tiempo completo" },
  { value: "MEDIO_TIEMPO", label: "Medio tiempo" },
] as const;

export type TipoAula = (typeof TIPO_AULA_OPTIONS)[number]["value"];
export type TipoProfesor = (typeof TIPO_PROFESOR_OPTIONS)[number]["value"];
