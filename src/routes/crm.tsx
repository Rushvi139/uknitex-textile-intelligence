import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  FileText,
  Flame,
  Link2,
  Plus,
  Search,
  Snowflake,
  Sparkles,
  Store,
  Undo2,
  X,
} from "lucide-react";
import { AppShell } from "@/components/erp/AppShell";
import { AiTag, KpiCard, PageHeader, Panel, Pill, Td, Th } from "@/components/erp/primitives";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { CrmProvider, deriveStatus, useCrm } from "@/lib/crm-store";
import {
  BOARD_COLUMNS,
  columnOf,
  lostReasons,
  masterFields,
  owners,
  partyKinds,
  sources,
  temperatures,
  type CrmStatus,
  type Lead,
  type PartyKind,
  type Source,
  type Temperature,
} from "@/lib/crm-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/crm")({
  head: () => ({
    meta: [
      { title: "CRM demand board — UKNITEX Fashion ERP" },
      {
        name: "description",
        content:
          "Lead-to-order demand board for a fabric trading house: parties, inquiries, prices, quotations, samples, orders and exhibition capture.",
      },
      { property: "og:title", content: "CRM demand board — UKNITEX Fashion ERP" },
      {
        property: "og:description",
        content: "Track every party from first call to confirmed order, with status read from records instead of typed.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <CrmProvider>
      <CrmPage />
    </CrmProvider>
  ),
});

const money = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const tempTone = (t: Temperature) => (t === "Hot" ? "danger" : t === "Warm" ? "warn" : "info");

function statusTone(s: CrmStatus) {
  if (s === "Closed") return "neutral" as const;
  if (s === "In master" || s === "Order confirmed") return "success" as const;
  if (s === "Order created" || s === "Quotation sent" || s === "Sample order") return "info" as const;
  if (s === "Price sent" || s === "Inquiry raised") return "warn" as const;
  return "neutral" as const;
}

const VIEWS = ["Demand board", "Leads", "Exhibitions", "Master details"] as const;
type View = (typeof VIEWS)[number];

function CrmPage() {
  const crm = useCrm();
  const [view, setView] = useState<View>("Demand board");
  const [query, setQuery] = useState("");
  const [owner, setOwner] = useState("All owners");
  const [temp, setTemp] = useState<"All" | Temperature>("All");
  const [showNew, setShowNew] = useState(false);

  const leads = useMemo(
    () =>
      crm.leads.filter((l) => {
        const q = query.trim().toLowerCase();
        const hitQ =
          !q ||
          [l.name, l.firm, l.city, l.leadNo, l.mobile, ...l.inquiries.map((i) => `${i.quality} ${i.colour}`)]
            .join(" ")
            .toLowerCase()
            .includes(q);
        const hitOwner = owner === "All owners" || (owner === "Unassigned" ? !l.owner : l.owner === owner);
        const hitTemp = temp === "All" || l.temperature === temp;
        return hitQ && hitOwner && hitTemp;
      }),
    [crm.leads, query, owner, temp],
  );

  const openInquiries = crm.leads.reduce((n, l) => n + l.inquiries.filter((i) => i.open).length, 0);
  const awaitingRate = crm.leads.reduce(
    (n, l) => n + l.inquiries.filter((i) => i.open && i.rate === null && !i.priceSentOn).length,
    0,
  );
  const overdue = crm.leads.filter((l) => l.followUpOverdue).length;
  const orderValue = crm.leads.reduce((n, l) => n + l.orders.reduce((s, o) => s + o.value, 0), 0);

  return (
    <AppShell breadcrumb={["UKNITEX", "Commercial", "CRM", view]}>
      <div className="space-y-5">
        <PageHeader
          eyebrow="Commercial · demand side"
          title="CRM — parties, inquiries and orders"
          subtitle="Status is read from what actually happened on the record — a call logged, a price sent, a quotation raised — never typed by hand."
          actions={
            <>
              <button
                type="button"
                onClick={() => setShowNew(true)}
                className="inline-flex h-9 items-center gap-1.5 rounded-sm bg-primary px-3 text-sm font-semibold text-primary-foreground"
              >
                <Plus className="size-4" /> New lead
              </button>
              <button
                type="button"
                className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-ai/25 bg-ai-soft px-3 text-sm font-semibold text-ai"
              >
                <Sparkles className="size-3.5" /> Ask about this book
              </button>
            </>
          }
        />

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Open parties" value={String(crm.leads.filter((l) => !l.lostReason).length)} note={`${crm.leads.length} on file`} />
          <KpiCard label="Open inquiries" value={String(openInquiries)} note={`${awaitingRate} waiting on a rate from the desk`} />
          <KpiCard label="Follow-ups overdue" value={String(overdue)} dir="down" delta="needs calls" note="Oldest 6 days" />
          <KpiCard label="Order value on book" value={money(orderValue)} note="Draft and confirmed sales orders" />
        </div>

        <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-surface px-3 py-2.5">
          <div className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-sm border border-border bg-background px-2.5 md:max-w-sm">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Party, firm, city, lead no, quality…"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} aria-label="Clear search">
                <X className="size-3.5 text-muted-foreground" />
              </button>
            )}
          </div>
          <select
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            className="h-9 rounded-sm border border-border bg-background px-2 text-sm"
          >
            {["All owners", ...owners].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
          <div className="flex items-center gap-1 rounded-sm border border-border p-0.5">
            {(["All", ...temperatures] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTemp(t)}
                className={cn(
                  "rounded-sm px-2 py-1 text-xs font-medium",
                  temp === t ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-surface-sunken",
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-1 rounded-sm border border-border p-0.5">
            {VIEWS.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={cn(
                  "rounded-sm px-2.5 py-1 text-xs font-semibold",
                  view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-surface-sunken",
                )}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {view === "Demand board" && <Board leads={leads} />}
        {view === "Leads" && <LeadTable leads={leads} />}
        {view === "Exhibitions" && <Exhibitions />}
        {view === "Master details" && <MasterQueue />}
      </div>

      <PartyPopup />
      <NewLeadDialog open={showNew} onClose={() => setShowNew(false)} />
    </AppShell>
  );
}

/* ---------------- Board ---------------- */

function Board({ leads }: { leads: Lead[] }) {
  const crm = useCrm();
  return (
    <div className="-mx-4 overflow-x-auto px-4 lg:-mx-6 lg:px-6">
      <div className="flex min-w-max gap-3 pb-2">
        {BOARD_COLUMNS.map((col) => {
          const items = leads.filter((l) => columnOf(deriveStatus(l)) === col.key);
          const kg = items.reduce((n, l) => n + l.inquiries.reduce((s, i) => s + i.askedKg, 0), 0);
          return (
            <section key={col.key} className="flex w-[292px] flex-col rounded-md border border-border bg-surface-sunken">
              <header className="flex items-center justify-between gap-2 border-b border-border px-3 py-2.5">
                <div>
                  <p className="text-sm font-semibold">{col.label}</p>
                  <p className="num text-[11px] text-muted-foreground">
                    {items.length} parties · {kg.toLocaleString("en-IN")} kg asked
                  </p>
                </div>
                <span className="num rounded-sm border border-border bg-surface px-1.5 py-0.5 text-[11px]">
                  {items.length}
                </span>
              </header>
              <div className="flex flex-1 flex-col gap-2 p-2">
                {items.length === 0 && (
                  <p className="rounded-sm border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
                    {col.empty}
                  </p>
                )}
                {items.map((l) => {
                  const stale = l.daysInColumn > col.ageLimit;
                  const openInq = l.inquiries.filter((i) => i.open);
                  return (
                    <article
                      key={l.id}
                      className="rounded-sm border border-border bg-surface p-3 text-left transition-colors hover:border-border-strong"
                    >
                      <button type="button" onClick={() => crm.openLead(l.id)} className="w-full text-left">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{l.firm}</p>
                            <p className="truncate text-[11px] text-muted-foreground">
                              {l.name} · {l.city}
                            </p>
                          </div>
                          <Pill tone={tempTone(l.temperature)}>
                            {l.temperature === "Cold" ? <Snowflake className="size-2.5" /> : <Flame className="size-2.5" />}
                            {l.temperature}
                          </Pill>
                        </div>

                        <p className="num mt-2 text-[11px] text-muted-foreground">{l.leadNo}</p>

                        {openInq.length > 0 ? (
                          <ul className="mt-2 space-y-1">
                            {openInq.slice(0, 2).map((i) => (
                              <li key={i.id} className="flex items-center gap-1.5 text-[11px]">
                                <span className="size-2.5 shrink-0 rounded-full border border-border" style={{ background: i.swatch }} />
                                <span className="truncate">
                                  {i.quality} {i.colour}
                                </span>
                                <span className="num ml-auto shrink-0 text-muted-foreground">
                                  {i.askedKg} kg ·{" "}
                                  {i.rate ? `₹${i.rate}` : i.lastSoldRate ? `last ₹${i.lastSoldRate}` : "rate awaited"}
                                </span>
                              </li>
                            ))}
                            {openInq.length > 2 && (
                              <li className="text-[11px] text-muted-foreground">+{openInq.length - 2} more asked</li>
                            )}
                          </ul>
                        ) : (
                          <p className="mt-2 text-[11px] text-muted-foreground">No quality asked yet — call and record the interest.</p>
                        )}

                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <Pill tone={statusTone(deriveStatus(l))}>{deriveStatus(l)}</Pill>
                          <Pill tone="neutral">{l.owner ?? "Unassigned"}</Pill>
                          {l.followUp && (
                            <Pill tone={l.followUpOverdue ? "danger" : "info"}>
                              <CalendarClock className="size-2.5" /> {l.followUp}
                            </Pill>
                          )}
                          {stale && <Pill tone="warn">{l.daysInColumn}d sitting here</Pill>}
                        </div>
                      </button>

                      <div className="mt-2.5 flex flex-wrap gap-1.5 border-t border-border pt-2.5">
                        <MiniAction onClick={() => crm.logTouch(l.id, "Called from the board")}>Log call</MiniAction>
                        {openInq[0] && !openInq[0].priceSentOn && (
                          <MiniAction onClick={() => crm.sendPrice(l.id, openInq[0]!.id)}>Send price</MiniAction>
                        )}
                        {openInq[0]?.priceSentOn && !l.quotations.length && (
                          <MiniAction onClick={() => crm.raiseQuotation(l.id, openInq[0]!.id)}>Quotation</MiniAction>
                        )}
                        <MiniAction onClick={() => crm.setFollowUp(l.id, "15 Sep 2026")}>Follow-up</MiniAction>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function MiniAction({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-sm border border-border bg-surface-sunken px-1.5 py-0.5 text-[11px] font-medium text-foreground hover:border-border-strong"
    >
      {children}
    </button>
  );
}

/* ---------------- Leads list ---------------- */

function LeadTable({ leads }: { leads: Lead[] }) {
  const crm = useCrm();
  return (
    <Panel title="Leads register" subtitle={`${leads.length} parties matched`} bodyClassName="p-0">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <Th>Lead no</Th>
              <Th>Party</Th>
              <Th>Type & source</Th>
              <Th>Open inquiries</Th>
              <Th>Status</Th>
              <Th>Owner</Th>
              <Th>Follow-up</Th>
              <Th className="text-right">Order value</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className="hover:bg-surface-sunken">
                <Td className="num text-xs">{l.leadNo}</Td>
                <Td>
                  <span className="block font-medium">{l.firm}</span>
                  <span className="block text-[11px] text-muted-foreground">
                    {l.name} · {l.city}
                  </span>
                </Td>
                <Td className="text-xs">
                  {l.kind}
                  <span className="block text-[11px] text-muted-foreground">
                    {l.source}
                    {l.fair ? ` · ${l.fair}` : ""}
                  </span>
                </Td>
                <Td className="text-xs">
                  {l.inquiries.filter((i) => i.open).length || "—"}
                  <span className="block text-[11px] text-muted-foreground">
                    {l.inquiries.filter((i) => i.open).reduce((n, i) => n + i.askedKg, 0) || 0} kg
                  </span>
                </Td>
                <Td>
                  <Pill tone={statusTone(deriveStatus(l))}>{deriveStatus(l)}</Pill>
                </Td>
                <Td className="text-xs">{l.owner ?? "Unassigned"}</Td>
                <Td className="text-xs">
                  {l.followUp ? (
                    <span className={l.followUpOverdue ? "text-danger" : undefined}>{l.followUp}</span>
                  ) : (
                    <span className="text-muted-foreground">not set</span>
                  )}
                </Td>
                <Td className="num text-right text-xs">
                  {l.orders.length ? money(l.orders.reduce((s, o) => s + o.value, 0)) : "—"}
                </Td>
                <Td className="text-right">
                  <button
                    type="button"
                    onClick={() => crm.openLead(l.id)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    Open <ArrowRight className="size-3" />
                  </button>
                </Td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <Td className="text-center text-muted-foreground" >
                  Nothing matched this search.
                </Td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* ---------------- Exhibitions ---------------- */

function Exhibitions() {
  const crm = useCrm();
  const [selected, setSelected] = useState(crm.exhibitions[0]?.id ?? "");
  const ex = crm.exhibitions.find((e) => e.id === selected) ?? crm.exhibitions[0];
  const [form, setForm] = useState({ name: "", place: "", dates: "" });

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
      <Panel title="Events & fairs" subtitle="Capture desks, QR scans and catalogue links per event" bodyClassName="p-0">
        <div className="divide-y divide-border">
          {crm.exhibitions.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => setSelected(e.id)}
              className={cn(
                "flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-surface-sunken",
                ex?.id === e.id && "bg-accent/40",
              )}
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-sm border border-border bg-surface-sunken">
                <Store className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{e.name}</span>
                <span className="block text-[11px] text-muted-foreground">
                  {e.place} · {e.dates}
                </span>
                <span className="num mt-1 block text-[11px] text-muted-foreground">
                  {e.leads} leads · {e.scans} scans · {e.pricesSent} prices sent · {e.liveLinks} live links
                </span>
              </span>
            </button>
          ))}
        </div>
        <div className="grid gap-2 border-t border-border p-4 sm:grid-cols-4">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Event name"
            className="h-9 rounded-sm border border-border bg-background px-2 text-sm sm:col-span-2"
          />
          <input
            value={form.place}
            onChange={(e) => setForm({ ...form, place: e.target.value })}
            placeholder="Place"
            className="h-9 rounded-sm border border-border bg-background px-2 text-sm"
          />
          <div className="flex gap-2">
            <input
              value={form.dates}
              onChange={(e) => setForm({ ...form, dates: e.target.value })}
              placeholder="Dates"
              className="h-9 min-w-0 flex-1 rounded-sm border border-border bg-background px-2 text-sm"
            />
            <button
              type="button"
              disabled={!form.name.trim()}
              onClick={() => {
                crm.addExhibition({
                  name: form.name.trim(),
                  place: form.place.trim() || "Surat, Gujarat",
                  dates: form.dates.trim() || "Dates to be fixed",
                });
                setForm({ name: "", place: "", dates: "" });
              }}
              className="h-9 shrink-0 rounded-sm bg-primary px-3 text-sm font-semibold text-primary-foreground disabled:opacity-40"
            >
              Add
            </button>
          </div>
        </div>
      </Panel>

      {ex && (
        <div className="space-y-4">
          <Panel title={ex.name} subtitle={`${ex.place} · ${ex.dates}`}>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Stat label="Leads captured" value={String(ex.leads)} />
              <Stat label="QR scans" value={String(ex.scans)} />
              <Stat label="Capture devices" value={String(ex.devices)} />
              <Stat label="Prices sent" value={String(ex.pricesSent)} />
            </div>
            <p className="label-caps mt-4">Most asked qualities</p>
            <ul className="mt-2 space-y-1.5">
              {ex.topQualities.map((t) => (
                <li key={t.quality} className="flex items-center gap-2 text-xs">
                  <span className="min-w-0 flex-1 truncate">{t.quality}</span>
                  <span className="relative h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                    <span
                      className="absolute inset-y-0 left-0 rounded-full bg-primary"
                      style={{ width: `${Math.min(100, t.asks * 9)}%` }}
                    />
                  </span>
                  <span className="num w-8 text-right text-muted-foreground">{t.asks}</span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel
            title="Share links"
            subtitle="Catalogue and stand links carry the event name into every lead"
            action={
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => crm.addLink(ex.id, "Catalogue link", crm.collections[0])}
                  className="rounded-sm border border-border px-2 py-1 text-[11px] font-semibold"
                >
                  <Link2 className="mr-1 inline size-3" /> Catalogue
                </button>
                <button
                  type="button"
                  onClick={() => crm.addLink(ex.id, "Stand QR")}
                  className="rounded-sm border border-border px-2 py-1 text-[11px] font-semibold"
                >
                  Stand QR
                </button>
              </div>
            }
            bodyClassName="p-0"
          >
            <ul className="divide-y divide-border">
              {ex.links.length === 0 && <li className="px-4 py-6 text-center text-xs text-muted-foreground">No link is live for this event.</li>}
              {ex.links.map((l) => (
                <li key={l.id} className="px-4 py-2.5 text-xs">
                  <p className="font-medium">
                    {l.kind}
                    {l.collection ? ` — ${l.collection}` : ""}
                  </p>
                  <p className="num text-[11px] text-muted-foreground">
                    Expires {l.expiry} · cap {l.cap} opens
                  </p>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-border bg-surface-sunken px-3 py-2">
      <p className="label-caps">{label}</p>
      <p className="num mt-1 text-lg font-semibold leading-none">{value}</p>
    </div>
  );
}

/* ---------------- Master details queue ---------------- */

function MasterQueue() {
  const crm = useCrm();
  const inMaster = crm.leads.filter((l) => l.inMaster);
  const ready = crm.leads.filter((l) => !l.inMaster && l.orders.some((o) => o.status === "Confirmed"));

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Panel title="Missing master details" subtitle="Accounts cannot bill until these are filled" bodyClassName="p-0">
        <ul className="divide-y divide-border">
          {inMaster.length === 0 && <li className="px-4 py-6 text-center text-xs text-muted-foreground">No party is in the master yet.</li>}
          {inMaster.map((l) => (
            <li key={l.id} className="px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <button type="button" onClick={() => crm.openLead(l.id)} className="text-sm font-semibold hover:underline">
                    {l.firm}
                  </button>
                  <p className="num text-[11px] text-muted-foreground">
                    {l.leadNo} · {l.city}
                  </p>
                </div>
                <Pill tone={l.missingMaster.length ? "warn" : "success"}>
                  {l.missingMaster.length ? `${l.missingMaster.length} pending` : "Complete"}
                </Pill>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {masterFields.map((f) => {
                  const pending = l.missingMaster.includes(f);
                  return (
                    <button
                      key={f}
                      type="button"
                      disabled={!pending}
                      onClick={() => crm.fillMasterField(l.id, f)}
                      className={cn(
                        "rounded-sm border px-1.5 py-0.5 text-[11px]",
                        pending
                          ? "border-warn/30 bg-warn-soft text-warn"
                          : "border-border bg-surface-sunken text-muted-foreground",
                      )}
                    >
                      {pending ? f : <span className="inline-flex items-center gap-1"><CheckCircle2 className="size-2.5" />{f}</span>}
                    </button>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Ready to become a customer" subtitle="Confirmed orders still sitting as a lead" bodyClassName="p-0">
        <ul className="divide-y divide-border">
          {ready.length === 0 && (
            <li className="px-4 py-6 text-center text-xs text-muted-foreground">Nothing waiting — every confirmed order is in the master.</li>
          )}
          {ready.map((l) => (
            <li key={l.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{l.firm}</p>
                <p className="num text-[11px] text-muted-foreground">
                  {l.leadNo} · {money(l.orders.reduce((s, o) => s + o.value, 0))}
                </p>
              </div>
              <button
                type="button"
                onClick={() => crm.addToMaster(l.id)}
                className="shrink-0 rounded-sm bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground"
              >
                Add to master
              </button>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

/* ---------------- Party popup ---------------- */

const TABS = ["Interest", "Papers", "History", "Notes"] as const;

function PartyPopup() {
  const crm = useCrm();
  const lead = crm.leads.find((l) => l.id === crm.openLeadId) ?? null;
  const [tab, setTab] = useState<(typeof TABS)[number]>("Interest");
  const [note, setNote] = useState("");
  const [newInq, setNewInq] = useState({ quality: "", colour: "BLACK", askedKg: "" });

  return (
    <Dialog open={!!lead} onOpenChange={(o) => !o && crm.openLead(null)}>
      <DialogContent className="max-h-[92vh] w-[min(1080px,96vw)] max-w-none overflow-y-auto p-0 sm:max-w-none">
        {lead && (
          <>
            <DialogTitle className="sr-only">{lead.firm}</DialogTitle>
            <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4">
              <div>
                <p className="num text-[11px] text-muted-foreground">{lead.leadNo}</p>
                <h2 className="text-lg font-semibold leading-tight">{lead.firm}</h2>
                <p className="text-xs text-muted-foreground">
                  {lead.name} · {lead.mobile} · {lead.city} · {lead.kind} · via {lead.source}
                  {lead.fair ? ` (${lead.fair})` : ""}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <Pill tone={statusTone(deriveStatus(lead))}>{deriveStatus(lead)}</Pill>
                  <Pill tone={tempTone(lead.temperature)}>{lead.temperature}</Pill>
                  {lead.agent && <Pill tone="neutral">Agent {lead.agent}</Pill>}
                  {lead.inMaster && <Pill tone="success">In customer master</Pill>}
                  {lead.lostReason && <Pill tone="danger">Lost — {lead.lostReason}</Pill>}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <select
                  value={lead.owner ?? "Unassigned"}
                  onChange={(e) => crm.assign(lead.id, e.target.value)}
                  className="h-8 rounded-sm border border-border bg-background px-2 text-xs"
                >
                  {owners.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
                <MiniAction onClick={() => crm.logTouch(lead.id, "Spoke on WhatsApp")}>Log touch</MiniAction>
                <MiniAction onClick={() => crm.setFollowUp(lead.id, "15 Sep 2026")}>Follow-up 15 Sep</MiniAction>
                {lead.lostReason ? (
                  <MiniAction onClick={() => crm.reopen(lead.id)}>
                    <Undo2 className="mr-1 inline size-3" />
                    Reopen
                  </MiniAction>
                ) : (
                  <select
                    defaultValue=""
                    onChange={(e) => e.target.value && crm.markLost(lead.id, e.target.value)}
                    className="h-8 rounded-sm border border-border bg-background px-2 text-xs"
                  >
                    <option value="">Mark lost…</option>
                    {lostReasons.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                )}
              </div>
            </header>

            <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="min-w-0 border-border lg:border-r">
                <div className="flex items-center gap-1 border-b border-border px-5 py-2">
                  {TABS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTab(t)}
                      className={cn(
                        "rounded-sm px-2.5 py-1 text-xs font-semibold",
                        tab === t ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-surface-sunken",
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <div className="space-y-4 px-5 py-4">
                  {tab === "Interest" && (
                    <>
                      <ul className="space-y-2">
                        {lead.inquiries.length === 0 && (
                          <li className="rounded-sm border border-dashed border-border px-3 py-5 text-center text-xs text-muted-foreground">
                            No quality asked yet. Add what the party wants and the ladder moves on its own.
                          </li>
                        )}
                        {lead.inquiries.map((i) => (
                          <li key={i.id} className={cn("rounded-sm border border-border p-3", !i.open && "opacity-60")}>
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex min-w-0 items-start gap-2.5">
                                <span className="mt-0.5 size-6 shrink-0 rounded-sm border border-border" style={{ background: i.swatch }} />
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold">
                                    {i.quality} {i.qualityName} · {i.colour}
                                  </p>
                                  <p className="num text-[11px] text-muted-foreground">
                                    {i.id} · asked {i.askedKg} kg on {i.askedOn}
                                    {i.moq ? ` · MOQ ${i.moq} kg` : ""}
                                    {i.leadTimeDays ? ` · ${i.leadTimeDays} days lead` : ""}
                                  </p>
                                </div>
                              </div>
                              <div className="shrink-0 text-right">
                                <p className="num text-sm font-semibold">
                                  {i.rate ? `₹${i.rate}/kg` : i.lastSoldRate ? `last sold ₹${i.lastSoldRate}/kg` : "rate awaited"}
                                </p>
                                <p className="num text-[11px] text-muted-foreground">
                                  {i.availableKg ? `${i.availableKg} kg in godown` : "nothing free in godown"}
                                  {i.onOrderKg ? ` · ${i.onOrderKg} kg on order` : ""}
                                </p>
                              </div>
                            </div>
                            <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-border pt-2.5">
                              <Pill tone={i.priceSentOn ? "success" : "warn"}>
                                {i.priceSentOn ? `Price sent ${i.priceSentOn}` : "Price not sent"}
                              </Pill>
                              {i.open ? (
                                <>
                                  {!i.priceSentOn && <MiniAction onClick={() => crm.sendPrice(lead.id, i.id)}>Send price</MiniAction>}
                                  <MiniAction onClick={() => crm.raiseQuotation(lead.id, i.id)}>Raise quotation</MiniAction>
                                  <MiniAction onClick={() => crm.requestSample(lead.id, i.id)}>Sample</MiniAction>
                                  <MiniAction onClick={() => crm.createOrder(lead.id, i.id)}>Create order</MiniAction>
                                  <select
                                    defaultValue=""
                                    onChange={(e) => e.target.value && crm.closeInquiry(lead.id, i.id, e.target.value)}
                                    className="h-6 rounded-sm border border-border bg-background px-1 text-[11px]"
                                  >
                                    <option value="">Close…</option>
                                    {lostReasons.map((r) => (
                                      <option key={r}>{r}</option>
                                    ))}
                                  </select>
                                </>
                              ) : (
                                <Pill tone="neutral">Closed</Pill>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>

                      <div className="grid gap-2 rounded-sm border border-border bg-surface-sunken p-3 sm:grid-cols-[1fr_1fr_90px_auto]">
                        <input
                          value={newInq.quality}
                          onChange={(e) => setNewInq({ ...newInq, quality: e.target.value })}
                          placeholder="Quality e.g. UK-614"
                          className="h-9 rounded-sm border border-border bg-background px-2 text-sm"
                        />
                        <input
                          value={newInq.colour}
                          onChange={(e) => setNewInq({ ...newInq, colour: e.target.value })}
                          placeholder="Colour"
                          className="h-9 rounded-sm border border-border bg-background px-2 text-sm"
                        />
                        <input
                          value={newInq.askedKg}
                          onChange={(e) => setNewInq({ ...newInq, askedKg: e.target.value })}
                          placeholder="kg"
                          className="num h-9 rounded-sm border border-border bg-background px-2 text-sm"
                        />
                        <button
                          type="button"
                          disabled={!newInq.quality.trim()}
                          onClick={() => {
                            crm.addInquiry(lead.id, {
                              quality: newInq.quality.trim().toUpperCase(),
                              qualityName: "",
                              colour: newInq.colour.trim().toUpperCase() || "GREY",
                              askedKg: Number(newInq.askedKg) || 100,
                            });
                            setNewInq({ quality: "", colour: "BLACK", askedKg: "" });
                          }}
                          className="h-9 rounded-sm bg-primary px-3 text-sm font-semibold text-primary-foreground disabled:opacity-40"
                        >
                          Add interest
                        </button>
                      </div>
                    </>
                  )}

                  {tab === "Papers" && (
                    <div className="space-y-4">
                      <PaperList
                        title="Quotations"
                        rows={lead.quotations.map((qt) => ({
                          id: qt.id,
                          left: `${qt.id} · ${qt.on}`,
                          right: money(qt.total),
                          pill: qt.converted ? "Converted" : qt.sent ? "Sent" : "Draft",
                        }))}
                        empty="No quotation raised for this party."
                      />
                      <PaperList
                        title="Samples"
                        rows={lead.samples.map((s) => ({
                          id: s.id,
                          left: `${s.id} · ${s.quality}`,
                          right: s.sentOn ?? "not sent",
                          pill: s.feedback ?? "Feedback awaited",
                        }))}
                        empty="No sample went out."
                      />
                      <PaperList
                        title="Orders"
                        rows={lead.orders.map((o) => ({
                          id: o.id,
                          left: `${o.id} · ${o.kindOf}`,
                          right: o.value ? money(o.value) : "sample, no value",
                          pill: o.status,
                          action:
                            o.status !== "Confirmed" && o.kindOf === "Regular" ? (
                              <MiniAction onClick={() => crm.confirmOrder(lead.id, o.id)}>Confirm</MiniAction>
                            ) : undefined,
                        }))}
                        empty="No order written yet."
                      />
                      <div>
                        <p className="label-caps">Documents</p>
                        <ul className="mt-2 space-y-1.5">
                          {lead.documents.length === 0 && (
                            <li className="text-xs text-muted-foreground">Nothing attached — GST paper and visiting card usually sit here.</li>
                          )}
                          {lead.documents.map((d) => (
                            <li key={d.id} className="flex items-center gap-2 text-xs">
                              <FileText className="size-3.5 text-muted-foreground" />
                              <span className="font-medium">{d.name}</span>
                              <span className="text-muted-foreground">{d.kind}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-2 flex gap-1.5">
                          <MiniAction onClick={() => crm.addDocument(lead.id, "GST certificate.pdf", "GST paper")}>Attach GST paper</MiniAction>
                          <MiniAction onClick={() => crm.addDocument(lead.id, "Visiting card.jpg", "Visiting card")}>Attach card</MiniAction>
                        </div>
                      </div>
                    </div>
                  )}

                  {tab === "History" && (
                    <ol className="space-y-3">
                      {[...lead.history].reverse().map((h, idx) => (
                        <li key={`${h.on}-${idx}`} className="relative pl-5">
                          <span className="absolute left-0 top-1.5 size-2 rounded-full bg-primary" />
                          <p className="text-sm">{h.text}</p>
                          <p className="num text-[11px] text-muted-foreground">
                            {h.kind} · {h.on} · {h.by}
                          </p>
                        </li>
                      ))}
                    </ol>
                  )}

                  {tab === "Notes" && (
                    <div className="space-y-3">
                      <ul className="space-y-2">
                        {lead.notes.length === 0 && <li className="text-xs text-muted-foreground">No note written for this party.</li>}
                        {lead.notes.map((n) => (
                          <li key={n.id} className="rounded-sm border border-border p-3">
                            <p className="text-sm">{n.text}</p>
                            <p className="num text-[11px] text-muted-foreground">
                              {n.verdict} · {n.assignee} · {n.on}
                            </p>
                          </li>
                        ))}
                      </ul>
                      <div className="flex gap-2">
                        <input
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          placeholder="What did the party say?"
                          className="h-9 min-w-0 flex-1 rounded-sm border border-border bg-background px-2 text-sm"
                        />
                        <button
                          type="button"
                          disabled={!note.trim()}
                          onClick={() => {
                            crm.addNote(lead.id, note.trim(), "Follow up", lead.owner ?? "RS");
                            setNote("");
                          }}
                          className="h-9 rounded-sm bg-primary px-3 text-sm font-semibold text-primary-foreground disabled:opacity-40"
                        >
                          Save note
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <aside className="space-y-4 bg-surface-sunken px-5 py-4">
                <div>
                  <p className="label-caps">Where this party stands</p>
                  <ol className="mt-2 space-y-1.5">
                    {["Contacted", "Inquiry raised", "Price sent", "Quotation sent", "Order created", "Order confirmed"].map((s) => {
                      const done = lead.history.some((h) => h.kind === s) || deriveStatus(lead) === s;
                      return (
                        <li key={s} className="flex items-center gap-2 text-xs">
                          <span className={cn("grid size-4 place-items-center rounded-full border", done ? "border-primary bg-primary text-primary-foreground" : "border-border")}>
                            {done && <CheckCircle2 className="size-3" />}
                          </span>
                          <span className={done ? "font-medium" : "text-muted-foreground"}>{s}</span>
                        </li>
                      );
                    })}
                  </ol>
                </div>

                <div className="rounded-sm border border-ai/20 bg-ai-soft p-3">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-ai">
                    <AiTag /> Reading of this party
                  </p>
                  <p className="mt-1.5 text-[11px] leading-4 text-muted-foreground">
                    {lead.inquiries.some((i) => i.open && !i.priceSentOn)
                      ? "A quality is asked but no price has gone out — send the rate today, this is where parties go quiet."
                      : lead.quotations.length && !lead.orders.length
                        ? "Quotation is out with no order behind it. A call on the rate usually closes this."
                        : lead.orders.some((o) => o.status !== "Confirmed")
                          ? "Order sits as a draft — confirm it to reserve godown stock."
                          : "Nothing urgent. Keep the follow-up date honest."}
                  </p>
                </div>

                <div>
                  <p className="label-caps">Dispatch & money</p>
                  <ul className="num mt-2 space-y-1 text-xs">
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">Shipped</span>
                      <span>{lead.dispatch.shippedKg} kg</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">Invoiced</span>
                      <span>{money(lead.dispatch.invoiced)}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">Advance outstanding</span>
                      <span className={lead.dispatch.advanceOutstanding ? "text-danger" : undefined}>
                        {money(lead.dispatch.advanceOutstanding)}
                      </span>
                    </li>
                  </ul>
                </div>

                {!lead.inMaster && (
                  <button
                    type="button"
                    onClick={() => crm.addToMaster(lead.id)}
                    className="w-full rounded-sm bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
                  >
                    Add to customer master
                  </button>
                )}
                {lead.inMaster && lead.missingMaster.length > 0 && (
                  <div className="rounded-sm border border-warn/30 bg-warn-soft p-3">
                    <p className="text-xs font-semibold text-warn">Master details pending</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {lead.missingMaster.map((f) => (
                        <MiniAction key={f} onClick={() => crm.fillMasterField(lead.id, f)}>
                          {f}
                        </MiniAction>
                      ))}
                    </div>
                  </div>
                )}
              </aside>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function PaperList({
  title,
  rows,
  empty,
}: {
  title: string;
  rows: { id: string; left: string; right: string; pill: string; action?: React.ReactNode }[];
  empty: string;
}) {
  return (
    <div>
      <p className="label-caps">{title}</p>
      <ul className="mt-2 space-y-1.5">
        {rows.length === 0 && <li className="text-xs text-muted-foreground">{empty}</li>}
        {rows.map((r) => (
          <li key={r.id} className="flex flex-wrap items-center gap-2 rounded-sm border border-border px-2.5 py-2 text-xs">
            <span className="num min-w-0 flex-1 truncate font-medium">{r.left}</span>
            <span className="num">{r.right}</span>
            <Pill tone="neutral">{r.pill}</Pill>
            {r.action}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------- New lead ---------------- */

function NewLeadDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const crm = useCrm();
  const [f, setF] = useState({
    name: "",
    firm: "",
    mobile: "",
    city: "Surat",
    kind: "Customer" as PartyKind,
    source: "Call" as Source,
    fair: "",
    owner: "RS",
    temperature: "Warm" as Temperature,
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="w-[min(560px,94vw)]">
        <DialogTitle>New lead</DialogTitle>
        <p className="text-xs text-muted-foreground">
          Capture the party only. Interest, price and orders get added on the record — the status follows them.
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <Field label="Contact name">
            <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Firm">
            <input value={f.firm} onChange={(e) => setF({ ...f, firm: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Mobile">
            <input value={f.mobile} onChange={(e) => setF({ ...f, mobile: e.target.value })} className={inputCls} />
          </Field>
          <Field label="City">
            <input value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Party type">
            <select value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value as PartyKind })} className={inputCls}>
              {partyKinds.map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
          </Field>
          <Field label="Source">
            <select value={f.source} onChange={(e) => setF({ ...f, source: e.target.value as Source })} className={inputCls}>
              {sources.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Event (if any)">
            <input value={f.fair} onChange={(e) => setF({ ...f, fair: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Owner">
            <select value={f.owner} onChange={(e) => setF({ ...f, owner: e.target.value })} className={inputCls}>
              {owners.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </Field>
          <Field label="Temperature">
            <select
              value={f.temperature}
              onChange={(e) => setF({ ...f, temperature: e.target.value as Temperature })}
              className={inputCls}
            >
              {temperatures.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="h-9 rounded-sm border border-border px-3 text-sm font-semibold">
            Cancel
          </button>
          <button
            type="button"
            disabled={!f.firm.trim() || !f.name.trim()}
            onClick={() => {
              const id = crm.addLead({
                name: f.name.trim(),
                firm: f.firm.trim(),
                mobile: f.mobile.trim() || "+91 —",
                city: f.city.trim() || "Surat",
                kind: f.kind,
                source: f.source,
                fair: f.fair.trim() || null,
                owner: f.owner === "Unassigned" ? null : f.owner,
                temperature: f.temperature,
              });
              onClose();
              crm.openLead(id);
            }}
            className="h-9 rounded-sm bg-primary px-3 text-sm font-semibold text-primary-foreground disabled:opacity-40"
          >
            Save lead
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const inputCls = "h-9 w-full rounded-sm border border-border bg-background px-2 text-sm";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label-caps">{label}</span>
      <span className="mt-1 block">{children}</span>
    </label>
  );
}
