"use client";

import { useActionState, useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { crearCarrera } from "./actions";

export function CarreraForm({ onSuccess }: { onSuccess?: () => void }) {
  const [state, action, pending] = useActionState(crearCarrera, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.message === "ok") {
      formRef.current?.reset();
      onSuccess?.();
    }
  }, [state, onSuccess]);

  return (
    <form ref={formRef} action={action} className="grid gap-4">
      <div className="space-y-1.5">
        <Label htmlFor="carrera-nombre">Nombre de la carrera</Label>
        <Input
          id="carrera-nombre"
          name="nombre"
          type="text"
          placeholder="Ej. Ingeniería de Software"
          required
          minLength={2}
          maxLength={100}
          aria-invalid={state?.errors?.nombre ? "true" : undefined}
        />
        {state?.errors?.nombre && (
          <p className="mt-1 text-xs text-destructive">{state.errors.nombre[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-2 pt-2">
        {state?.message && state.message !== "ok" && (
          <p className="text-xs text-destructive font-medium">{state.message}</p>
        )}
        <Button type="submit" disabled={pending} className="w-full">
          <Plus className="h-4 w-4" />
          {pending ? "Creando..." : "Crear carrera"}
        </Button>
      </div>
    </form>
  );
}
