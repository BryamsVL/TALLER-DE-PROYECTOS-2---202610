import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

interface Modulo {
  href: string;
  titulo: string;
  descripcion: string;
  estado: "disponible" | "proximamente";
}

const MODULOS: Modulo[] = [
  {
    href: "/docente/horario",
    titulo: "Mi horario",
    descripcion: "Cursos asignados, dias, bloques y aulas para el ciclo activo.",
    estado: "proximamente",
  },
  {
    href: "/docente/disponibilidad",
    titulo: "Mi disponibilidad",
    descripcion:
      "Marca los turnos por dia (manana / tarde / noche) en los que puedes dictar clase.",
    estado: "proximamente",
  },
];

export default async function DocenteHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            SGOHA — Docente
          </h1>
          <Link
            href="/dashboard"
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
          >
            Cambiar de rol
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
          Tu vista como docente.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {MODULOS.map((m) => (
            <div
              key={m.href}
              className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100/60 dark:bg-zinc-900/40 p-5 cursor-not-allowed"
            >
              <div className="text-base font-semibold text-zinc-700 dark:text-zinc-400 mb-1">
                {m.titulo}
              </div>
              <div className="text-sm text-zinc-500 dark:text-zinc-500">
                {m.descripcion}
              </div>
              <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-500">
                Proximamente
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
