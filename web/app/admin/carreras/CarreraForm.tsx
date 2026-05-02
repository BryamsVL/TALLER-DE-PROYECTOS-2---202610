"use client";

import { useActionState, useEffect, useRef } from "react";
import { crearCarrera } from "./actions";

export function CarreraForm() {
  const [state, action, pending] = useActionState(crearCarrera, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  // Resetear el form tras un crear exitoso.
  useEffect(() => {
    if (state?.message === "ok") {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form
      ref={formRef}
      action={action}
      className="flex flex-col sm:flex-row gap-2 mb-6"
    >
      <div className="flex-1">
        <input
          name="nombre"
          type="text"
          placeholder="Nombre de la carrera"
          required
          minLength={2}
          maxLength={100}
          className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-400"
        />
        {state?.errors?.nombre && (
          <p className="mt-1 text-sm text-red-600">{state.errors.nombre[0]}</p>
        )}
        {state?.message && state.message !== "ok" && (
          <p className="mt-1 text-sm text-red-600">{state.message}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 px-4 py-2 font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {pending ? "Creando..." : "Crear carrera"}
      </button>
    </form>
  );
}
