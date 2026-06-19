"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Eye, EyeOff, Lock, Mail, User, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/app/actions/auth";

function getConfirmBorderClass(confirmTouched: boolean, passwordsMatch: boolean) {
  if (!confirmTouched) return "border-input focus-within:ring-ring";
  return passwordsMatch
    ? "border-green-500 focus-within:ring-green-500"
    : "border-destructive focus-within:ring-destructive";
}

function getErrorId(field: string, hasError: boolean) {
  return hasError ? `register-${field}-error` : undefined;
}

export default function RegisterPage() {
  const [state, action, pending] = useActionState(signUp, undefined);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const nombreErrorId = getErrorId("nombre", !!state?.errors?.nombre);
  const emailErrorId = getErrorId("email", !!state?.errors?.email);
  const passwordErrorId = getErrorId("password", !!state?.errors?.password);
  const formErrorId = getErrorId("form", !!state?.message);

  const confirmTouched = confirm.length > 0;
  const passwordsMatch = password === confirm;
  const canSubmit = password.length > 0 && confirmTouched && passwordsMatch;

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
                  aria-invalid={state?.errors?.nombre ? "true" : undefined}
                  aria-describedby={nombreErrorId}
                  className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                />
              </div>
              {state?.errors?.nombre && (
                <p id={nombreErrorId} className="text-xs text-destructive">
                  {state.errors.nombre[0]}
                </p>
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
                  aria-invalid={state?.errors?.email ? "true" : undefined}
                  aria-describedby={emailErrorId}
                  className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                />
              </div>
              {state?.errors?.email && (
                <p id={emailErrorId} className="text-xs text-destructive">
                  {state.errors.email[0]}
                </p>
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
                  autoComplete="new-password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={state?.errors?.password ? "true" : undefined}
                  aria-describedby={passwordErrorId}
                  className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-pressed={showPassword}
                  aria-label={
                    showPassword ? "Ocultar contrasena" : "Mostrar contrasena"
                  }
                  title={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
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
                <ul
                  id={passwordErrorId}
                  className="text-xs text-destructive space-y-0.5"
                >
                  {state.errors.password.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="confirm-password"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Confirmar contrasena
              </Label>
              <div
                className={`flex items-center gap-2 rounded-xl border bg-background px-3 focus-within:ring-1 ${getConfirmBorderClass(
                  confirmTouched,
                  passwordsMatch
                )}`}
              >
                <Lock className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirm-password"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-pressed={showConfirm}
                  aria-label={
                    showConfirm ? "Ocultar contrasena" : "Mostrar contrasena"
                  }
                  title={showConfirm ? "Ocultar contrasena" : "Mostrar contrasena"}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {showConfirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {confirmTouched && (
                <p
                  className={`flex items-center gap-1 text-xs ${passwordsMatch ? "text-green-600" : "text-destructive"
                    }`}
                >
                  {passwordsMatch ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Las contrasenas coinciden
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3.5 w-3.5" />
                      Las contrasenas no coinciden
                    </>
                  )}
                </p>
              )}
            </div>

            {state?.message && (
              <p
                id={formErrorId}
                className="text-sm text-destructive"
                role="alert"
                aria-live="polite"
              >
                {state.message}
              </p>
            )}

            <Button
              type="submit"
              disabled={pending || !canSubmit}
              aria-describedby={formErrorId}
              className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-accent-foreground hover:bg-accent/90 h-auto disabled:opacity-60"
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
