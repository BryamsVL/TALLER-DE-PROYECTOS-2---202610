import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  BookOpen,
  DoorOpen,
  CalendarRange,
  GraduationCap,
  CalendarClock,
  Calendar,
  FileBarChart2,
  ShieldCheck,
  LogOut,
  Search,
  Bell,
} from "lucide-react";
import type { ComponentType } from "react";

type NavItem = {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

const mainNav: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/courses", label: "Cursos", icon: BookOpen },
  { to: "/classrooms", label: "Aulas", icon: DoorOpen },
  { to: "/periods", label: "Períodos", icon: CalendarRange },
  { to: "/enrollment", label: "Matrícula", icon: GraduationCap },
  { to: "/scheduler", label: "Generador CSP", icon: CalendarClock },
  { to: "/calendar", label: "Calendario", icon: Calendar },
  { to: "/reports", label: "Reportes", icon: FileBarChart2 },
  { to: "/audit", label: "Auditoría", icon: ShieldCheck },
];

function SidebarLink({ item }: { item: NavItem }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const active = pathname === item.to;
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
        active
          ? "bg-sidebar-active text-sidebar-active-foreground shadow-soft"
          : "text-sidebar-muted hover:bg-sidebar-active/60 hover:text-sidebar-active-foreground"
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{item.label}</span>
    </Link>
  );
}

function Sidebar() {
  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-4 lg:left-4 rounded-3xl bg-sidebar text-sidebar-foreground p-6">
      <div className="flex items-center gap-2 px-2 pb-8">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-accent-foreground font-bold">
          S
        </div>
        <div>
          <p className="text-base font-bold tracking-tight text-sidebar-active-foreground">
            SGOHA
          </p>
          <p className="text-[10px] uppercase tracking-[0.18em] text-sidebar-muted">
            Academic OS
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {mainNav.map((item) => (
          <SidebarLink key={item.to} item={item} />
        ))}
      </nav>

      <div className="mt-6 border-t border-sidebar-border pt-4">
        <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-sidebar-muted transition-colors hover:bg-sidebar-active/60 hover:text-sidebar-active-foreground">
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="flex flex-col gap-4 pb-6 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-full bg-card px-4 py-2 shadow-soft md:flex">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Buscar curso, docente, aula…"
            className="w-56 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <button className="grid h-10 w-10 place-items-center rounded-full bg-card shadow-soft">
          <Bell className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-3 rounded-full bg-card px-3 py-1.5 shadow-soft">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-accent font-semibold text-accent-foreground">
            DT
          </div>
          <div className="pr-2 text-right">
            <p className="text-sm font-semibold leading-tight">David Taylor</p>
            <p className="text-[11px] text-muted-foreground">Coordinador</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return <TopBar title={title} subtitle={subtitle} />;
}

export default function AppLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname === "/login") {
    return <Outlet />;
  }
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="px-4 py-4 lg:pl-[19.5rem] lg:pr-6">
        <Outlet />
      </main>
    </div>
  );
}
