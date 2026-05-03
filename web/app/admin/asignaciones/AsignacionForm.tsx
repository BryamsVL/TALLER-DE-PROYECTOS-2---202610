"use client";

import { useActionState, useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { crearAsignacion } from "./actions";

interface CursoOption {
  id: number;
  codigo: string;
  nombre: string;
}

interface ProfesorOption {
  id: string;
  nombre: string;
}

interface AsignacionFormProps {
  cursos: CursoOption[];
  profesores: ProfesorOption[];
}

export function AsignacionForm({ cursos, profesores }: AsignacionFormProps) {
  const [state, action, pending] = useActionState(crearAsignacion, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const disabled = cursos.length === 0 || profesores.length === 0;

  useEffect(() => {
    if (state?.message === "ok") {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={action} className="grid gap-3 md:grid-cols-[1.2fr_1fr_auto]">
      <div>
        <select
          name="cursoId"
          required
          defaultValue=""
          disabled={disabled}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring"
          aria-invalid={state?.errors?.cursoId ? "true" : undefined}
        >
          <option value="" disabled>
            {cursos.length === 0 ? "No hay cursos activos disponibles" : "Selecciona un curso"}
          </option>
          {cursos.map((curso) => (
            <option key={curso.id} value={curso.id}>
              {curso.codigo} - {curso.nombre}
            </option>
          ))}
        </select>
        {state?.errors?.cursoId && (
          <p className="mt-1 text-xs text-destructive">{state.errors.cursoId[0]}</p>
        )}
      </div>

      <div>
        <select
          name="profesorId"
          required
          defaultValue=""
          disabled={disabled}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring"
          aria-invalid={state?.errors?.profesorId ? "true" : undefined}
        >
          <option value="" disabled>
            {profesores.length === 0
              ? "No hay profesores activos disponibles"
              : "Selecciona un profesor"}
          </option>
          {profesores.map((profesor) => (
            <option key={profesor.id} value={profesor.id}>
              {profesor.nombre}
            </option>
          ))}
        </select>
        {state?.errors?.profesorId && (
          <p className="mt-1 text-xs text-destructive">{state.errors.profesorId[0]}</p>
        )}
      </div>

      <Button type="submit" disabled={pending || disabled} className="md:self-start">
        <Plus className="h-4 w-4" />
        {pending ? "Asignando..." : "Asignar"}
      </Button>

      {state?.message && state.message !== "ok" && (
        <p className="md:col-span-3 text-xs text-destructive">{state.message}</p>
      )}
    </form>
  );
}
