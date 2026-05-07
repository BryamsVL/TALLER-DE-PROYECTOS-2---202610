"use client";

import { useActionState, useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { crearCurso } from "./actions";
import { TIPO_AULA_OPTIONS } from "../catalog-options";

export function CursoForm({ carreras = [] }: { carreras?: any[] }) {
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
        <Input
          name="code"
          type="text"
          placeholder="Código"
          required
          minLength={2}
          maxLength={15}
          aria-invalid={state?.errors?.code ? "true" : undefined}
        />
        {state?.errors?.code && (
          <p className="mt-1 text-xs text-destructive">{state.errors.code[0]}</p>
        )}
      </div>

      <div>
        <Input
          name="name"
          type="text"
          placeholder="Nombre del curso"
          required
          minLength={2}
          maxLength={100}
          aria-invalid={state?.errors?.name ? "true" : undefined}
        />
        {state?.errors?.name && (
          <p className="mt-1 text-xs text-destructive">{state.errors.name[0]}</p>
        )}
      </div>

      <div>
        <Input
          name="cycle"
          type="number"
          min={1}
          max={10}
          step={1}
          placeholder="Ciclo"
          required
          aria-invalid={state?.errors?.cycle ? "true" : undefined}
        />
        {state?.errors?.cycle && (
          <p className="mt-1 text-xs text-destructive">{state.errors.cycle[0]}</p>
        )}
      </div>

      <div>
        <Input
          name="credits"
          type="number"
          min={1}
          step={1}
          placeholder="Créditos"
          required
          aria-invalid={state?.errors?.credits ? "true" : undefined}
        />
        {state?.errors?.credits && (
          <p className="mt-1 text-xs text-destructive">{state.errors.credits[0]}</p>
        )}
      </div>

      <div>
        <Input
          name="weeklyHours"
          type="number"
          min={1.5}
          step={1.5}
          placeholder="Horas semanales"
          required
          aria-invalid={state?.errors?.weeklyHours ? "true" : undefined}
        />
        {state?.errors?.weeklyHours && (
          <p className="mt-1 text-xs text-destructive">{state.errors.weeklyHours[0]}</p>
        )}
      </div>

      <div>
        <select
          name="requiredRoomType"
          required
          defaultValue="TEORIA"
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring"
          aria-invalid={state?.errors?.requiredRoomType ? "true" : undefined}
        >
          {TIPO_AULA_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {state?.errors?.requiredRoomType && (
          <p className="mt-1 text-xs text-destructive">{state.errors.requiredRoomType[0]}</p>
        )}
      </div>

      <div className="xl:col-span-3 pt-2">
        <Button type="submit" disabled={pending} className="bg-purple-600 hover:bg-purple-700 text-white font-medium">
          <Plus className="h-4 w-4 mr-2" />
          {pending ? "Creando..." : "Crear curso"}
        </Button>
      </div>

      {state?.message && state.message !== "ok" && (
        <p className="xl:col-span-3 text-xs font-medium text-red-600 bg-red-50 p-2 rounded-md">{state.message}</p>
      )}
    </form>
  );
}
