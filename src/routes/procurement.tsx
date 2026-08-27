import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Calendar,
  ChevronDown,
  Download,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { AppShell } from "@/components/erp/AppShell";
import {
  AiTag,
  Confidence,
  MiniBar,
  PageHeader,
  Panel,
  Pill,
  SourceChip,
  Td,
  Th,
  statusTone,
} from "@/components/erp/primitives";
import { inr, poKpis, purchaseOrders, reorderSuggestions } from "@/lib/erp-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/procurement")({
  head: () => ({
    meta: [
      { title: "Purchase Orders — UKNITEX Procurement Command Centre" },
      {
        name: "description",
        content:
          "Procurement command centre for fabric trading: PO list with delivery risk, priorities, filters and AI reorder suggestions grounded in sales commitments.",
      },
      { property: "og:title", content: "UKNITEX Procurement — Purchase Orders" },
      {
        property: "og:description",
        content: "Track supplier commitments, receipts and delivery risk with AI-grounded reorder suggestions.",
      },
    ],
  }),
  component: Procurement,
});

const tabs = [
  { key: "All", count: 126 },
  { key: "Draft", count: 8 },
  { key: "Issued", count: 32 },
  { key: "In Transit", count: 14 },
  { key: "Partially Received", count: 28 },
  { key: "Completed", count: 42 },
  { key: "Cancelled", count: 16 },
];

const riskTone = { "On time": "success", "Due today": "warn", Delayed: "danger", Closed: "neutral" } as const;

