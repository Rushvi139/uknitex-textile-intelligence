import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  FileText,
  Play,
  Printer,
  RefreshCw,
  Search,
} from "lucide-react";
import { AppShell } from "@/components/erp/AppShell";
import { PageHeader, Panel, Pill, Td, Th, statusTone } from "@/components/erp/primitives";
import { claimCase, inspectionUnits, qcCases, qcKpis } from "@/lib/erp-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/quality")({
  head: () => ({
    meta: [
      { title: "Quality Check Workspace — UKNITEX ERP" },
      {
        name: "description",
        content:
          "Split-screen quality check workspace: QC queue, inspection detail, failed item resolution and supplier claim trail for received fabric.",
      },
      { property: "og:title", content: "UKNITEX — Quality Check Workspace" },
      {
        property: "og:description",
        content: "Inspect received rolls, resolve failed items and manage supplier claims from one queue.",
      },
    ],
  }),
  component: Quality,
});

const filters = ["All", "Awaiting QC", "In Progress", "Decision Pending", "Passed", "Rejected"];
const panes = ["QC info", "Inspection items", "Failed item", "Return / claim"];

function Quality() {
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(qcCases[0]!.id);
  const [pane, setPane] = useState(panes[0]!);

  const rows = useMemo(
    () =>
      qcCases.filter((c) => {
        if (filter !== "All" && c.status !== filter) return false;
        const q = query.trim().toLowerCase();
        return !q || `${c.id} ${c.qcId} ${c.supplier} ${c.quality} ${c.po}`.toLowerCase().includes(q);
      }),
    [filter, query],
  );

  const c = qcCases.find((x) => x.id === selectedId) ?? qcCases[0]!;

  return (
    <AppShell breadcrumb={["Operations", "Quality check", c.id]}>
      <div className="space-y-5">
        <PageHeader
          eyebrow="Quality check"
          title="Inspection workspace"
          subtitle="Pick a GRN on the left; the right side opens only the context that decision needs."
          actions={
            <>
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
                    filter === f ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  {f}
                  <span className="num ml-1 text-[11px] opacity-70">
                    ({f === "All" ? qcCases.length : qcCases.filter((x) => x.status === f).length})
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
                        <Pill tone={statusTone(r.status)}>{r.status}</Pill>
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
          <div className="min-w-0 space-y-3 xl:sticky xl:top-[104px]">
            <Panel
              title={`QC summary · ${c.id}`}
              subtitle={`${c.supplier} · ${c.quality} · ${c.shade}`}
              action={<Pill tone={statusTone(c.status)}>{c.status}</Pill>}
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
                      <button className="h-9 flex-1 rounded-sm bg-primary text-sm font-semibold text-primary-foreground">
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
                <button className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-primary/30 bg-accent px-3 text-[12.5px] font-semibold text-primary">
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
        </div>
      </div>
    </AppShell>
  );
}
