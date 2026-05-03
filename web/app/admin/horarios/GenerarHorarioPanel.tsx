"use client";

import { useState, useTransition } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generarHorario, type GenerarHorarioResult } from "./actions";

export function GenerarHorarioPanel() {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<GenerarHorarioResult | null>(null);

  function handleGenerar() {
    if (!confirm("Generar horario? Esto borra las sesiones programadas previas para este ciclo.")) {
      return;
    }
    setResult(null);
    startTransition(async () => {
      const r = await generarHorario();
      setResult(r);
    });
  }

  return (
    <div className="space-y-4">
      <Button
        type="button"
        size="lg"
        onClick={handleGenerar}
        disabled={pending}
        className="w-full sm:w-auto"
      >
        <Sparkles className="h-4 w-4" />
        {pending ? "Generando..." : "Generar horario"}
      </Button>

      {result && result.ok && (
        <div className="rounded-md border border-success/40 bg-success/10 p-4 text-sm">
          <p className="font-medium text-success-foreground">Horario generado.</p>
          <p className="text-muted-foreground">
            {result.nrcsProgramados} NRCs programados, {result.sesionesGeneradas} sesiones
            asignadas.
          </p>
        </div>
      )}

      {result && !result.ok && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm">
          <p className="font-medium text-destructive">No se pudo generar.</p>
          <p className="text-muted-foreground">{result.message}</p>
        </div>
      )}
    </div>
  );
}
