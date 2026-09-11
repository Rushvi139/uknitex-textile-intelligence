import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  LayoutGrid,
  List,
  Package,
  Play,
  Printer,
  RefreshCw,
  Search,
  Truck,
} from "lucide-react";
import { AppShell } from "@/components/erp/AppShell";
import { PageHeader, Panel, Pill, Td, Th, statusTone } from "@/components/erp/primitives";
import { claimCase, godownFeed, inspectionUnits, qcCases, qcKpis, qcStages } from "@/lib/erp-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/quality")({
  head: () => ({
    meta: [
      { title: "Quality Check Workspace — UKNITEX ERP" },
      {
        name: "description",
        content:
          "Split-screen and kanban quality check workspace: QC queue, inspection detail, failed item resolution, godown updates and supplier claim trail for received fabric.",
      },
      { property: "og:title", content: "UKNITEX — Quality Check Workspace" },
      {
        property: "og:description",
        content: "Inspect received rolls, track godown handover and manage supplier claims from one board.",
      },
    ],
  }),
  component: Quality,
});

const filters = ["All", ...qcStages];
const panes = ["QC info", "Inspection items", "Failed item", "Return / claim"];

const stageHint: Record<string, string> = {
  "Awaiting QC": "Lot staged, inspector to be assigned",
  "In Progress": "Rolls being checked in the bay",
  "Decision Pending": "Failed items need a call",
  Passed: "Print labels and shelve",
  Rejected: "Stage at return dock",
};

