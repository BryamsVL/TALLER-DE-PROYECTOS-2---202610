"use client";

import { useState, useTransition } from "react";
import { Sun, Sunset, Moon } from "lucide-react";
import { setDisponibilidad, setDisponibilidadMasivo } from "./actions";

type Dia = "LUN" | "MAR" | "MIE" | "JUE" | "VIE" | "SAB" | "DOM";
type DiaActiva = Exclude<Dia, "DOM">;
type Turno = "MANANA" | "TARDE" | "NOCHE";

const DIAS: { key: Dia; label: string }[] = [
  { key: "LUN", label: "Lunes" },
  { key: "MAR", label: "Martes" },
  { key: "MIE", label: "Miercoles" },
  { key: "JUE", label: "Jueves" },
  { key: "VIE", label: "Viernes" },
  { key: "SAB", label: "Sabado" },
  { key: "DOM", label: "Domingo" },
];

const TURNOS: { key: Turno; label: string; horas: string; icon: typeof Sun }[] = [
  { key: "MANANA", label: "Manana", horas: "07:00 - 13:30", icon: Sun },
  { key: "TARDE", label: "Tarde", horas: "14:00 - 18:50", icon: Sunset },
  { key: "NOCHE", label: "Noche", horas: "19:00 - 22:10", icon: Moon },
];

const DIAS_ACTIVOS: DiaActiva[] = ["LUN", "MAR", "MIE", "JUE", "VIE", "SAB"];

function key(dia: DiaActiva, turno: Turno) {
  return `${dia}-${turno}`;
}

interface HorarioPreferenteProps {
  // Set de "DIA-TURNO" iniciales, p.ej. "LUN-MANANA".
  initial: Set<string>;
}

export function HorarioPreferente({ initial }: HorarioPreferenteProps) {
  const [marcados, setMarcados] = useState<Set<string>>(initial);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const totalSlots = 6 * TURNOS.length; // L-S * 3 turnos
  const seleccionados = marcados.size;

  function handleToggle(dia: DiaActiva, turno: Turno) {
    setError(null);
    const k = key(dia, turno);
    const activar = !marcados.has(k);

    // Optimista
    const next = new Set(marcados);
    if (activar) next.add(k);
    else next.delete(k);
    setMarcados(next);

    const fd = new FormData();
    fd.set("dia", dia);
    fd.set("turno", turno);
    fd.set("activar", activar ? "true" : "false");

    startTransition(async () => {
      const result = await setDisponibilidad(fd);
      if (!result.ok) {
        // Rollback
        const rollback = new Set(marcados);
        if (activar) rollback.delete(k);
        else rollback.add(k);
        setMarcados(rollback);
        setError(result.message);
      }
    });
  }

  function handleBulk(turno: Turno | "ALL", activar: boolean) {
    setError(null);
    const turnos: Turno[] = turno === "ALL" ? ["MANANA", "TARDE", "NOCHE"] : [turno];
    const keys: string[] = [];
    for (const t of turnos) {
      for (const d of DIAS_ACTIVOS) keys.push(key(d, t));
    }

    const prev = marcados;
    const next = new Set(marcados);
    for (const k of keys) {
      if (activar) next.add(k);
      else next.delete(k);
    }
    setMarcados(next);

    const fd = new FormData();
    fd.set("turno", turno);
    fd.set("activar", activar ? "true" : "false");

    startTransition(async () => {
      const result = await setDisponibilidadMasivo(fd);
      if (!result.ok) {
        setMarcados(prev);
        setError(result.message);
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {seleccionados === 0
            ? "Marca al menos un turno para que el generador pueda asignarte clases."
            : `${seleccionados} de ${totalSlots} turnos marcados.`}
        </p>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => handleBulk("ALL", true)}
          disabled={pending}
          className="rounded-md border bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          Marcar todo
        </button>
        <button
          type="button"
          onClick={() => handleBulk("ALL", false)}
          disabled={pending}
          className="rounded-md border px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-60"
        >
          Limpiar
        </button>

        <span className="ml-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Atajos por turno:
        </span>
        {TURNOS.map((t) => (
          <div
            key={t.key}
            className="flex items-center gap-1 rounded-lg border bg-muted/40 p-1"
          >
            <span className="px-1.5 text-[10px] font-medium text-muted-foreground">
              {t.label}
            </span>
            <button
              type="button"
              onClick={() => handleBulk(t.key, true)}
              disabled={pending}
              className="rounded px-1.5 py-0.5 text-[10px] font-bold text-primary hover:bg-primary/10 disabled:opacity-60"
            >
              Agregar
            </button>
            <span className="text-muted-foreground/40">|</span>
            <button
              type="button"
              onClick={() => handleBulk(t.key, false)}
              disabled={pending}
              className="rounded px-1.5 py-0.5 text-[10px] font-bold text-destructive hover:bg-destructive/10 disabled:opacity-60"
            >
              Quitar
            </button>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border bg-background">
        <div className="min-w-[640px] grid grid-cols-[120px_repeat(7,minmax(0,1fr))]">
          {/* Header row */}
          <div className="border-b border-r bg-muted/40 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Turno
          </div>
          {DIAS.map((d) => (
            <div
              key={d.key}
              className={`border-b px-2 py-2 text-center text-xs font-semibold uppercase tracking-wider ${
                d.key === "DOM"
                  ? "bg-muted/40 text-muted-foreground/60"
                  : "bg-muted/40 text-muted-foreground"
              }`}
            >
              {d.label}
            </div>
          ))}

          {/* Rows: turnos */}
          {TURNOS.map((t, rowIdx) => {
            const Icon = t.icon;
            const isLast = rowIdx === TURNOS.length - 1;
            return (
              <div key={t.key} className="contents">
                <div
                  className={`flex flex-col gap-0.5 border-r px-3 py-3 text-sm ${
                    isLast ? "" : "border-b"
                  }`}
                >
                  <div className="flex items-center gap-2 font-medium">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    {t.label}
                  </div>
                  <div className="text-[10px] text-muted-foreground">{t.horas}</div>
                </div>

                {DIAS.map((d) => {
                  const isDomingo = d.key === "DOM";
                  const k = isDomingo ? "" : key(d.key as DiaActiva, t.key);
                  const checked = !isDomingo && marcados.has(k);

                  if (isDomingo) {
                    return (
                      <div
                        key={`${d.key}-${t.key}`}
                        className={`flex items-center justify-center bg-muted/20 px-1 py-3 ${
                          isLast ? "" : "border-b"
                        }`}
                      >
                        <span className="text-[10px] text-muted-foreground/60">
                          No disponible
                        </span>
                      </div>
                    );
                  }

                  return (
                    <button
                      key={`${d.key}-${t.key}`}
                      type="button"
                      onClick={() => handleToggle(d.key as DiaActiva, t.key)}
                      disabled={pending}
                      aria-pressed={checked}
                      className={`m-1 rounded-md px-2 py-3 text-xs font-medium transition-colors ${
                        checked
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "border border-dashed border-input bg-background text-muted-foreground hover:bg-muted"
                      } ${isLast ? "" : "border-b-transparent"} disabled:opacity-60`}
                    >
                      {checked ? "Disponible" : "Marcar"}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
