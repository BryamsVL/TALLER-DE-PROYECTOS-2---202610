import Link from "next/link";
import {
  ArrowRight,
  BookMarked,
  Building2,
  CalendarClock,
  GraduationCap,
  Link2,
  School,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";

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
    descripcion: "Catalogo base para ordenar cohortes y cursos.",
    estado: "disponible",
  },
  {
    href: "/admin/aulas",
    titulo: "Aulas",
    descripcion: "Espacios fisicos, tipo y capacidad para el horario.",
    estado: "disponible",
  },
  {
    href: "/admin/profesores",
    titulo: "Profesores",
    descripcion: "Plantel docente y tipo de contrato.",
    estado: "disponible",
  },
  {
    href: "/admin/cursos",
    titulo: "Cursos",
    descripcion: "Malla curricular por carrera, nivel y tipo de aula.",
    estado: "disponible",
  },
  {
    href: "/admin/cohortes",
    titulo: "Cohortes",
    descripcion: "Secciones por carrera, ciclo y nivel.",
    estado: "proximamente",
  },
  {
    href: "/admin/asignaciones",
    titulo: "Curso a Profesor",
    descripcion: "Habilita que docentes pueden dictar cada curso.",
    estado: "disponible",
  },
  {
    href: "/admin/horarios",
    titulo: "Generar horario",
    descripcion: "Lanzar el CSP y revisar el resultado del ciclo activo.",
    estado: "proximamente",
  },
] as const;

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export default async function AdminHomePage() {
  const supabase = await createClient();

  const [
    { count: carrerasTotal },
    { count: cursosTotal },
    { count: profesoresTotal },
    { count: aulasActivas },
    { data: cicloActivo },
    { data: ultimosCursos },
  ] = await Promise.all([
    supabase.from("carrera").select("*", { count: "exact", head: true }),
    supabase.from("curso").select("*", { count: "exact", head: true }).eq("activo", true),
    supabase.from("profesor").select("*", { count: "exact", head: true }),
    supabase.from("aula").select("*", { count: "exact", head: true }).eq("activo", true),
    supabase
      .from("ciclo")
      .select("id, nombre, fecha_inicio, fecha_fin, prefijo_nrc")
      .eq("activo", true)
      .maybeSingle(),
    supabase
      .from("curso")
      .select("id, codigo, nombre, nivel, created_at, carrera:carrera_id(nombre)")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline">Panel admin</Badge>
          {cicloActivo ? (
            <Badge className="bg-success/20 text-success-foreground hover:bg-success/20">
              Ciclo activo
            </Badge>
          ) : (
            <Badge variant="outline">Sin ciclo activo</Badge>
          )}
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
          Inicio
        </h1>
        <p className="text-sm text-muted-foreground">
          Vista general del estado academico para preparar carreras, cursos, docentes y
          asignaciones antes de generar horarios.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Carreras"
          value={String(carrerasTotal ?? 0)}
          caption="Catalogos academicos creados"
          icon={Building2}
        />
        <StatCard
          label="Cursos activos"
          value={String(cursosTotal ?? 0)}
          caption="Oferta disponible para planificacion"
          icon={BookMarked}
          iconClass="bg-amber-100 text-amber-700"
        />
        <StatCard
          label="Profesores"
          value={String(profesoresTotal ?? 0)}
          caption="Docentes registrados en el sistema"
          icon={Users}
          iconClass="bg-emerald-100 text-emerald-700"
        />
        <StatCard
          label="Aulas activas"
          value={String(aulasActivas ?? 0)}
          caption="Espacios habilitados para asignacion"
          icon={School}
          iconClass="bg-sky-100 text-sky-700"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.3fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-base">Estado del ciclo</CardTitle>
            <CardDescription>
              El generador de horarios depende de un ciclo activo y de catalogos consistentes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {cicloActivo ? (
              <div className="rounded-xl border border-border bg-background p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-display text-xl font-bold">{cicloActivo.nombre}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Prefijo NRC {cicloActivo.prefijo_nrc} | {formatDate(cicloActivo.fecha_inicio)} al{" "}
                      {formatDate(cicloActivo.fecha_fin)}
                    </p>
                  </div>
                  <CalendarClock className="h-5 w-5 text-accent-foreground" />
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-background p-4 text-sm text-muted-foreground">
                Todavia no hay un ciclo marcado como activo. Antes de generar horarios, el proyecto
                necesita un ciclo vigente y las relaciones curso-profesor preparadas.
              </div>
            )}

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-xl bg-muted/50 p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Siguiente paso
                </p>
                <p className="mt-2 text-sm font-medium">Completar cohortes por carrera y nivel.</p>
              </div>
              <div className="rounded-xl bg-muted/50 p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Requisito
                </p>
                <p className="mt-2 text-sm font-medium">
                  Confirmar que cada curso tenga al menos un profesor asignado.
                </p>
              </div>
              <div className="rounded-xl bg-muted/50 p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Bloqueo actual
                </p>
                <p className="mt-2 text-sm font-medium">
                  El modulo de cohortes y generacion aun falta completarse.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-base">Actividad reciente</CardTitle>
            <CardDescription>Ultimos cursos registrados en la base de datos.</CardDescription>
          </CardHeader>
          <CardContent>
            {!ultimosCursos || ultimosCursos.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Aun no hay cursos registrados.
              </p>
            ) : (
              <div className="space-y-3">
                {ultimosCursos.map((curso) => (
                  <div
                    key={curso.id}
                    className="flex items-start justify-between gap-3 rounded-xl border border-border bg-background p-3"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">
                        {curso.codigo} - {curso.nombre}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Nivel {curso.nivel} | {curso.carrera?.[0]?.nombre ?? "Sin carrera"}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatDate(curso.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <div className="mb-3">
          <h2 className="font-display text-lg font-bold tracking-tight">Accesos rapidos</h2>
          <p className="text-sm text-muted-foreground">
            Modulos disponibles para preparar la informacion del horario.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {MODULOS.map((modulo) => {
            const isDisponible = modulo.estado === "disponible";
            const content = (
              <Card
                className={
                  isDisponible
                    ? "h-full transition-colors hover:border-accent"
                    : "h-full cursor-not-allowed opacity-60"
                }
              >
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="font-display text-base">{modulo.titulo}</CardTitle>
                    {isDisponible ? (
                      <Badge variant="secondary" className="bg-success/20 text-success-foreground">
                        Disponible
                      </Badge>
                    ) : (
                      <Badge variant="outline">Proximamente</Badge>
                    )}
                  </div>
                  <CardDescription>{modulo.descripcion}</CardDescription>
                  <div className="flex items-center gap-1 text-sm font-medium text-foreground">
                    Abrir
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            );

            return isDisponible ? (
              <Link key={modulo.href} href={modulo.href} className="block">
                {content}
              </Link>
            ) : (
              <div key={modulo.href}>{content}</div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-base">Cobertura docente</CardTitle>
            <CardDescription>Relacion entre cursos y docentes disponibles.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/admin/asignaciones"
              className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-sm transition-colors hover:border-accent"
            >
              <span>Revisar asignaciones curso-profesor</span>
              <Link2 className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-base">Estructura academica</CardTitle>
            <CardDescription>Carreras y niveles que alimentan cohortes y NRCs.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/admin/carreras"
              className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-sm transition-colors hover:border-accent"
            >
              <span>Administrar carreras del sistema</span>
              <GraduationCap className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
