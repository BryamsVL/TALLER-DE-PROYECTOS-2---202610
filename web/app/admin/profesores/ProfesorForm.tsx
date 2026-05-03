"use client";

import { useActionState, useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { crearProfesor } from "./actions";
import { TIPO_PROFESOR_OPTIONS } from "../catalog-options";

interface PerfilOption {
  id: string;
  nombre: string;
  activo: boolean;
}

interface ProfesorFormProps {
  perfiles: PerfilOption[];
}

export function ProfesorForm({ perfiles }: ProfesorFormProps) {
  const [state, action, pending] = useActionState(crearProfesor, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.message === "ok") {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={action} className="grid gap-3 md:grid-cols-[1.4fr_1fr_auto]">
      <div>
        <select
          name="perfilId"
          required
          defaultValue=""
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring"
          aria-invalid={state?.errors?.perfilId ? "true" : undefined}
          disabled={perfiles.length === 0}
        >
          <option value="" disabled>
            {perfiles.length === 0 ? "No hay perfiles DOCENTE disponibles" : "Selecciona un perfil"}
          </option>
          {perfiles.map((perfil) => (
            <option key={perfil.id} value={perfil.id}>
              {perfil.nombre}{perfil.activo ? "" : " (inactivo)"}
            </option>
          ))}
        </select>
        {state?.errors?.perfilId && (
          <p className="mt-1 text-xs text-destructive">{state.errors.perfilId[0]}</p>
        )}
      </div>

      <div>
        <select
          name="tipo"
          required
          defaultValue="TIEMPO_COMPLETO"
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring"
          aria-invalid={state?.errors?.tipo ? "true" : undefined}
          disabled={perfiles.length === 0}
        >
          {TIPO_PROFESOR_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {state?.errors?.tipo && (
          <p className="mt-1 text-xs text-destructive">{state.errors.tipo[0]}</p>
        )}
      </div>

      <Button type="submit" disabled={pending || perfiles.length === 0} className="md:self-start">
        <Plus className="h-4 w-4" />
        {pending ? "Registrando..." : "Registrar profesor"}
      </Button>

      {state?.message && state.message !== "ok" && (
        <p className="md:col-span-3 text-xs text-destructive">{state.message}</p>
      )}
    </form>
  );
}
