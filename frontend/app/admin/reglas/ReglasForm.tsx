"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { actualizarReglasCreditos } from "./actions";

interface ReglasFormProps {
  defaultMin: number;
  defaultMax: number;
}

export function ReglasForm({ defaultMin, defaultMax }: ReglasFormProps) {
  const [state, action, pending] = useActionState(
    actualizarReglasCreditos,
    undefined,
  );

  return (
    <form action={action} className="grid max-w-md gap-4">
      <div className="space-y-1.5">
        <Label htmlFor="reglas-min">Créditos mínimos por estudiante</Label>
        <Input
          id="reglas-min"
          name="minCreditos"
          type="number"
          min={1}
          max={30}
          defaultValue={defaultMin}
          required
          aria-invalid={state?.errors?.minCreditos ? "true" : undefined}
        />
        {state?.errors?.minCreditos && (
          <p className="mt-1 text-xs text-destructive">
            {state.errors.minCreditos[0]}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="reglas-max">Créditos máximos por estudiante</Label>
        <Input
          id="reglas-max"
          name="maxCreditos"
          type="number"
          min={1}
          max={30}
          defaultValue={defaultMax}
          required
          aria-invalid={state?.errors?.maxCreditos ? "true" : undefined}
        />
        {state?.errors?.maxCreditos && (
          <p className="mt-1 text-xs text-destructive">
            {state.errors.maxCreditos[0]}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2 pt-2">
        {state?.message === "ok" && (
          <p className="text-xs font-medium text-emerald-600">
            Reglas guardadas.
          </p>
        )}
        {state?.message && state.message !== "ok" && (
          <p className="text-xs font-medium text-destructive">
            {state.message}
          </p>
        )}
        <Button type="submit" disabled={pending} className="w-fit">
          <Save className="h-4 w-4" />
          {pending ? "Guardando..." : "Guardar reglas"}
        </Button>
      </div>
    </form>
  );
}
