"use client";

import { useActionState, useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { crearAula } from "./actions";
import { TIPO_AULA_OPTIONS } from "../catalog-options";

export function AulaForm() {
  const [state, action, pending] = useActionState(crearAula, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.message === "ok") {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={action} className="grid gap-3 md:grid-cols-[1.2fr_1fr_0.8fr_auto]">
      <div>
        <Input
          name="nombre"
          type="text"
          placeholder="Ej. Aula A-101"
          required
          minLength={2}
          maxLength={50}
          aria-invalid={state?.errors?.nombre ? "true" : undefined}
        />
        {state?.errors?.nombre && (
          <p className="mt-1 text-xs text-destructive">{state.errors.nombre[0]}</p>
        )}
      </div>

      <div>
        <select
          name="tipo"
          required
          defaultValue="TEORIA"
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring"
          aria-invalid={state?.errors?.tipo ? "true" : undefined}
        >
          {TIPO_AULA_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {state?.errors?.tipo && (
          <p className="mt-1 text-xs text-destructive">{state.errors.tipo[0]}</p>
        )}
      </div>

      <div>
        <Input
          name="capacidad"
          type="number"
          min={1}
          step={1}
          placeholder="Capacidad"
          required
          aria-invalid={state?.errors?.capacidad ? "true" : undefined}
        />
        {state?.errors?.capacidad && (
          <p className="mt-1 text-xs text-destructive">{state.errors.capacidad[0]}</p>
        )}
      </div>

      <Button type="submit" disabled={pending} className="md:self-start">
        <Plus className="h-4 w-4" />
        {pending ? "Creando..." : "Crear aula"}
      </Button>

      {state?.message && state.message !== "ok" && (
        <p className="md:col-span-4 text-xs text-destructive">{state.message}</p>
      )}
    </form>
  );
}
