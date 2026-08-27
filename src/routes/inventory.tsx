import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  FileText,
  MoreHorizontal,
  Pencil,
  Printer,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { AppShell } from "@/components/erp/AppShell";
import { PageHeader, Panel, Pill, Td, Th, statusTone } from "@/components/erp/primitives";
import fabricImg from "@/assets/fabric-white.jpg";
import {
  batches,
  composition,
  documents,
  product,
  rolls,
  supplierContext,
  timeline,
} from "@/lib/erp-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/inventory")({
  head: () => ({
    meta: [
      { title: "Cotton Single Jersey 180 GSM — UKNITEX Inventory" },
      {
        name: "description",
        content:
          "Fabric product detail: roll and batch inventory, stock composition, supplier rate context, documents and event history for a textile trading house.",
      },
      { property: "og:title", content: "UKNITEX Inventory — Product Detail" },
      {
        property: "og:description",
        content: "Roll-level stock, batch trail, supplier rates and document history for a fabric quality.",
      },
    ],
  }),
  component: Inventory,
});


const tabs = ["Roll inventory", "Stock batches", "Stock movement", "Purchase history", "Sales history", "Documents", "Notes"];
const statuses = ["All", "Available", "Reserved", "In QC", "Damaged"];

function Inventory() {
  const [tab, setTab] = useState(tabs[0]);
  const [status, setStatus] = useState("All");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(rolls[0]!.roll);

  const filtered = useMemo(
    () =>
      rolls.filter((r) => {
        if (status !== "All" && r.status !== status) return false;
        const q = query.trim().toLowerCase();
        return !q || `${r.roll} ${r.batch} ${r.grn} ${r.location}`.toLowerCase().includes(q);
      }),
    [status, query],
  );

  const active = rolls.find((r) => r.roll === selected) ?? rolls[0]!;

  const summary = [
    { label: "Total stock", value: product.totalRolls, sub: `${product.totalMtrs} mtrs`, tone: "" },
    { label: "Available", value: product.available, sub: `${product.availableMtrs} mtrs`, tone: "text-primary" },
    { label: "Reserved", value: product.reserved, sub: `${product.reservedMtrs} mtrs`, tone: "text-ai" },
    { label: "In QC", value: product.inQc, sub: `${product.qcMtrs} mtrs`, tone: "text-warn" },
  ];

  return (
    <AppShell breadcrumb={["Operations", "Inventory", "Products", product.name]}>
      <div className="space-y-5">
        <div className="grid gap-5 lg:grid-cols-[132px_1fr] lg:items-start">
          <div className="space-y-2">
            <img
              src={fabricImg}
              alt={`${product.name} in ${product.shade}`}
              width={900}
              height={900}
              className="aspect-square w-full rounded-md border border-border object-cover"
            />
            <div className="grid grid-cols-4 gap-1.5">
              {[0, 1, 2].map((i) => (
                <img
                  key={i}
                  src={fabricImg}
                  alt=""
                  loading="lazy"
                  width={900}
                  height={900}
                  className="aspect-square w-full rounded-sm border border-border object-cover opacity-80"
                />
              ))}
              <span className="num grid aspect-square place-items-center rounded-sm border border-border bg-surface-sunken text-[11px] font-semibold text-muted-foreground">
                +4
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <PageHeader
              eyebrow={`${product.category} · ${product.sku}`}
              title={`${product.name} · ${product.shade}`}
              subtitle={`HSN ${product.hsn} · UOM ${product.uom} · Width ${product.width} · ${product.gsm} GSM · updated ${product.updated}`}
              actions={
                <>
                  <button className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-border bg-surface px-3 text-sm font-medium">
                    <Printer className="size-3.5" /> Print label
                  </button>
                  <button className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-border bg-surface px-3 text-sm font-medium">
                    <MoreHorizontal className="size-3.5" /> More actions
                  </button>
                  <button className="inline-flex h-9 items-center gap-1.5 rounded-sm bg-primary px-3 text-sm font-semibold text-primary-foreground">
                    <Pencil className="size-3.5" /> Edit product
                  </button>
                </>
              }
            />

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {summary.map((s) => (
                <div key={s.label} className="rounded-md border border-border bg-surface px-4 py-3">
                  <p className="label-caps">{s.label}</p>
                  <p className={cn("mt-2 flex items-baseline gap-1", s.tone)}>
                    <span className="num text-2xl font-semibold leading-none">{s.value}</span>
                    <span className="text-xs text-muted-foreground">rolls</span>
                  </p>
                  <p className="num mt-1.5 text-[11px] text-muted-foreground">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1fr_318px]">
          <div className="min-w-0 space-y-3">
            <div className="flex gap-1 overflow-x-auto border-b border-border pb-px">
              {tabs.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    "-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-[13px] font-medium",
                    tab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

            {tab === "Stock batches" ? (
              <Panel bodyClassName="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] border-collapse">
                    <thead>
                      <tr>
                        <Th>Batch No.</Th>
                        <Th>GRN No.</Th>
                        <Th>PO No.</Th>
                        <Th>Received</Th>
                        <Th className="text-right">Rolls</Th>
                        <Th className="text-right">Available</Th>
                        <Th className="text-right">Reserved</Th>
                        <Th>QC</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {batches.map((b) => (
                        <tr key={b.batch} className="hover:bg-surface-sunken">
                          <Td className="num font-semibold">{b.batch}</Td>
                          <Td className="num text-primary">{b.grn}</Td>
                          <Td className="num text-primary">{b.po}</Td>
                          <Td className="num text-muted-foreground">{b.received}</Td>
                          <Td className="num text-right">{b.rolls}</Td>
                          <Td className="num text-right">{b.available}</Td>
                          <Td className="num text-right">{b.reserved}</Td>
                          <Td>
                            <Pill tone={statusTone(b.qc === "Passed" ? "Passed" : "In QC")}>{b.qc}</Pill>
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
            ) : tab === "Roll inventory" ? (
              <>
                <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-surface px-3 py-2.5">
                  <div className="flex h-9 min-w-[190px] flex-1 items-center gap-2 rounded-sm border border-border px-2.5">
                    <Search className="size-3.5 text-muted-foreground" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search roll no., batch, GRN, rack…"
                      className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    />
                  </div>
                  <div className="flex h-9 items-center rounded-sm border border-border p-0.5">
                    {statuses.map((s) => (
                      <button
                        key={s}
                        onClick={() => setStatus(s)}
                        className={cn(
                          "rounded-[3px] px-2 py-1 text-[11px] font-medium",
                          status === s ? "bg-secondary text-secondary-foreground" : "text-muted-foreground",
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <button className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-border px-2.5 text-xs font-medium">
                    <SlidersHorizontal className="size-3.5" /> Columns
                  </button>
                </div>

                <Panel bodyClassName="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[860px] border-collapse">
                      <thead>
                        <tr>
                          <Th>Roll No.</Th>
                          <Th>Batch No.</Th>
                          <Th>GRN No.</Th>
                          <Th>Received</Th>
                          <Th className="text-right">Mtrs</Th>
                          <Th className="text-right">Weight (kg)</Th>
                          <Th>Status</Th>
                          <Th>Location</Th>
                          <Th>Reserved for</Th>
                          <Th className="w-9" />
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((r) => (
                          <tr
                            key={r.roll}
                            onClick={() => setSelected(r.roll)}
                            className={cn(
                              "cursor-pointer hover:bg-surface-sunken",
                              selected === r.roll && "bg-accent/50",
                            )}
                          >
                            <Td className="num font-semibold">{r.roll}</Td>
                            <Td className="num text-muted-foreground">{r.batch}</Td>
                            <Td className="num text-primary">{r.grn}</Td>
                            <Td className="num text-muted-foreground">{r.received}</Td>
                            <Td className="num text-right">{r.mtrs}</Td>
                            <Td className="num text-right">{r.kg}</Td>
                            <Td>
                              <Pill tone={statusTone(r.status)}>{r.status}</Pill>
                            </Td>
                            <Td className="num text-muted-foreground">{r.location}</Td>
                            <Td className="num text-primary">{r.reservedFor}</Td>
                            <Td>
                              <MoreHorizontal className="size-4 text-muted-foreground" />
                            </Td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
                    <span>
                      Showing <span className="num">{filtered.length}</span> of{" "}
                      <span className="num">{product.totalRolls}</span> rolls
                    </span>
                    <span className="num">Rows per page 10</span>
                  </div>
                </Panel>
              </>
            ) : (
              <Panel title={tab} subtitle="Reference screen — this tab is not part of the wired prototype.">
                <p className="py-8 text-center text-sm text-muted-foreground">
                  {tab} would follow the same table pattern as roll inventory, with its own column set.
                </p>
              </Panel>
            )}

            <Panel title="Selected roll" subtitle={`${active.roll} · ${active.batch}`}>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-[12.5px] md:grid-cols-4">
                {[
                  ["Status", active.status],
                  ["Location", active.location],
                  ["Length", `${active.mtrs} mtrs`],
                  ["Weight", `${active.kg} kg`],
                  ["GRN", active.grn],
                  ["Received", active.received],
                  ["Reserved for", active.reservedFor],
                  ["Quality", `${product.name} · ${product.shade}`],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="label-caps">{k}</dt>
                    <dd className="num mt-0.5 font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </Panel>
          </div>

          <aside className="min-w-0 space-y-3">
            <Panel title="Stock composition" subtitle={`${product.totalRolls} rolls on record`}>
              <div className="flex h-2.5 overflow-hidden rounded-full">
                {composition.map((c) => (
                  <span key={c.name} style={{ width: c.pct, background: c.color }} />
                ))}
              </div>
              <ul className="mt-3 space-y-2 text-[12.5px]">
                {composition.map((c) => (
                  <li key={c.name} className="flex items-center gap-2">
                    <span className="size-2 rounded-full" style={{ background: c.color }} />
                    <span className="flex-1">{c.name}</span>
                    <span className="num font-semibold">{c.value}</span>
                    <span className="num w-9 text-right text-muted-foreground">{c.pct}</span>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="Supplier & rate context">
              <dl className="space-y-2 text-[12.5px]">
                {supplierContext.map((s) => (
                  <div key={s.label} className="flex items-baseline justify-between gap-3">
                    <dt className="text-muted-foreground">{s.label}</dt>
                    <dd className="num text-right font-medium">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </Panel>

            <Panel
              title="Documents"
              action={<button className="text-[11px] font-semibold text-primary">View all</button>}
            >
              <ul className="space-y-2 text-[12.5px]">
                {documents.map((d) => (
                  <li key={d.name} className="flex items-center gap-2">
                    <FileText className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate">{d.name}</span>
                    <span className="num shrink-0 text-[11px] text-muted-foreground">{d.date}</span>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel title="Event history">
              <ol className="space-y-3">
                {timeline.map((t) => (
                  <li key={t.time} className="relative pl-4 text-[12.5px]">
                    <span className="absolute left-0 top-1.5 size-1.5 rounded-full bg-primary" />
                    <span className="num block text-[11px] text-muted-foreground">{t.time}</span>
                    <span className="block leading-snug">{t.text}</span>
                    <span className="block text-[11px] text-muted-foreground">by {t.by}</span>
                  </li>
                ))}
              </ol>
            </Panel>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
