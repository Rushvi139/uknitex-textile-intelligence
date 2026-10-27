import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Search, SlidersHorizontal } from "lucide-react";
import { AppShell } from "@/components/erp/AppShell";
import { ModuleNav } from "@/components/erp/ModuleNav";
import { DevelopmentForm } from "@/components/erp/DevelopmentForm";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/erp/primitives";
import { useSourcing, type Development, type DevelopmentColour, type SupplierColourTrack } from "@/lib/sourcing-reference";

export const Route = createFileRoute("/sourcing/developments")({
  head: () => ({ meta: [{ title: "Product Developments — UKNITEX" }, { name: "description", content: "Every development, colour, supplier, sample stage and cost sheet in one list." }, { property: "og:title", content: "UKNITEX Product Developments" }, { property: "og:description", content: "Colour and supplier stage tracker across all developments." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: Developments,
});

type Row = { dev: Development; colour: DevelopmentColour; track: SupplierColourTrack | null };

const WAITING = ["Requirement ready", "Costing requested", "Cost received"];
const SAMPLING = ["Sample requested", "Sample received"];

const stageTone = (stage: string | null) =>
  stage === null ? "warn" : stage === "Approved" || stage === "Cost accepted" ? "success" : stage === "Rejected" ? "danger" : stage === "Feedback due" ? "warn" : "info";

const viewOf = (stage: string | null) =>
  !stage || WAITING.includes(stage) ? "supplier" : SAMPLING.includes(stage) ? "sampling" : stage === "Feedback due" ? "decision" : "decided";

const VIEWS: { key: string; label: string }[] = [
  { key: "all", label: "Everything" },
  { key: "supplier", label: "With supplier" },
  { key: "sampling", label: "Sampling" },
  { key: "decision", label: "Needs decision" },
  { key: "decided", label: "Decided" },
];

function Developments() {
  const { developments } = useSourcing();
  const [query, setQuery] = useState("");
  const [view, setView] = useState("all");

  const rows: Row[] = developments.flatMap((dev): Row[] =>
    dev.colours.flatMap((colour): Row[] =>
      colour.supplierTracks.length
        ? colour.supplierTracks.map((track) => ({ dev, colour, track }))
        : [{ dev, colour, track: null }],
    ),
  );

  const q = query.trim().toLowerCase();
  const visible = rows.filter((row) => {
    if (view !== "all" && viewOf(row.track?.stage ?? null) !== view) return false;
    if (!q) return true;
    const haystack = `${row.dev.id} ${row.dev.title} ${row.dev.collection} ${row.colour.name} ${row.track?.supplier ?? ""}`.toLowerCase();
    return haystack.includes(q);
  });

  const countFor = (key: string) => (key === "all" ? rows.length : rows.filter((row) => viewOf(row.track?.stage ?? null) === key).length);
  const open = (row: Row) => `/sourcing/developments/${row.dev.id}`;

  const stageLabel = (row: Row) => (row.track ? row.track.stage : "Not started");

  return <AppShell breadcrumb={["Commercial", "Sourcing", "Developments"]}><ModuleNav active="developments" />
    <header className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3"><div className="min-w-0"><p className="label-caps">Design &amp; development</p><h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Stage tracker</h1><p className="mt-1 text-sm text-muted-foreground">One row per colour and supplier, across every development.</p></div><div className="hidden sm:block"><DevelopmentForm /></div></header>
    <div className="mt-3 sm:hidden"><DevelopmentForm /></div>

    <label className="relative mt-4 block"><Search className="absolute left-3 top-3 size-4 text-muted-foreground" /><input aria-label="Search the tracker" value={query} onChange={(e) => setQuery(e.target.value)} className="reference-input pl-9" placeholder="Quality, colour, supplier…" /></label>

    <div className="mt-3 flex gap-1 overflow-x-auto pb-1" aria-label="Quick views">{VIEWS.map((v) => <Button key={v.key} variant="ghost" onClick={() => setView(v.key)} aria-pressed={view === v.key} className={`shrink-0 gap-1.5 rounded-sm border text-xs ${view === v.key ? "border-primary bg-accent/40 text-primary" : "border-border text-muted-foreground"}`}>{v.label}<span className="num">{countFor(v.key)}</span></Button>)}</div>

    <div className="mt-2 flex items-center justify-between"><p className="text-xs text-muted-foreground">{visible.length} of {rows.length} stage rows</p><Button variant="ghost" size="sm" onClick={() => { setQuery(""); setView("all"); }}><SlidersHorizontal />Reset</Button></div>

    {/* Mobile: one card per stage row */}
    <div className="mt-3 border-y border-border md:hidden">
      {visible.map((row) => <Link key={`${row.dev.id}-${row.colour.name}-${row.track?.supplier ?? "none"}`} to="/sourcing/developments/$id" params={{ id: row.dev.id }} className="block border-b border-border px-3 py-3 last:border-b-0 active:bg-accent/30">
        <div className="flex items-center justify-between gap-2"><p className="min-w-0 truncate text-[13px] font-semibold">{row.colour.name}<span className="ml-2 font-normal text-muted-foreground">{row.track?.supplier ?? "No supplier yet"}</span></p><Pill tone={stageTone(row.track?.stage ?? null)}>{stageLabel(row)}</Pill></div>
        <p className="num mt-1 text-[10px] text-primary">{row.dev.id}<span className="ml-2 font-sans text-[11px] text-muted-foreground">{row.dev.title}</span></p>
        <p className="mt-1 text-[11px] text-muted-foreground">Cost sheet: {row.track ? `${row.track.costSheetStatus}${row.track.ratePerKg ? ` · ₹${row.track.ratePerKg}/kg` : ""}` : "—"}{row.track?.sampleNo && row.track.sampleNo !== "—" ? ` · Sample ${row.track.sampleNo}` : ""}</p>
      </Link>)}
      {visible.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">Nothing in this quick view.</p>}
    </div>

    {/* Desktop: the same rows as a table */}
    <div className="mt-3 hidden overflow-x-auto border-y border-border md:block">
      <table className="w-full text-left text-sm"><thead className="bg-surface-sunken text-[11px] uppercase text-muted-foreground"><tr>{["Development", "Colour", "Supplier", "Stage", "Cost sheet", "Sample", ""].map((label) => <th key={label} className="px-3 py-2.5 font-medium">{label}</th>)}</tr></thead><tbody>
        {visible.map((row) => <tr key={`${row.dev.id}-${row.colour.name}-${row.track?.supplier ?? "none"}`} className="border-t border-border bg-surface hover:bg-accent/30">
          <td className="max-w-[260px] px-3 py-2.5"><p className="text-[13px] font-semibold leading-5">{row.dev.title}</p><p className="num mt-0.5 text-[10px] text-primary">{row.dev.id}<span className="ml-2 font-sans text-muted-foreground">{row.dev.collection || "—"}</span></p></td>
          <td className="px-3 text-[13px] font-medium">{row.colour.name}</td>
          <td className="px-3 text-xs text-muted-foreground">{row.track?.supplier ?? "Not linked"}</td>
          <td className="px-3"><Pill tone={stageTone(row.track?.stage ?? null)}>{stageLabel(row)}</Pill></td>
          <td className="px-3 text-xs text-muted-foreground">{row.track ? `${row.track.costSheetStatus}${row.track.ratePerKg ? ` · ₹${row.track.ratePerKg}/kg` : ""}` : "—"}</td>
          <td className="num px-3 text-xs">{row.track?.sampleNo && row.track.sampleNo !== "—" ? row.track.sampleNo : "—"}</td>
          <td className="px-3"><Button variant="ghost" size="icon" asChild><Link to="/sourcing/developments/$id" params={{ id: row.dev.id }} aria-label={`Open ${row.dev.title}`}><ArrowRight /></Link></Button></td>
        </tr>)}
        {visible.length === 0 && <tr><td colSpan={7} className="py-10 text-center text-sm text-muted-foreground">Nothing in this quick view.</td></tr>}
      </tbody></table>
    </div>

    <p className="mt-4 text-xs text-muted-foreground">Tap any row to open the development — what happened, what is pending, and the small actions for each supplier.</p>
  </AppShell>;
}
