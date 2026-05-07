"use client";

import { useActionState, useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { crearProfesor } from "./actions";
import { TIPO_PROFESOR_OPTIONS } from "../catalog-options";

export function ProfesorForm() {
  const [state, action, pending] = useActionState(crearProfesor, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.message === "ok") {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={action} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="prof-nombre">Nombre completo</Label>
          <Input
            id="prof-nombre"
            name="nombre"
            type="text"
            required
            minLength={2}
            maxLength={100}
            placeholder="Ej. Maria Lopez"
            aria-invalid={state?.errors?.nombre ? "true" : undefined}
          />
          {state?.errors?.nombre && (
            <p className="text-xs text-destructive">{state.errors.nombre[0]}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="prof-email">Correo</Label>
          <Input
            id="prof-email"
            name="email"
            type="email"
            required
            placeholder="docente@institucion.edu"
            aria-invalid={state?.errors?.email ? "true" : undefined}
          />
          {state?.errors?.email && (
            <p className="text-xs text-destructive">{state.errors.email[0]}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="prof-password">Contrasena temporal</Label>
          <Input
            id="prof-password"
            name="password"
            type="text"
            required
            minLength={8}
            placeholder="Minimo 8 caracteres"
            aria-invalid={state?.errors?.password ? "true" : undefined}
          />
          {state?.errors?.password && (
            <p className="text-xs text-destructive">{state.errors.password[0]}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="prof-tipo">Tipo de contrato</Label>
          <select
            id="prof-tipo"
            name="tipo"
            required
            defaultValue="TIEMPO_COMPLETO"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring"
            aria-invalid={state?.errors?.tipo ? "true" : undefined}
          >
            {TIPO_PROFESOR_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {state?.errors?.tipo && (
            <p className="text-xs text-destructive">{state.errors.tipo[0]}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        {state?.message && state.message !== "ok" ? (
          <p className="text-xs text-destructive">{state.message}</p>
        ) : (
          <span className="text-xs text-muted-foreground">
            Se crea el usuario en Auth, se asigna rol DOCENTE y se registra como profesor.
          </span>
        )}
        <Button type="submit" disabled={pending} className="md:self-end">
          <Plus className="h-4 w-4" />
          {pending ? "Registrando..." : "Registrar profesor"}
        </Button>
      </div>
    </form>
  );
}
