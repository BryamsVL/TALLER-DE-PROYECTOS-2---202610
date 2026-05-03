"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cancelarSolicitud, crearSolicitud } from "./actions";

interface NrcOption {
  nrc: string;
  cursoCodigo: string;
  cursoNombre: string;
}

interface Props {
  nrcsActuales: NrcOption[];
  // Por NRC actual: NRCs alternos del mismo curso disponibles (con cupo).
  alternativasPorNrc: Record<string, NrcOption[]>;
}

export function NuevaSolicitudForm({ nrcsActuales, alternativasPorNrc }: Props) {
  const [nrcActual, setNrcActual] = useState("");
  const [nrcNuevo, setNrcNuevo] = useState("");
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const alternativas = nrcActual ? alternativasPorNrc[nrcActual] ?? [] : [];

  function handleSubmit() {
    setError(null);
    if (!nrcActual || !nrcNuevo) {
      setError("Selecciona ambos NRCs.");
      return;
    }
    const fd = new FormData();
    fd.set("nrcActual", nrcActual);
    fd.set("nrcNuevo", nrcNuevo);
    if (motivo.trim()) fd.set("motivo", motivo.trim());

    startTransition(async () => {
      const r = await crearSolicitud(fd);
      if (!r.ok) setError(r.message);
      else {
        setNrcActual("");
        setNrcNuevo("");
        setMotivo("");
      }
    });
  }

  if (nrcsActuales.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No tienes inscripciones activas. Inscribete en /estudiante/inscripciones primero.
      </p>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="sol-actual">NRC actual</Label>
          <select
            id="sol-actual"
            value={nrcActual}
            onChange={(e) => {
              setNrcActual(e.target.value);
              setNrcNuevo("");
            }}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">Selecciona</option>
            {nrcsActuales.map((n) => (
              <option key={n.nrc} value={n.nrc}>
                {n.nrc} — {n.cursoCodigo}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="sol-nuevo">NRC nuevo</Label>
          <select
            id="sol-nuevo"
            value={nrcNuevo}
            onChange={(e) => setNrcNuevo(e.target.value)}
            disabled={!nrcActual}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">
              {!nrcActual
                ? "Elige un NRC actual primero"
                : alternativas.length === 0
                  ? "No hay otros NRCs del mismo curso"
                  : "Selecciona"}
            </option>
            {alternativas.map((n) => (
              <option key={n.nrc} value={n.nrc}>
                {n.nrc}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="sol-motivo">Motivo (opcional)</Label>
        <Input
          id="sol-motivo"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          maxLength={500}
          placeholder="Por que pides el cambio"
        />
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <Button
        type="button"
        onClick={handleSubmit}
        disabled={pending || !nrcActual || !nrcNuevo}
        className="self-start"
      >
        {pending ? "Enviando..." : "Crear solicitud"}
      </Button>
    </div>
  );
}

export function CancelarButton({ id }: { id: number }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-destructive hover:text-destructive"
        onClick={() => {
          setError(null);
          if (!confirm("Cancelar solicitud?")) return;
          const fd = new FormData();
          fd.set("id", String(id));
          startTransition(async () => {
            const r = await cancelarSolicitud(fd);
            if (!r.ok) setError(r.message);
          });
        }}
        disabled={pending}
      >
        {pending ? "Cancelando..." : "Cancelar"}
      </Button>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
