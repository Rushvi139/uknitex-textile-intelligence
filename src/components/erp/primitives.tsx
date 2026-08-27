import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------- Status pill ---------- */

const toneMap: Record<string, string> = {
  success: "bg-success-soft text-success border-success/25",
  warn: "bg-warn-soft text-warn border-warn/25",
  danger: "bg-danger-soft text-danger border-danger/25",
  info: "bg-info-soft text-info border-info/25",
  ai: "bg-ai-soft text-ai border-ai/25",
  neutral: "bg-muted text-muted-foreground border-border",
};

export function Pill({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: keyof typeof toneMap;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-sm border px-1.5 py-0.5 text-[11px] font-medium leading-4",
        toneMap[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function statusTone(status: string): keyof typeof toneMap {
  switch (status) {
    case "Available":
    case "Completed":
    case "Passed":
    case "On time":
    case "Closed":
      return "success";
    case "Partially Received":
    case "Awaiting QC":
    case "Decision Pending":
    case "Due today":
    case "Part covered":
    case "Awaiting stock":
      return "warn";
    case "Damaged":
    case "Rejected":
    case "Delayed":
      return "danger";
    case "In Transit":
    case "In Progress":
    case "In QC":
    case "Issued":
    case "Dispatched":
      return "info";
    case "Reserved":
      return "ai";
    default:
      return "neutral";
  }
}

/* ---------- Panel ---------- */

export function Panel({
  title,
  subtitle,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("flex flex-col rounded-md border border-border bg-surface", className)}>
      {(title || action) && (
        <header className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
          <div className="min-w-0">
            {title && <h2 className="text-sm font-semibold tracking-tight">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div className={cn("flex-1 px-4 py-3", bodyClassName)}>{children}</div>
    </section>
  );
}

/* ---------- KPI ---------- */

export function KpiCard({
  label,
  value,
  delta,
  dir,
  note,
  className,
}: {
  label: string;
  value: string;
  delta?: string;
  dir?: "up" | "down";
  note?: string;
  className?: string;
}) {
  const Icon = dir === "down" ? ArrowDownRight : ArrowUpRight;
  return (
    <div className={cn("rounded-md border border-border bg-surface px-4 py-3", className)}>
      <p className="label-caps">{label}</p>
      <p className="num mt-2 text-2xl font-semibold leading-none">{value}</p>
      <div className="mt-2 flex items-center gap-2 text-xs">
        {delta && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-medium",
              dir === "down" ? "text-danger" : "text-success",
            )}
          >
            <Icon className="size-3" />
            {delta}
          </span>
        )}
        {note && <span className="truncate text-muted-foreground">{note}</span>}
      </div>
    </div>
  );
}

/* ---------- AI marker ---------- */

export function AiTag({ children = "AI" }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-sm border border-ai/25 bg-ai-soft px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-ai">
      <Sparkles className="size-2.5" />
      {children}
    </span>
  );
}

export function Confidence({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
      <span className="relative h-1 w-10 overflow-hidden rounded-full bg-muted">
        <span className="absolute inset-y-0 left-0 bg-ai" style={{ width: `${value}%` }} />
      </span>
      <span className="num">{value}%</span>
    </span>
  );
}

export function SourceChip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-sm border border-border bg-surface-sunken px-1.5 py-0.5 text-[10px] text-muted-foreground">
      {children}
    </span>
  );
}

/* ---------- Bar ---------- */

export function MiniBar({ pct, tone = "primary" }: { pct: number; tone?: "primary" | "warn" | "danger" }) {
  const bg = tone === "danger" ? "bg-danger" : tone === "warn" ? "bg-warn" : "bg-primary";
  return (
    <span className="flex items-center gap-2">
      <span className="relative h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <span className={cn("absolute inset-y-0 left-0 rounded-full", bg)} style={{ width: `${pct}%` }} />
      </span>
      <span className="num text-xs text-muted-foreground">{pct}%</span>
    </span>
  );
}

/* ---------- Table shells ---------- */

export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        "whitespace-nowrap border-b border-border bg-surface-sunken px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({ children, className }: { children?: ReactNode; className?: string }) {
  return <td className={cn("whitespace-nowrap border-b border-border px-3 py-2.5 text-sm", className)}>{children}</td>;
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="label-caps">{eyebrow}</p>}
        <h1 className="mt-1 text-[26px] font-semibold leading-tight tracking-[-0.02em]">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
