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
    href: "/admin/carreras",
    titulo: "Carreras",
    descripcion: "Catalogo de carreras de la facultad.",
    estado: "disponible",
  },
  {
    href: "/admin/aulas",
    titulo: "Aulas",
    descripcion: "Espacios fisicos: teoria, laboratorio, auditorio.",
    estado: "proximamente",
  },
  {
    href: "/admin/profesores",
    titulo: "Profesores",
    descripcion: "Plantel docente y tipo de contrato.",
    estado: "proximamente",
  },
  {
    href: "/admin/cursos",
    titulo: "Cursos",
    descripcion: "Malla curricular: nombre, horas semanales, tipo de aula.",
    estado: "proximamente",
  },
  {
    href: "/admin/cohortes",
    titulo: "Cohortes",
    descripcion: "Secciones de alumnos por carrera, ciclo y nivel.",
    estado: "proximamente",
  },
  {
    href: "/admin/asignaciones",
    titulo: "Curso a Profesor",
    descripcion: "Que profesor puede dictar que curso.",
    estado: "proximamente",
  },
  {
    href: "/admin/horarios",
    titulo: "Generar horario",
    descripcion: "Disparar el algoritmo CSP y revisar el resultado.",
    estado: "proximamente",
  },
];

export default async function AdminHomePage() {
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
            SGOHA — Admin / Coordinador
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
          Modulos de gestion academica.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULOS.map((m) => {
            const isDisponible = m.estado === "disponible";
            const cardClass = isDisponible
              ? "rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
              : "rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100/60 dark:bg-zinc-900/40 p-5 cursor-not-allowed";
            return isDisponible ? (
              <Link key={m.href} href={m.href} className={cardClass}>
                <div className="text-base font-semibold text-zinc-900 dark:text-zinc-50 mb-1">
                  {m.titulo}
                </div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  {m.descripcion}
                </div>
                <div className="mt-3 text-xs text-emerald-700 dark:text-emerald-400">
                  Disponible
                </div>
              </Link>
            ) : (
              <div key={m.href} className={cardClass}>
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
            );
          })}
        </div>
      </main>
    </div>
  );
}
