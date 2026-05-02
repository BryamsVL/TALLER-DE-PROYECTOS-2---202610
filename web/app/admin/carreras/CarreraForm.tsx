"use client";

import { useActionState, useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { crearCarrera } from "./actions";

export function CarreraForm() {
  const [state, action, pending] = useActionState(crearCarrera, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.message === "ok") {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form
      ref={formRef}
      action={action}
      className="flex flex-col sm:flex-row gap-3"
    >
      <div className="flex-1">
        <Input
          name="nombre"
          type="text"
          placeholder="Nombre de la carrera"
          required
          minLength={2}
          maxLength={100}
          aria-invalid={state?.errors?.nombre ? "true" : undefined}
        />
        {state?.errors?.nombre && (
          <p className="mt-1 text-xs text-destructive">
            {state.errors.nombre[0]}
          </p>
        )}
        {state?.message && state.message !== "ok" && (
          <p className="mt-1 text-xs text-destructive">{state.message}</p>
        )}
      </div>
      <Button type="submit" disabled={pending}>
        <Plus className="h-4 w-4" />
        {pending ? "Creando..." : "Crear carrera"}
      </Button>
    </form>
  );
}
