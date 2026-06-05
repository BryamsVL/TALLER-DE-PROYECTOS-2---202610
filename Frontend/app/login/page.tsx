"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/app/actions/auth";

export default function LoginPage() {
  const [state, action, pending] = useActionState(signIn, undefined);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Credenciales invalidas: borrar solo la contrasena, mantener el correo.
  useEffect(() => {
    if (state?.message) {
      setPassword("");
    }
  }, [state]);

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
              Optimiza tu calendario academico con CSP.
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Matricula, horarios y reportes en una sola plataforma para
              coordinacion, docentes y estudiantes.
            </p>
          </div>

          <div className="rounded-2xl border border-sidebar-border bg-sidebar-active p-4 text-xs">
            <p className="font-semibold text-sidebar-active-foreground">
              Generacion automatica con backtracking
            </p>
            <p className="mt-1 text-sidebar-muted">
              Restricciones de profesor, aula, cohorte y disponibilidad cumplidas.
            </p>
          </div>
        </div>

        <div className="p-8 md:p-10">
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Bienvenido de vuelta
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ingresa con tu cuenta institucional
          </p>

          <form action={action} className="mt-8 space-y-4">
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={
                    showPassword ? "Ocultar contrasena" : "Mostrar contrasena"
                  }
                  className="text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {state?.errors?.password && (
                <p className="text-xs text-destructive">{state.errors.password[0]}</p>
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
              {pending ? "Ingresando..." : "Ingresar"}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            No tienes cuenta?{" "}
            <Link
              href="/register"
              className="font-semibold text-foreground hover:underline"
            >
              Registrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