function Procurement() {
  const [tab, setTab] = useState("All");
  const [query, setQuery] = useState("");
  const [priority, setPriority] = useState("All");
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [picked, setPicked] = useState<string[]>([]);

  const rows = useMemo(
    () =>
      purchaseOrders.filter((p) => {
        if (tab !== "All" && p.status !== tab) return false;
        if (priority !== "All" && p.priority !== priority) return false;
        const q = query.trim().toLowerCase();
        if (!q) return true;
        return `${p.id} ${p.supplier} ${p.quality} ${p.shade}`.toLowerCase().includes(q);
      }),
    [tab, query, priority],
  );

  return (
    <AppShell breadcrumb={["Operations", "Procurement", "Purchase orders"]}>
      <div className="space-y-5">
        <PageHeader
          eyebrow="Procurement"
          title="Purchase orders"
          subtitle="Supplier commitments, receipts and delivery risk in one list. Filters and tabs narrow the working set."
          actions={
            <>
              <button className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-border bg-surface px-3 text-sm font-medium hover:border-border-strong">
                <Download className="size-3.5" /> Export
              </button>
              <button
                onClick={() => setDrawerOpen(true)}
                className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-ai/25 bg-ai-soft px-3 text-sm font-semibold text-ai"
              >
                <Sparkles className="size-3.5" /> Suggestions
              </button>
              <button className="inline-flex h-9 items-center gap-1.5 rounded-sm bg-primary px-3 text-sm font-semibold text-primary-foreground hover:opacity-90">
                <Plus className="size-3.5" /> New purchase order
              </button>
            </>
          }
        />

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          {poKpis.map((k) => (
            <div key={k.label} className="rounded-md border border-border bg-surface px-4 py-3">
              <p className="label-caps">{k.label}</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="num text-2xl font-semibold leading-none">{k.value}</span>
                <span
                  className={cn(
                    "num text-[11px] font-medium",
                    k.delta.startsWith("-") ? "text-success" : "text-muted-foreground",
                  )}
                >
                  {k.delta} vs last month
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className={cn("grid gap-4", drawerOpen ? "xl:grid-cols-[1fr_338px]" : "grid-cols-1")}>
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-surface px-3 py-2.5">
              <div className="flex h-9 min-w-[210px] flex-1 items-center gap-2 rounded-sm border border-border px-2.5">
                <Search className="size-3.5 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search PO, supplier, quality…"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
                {query && (
                  <button onClick={() => setQuery("")} aria-label="Clear search">
                    <X className="size-3.5 text-muted-foreground" />
                  </button>
                )}
              </div>
              <span className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-border px-2.5 text-xs text-muted-foreground">
                <Calendar className="size-3.5" /> 01 Aug – 31 Aug 2026
              </span>
              <div className="flex h-9 items-center rounded-sm border border-border p-0.5">
                {["All", "High", "Medium", "Low"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={cn(
                      "rounded-[3px] px-2 py-1 text-[11px] font-medium",
                      priority === p ? "bg-secondary text-secondary-foreground" : "text-muted-foreground",
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-border px-2.5 text-xs font-medium">
                <Filter className="size-3.5" /> More filters
                <span className="num rounded-sm bg-secondary px-1 text-[10px]">2</span>
              </button>
              {(query || priority !== "All" || tab !== "All") && (
                <button
                  onClick={() => {
                    setQuery("");
                    setPriority("All");
                    setTab("All");
                  }}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="flex gap-1 overflow-x-auto border-b border-border pb-px">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={cn(
                    "-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-[13px] font-medium transition-colors",
                    tab === t.key
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t.key} <span className="num text-[11px] opacity-70">({t.count})</span>
                </button>
              ))}
            </div>

            <Panel bodyClassName="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] border-collapse">
                  <thead>
                    <tr>
                      <Th className="w-9" />
                      <Th>PO No.</Th>
                      <Th>Supplier</Th>
                      <Th>Quality / shade</Th>
                      <Th className="text-right">Ordered</Th>
                      <Th className="text-right">Received</Th>
                      <Th>Progress</Th>
                      <Th>Status</Th>
                      <Th>Expected</Th>
                      <Th>Delivery risk</Th>
                      <Th>Priority</Th>
                      <Th className="text-right">Value</Th>
                      <Th className="w-9" />
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((p) => {
                      const pct = Math.round((p.received / p.ordered) * 100);
                      const on = picked.includes(p.id);
                      return (
                        <tr key={p.id} className={cn("hover:bg-surface-sunken", on && "bg-accent/40")}>
                          <Td>
                            <input
                              type="checkbox"
                              checked={on}
                              onChange={() =>
                                setPicked((v) => (on ? v.filter((x) => x !== p.id) : [...v, p.id]))
                              }
                              className="size-3.5 accent-[var(--color-primary)]"
                              aria-label={`Select ${p.id}`}
                            />
                          </Td>
                          <Td className="num font-semibold text-primary">{p.id}</Td>
                          <Td>
                            <span className="block font-medium">{p.supplier}</span>
                            <span className="block text-[11px] text-muted-foreground">{p.city}</span>
                          </Td>
                          <Td>
                            <span className="block">{p.quality}</span>
                            <span className="block text-[11px] text-muted-foreground">{p.shade}</span>
                          </Td>
                          <Td className="num text-right">{p.ordered.toLocaleString("en-IN")} kg</Td>
                          <Td className="num text-right">{p.received.toLocaleString("en-IN")} kg</Td>
                          <Td>
                            <MiniBar pct={pct} tone={pct === 0 ? "danger" : pct < 100 ? "warn" : "primary"} />
                          </Td>
                          <Td>
                            <Pill tone={statusTone(p.status)}>{p.status}</Pill>
                          </Td>
                          <Td className={cn("num", p.risk === "Delayed" && "font-semibold text-danger")}>
                            {p.expected}
                          </Td>
                          <Td>
                            <Pill tone={riskTone[p.risk]}>{p.risk}</Pill>
                          </Td>
                          <Td>
                            <Pill
                              tone={p.priority === "High" ? "danger" : p.priority === "Medium" ? "warn" : "neutral"}
                            >
                              {p.priority}
                            </Pill>
                          </Td>
                          <Td className="num text-right font-semibold">{inr(p.value)}</Td>
                          <Td>
                            <button className="grid size-7 place-items-center rounded-sm hover:bg-secondary" aria-label="Row actions">
                              <MoreHorizontal className="size-4 text-muted-foreground" />
                            </button>
                          </Td>
                        </tr>
                      );
                    })}
                    {rows.length === 0 && (
                      <tr>
                        <Td className="py-10 text-center text-muted-foreground" >
                          Nothing matches these filters.
                        </Td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
                <span>
                  Showing <span className="num">{rows.length}</span> of{" "}
                  <span className="num">{purchaseOrders.length}</span> loaded rows ·{" "}
                  <span className="num">324</span> total POs
                  {picked.length > 0 && <> · <span className="num font-semibold text-foreground">{picked.length} selected</span></>}
                </span>
                <div className="flex items-center gap-1">
                  {["1", "2", "3", "…", "54"].map((n, i) => (
                    <button
                      key={n + i}
                      className={cn(
                        "num grid size-7 place-items-center rounded-sm border border-border text-[11px]",
                        n === "1" && "bg-primary text-primary-foreground",
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </Panel>
          </div>

          {drawerOpen && (
            <aside className="min-w-0 space-y-3 xl:sticky xl:top-[104px] xl:self-start">
              <div className="rounded-md border border-ai/25 bg-surface">
                <header className="flex items-start justify-between gap-2 border-b border-ai/20 bg-ai-soft px-3.5 py-3">
                  <div>
                    <h2 className="flex items-center gap-2 text-sm font-semibold text-ai">
                      Reorder suggestions <AiTag />
                    </h2>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      Grounded in confirmed sales orders and shelf coverage
                    </p>
                  </div>
                  <button onClick={() => setDrawerOpen(false)} aria-label="Close suggestions">
                    <X className="size-4 text-muted-foreground" />
                  </button>
                </header>
                <div className="px-3.5 py-2.5 text-[11.5px] text-muted-foreground">
                  <span className="num font-semibold text-foreground">45,290 kg</span> to buy in total · roughly{" "}
                  <span className="num font-semibold text-foreground">₹40.49 L</span> for the 49 qualities bought before
                </div>
                <ul className="divide-y divide-border border-t border-border">
                  {reorderSuggestions.map((s) => (
                    <li key={s.quality} className="px-3.5 py-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-semibold">{s.quality}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {s.shade} · in stock {s.inStock}
                          </p>
                        </div>
                        <span className="num shrink-0 rounded-sm bg-surface-sunken px-1.5 py-0.5 text-xs font-semibold">
                          {s.buy}
                        </span>
                      </div>
                      <p className="mt-1.5 text-[11.5px] leading-4 text-danger">{s.reason}</p>
                      <div className="num mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>Needed {s.needed}</span>
                        <span>{s.rate}</span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <SourceChip>{s.supplier}</SourceChip>
                        <SourceChip>Stock ledger</SourceChip>
                      </div>
                      <div className="mt-2.5 flex items-center justify-between gap-2">
                        <Confidence value={s.confidence} />
                        <button className="inline-flex items-center gap-1 rounded-sm bg-primary px-2 py-1 text-[11px] font-semibold text-primary-foreground">
                          Raise PO <ArrowRight className="size-3" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                <button className="flex w-full items-center justify-center gap-1 border-t border-border py-2.5 text-[11.5px] font-semibold text-ai">
                  View all 302 suggestions <ChevronDown className="size-3" />
                </button>
              </div>

              <Panel title="Supplier watch" subtitle="Cycle slippage over the last four orders">
                <ul className="space-y-2.5 text-[12.5px]">
                  {[
                    { name: "Star Vihan Industries", note: "21 → 31 day cycle", tone: "danger" as const, val: "4 late" },
                    { name: "Shri Ganesh Mills", note: "Nothing received on 400 kg", tone: "danger" as const, val: "3 late" },
                    { name: "Sun Arihant Fabrics", note: "Partial dispatches", tone: "warn" as const, val: "2 late" },
                    { name: "Deep Universal Knit Mills", note: "Holding 9 day lead time", tone: "success" as const, val: "On time" },
                  ].map((s) => (
                    <li key={s.name} className="flex items-center justify-between gap-2">
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{s.name}</span>
                        <span className="block text-[11px] text-muted-foreground">{s.note}</span>
                      </span>
                      <Pill tone={s.tone}>{s.val}</Pill>
                    </li>
                  ))}
                </ul>
              </Panel>
            </aside>
          )}
        </div>
      </div>
    </AppShell>
  );
}
