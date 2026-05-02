import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions/auth";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: perfil } = await supabase
    .from("perfil")
    .select("nombre, rol")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
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

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Hola, {perfil?.nombre ?? user.email}
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Rol: <span className="font-medium">{perfil?.rol ?? "sin perfil"}</span>
          </p>
          <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-500">
            Sprint 1 en construccion. Las funcionalidades de gestion academica se
            agregaran proximamente.
          </p>

          {(perfil?.rol === "ADMIN" || perfil?.rol === "COORDINADOR") && (
            <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                Administracion
              </h3>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/admin/carreras"
                  className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-1.5 text-sm text-zinc-900 dark:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Carreras
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
