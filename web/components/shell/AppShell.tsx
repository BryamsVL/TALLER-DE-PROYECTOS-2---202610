"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  BookMarked,
  Building2,
  Calendar,
  CalendarClock,
  ChevronsLeftRight,
  Clock,
  DoorOpen,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Link2,
  LogOut,
  Users,
} from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

const NAV_ICONS = {
  bookMarked: BookMarked,
  building: Building2,
  calendar: Calendar,
  calendarClock: CalendarClock,
  clock: Clock,
  door: DoorOpen,
  fileText: FileText,
  graduationCap: GraduationCap,
  layoutDashboard: LayoutDashboard,
  link: Link2,
  users: Users,
} satisfies Record<string, LucideIcon>;

export type NavIconName = keyof typeof NAV_ICONS;

export interface NavItem {
  href: string;
  label: string;
  icon: NavIconName;
  exact?: boolean;
}

interface AppShellProps {
  roleLabel: string;
  userEmail: string;
  navItems: NavItem[];
  children: React.ReactNode;
}

function isActive(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function SidebarLink({
  item,
  active,
}: {
  item: NavItem;
  active: boolean;
}) {
  const Icon = NAV_ICONS[item.icon];

  return (
    <Link
      href={item.href}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
        active
          ? "bg-sidebar-active text-sidebar-active-foreground shadow-soft"
          : "text-sidebar-muted hover:bg-sidebar-active/60 hover:text-sidebar-active-foreground",
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{item.label}</span>
    </Link>
  );
}

function Sidebar({
  roleLabel,
  navItems,
  pathname,
}: {
  roleLabel: string;
  navItems: NavItem[];
  pathname: string;
}) {
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
            {roleLabel}
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <SidebarLink
            key={item.href}
            item={item}
            active={isActive(pathname, item)}
          />
        ))}
      </nav>

      <div className="mt-6 border-t border-sidebar-border pt-4 space-y-1">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-sidebar-muted transition-colors hover:bg-sidebar-active/60 hover:text-sidebar-active-foreground"
        >
          <ChevronsLeftRight className="h-4 w-4" />
          Cambiar de rol
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-sidebar-muted transition-colors hover:bg-sidebar-active/60 hover:text-sidebar-active-foreground"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesion
          </button>
        </form>
      </div>
    </aside>
  );
}

function MobileBar({
  roleLabel,
  userEmail,
}: {
  roleLabel: string;
  userEmail: string;
}) {
  return (
    <div className="lg:hidden flex items-center justify-between rounded-2xl bg-sidebar text-sidebar-foreground px-4 py-3 mb-4">
      <div className="flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-accent-foreground font-bold text-sm">
          S
        </div>
        <div>
          <p className="text-sm font-bold text-sidebar-active-foreground">
            SGOHA
          </p>
          <p className="text-[10px] uppercase tracking-[0.18em] text-sidebar-muted">
            {roleLabel}
          </p>
        </div>
      </div>
      <Link
        href="/dashboard"
        className="text-xs text-sidebar-muted hover:text-sidebar-active-foreground"
      >
        Cambiar
      </Link>
      <span className="sr-only">{userEmail}</span>
    </div>
  );
}

export function AppShell({
  roleLabel,
  userEmail,
  navItems,
  children,
}: AppShellProps) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        roleLabel={roleLabel}
        navItems={navItems}
        pathname={pathname}
      />
      <main className="px-4 py-4 lg:pl-[19.5rem] lg:pr-6">
        <MobileBar roleLabel={roleLabel} userEmail={userEmail} />
        {children}
      </main>
    </div>
  );
}
