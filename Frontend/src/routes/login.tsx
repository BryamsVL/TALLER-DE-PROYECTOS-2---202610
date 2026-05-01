import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock, Mail } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
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
              Optimiza tu calendario académico con CSP.
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Matrícula, horarios y reportes en una sola plataforma para
              coordinación, docentes y estudiantes.
            </p>
          </div>
          <div className="rounded-2xl border border-sidebar-border bg-sidebar-active p-4 text-xs">
            <p className="font-semibold text-sidebar-active-foreground">
              99.4% de cursos asignados
            </p>
            <p className="mt-1 text-sidebar-muted">
              Promedio del último período usando OR-Tools.
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

          <form className="mt-8 space-y-4">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Correo
              </span>
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2.5">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  className="w-full bg-transparent text-sm outline-none"
                  placeholder="usuario@institucion.edu"
                />
              </div>
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Contraseña
              </span>
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2.5">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  className="w-full bg-transparent text-sm outline-none"
                  placeholder="••••••••"
                />
              </div>
            </label>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-muted-foreground">
                <input type="checkbox" className="h-3.5 w-3.5" /> Recordarme
              </label>
              <a className="font-semibold text-foreground hover:underline" href="#">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button
              type="button"
              className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
            >
              Ingresar
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            ¿Sin cuenta?{" "}
            <Link to="/" className="font-semibold text-foreground hover:underline">
              Solicitar acceso
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
