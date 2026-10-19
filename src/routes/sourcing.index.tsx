import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCheck, Clock3, FlaskConical, Layers, Sparkles } from "lucide-react";
import { AppShell } from "@/components/erp/AppShell";
import { ModuleNav } from "@/components/erp/ModuleNav";
import { DevelopmentForm } from "@/components/erp/DevelopmentForm";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/erp/primitives";
import { useSourcing } from "@/lib/sourcing-reference";

export const Route = createFileRoute("/sourcing/")({
  head: () => ({ meta: [{ title: "Sourcing Desk — UKNITEX" }, { name: "description", content: "UKNITEX sourcing desk for fabric developments, samples, supplier follow-ups and decisions." }, { property: "og:title", content: "UKNITEX Sourcing Desk" }, { property: "og:description", content: "A composed overview of textile sourcing and product development." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: SourcingDesk,
});

function SourcingDesk() {
  const { developments } = useSourcing();
  return <AppShell breadcrumb={["Commercial", "Sourcing"]}><ModuleNav active="desk" />
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3"><div className="min-w-0"><p className="label-caps">Buying & development</p><h1 className="mt-1 text-3xl font-semibold">Sourcing desk</h1><p className="mt-2 text-sm text-muted-foreground">Samples, supplier commitments and the next buying decision.</p></div><div className="hidden shrink-0 sm:block"><DevelopmentForm /></div></div>
    <div className="mt-4 sm:hidden"><DevelopmentForm /></div>
    <section aria-label="Sourcing overview" className="my-6 grid grid-cols-2 border-y border-border bg-surface sm:grid-cols-4">
      {[{ label: "Open developments", value: 5 + developments.length - 2, note: "Not launched or dropped", icon: Layers }, { label: "Samples pending", value: 0, note: "Past promised date", icon: FlaskConical }, { label: "Decisions waiting", value: 0, note: "Sent to management", icon: Clock3 }, { label: "Supply gaps", value: 0, note: "Uncovered market demand", icon: CheckCheck }].map((m) => <div key={m.label} className="border-r border-border p-4 last:border-r-0"><div className="flex items-center justify-between gap-2"><span className="label-caps">{m.label}</span><m.icon className="size-4 shrink-0 text-muted-foreground" /></div><p className="num my-2 text-3xl font-semibold">{m.value}</p><p className="text-xs text-muted-foreground">{m.note}</p></div>)}
    </section>
    <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_290px]">
      <section className="min-w-0"><div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3"><div><h2 className="text-base font-semibold">Open developments</h2><p className="mt-1 text-xs text-muted-foreground">Latest product work</p></div><Button variant="ghost" size="sm" asChild><Link to="/sourcing/developments">All developments<ArrowRight /></Link></Button></div>
        <div className="divide-y divide-border border-y border-border">{developments.map((d) => <Link key={d.id} to="/sourcing/developments/$id" params={{ id: d.id }} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-4 hover:bg-accent/40"><div className="min-w-0"><div className="mb-2 flex flex-wrap items-center gap-2"><span className="num text-xs text-primary">{d.id}</span><Pill tone={d.status === "Samples approved" ? "success" : "info"}>{d.status}</Pill></div><h3 className="text-sm font-semibold">{d.title}</h3><p className="mt-1 text-xs text-muted-foreground">{d.suppliers.join(" · ") || "No supplier linked"}</p></div><div className="flex items-center gap-4"><span className="hidden text-right text-xs text-muted-foreground sm:block">{d.collection}<span className="mt-1 block">{d.samples} samples</span></span><ArrowRight className="size-4 text-muted-foreground" /></div></Link>)}</div>
        <div className="mt-7"><h2 className="text-base font-semibold">Department follow-ups</h2><div className="mt-3 divide-y divide-border border-y border-border">{[["My sourcing tasks", "Nothing assigned to you right now."], ["Pending follow-ups", "Nothing outstanding for the department."], ["Pending samples", "Nothing out right now."], ["Supplier responses", "No mill is overdue on a promise right now."], ["Decisions / approvals", "Nothing waiting on a decision."], ["Market demand & supply gaps", "Nothing short right now."]].map(([title, description]) => <div key={title} className="grid gap-1 py-3 sm:grid-cols-[200px_minmax(0,1fr)]"><span className="text-sm font-medium">{title}</span><span className="text-xs text-muted-foreground">{description}</span></div>)}</div></div>
      </section>
      <aside className="min-w-0 border-t border-border pt-5 xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0"><p className="label-caps">Product opportunities</p><p className="num mt-3 text-4xl font-semibold">5</p><p className="mt-1 text-sm">New this month</p><dl className="mt-4 divide-y divide-border">{["Shortlisted", "Samples out", "Overdue", "Catalogues", "Ready to onboard"].map((label) => <div key={label} className="flex justify-between py-2.5 text-xs"><dt className="text-muted-foreground">{label}</dt><dd className="num font-medium">0</dd></div>)}</dl><div className="mt-6 border-t border-ai/20 pt-5"><h2 className="flex items-center gap-2 text-sm font-semibold text-ai"><Sparkles className="size-4" />Sourcing intelligence</h2><p className="mt-2 text-xs text-muted-foreground">Waiting on the Copilot.</p><Pill tone="neutral" className="mt-3">Not connected yet</Pill></div></aside>
    </div>
  </AppShell>;
}