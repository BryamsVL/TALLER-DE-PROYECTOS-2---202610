import type { ReactNode } from "react";

export function SectionCard({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-3xl bg-card p-6 shadow-card ${className}`}>
      {(title || action) && (
        <header className="mb-5 flex items-start justify-between gap-4">
          <div>
            {title && (
              <h2 className="font-display text-lg font-semibold tracking-tight">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function Pill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "success" | "warning" | "info" | "neutral" | "danger";
}) {
  const tones: Record<string, string> = {
    success: "bg-success/20 text-success-foreground",
    warning: "bg-warning/30 text-warning-foreground",
    info: "bg-info/25 text-info-foreground",
    neutral: "bg-muted text-muted-foreground",
    danger: "bg-destructive/15 text-destructive",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
