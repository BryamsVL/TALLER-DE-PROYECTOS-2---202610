import type { ComponentType, ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

type Trend = "up" | "down" | "neutral";

export function StatCard({
  label,
  value,
  delta,
  trend = "up",
  caption,
  icon: Icon,
  iconClass = "bg-accent/20 text-accent-foreground",
  chart,
}: {
  label: string;
  value: string;
  delta?: string;
  trend?: Trend;
  caption?: string;
  icon: ComponentType<{ className?: string }>;
  iconClass?: string;
  chart?: ReactNode;
}) {
  const trendStyles: Record<Trend, string> = {
    up: "bg-success/20 text-success-foreground",
    down: "bg-destructive/15 text-destructive",
    neutral: "bg-muted text-muted-foreground",
  };
  return (
    <div className="rounded-3xl bg-card p-6 shadow-card">
      <div className="flex items-center justify-between">
        <div className={`grid h-10 w-10 place-items-center rounded-xl ${iconClass}`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="mt-5 flex items-end justify-between gap-4">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-bold tracking-tight">{value}</span>
            {delta && (
              <span
                className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${trendStyles[trend]}`}
              >
                {trend === "up" ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : trend === "down" ? (
                  <ArrowDownRight className="h-3 w-3" />
                ) : null}
                {delta}
              </span>
            )}
          </div>
          {caption && (
            <p className="mt-2 text-xs text-muted-foreground">{caption}</p>
          )}
        </div>
        {chart && <div className="h-12 w-20">{chart}</div>}
      </div>
    </div>
  );
}