function Quality() {
  const [view, setView] = useState<"queue" | "kanban">("queue");
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(qcCases[0]!.id);
  const [pane, setPane] = useState(panes[0]!);
  const [board, setBoard] = useState<Record<string, string>>(() =>
    Object.fromEntries(qcCases.map((c) => [c.id, c.status as string])),
  );

  const stageOf = (id: string) => board[id] ?? "Awaiting QC";

  const move = (id: string, dir: -1 | 1) => {
    const i = qcStages.indexOf(stageOf(id) as (typeof qcStages)[number]);
    const next = qcStages[Math.min(qcStages.length - 1, Math.max(0, i + dir))]!;
    setBoard((b) => ({ ...b, [id]: next }));
  };

  const matches = (c: (typeof qcCases)[number]) => {
    const q = query.trim().toLowerCase();
    return !q || `${c.id} ${c.qcId} ${c.supplier} ${c.quality} ${c.po}`.toLowerCase().includes(q);
  };

  const rows = useMemo(
    () => qcCases.filter((c) => (filter === "All" || stageOf(c.id) === filter) && matches(c)),
    [filter, query, board],
  );

  const c = qcCases.find((x) => x.id === selectedId) ?? qcCases[0]!;
  const cStatus = stageOf(c.id);

  const count = (stage: string) => qcCases.filter((x) => stageOf(x.id) === stage).length;
  const rollsIn = (stage: string) =>
    qcCases.filter((x) => stageOf(x.id) === stage).reduce((s, x) => s + x.rolls, 0);

  const godownCards = [
    { label: "In checking", value: count("In Progress"), note: `${rollsIn("In Progress")} rolls in bay`, icon: Play, tone: "text-info" },
    { label: "Label print", value: count("Passed"), note: `${rollsIn("Passed")} rolls to shelve`, icon: Printer, tone: "text-success" },
    { label: "Ready for return", value: count("Rejected"), note: `${rollsIn("Rejected")} rolls at dock`, icon: Truck, tone: "text-danger" },
    { label: "Awaiting pickup", value: count("Awaiting QC"), note: `${rollsIn("Awaiting QC")} rolls staged`, icon: Package, tone: "text-warn" },
  ];

  const contextColumn = (
    <div className="min-w-0 space-y-3">
      <Panel
        title={`QC summary · ${c.id}`}
        subtitle={`${c.supplier} · ${c.quality} · ${c.shade}`}
        action={<Pill tone={statusTone(cStatus)}>{cStatus}</Pill>}
        bodyClassName="p-0"
      >
        <div className="grid grid-cols-2 divide-x divide-border border-b border-border md:grid-cols-4">
          {[
            { l: "Received", v: `${c.rolls} rolls`, s: c.weight, t: "" },
            { l: "Passed", v: `${c.pass} rolls`, s: "225.00 kg", t: "text-success" },
            { l: "Failed", v: `${c.fail} roll`, s: "25.00 kg", t: "text-danger" },
            { l: "Pending", v: `${c.pending} rolls`, s: "0.00 kg", t: "text-warn" },
          ].map((k) => (
            <div key={k.l} className="px-3.5 py-3">
              <p className={cn("label-caps", k.t)}>{k.l}</p>
              <p className="num mt-1.5 text-sm font-semibold">{k.v}</p>
              <p className="num text-[11px] text-muted-foreground">{k.s}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-1 overflow-x-auto border-b border-border px-3 pt-2">
          {panes.map((p) => (
            <button
              key={p}
              onClick={() => setPane(p)}
              className={cn(
                "-mb-px whitespace-nowrap border-b-2 px-2.5 py-2 text-[12.5px] font-medium",
                pane === p ? "border-primary text-foreground" : "border-transparent text-muted-foreground",
              )}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="px-4 py-3.5">
          {pane === "QC info" && (
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-[12.5px]">
              {[
                ["GRN No.", c.id],
                ["QC ID", c.qcId],
                ["PO No.", c.po],
                ["Supplier", c.supplier],
                ["Quality", c.quality],
                ["Shade", c.shade],
                ["Received on", c.received],
                ["Inspector", c.inspector],
                ["UOM", "Rolls"],
                ["Total weight", c.weight],
              ].map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-3">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="num text-right font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          )}

          {pane === "Inspection items" && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <span
                    className="absolute inset-y-0 left-0 rounded-full bg-primary"
                    style={{ width: `${Math.round(((c.pass + c.fail) / c.rolls) * 100)}%` }}
                  />
                </span>
                <span className="num text-xs text-muted-foreground">
                  {c.pass + c.fail} of {c.rolls} inspected
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[400px] border-collapse">
                  <thead>
                    <tr>
                      <Th>QC unit</Th>
                      <Th className="text-right">Weight</Th>
                      <Th>Status</Th>
                      <Th>Inspection</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {inspectionUnits.map((u) => (
                      <tr key={u.unit} className="hover:bg-surface-sunken">
                        <Td className="num font-medium">{u.unit}</Td>
                        <Td className="num text-right">{u.weight}</Td>
                        <Td>
                          <Pill tone={u.status === "Passed" ? "success" : "danger"}>{u.status}</Pill>
                        </Td>
                        <Td className="text-[12px] text-muted-foreground">{u.note}</Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="flex items-center gap-1.5 rounded-sm bg-info-soft px-2.5 py-2 text-[11.5px] text-info">
                <CheckCircle2 className="size-3.5" /> Roll numbers are generated only after a QC pass.
              </p>
            </div>
          )}

          {pane === "Failed item" && (
            <div className="space-y-3 text-[12.5px]">
              <div className="flex items-center justify-between gap-2">
                <span className="num font-semibold">QC-009-010</span>
                <span className="num">25.00 kg</span>
              </div>
              <dl className="space-y-2">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Defect type</dt>
                  <dd className="font-medium">Wrong colour</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Defect detail</dt>
                  <dd className="mt-0.5 leading-snug">
                    Shade reads darker than the approved PO sample. Deviation visible across the full width.
                  </dd>
                </div>
              </dl>
              <div>
                <p className="label-caps">Evidence</p>
                <div className="mt-1.5 grid grid-cols-4 gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="aspect-square rounded-sm border border-border bg-surface-sunken" />
                  ))}
                  <span className="num grid aspect-square place-items-center rounded-sm border border-border bg-foreground/85 text-[10px] font-semibold text-background">
                    00:18
                  </span>
                </div>
              </div>
              <div>
                <p className="label-caps">Recommended action</p>
                <ul className="mt-1.5 space-y-1.5">
                  {["Return to supplier", "Hold for review", "Keep as sample", "Sell with approval"].map((o, i) => (
                    <li key={o} className="flex items-center gap-2">
                      <span
                        className={cn(
                          "grid size-3.5 place-items-center rounded-full border",
                          i === 0 ? "border-primary" : "border-border",
                        )}
                      >
                        {i === 0 && <span className="size-1.5 rounded-full bg-primary" />}
                      </span>
                      <span className={i === 0 ? "font-medium" : "text-muted-foreground"}>{o}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex gap-2 pt-1">
                <button className="h-9 flex-1 rounded-sm border border-border text-sm font-medium">Cancel</button>
                <button
                  onClick={() => setBoard((b) => ({ ...b, [c.id]: "Rejected" }))}
                  className="h-9 flex-1 rounded-sm bg-primary text-sm font-semibold text-primary-foreground"
                >
                  Save action
                </button>
              </div>
            </div>
          )}

          {pane === "Return / claim" && (
            <div className="space-y-3 text-[12.5px]">
              <div className="flex items-center justify-between gap-2">
                <span className="num font-semibold">{claimCase.id}</span>
                <Pill tone="warn">{claimCase.status}</Pill>
              </div>
              <dl className="space-y-2">
                {[
                  ["Related to", `${claimCase.grn} · ${claimCase.po}`],
                  ["Supplier", claimCase.supplier],
                  ["Reason", claimCase.reason],
                  ["Rejected qty", claimCase.rejected],
                  ["Estimated value", claimCase.value],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="num text-right font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
              <ol className="space-y-2.5 border-t border-border pt-3">
                {claimCase.events.map((e) => (
                  <li key={e.date} className="relative pl-4">
                    <span className="absolute left-0 top-1.5 size-1.5 rounded-full bg-primary" />
                    <span className="num block text-[11px] text-muted-foreground">{e.date}</span>
                    <span className="block leading-snug">{e.text}</span>
                  </li>
                ))}
              </ol>
              <div className="flex gap-2">
                <button className="h-9 flex-1 rounded-sm border border-border text-sm font-medium">
                  <FileText className="mr-1 inline size-3.5" /> Debit note
                </button>
                <button className="h-9 flex-1 rounded-sm bg-primary text-sm font-semibold text-primary-foreground">
                  Close case
                </button>
              </div>
            </div>
          )}
        </div>
      </Panel>

      <Panel title="Next actions" subtitle="Only what this case still needs">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setPane("Failed item")}
            className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-danger/30 bg-danger-soft px-3 text-[12.5px] font-semibold text-danger"
          >
            <AlertTriangle className="size-3.5" /> Resolve failed items
          </button>
          <button
            onClick={() => setBoard((b) => ({ ...b, [c.id]: "Passed" }))}
            className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-primary/30 bg-accent px-3 text-[12.5px] font-semibold text-primary"
          >
            <Printer className="size-3.5" /> Print labels (pass)
          </button>
          <button
            onClick={() => setPane("Return / claim")}
            className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-border px-3 text-[12.5px] font-medium"
          >
            View QC trail
          </button>
        </div>
      </Panel>
    </div>
  );

  const godownPanel = (
    <Panel
      title="Godown updates"
      subtitle="Back office view of physical movement"
      action={<span className="num text-[11px] text-muted-foreground">Live · 16:30</span>}
      bodyClassName="p-0"
    >
      <div className="grid grid-cols-2 divide-x divide-y divide-border border-b border-border">
        {godownCards.map((g) => (
          <div key={g.label} className="px-3.5 py-3">
            <p className="label-caps flex items-center gap-1.5">
              <g.icon className={cn("size-3.5", g.tone)} /> {g.label}
            </p>
            <p className="num mt-1.5 text-xl font-semibold leading-none">{g.value}</p>
            <p className="num mt-1 text-[11px] text-muted-foreground">{g.note}</p>
          </div>
        ))}
      </div>
      <ol className="divide-y divide-border">
        {godownFeed.map((f) => (
          <li key={f.time} className="flex gap-3 px-4 py-2.5">
            <span className="num w-10 shrink-0 text-[11px] text-muted-foreground">{f.time}</span>
            <span className="min-w-0">
              <span className="block text-[12.5px] leading-snug">{f.text}</span>
              <span className="block text-[11px] text-muted-foreground">{f.by}</span>
            </span>
          </li>
        ))}
      </ol>
    </Panel>
  );

  return (
    <AppShell breadcrumb={["Operations", "Quality check", c.id]}>
      <div className="space-y-5">
        <PageHeader
          eyebrow="Quality check"
          title="Inspection workspace"
          subtitle={
            view === "queue"
              ? "Pick a GRN on the left; the right side opens only the context that decision needs."
              : "Back office board: move lots across stages and watch godown handover in one place."
          }
          actions={
            <>
              <div className="flex h-9 items-center rounded-sm border border-border bg-surface p-0.5">
                {(
                  [
                    { k: "queue", label: "Queue", icon: List },
                    { k: "kanban", label: "Kanban", icon: LayoutGrid },
                  ] as const
                ).map((v) => (
                  <button
                    key={v.k}
                    onClick={() => setView(v.k)}
                    className={cn(
                      "inline-flex h-8 items-center gap-1.5 rounded-[3px] px-2.5 text-[12.5px] font-medium",
                      view === v.k ? "bg-accent text-primary" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <v.icon className="size-3.5" /> {v.label}
                  </button>
                ))}
              </div>
              <button className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-border bg-surface px-3 text-sm font-medium">
                <RefreshCw className="size-3.5" /> Refresh
              </button>
              <button className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-border bg-surface px-3 text-sm font-medium">
                <Printer className="size-3.5" /> Print pending labels
              </button>
              <button className="inline-flex h-9 items-center gap-1.5 rounded-sm bg-primary px-3 text-sm font-semibold text-primary-foreground">
                <Play className="size-3.5" /> Create QC case
              </button>
            </>
          }
        />

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {qcKpis.map((k) => (
            <div key={k.label} className="rounded-md border border-border bg-surface px-3.5 py-3">
              <p className="label-caps leading-4">{k.label}</p>
              <p className="num mt-2 text-xl font-semibold leading-none">{k.value}</p>
              <p className="num mt-1.5 text-[11px] text-muted-foreground">{k.note}</p>
            </div>
          ))}
        </div>

        {view === "queue" ? (
          <div className="grid gap-4 xl:grid-cols-[1.15fr_1fr] xl:items-start">
            {/* QUEUE */}
            <div className="min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-surface px-3 py-2.5">
                <div className="flex h-9 min-w-[180px] flex-1 items-center gap-2 rounded-sm border border-border px-2.5">
                  <Search className="size-3.5 text-muted-foreground" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search GRN, supplier, PO, quality…"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                </div>
                <span className="num text-[11px] text-muted-foreground">Sorted by QC date, newest</span>
              </div>

              <div className="flex gap-1 overflow-x-auto border-b border-border pb-px">
                {filters.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cn(
                      "-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-[13px] font-medium",
                      filter === f
                        ? "border-primary text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {f}
                    <span className="num ml-1 text-[11px] opacity-70">
                      ({f === "All" ? qcCases.length : count(f)})
                    </span>
                  </button>
                ))}
              </div>

              <Panel bodyClassName="p-0">
                <ul className="divide-y divide-border">
                  {rows.map((r) => {
                    const on = r.id === selectedId;
                    return (
                      <li key={r.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedId(r.id);
                            setPane(panes[0]!);
                          }}
                          className={cn(
                            "flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-surface-sunken",
                            on && "bg-accent/50 shadow-[inset_2px_0_0_0_var(--color-primary)]",
                          )}
                        >
                          <span className="min-w-0 flex-1">
                            <span className="num block text-[13px] font-semibold">{r.id}</span>
                            <span className="num block text-[11px] text-muted-foreground">{r.qcId}</span>
                          </span>
                          <span className="hidden min-w-0 flex-1 sm:block">
                            <span className="block truncate text-[12.5px]">{r.supplier}</span>
                            <span className="num block text-[11px] text-muted-foreground">{r.po}</span>
                          </span>
                          <span className="hidden min-w-0 flex-1 md:block">
                            <span className="block truncate text-[12.5px]">{r.quality}</span>
                            <span className="block text-[11px] text-muted-foreground">{r.shade}</span>
                          </span>
                          <span className="num hidden w-20 text-right text-[12px] sm:block">
                            {r.rolls} rolls
                            <span className="block text-[11px] text-muted-foreground">{r.weight}</span>
                          </span>
                          <Pill tone={statusTone(stageOf(r.id))}>{stageOf(r.id)}</Pill>
                          <span className="num hidden w-20 text-right text-[11.5px] md:block">
                            <span className="text-success">{r.pass}✓</span>{" "}
                            <span className="text-danger">{r.fail}✕</span>{" "}
                            <span className="text-muted-foreground">{r.pending}◷</span>
                          </span>
                          <ChevronRight className={cn("size-4 text-muted-foreground", on && "text-primary")} />
                        </button>
                      </li>
                    );
                  })}
                  {rows.length === 0 && (
                    <li className="px-4 py-10 text-center text-sm text-muted-foreground">
                      No QC cases in this state.
                    </li>
                  )}
                </ul>
                <div className="border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
                  Showing <span className="num">{rows.length}</span> of <span className="num">69</span> entries
                </div>
              </Panel>
            </div>

            {/* CONTEXT */}
            <div className="xl:sticky xl:top-[104px]">{contextColumn}</div>
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-[1fr_340px] xl:items-start">
            <div className="min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-surface px-3 py-2.5">
                <div className="flex h-9 min-w-[180px] flex-1 items-center gap-2 rounded-sm border border-border px-2.5">
                  <Search className="size-3.5 text-muted-foreground" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search GRN, supplier, PO, quality…"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                </div>
                <span className="num text-[11px] text-muted-foreground">
                  Use the arrows on a card to move it between stages
                </span>
              </div>

              <div className="overflow-x-auto pb-1">
                <div className="flex min-w-[900px] gap-3">
                  {qcStages.map((stage) => {
                    const cards = qcCases.filter((x) => stageOf(x.id) === stage && matches(x));
                    return (
                      <div key={stage} className="flex w-[calc(20%-0.6rem)] min-w-[180px] flex-1 flex-col">
                        <div className="rounded-t-md border border-b-0 border-border bg-surface-sunken px-3 py-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[12.5px] font-semibold">{stage}</span>
                            <span className="num text-[11px] text-muted-foreground">{cards.length}</span>
                          </div>
                          <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{stageHint[stage]}</p>
                        </div>
                        <div className="flex-1 space-y-2 rounded-b-md border border-border bg-surface p-2">
                          {cards.map((r) => {
                            const on = r.id === selectedId;
                            return (
                              <div
                                key={r.id}
                                onClick={() => {
                                  setSelectedId(r.id);
                                  setPane(panes[0]!);
                                }}
                                className={cn(
                                  "cursor-pointer rounded-sm border border-border bg-surface px-2.5 py-2 hover:bg-surface-sunken",
                                  on && "border-primary/40 bg-accent/50",
                                )}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="num text-[12.5px] font-semibold">{r.id}</span>
                                  <Pill tone={statusTone(stage)}>{r.rolls} rolls</Pill>
                                </div>
                                <p className="mt-1 truncate text-[12px]">{r.quality}</p>
                                <p className="truncate text-[11px] text-muted-foreground">
                                  {r.supplier} · {r.shade}
                                </p>
                                <p className="num mt-1 text-[11px] text-muted-foreground">
                                  <span className="text-success">{r.pass}✓</span>{" "}
                                  <span className="text-danger">{r.fail}✕</span>{" "}
                                  <span>{r.pending}◷</span> · {r.inspector}
                                </p>
                                <div className="mt-2 flex items-center justify-between gap-2 border-t border-border pt-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      move(r.id, -1);
                                    }}
                                    aria-label={`Move ${r.id} back`}
                                    className="grid size-6 place-items-center rounded-sm border border-border text-muted-foreground hover:text-foreground"
                                  >
                                    <ChevronLeft className="size-3.5" />
                                  </button>
                                  <span className="truncate text-[11px] text-muted-foreground">{r.next}</span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      move(r.id, 1);
                                    }}
                                    aria-label={`Move ${r.id} forward`}
                                    className="grid size-6 place-items-center rounded-sm border border-border text-muted-foreground hover:text-foreground"
                                  >
                                    <ChevronRight className="size-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                          {cards.length === 0 && (
                            <p className="px-1 py-6 text-center text-[11.5px] text-muted-foreground">Nothing here</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {contextColumn}
            </div>

            <div className="min-w-0 xl:sticky xl:top-[104px]">{godownPanel}</div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
