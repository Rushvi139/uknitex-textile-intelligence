import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileText,
  MessageSquareText,
  PackageCheck,
  PhoneCall,
  Pin,
  Search,
  ShoppingCart,
  StickyNote,
} from "lucide-react";
import { AppShell } from "@/components/erp/AppShell";
import { PageHeader, Panel, Pill } from "@/components/erp/primitives";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/my-desk")({
  head: () => ({
    meta: [
      { title: "My Desk — UKNITEX Daily Work" },
      { name: "description", content: "A decision-first personal work desk for textile purchasing, dispatch, reminders, notes and operational follow-up." },
      { property: "og:title", content: "My Desk — UKNITEX Daily Work" },
      { property: "og:description", content: "See what needs action today, who is waiting, and the records behind each task." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MyDesk,
});

type DeskView = "Daily" | "Tasks" | "Notes" | "Reminders" | "Notifications";

const tasks = [
  { id: "D-01", desk: "Buying desk", title: "Call Star Vihan — dispatch acknowledgement still missing", meta: "PO-2026-0018 · 900 kg · promised 29 Aug", age: "2 days", level: "danger" as const, to: "/procurement" as const },
  { id: "D-02", desk: "Buying desk", title: "Two mill promises are past date", meta: "Shri Ganesh Mills and Surya Mills · ₹8.37 L exposed", age: "Today", level: "warn" as const, to: "/procurement" as const },
  { id: "D-03", desk: "Godown", title: "Print return labels for rejected rolls", meta: "QC-2026-089 · 7 rolls · 168.4 kg", age: "Before 3 PM", level: "warn" as const, to: "/quality" as const },
  { id: "D-04", desk: "Sales desk", title: "Give Nandan Apparels a credible arrival date", meta: "SO-2026-0151 · Fine Brick Knit · 800 kg", age: "Overdue", level: "danger" as const, to: "/procurement" as const },
  { id: "D-05", desk: "CRM", title: "Follow up on Agarwal Knit House quotation", meta: "LD-2026-0007 · QT-2026-0014 · ₹1,18,400", age: "Today", level: "info" as const, to: "/crm" as const },
  { id: "D-06", desk: "Accounts", title: "Send 12 cleared dispatches to billing", meta: "₹4.81 L delivered · oldest is 14 days", age: "Today", level: "warn" as const, to: "/" as const },
];

const notes = [
  { id: "N-01", title: "Hold this sales order", body: "Customer asked to pause SO-2026-0154 until shade approval arrives.", record: "SO-2026-0154", date: "23 Sep" },
  { id: "N-02", title: "Return failed roll to mill", body: "GRN-2026-0006, roll 1 failed for visible damage. Send with fault written on label.", record: "PRET-2026-0002", date: "23 Sep" },
  { id: "N-03", title: "Supplier rate conversation", body: "Bhumi agreed to review the dyeing issue and discounted rate before next purchase.", record: "PO-2026-0022", date: "19 Sep" },
];

const deskMetrics = [
  { key: "Daily" as const, label: "My daily", value: "24", note: "work items still on your desk", icon: ClipboardCheck, tone: "danger" },
  { key: "Tasks" as const, label: "My tasks", value: "6", note: "assigned directly to you", icon: CheckCircle2, tone: "primary" },
  { key: "Notes" as const, label: "My notes", value: "6", note: "written on linked records", icon: StickyNote, tone: "info" },
  { key: "Reminders" as const, label: "Reminders", value: "2", note: "have a date and time", icon: Clock3, tone: "warn" },
  { key: "Notifications" as const, label: "Notifications", value: "3", note: "changes elsewhere to know", icon: Bell, tone: "primary" },
];

function MyDesk() {
  const [view, setView] = useState<DeskView>("Daily");
  const [query, setQuery] = useState("");
  const [done, setDone] = useState<string[]>([]);
  const visibleTasks = useMemo(() => tasks.filter((t) => !done.includes(t.id) && `${t.title} ${t.meta} ${t.desk}`.toLowerCase().includes(query.toLowerCase())), [query, done]);

  return (
    <AppShell breadcrumb={["UKNITEX", "Overview", "My desk"]}>
      <div className="space-y-5">
        <PageHeader
          eyebrow="Tuesday · 29 September · Ahmedabad"
          title="My desk"
          subtitle="Everything with your name on it, ordered by consequence — not by whichever department created it."
          actions={<Pill tone="success">Live work read from records</Pill>}
        />

        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
          {deskMetrics.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setView(m.key)}
              className={cn(
                "grid min-w-0 grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-md border bg-surface px-3 py-3 text-left transition-colors",
                view === m.key ? "border-primary shadow-[inset_0_3px_0_0_var(--color-primary)]" : "border-border hover:border-border-strong",
              )}
            >
              <span className={cn("grid size-9 shrink-0 place-items-center rounded-sm", m.tone === "danger" ? "bg-danger-soft text-danger" : m.tone === "warn" ? "bg-warn-soft text-warn" : m.tone === "info" ? "bg-info-soft text-info" : "bg-accent text-primary")}>
                <m.icon className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="label-caps block truncate">{m.label}</span>
                <span className="num mt-0.5 block text-xl font-semibold leading-none">{m.value}</span>
                <span className="mt-1 block text-[11px] leading-4 text-muted-foreground">{m.note}</span>
              </span>
            </button>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-4">
            {(view === "Daily" || view === "Tasks" || view === "Reminders" || view === "Notifications") && (
              <Panel
                title={view === "Daily" ? "Today needs action" : view}
                subtitle="Oldest and highest-consequence work appears first"
                action={
                  <label className="flex h-8 items-center gap-2 rounded-sm border border-border bg-background px-2">
                    <Search className="size-3.5 text-muted-foreground" />
                    <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Find work…" className="w-32 bg-transparent text-xs outline-none" />
                  </label>
                }
                bodyClassName="p-0"
              >
                <ul className="divide-y divide-border">
                  {visibleTasks.slice(0, view === "Daily" ? 6 : undefined).map((task) => (
                    <li key={task.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 px-4 py-3 hover:bg-surface-sunken">
                      <span className={cn("mt-0.5 grid size-8 shrink-0 place-items-center rounded-sm", task.desk === "Buying desk" ? "bg-warn-soft text-warn" : task.desk === "Godown" ? "bg-info-soft text-info" : task.desk === "CRM" ? "bg-success-soft text-success" : "bg-danger-soft text-danger")}>
                        {task.desk === "Buying desk" ? <ShoppingCart className="size-4" /> : task.desk === "Godown" ? <PackageCheck className="size-4" /> : task.desk === "CRM" ? <PhoneCall className="size-4" /> : <Bell className="size-4" />}
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <p className="text-sm font-semibold">{task.title}</p>
                          <Pill tone={task.level}>{task.age}</Pill>
                        </div>
                        <p className="num mt-0.5 truncate text-[11px] text-muted-foreground">{task.desk} · {task.meta}</p>
                        <div className="mt-2 flex gap-1.5">
                          <Button variant="outline" size="sm" onClick={() => setDone((v) => [...v, task.id])}><CheckCircle2 /> Done</Button>
                          <Button variant="ghost" size="sm"><Clock3 /> Remind tomorrow</Button>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" asChild aria-label={`Open ${task.title}`}>
                        <Link to={task.to}><ArrowRight /></Link>
                      </Button>
                    </li>
                  ))}
                  {visibleTasks.length === 0 && (
                    <li className="px-4 py-12 text-center">
                      <CheckCircle2 className="mx-auto size-6 text-success" />
                      <p className="mt-2 text-sm font-semibold">This desk is clear</p>
                      <p className="text-xs text-muted-foreground">Finished work disappears; it is not replaced with an empty-looking dashboard.</p>
                    </li>
                  )}
                </ul>
              </Panel>
            )}

            {(view === "Daily" || view === "Notes") && (
              <Panel title="Notes attached to work" subtitle="Short memory, always linked back to the record" bodyClassName="p-0">
                <ul className="divide-y divide-border">
                  {notes.map((note) => (
                    <li key={note.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] gap-3 px-4 py-3">
                      <MessageSquareText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{note.title}</p>
                        <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{note.body}</p>
                      </div>
                      <span className="num text-right text-[10px] text-muted-foreground">{note.record}<br />{note.date}</span>
                    </li>
                  ))}
                </ul>
              </Panel>
            )}
          </div>

          <aside className="space-y-4 xl:sticky xl:top-[104px] xl:self-start">
            <Panel title="Desk pulse" subtitle="What changed since yesterday">
              <ul className="space-y-3">
                {[
                  { value: "2", label: "purchase promises slipped", tone: "danger" as const },
                  { value: "7", label: "rejected rolls need labels", tone: "warn" as const },
                  { value: "3", label: "CRM follow-ups became due", tone: "info" as const },
                ].map((item) => (
                  <li key={item.label} className="flex items-center gap-3">
                    <span className={cn("num grid size-8 place-items-center rounded-sm text-sm font-semibold", item.tone === "danger" ? "bg-danger-soft text-danger" : item.tone === "warn" ? "bg-warn-soft text-warn" : "bg-info-soft text-info")}>{item.value}</span>
                    <span className="text-xs">{item.label}</span>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="Pinned records" subtitle="Keep the live record close, not a copied note">
              <ul className="space-y-2">
                {["PO-2026-0022 · Shri Ganesh Mills", "QC-2026-089 · Return to supplier", "LD-2026-0007 · Agarwal Knit House"].map((item) => (
                  <li key={item} className="flex items-center gap-2 rounded-sm border border-border px-2.5 py-2 text-xs">
                    <Pin className="size-3.5 shrink-0 text-primary" />
                    <span className="num min-w-0 flex-1 truncate">{item}</span>
                    <ArrowRight className="size-3 text-muted-foreground" />
                  </li>
                ))}
              </ul>
            </Panel>

            <div className="rounded-md border border-ai/25 bg-ai-soft p-4">
              <p className="flex items-center gap-2 text-xs font-semibold text-ai"><FileText className="size-4" /> Morning brief is ready</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">Three supplier calls will remove most of today’s delivery uncertainty.</p>
              <Button variant="outline" size="sm" className="mt-3 border-ai/25 text-ai" asChild><Link to="/ai-workbench">Open brief <ArrowRight /></Link></Button>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}