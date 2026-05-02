"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Lock, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/app/actions/auth";

export default function RegisterPage() {
  const [state, action, pending] = useActionState(signUp, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-card shadow-pop md:grid-cols-2">
        <div className="hidden flex-col justify-between bg-primary p-10 text-primary-foreground md:flex">
          <div className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-accent-foreground font-bold">
              S
            </div>
            <div>
              <p className="text-base font-bold">SGOHA</p>
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Academic OS
              </p>
            </div>
          </div>

          <div>
            <h2 className="font-display text-3xl font-bold leading-tight">
              Empieza a organizar tu calendario academico.
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Crea tu cuenta. Despues un coordinador te asignara el rol que
              corresponda (docente, estudiante o administrador).
            </p>
          </div>

          <div className="rounded-2xl border border-sidebar-border bg-sidebar-active p-4 text-xs">
            <p className="font-semibold text-sidebar-active-foreground">
              Sin spam, sin tarjetas
            </p>
            <p className="mt-1 text-sidebar-muted">
              Solo necesitas tu correo institucional para empezar.
            </p>
          </div>
        </div>

        <div className="p-8 md:p-10">
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Crear cuenta
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Completa tus datos para continuar
          </p>

          <form action={action} className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="nombre"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Nombre completo
              </Label>
              <div className="flex items-center gap-2 rounded-xl border border-input bg-background px-3 focus-within:ring-1 focus-within:ring-ring">
                <User className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="nombre"
                  name="nombre"
                  type="text"
                  autoComplete="name"
                  required
                  placeholder="Nombre Apellido"
                  className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                />
              </div>
              {state?.errors?.nombre && (
                <p className="text-xs text-destructive">{state.errors.nombre[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Correo
              </Label>
              <div className="flex items-center gap-2 rounded-xl border border-input bg-background px-3 focus-within:ring-1 focus-within:ring-ring">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="usuario@institucion.edu"
                  className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                />
              </div>
              {state?.errors?.email && (
                <p className="text-xs text-destructive">{state.errors.email[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Contrasena
              </Label>
              <div className="flex items-center gap-2 rounded-xl border border-input bg-background px-3 focus-within:ring-1 focus-within:ring-ring">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="••••••••"
                  className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                />
              </div>
              {state?.errors?.password && (
                <ul className="text-xs text-destructive space-y-0.5">
                  {state.errors.password.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              )}
            </div>

            {state?.message && (
              <p className="text-sm text-destructive">{state.message}</p>
            )}

            <Button
              type="submit"
              disabled={pending}
              className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-accent-foreground hover:bg-accent/90 h-auto"
            >
              {pending ? "Creando..." : "Crear cuenta"}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Ya tienes cuenta?{" "}
            <Link
              href="/login"
              className="font-semibold text-foreground hover:underline"
            >
              Inicia sesion
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
