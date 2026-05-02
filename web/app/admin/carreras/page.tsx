import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CarreraForm } from "./CarreraForm";
import { eliminarCarrera, toggleActivoCarrera } from "./actions";

interface Carrera {
  id: number;
  nombre: string;
  activo: boolean;
  created_at: string;
}

export default async function CarrerasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Modo prototipo: no se valida el rol aqui. La BD aplica RLS sobre la
  // tabla `carrera` (policy carrera_write), asi que las escrituras solo
  // funcionan si el usuario real tiene rol ADMIN/COORDINADOR.

  const { data: carreras, error } = await supabase
    .from("carrera")
    .select("id, nombre, activo, created_at")
    .order("id", { ascending: true });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            SGOHA — Carreras
          </h1>
          <Link
            href="/admin"
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
          >
            Volver
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
            Crear carrera
          </h2>
          <CarreraForm />

          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
            Carreras registradas
          </h2>

          {error && (
            <p className="text-sm text-red-600 mb-4">
              Error cargando carreras: {error.message}
            </p>
          )}

          {!error && (!carreras || carreras.length === 0) && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Aun no hay carreras registradas.
            </p>
          )}

          {carreras && carreras.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-left text-zinc-600 dark:text-zinc-400">
                    <th className="py-2 pr-4 font-medium">ID</th>
                    <th className="py-2 pr-4 font-medium">Nombre</th>
                    <th className="py-2 pr-4 font-medium">Estado</th>
                    <th className="py-2 pr-4 font-medium text-right">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(carreras as Carrera[]).map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                    >
                      <td className="py-3 pr-4 text-zinc-500 dark:text-zinc-400">
                        {c.id}
                      </td>
                      <td className="py-3 pr-4 text-zinc-900 dark:text-zinc-50">
                        {c.nombre}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={
                            c.activo
                              ? "inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                              : "inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
                          }
                        >
                          {c.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex gap-2 justify-end">
                          <form action={toggleActivoCarrera}>
                            <input type="hidden" name="id" value={c.id} />
                            <input
                              type="hidden"
                              name="activo"
                              value={String(c.activo)}
                            />
                            <button
                              type="submit"
                              className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
                            >
                              {c.activo ? "Desactivar" : "Activar"}
                            </button>
                          </form>
                          <form action={eliminarCarrera}>
                            <input type="hidden" name="id" value={c.id} />
                            <button
                              type="submit"
                              className="text-xs text-red-600 hover:text-red-700"
                            >
                              Eliminar
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
