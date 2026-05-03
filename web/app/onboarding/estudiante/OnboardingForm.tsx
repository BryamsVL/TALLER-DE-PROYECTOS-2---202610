"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { seleccionarCarrera, type OnboardingResult } from "./actions";

interface CarreraOption {
  id: number;
  nombre: string;
}

interface OnboardingFormProps {
  carreras: CarreraOption[];
}

export function OnboardingForm({ carreras }: OnboardingFormProps) {
  const [state, action, pending] = useActionState<OnboardingResult | undefined, FormData>(
    seleccionarCarrera,
    undefined,
  );

  return (
    <form action={action} className="space-y-3">
      <select
        name="carreraId"
        required
        defaultValue=""
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
        disabled={carreras.length === 0}
      >
        <option value="" disabled>
          {carreras.length === 0 ? "No hay carreras disponibles" : "Selecciona tu carrera"}
        </option>
        {carreras.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nombre}
          </option>
        ))}
      </select>

      {state && !state.ok && (
        <p className="text-xs text-destructive">{state.message}</p>
      )}

      <Button type="submit" disabled={pending || carreras.length === 0} className="w-full">
        {pending ? "Guardando..." : "Confirmar carrera"}
      </Button>
    </form>
  );
}
