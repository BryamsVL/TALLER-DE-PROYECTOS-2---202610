import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Building2,
  CalendarDays,
  CalendarCheck,
  DoorOpen,
  GraduationCap,
  Users,
  UserCircle,
  TrendingUp,
  ShieldCheck,
  Settings2,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/card";

export default async function AdminHomePage() {
  const [
    carrerasTotal,
    cursosTotal,
    profesoresTotal,
    estudiantesTotal,
    aulasActivas,
    periodoActivo,
    ultimosCursos,
  ] = await Promise.all([
    prisma.carrera.count(),
    prisma.course.count({ where: { isActive: true } }),
    prisma.teacher.count(),
    prisma.student.count(),
    prisma.classroom.count({ where: { isActive: true } }),
    prisma.academicPeriod.findFirst({
      where: { isActive: true },
      select: { id: true, name: true, code: true, startsAt: true, endsAt: true },
    }),
    prisma.course.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, code: true, name: true, cycle: true, createdAt: true },
    }),
  ]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const STAT_CARDS = [
    { label: "Estudiantes", value: estudiantesTotal.toString(), sub: "Matriculados en el sistema.", icon: <Users className="h-5 w-5" />, href: "/admin/estudiantes" },
    { label: "Profesores", value: profesoresTotal.toString(), sub: "Plantilla docente disponible.", icon: <GraduationCap className="h-5 w-5" />, href: "/admin/profesores" },
    { label: "Cursos", value: cursosTotal.toString(), sub: "Catálogo activo de la malla.", icon: <BookOpen className="h-5 w-5" />, href: "/admin/cursos" },
    { label: "Aulas", value: aulasActivas.toString(), sub: "Espacios físicos habilitados.", icon: <DoorOpen className="h-5 w-5" />, href: "/admin/aulas" },
    { label: "Carreras", value: carrerasTotal.toString(), sub: "Programas académicos.", icon: <Building2 className="h-5 w-5" />, href: "/admin/carreras" },
    { label: "Períodos", value: periodoActivo ? "1" : "0", sub: "Ciclos configurados.", icon: <CalendarDays className="h-5 w-5" />, href: "/admin/academic-periods" },
  ];

  const QUICK_LINKS = [
    { title: "Gestión de Estudiantes", description: "Revisa y administra los estudiantes matriculados y sus perfiles.", href: "/admin/estudiantes", icon: <Users className="h-5 w-5" /> },
    { title: "Plantilla Docente", description: "Configura contratos, disponibilidad y departamentos de profesores.", href: "/admin/profesores", icon: <GraduationCap className="h-5 w-5" /> },
    { title: "Catálogo de Cursos", description: "Modifica la malla curricular, créditos y tipo de aula requerida.", href: "/admin/cursos", icon: <BookOpen className="h-5 w-5" /> },
    { title: "Aulas y Laboratorios", description: "Administra capacidad, tipo y disponibilidad de los espacios.", href: "/admin/aulas", icon: <DoorOpen className="h-5 w-5" /> },
    { title: "Programas Académicos", description: "Gestiona las carreras y los créditos requeridos para egresar.", href: "/admin/carreras", icon: <Building2 className="h-5 w-5" /> },
  ];

  const SYSTEM_CARDS = [
    { label: "Período Activo", value: periodoActivo ? periodoActivo.name : "Ninguno", icon: <TrendingUp className="h-4 w-4" /> },
    { label: "Estado del Motor CSP", value: "En línea", icon: <ShieldCheck className="h-4 w-4" />, accent: true },
    { label: "Versión del Sistema", value: "v2.1.0", icon: <Settings2 className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-10">
      <header>
        <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
          Panel de Administración
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Vista general del estado académico para preparar carreras, cursos, docentes y aulas antes de generar horarios.
        </p>
      </header>

      {/* Métricas principales */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {STAT_CARDS.map((card) => (
          <Link key={card.label} href={card.href} className="group block h-full">
            <Card className="h-full p-5 bg-white dark:bg-[#1a1a1a] border border-gray-100 shadow-sm rounded-xl hover:border-gray-300 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-50 text-purple-700"
                >
                  {card.icon}
                </div>
                <ArrowRight
                  className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors group-hover:translate-x-1 transform"
                />
              </div>
              <p className="text-3xl font-bold tracking-tight text-gray-900">
                {card.value}
              </p>
              <p className="text-xs text-gray-500 mt-1 font-semibold uppercase tracking-wide">
                {card.label}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">{card.sub}</p>
            </Card>
          </Link>
        ))}
      </div>

      {/* Acciones rápidas y Sistema */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Módulos de gestión */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
            Módulos del Sistema
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {QUICK_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="group block">
                <Card className="p-4 bg-white border border-gray-100 shadow-sm rounded-xl hover:border-purple-200 hover:shadow-md transition-all">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5 bg-purple-50 text-purple-700"
                    >
                      {link.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-gray-900 mb-1 group-hover:text-purple-700 transition-colors">
                        {link.title}
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {link.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Estado del sistema */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
            Estado Actual
          </h2>
          <Card className="p-5 bg-white border border-gray-100 shadow-sm rounded-xl divide-y divide-gray-50">
            {SYSTEM_CARDS.map((item) => (
              <div key={item.label} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <span className="text-gray-400">{item.icon}</span>
                  <span className="text-sm font-medium text-gray-600">{item.label}</span>
                </div>
                <span
                  className={`text-sm font-bold ${item.accent ? 'text-green-600' : 'text-gray-900'}`}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </Card>

          {periodoActivo && (
            <div className="mt-4 rounded-xl p-5 border bg-purple-50 border-purple-100">
              <p className="text-xs font-bold mb-1 text-purple-700 uppercase tracking-wider">
                Configuración Activa
              </p>
              <p className="text-sm font-semibold text-gray-900 mb-1">
                {periodoActivo.name} ({periodoActivo.code})
              </p>
              <p className="text-xs text-purple-600/80 leading-relaxed">
                Vigencia: {formatDate(periodoActivo.startsAt)} al {formatDate(periodoActivo.endsAt)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
