"use client";

import { useActionState, useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { crearEstudiante } from "./actions";

interface StudentFormProps {
  carreras: {
    id: string;
    name: string;
  }[];
}

export function StudentForm({ carreras }: StudentFormProps) {
  const [state, action, pending] = useActionState(crearEstudiante, undefined);
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
          <Label htmlFor="stud-nombre">Nombre completo</Label>
          <Input
            id="stud-nombre"
            name="nombre"
            type="text"
            required
            minLength={2}
            maxLength={100}
            placeholder="Ej. Juan Pérez"
            aria-invalid={state?.errors?.nombre ? "true" : undefined}
          />
          {state?.errors?.nombre && (
            <p className="text-xs text-destructive">{state.errors.nombre[0]}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="stud-email">Correo</Label>
          <Input
            id="stud-email"
            name="email"
            type="email"
            required
            placeholder="estudiante@institucion.edu"
            aria-invalid={state?.errors?.email ? "true" : undefined}
          />
          {state?.errors?.email && (
            <p className="text-xs text-destructive">{state.errors.email[0]}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="stud-password">Contraseña temporal</Label>
          <Input
            id="stud-password"
            name="password"
            type="text"
            required
            minLength={8}
            placeholder="Mínimo 8 caracteres"
            aria-invalid={state?.errors?.password ? "true" : undefined}
          />
          {state?.errors?.password && (
            <p className="text-xs text-destructive">{state.errors.password[0]}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="stud-carrera">Carrera</Label>
          <select
            id="stud-carrera"
            name="carreraId"
            required
            defaultValue=""
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring"
            aria-invalid={state?.errors?.carreraId ? "true" : undefined}
          >
            <option value="" disabled>Seleccione una carrera</option>
            {carreras.map((carrera) => (
              <option key={carrera.id} value={carrera.id}>
                {carrera.name}
              </option>
            ))}
          </select>
          {state?.errors?.carreraId && (
            <p className="text-xs text-destructive">{state.errors.carreraId[0]}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="stud-ciclo">Ciclo Académico</Label>
          <select
            id="stud-ciclo"
            name="ciclo"
            required
            defaultValue="1"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring"
            aria-invalid={state?.errors?.ciclo ? "true" : undefined}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((c) => (
              <option key={c} value={c}>
                Ciclo {c}
              </option>
            ))}
          </select>
          {state?.errors?.ciclo && (
            <p className="text-xs text-destructive">{state.errors.ciclo[0]}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="stud-creditos">Límite de créditos</Label>
          <Input
            id="stud-creditos"
            name="limiteCreditos"
            type="number"
            required
            min={1}
            max={30}
            defaultValue={22}
            aria-invalid={state?.errors?.limiteCreditos ? "true" : undefined}
          />
          {state?.errors?.limiteCreditos && (
            <p className="text-xs text-destructive">{state.errors.limiteCreditos[0]}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between pt-2">
        {state?.message && state.message !== "ok" ? (
          <p className="text-xs text-destructive font-medium">{state.message}</p>
        ) : (
          <span className="text-xs text-muted-foreground">
            Se creará la cuenta de login en Auth y su correspondiente ficha académica de Estudiante.
          </span>
        )}
        <Button type="submit" disabled={pending} className="md:self-end">
          <Plus className="h-4 w-4" />
          {pending ? "Registrando..." : "Registrar estudiante"}
        </Button>
      </div>
    </form>
  );
}
