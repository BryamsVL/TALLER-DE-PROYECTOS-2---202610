import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";

// MODO PROTOTIPO: el dashboard ofrece previsualizar las 3 vistas de rol
// (Admin, Docente, Estudiante) sin imponer restricciones de autorizacion.
// Cuando se conecten las restricciones reales, este selector se reemplaza
// por una redireccion automatica al area que corresponda al rol del usuario.

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex flex-col">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="max-w-5xl mx-auto w-full px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            SGOHA
          </h1>
          <form action={signOut}>
            <button
              type="submit"
              className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
            >
              Cerrar sesion
            </button>
          </form>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="text-center max-w-3xl w-full">
          <p className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
            Modo prototipo
          </p>
          <h2 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
            Selecciona el rol a previsualizar
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mb-12">
            Cada vista muestra la interfaz que vera ese tipo de usuario. Las
            restricciones reales por rol se activaran mas adelante.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/admin"
              className="group rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 text-left hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
            >
              <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
                ROL 1
              </div>
              <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-1">
                Admin / Coordinador
              </div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                Gestiona carreras, cursos, aulas, profesores y genera horarios.
              </div>
              <div className="mt-4 text-sm text-zinc-900 dark:text-zinc-50 group-hover:underline">
                Ingresar →
              </div>
            </Link>

            <Link
              href="/docente"
              className="group rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 text-left hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
            >
              <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
                ROL 2
              </div>
              <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-1">
                Docente
              </div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                Consulta su horario y registra su disponibilidad semanal.
              </div>
              <div className="mt-4 text-sm text-zinc-900 dark:text-zinc-50 group-hover:underline">
                Ingresar →
              </div>
            </Link>

            <Link
              href="/estudiante"
              className="group rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 text-left hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
            >
              <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
                ROL 3
              </div>
              <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-1">
                Estudiante
              </div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                Ve sus inscripciones, su horario y solicita cambios.
              </div>
              <div className="mt-4 text-sm text-zinc-900 dark:text-zinc-50 group-hover:underline">
                Ingresar →
              </div>
            </Link>
          </div>

          <p className="mt-10 text-xs text-zinc-500 dark:text-zinc-400">
            Sesion activa: {user.email}
          </p>
        </div>
      </main>
    </div>
  );
}
