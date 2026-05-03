"use client";

import { useActionState, useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { crearCurso } from "./actions";
import { TIPO_AULA_OPTIONS } from "../catalog-options";

interface CarreraOption {
  id: number;
  nombre: string;
}

interface CursoFormProps {
  carreras: CarreraOption[];
}

export function CursoForm({ carreras }: CursoFormProps) {
  const [state, action, pending] = useActionState(crearCurso, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.message === "ok") {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={action} className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <div>
        <select
          name="carreraId"
          required
          defaultValue=""
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring"
          aria-invalid={state?.errors?.carreraId ? "true" : undefined}
        >
          <option value="" disabled>
            Selecciona una carrera
          </option>
          {carreras.map((carrera) => (
            <option key={carrera.id} value={carrera.id}>
              {carrera.nombre}
            </option>
          ))}
        </select>
        {state?.errors?.carreraId && (
          <p className="mt-1 text-xs text-destructive">{state.errors.carreraId[0]}</p>
        )}
      </div>

      <div>
        <Input
          name="codigo"
          type="text"
          placeholder="Codigo"
          required
          minLength={2}
          maxLength={15}
          aria-invalid={state?.errors?.codigo ? "true" : undefined}
        />
        {state?.errors?.codigo && (
          <p className="mt-1 text-xs text-destructive">{state.errors.codigo[0]}</p>
        )}
      </div>

      <div>
        <Input
          name="nombre"
          type="text"
          placeholder="Nombre del curso"
          required
          minLength={2}
          maxLength={100}
          aria-invalid={state?.errors?.nombre ? "true" : undefined}
        />
        {state?.errors?.nombre && (
          <p className="mt-1 text-xs text-destructive">{state.errors.nombre[0]}</p>
        )}
      </div>

      <div>
        <Input
          name="nivel"
          type="number"
          min={1}
          max={10}
          step={1}
          placeholder="Nivel"
          required
          aria-invalid={state?.errors?.nivel ? "true" : undefined}
        />
        {state?.errors?.nivel && (
          <p className="mt-1 text-xs text-destructive">{state.errors.nivel[0]}</p>
        )}
      </div>

      <div>
        <Input
          name="horasSemanales"
          type="number"
          min={1.5}
          step={1.5}
          placeholder="Horas semanales"
          required
          aria-invalid={state?.errors?.horasSemanales ? "true" : undefined}
        />
        {state?.errors?.horasSemanales && (
          <p className="mt-1 text-xs text-destructive">{state.errors.horasSemanales[0]}</p>
        )}
      </div>

      <div>
        <select
          name="tipoAula"
          required
          defaultValue="TEORIA"
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring"
          aria-invalid={state?.errors?.tipoAula ? "true" : undefined}
        >
          {TIPO_AULA_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {state?.errors?.tipoAula && (
          <p className="mt-1 text-xs text-destructive">{state.errors.tipoAula[0]}</p>
        )}
      </div>

      <div className="xl:col-span-3">
        <Button type="submit" disabled={pending || carreras.length === 0}>
          <Plus className="h-4 w-4" />
          {pending ? "Creando..." : "Crear curso"}
        </Button>
      </div>

      {state?.message && state.message !== "ok" && (
        <p className="xl:col-span-3 text-xs text-destructive">{state.message}</p>
      )}
    </form>
  );
}
