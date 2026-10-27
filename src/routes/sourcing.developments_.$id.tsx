import { useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, FileText, ImagePlus, Paperclip, Plus, X } from "lucide-react";
import { AppShell } from "@/components/erp/AppShell";
import { ModuleNav } from "@/components/erp/ModuleNav";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/erp/primitives";
import { CostSheetReference } from "@/components/erp/CostSheetReference";
import { useSourcing, type DevelopmentColour, type SupplierColourTrack } from "@/lib/sourcing-reference";

export const Route = createFileRoute("/sourcing/developments_/$id")({
  head: ({ params }) => ({ meta: [{ title: `${params.id} — UKNITEX Development` }, { name: "description", content: "Current status and full history of a fabric development, colour by colour and supplier by supplier." }, { property: "og:title", content: `UKNITEX Development ${params.id}` }, { property: "og:description", content: "What has happened and what needs a decision now." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: DevelopmentDetail,
});

const STAGES = ["Requirement ready", "Costing requested", "Cost received", "Cost accepted", "Sample requested", "Sample received", "Feedback due", "Approved", "Rejected"];
const stageTone = (stage: string) => (stage === "Approved" || stage === "Cost accepted" ? "success" : stage === "Rejected" ? "danger" : stage === "Feedback due" ? "warn" : "info");

function DevelopmentDetail() {
  const { id } = Route.useParams();
  const { developments, update } = useSourcing();
  const d = developments.find((row) => row.id === id);
  const [supplier, setSupplier] = useState("");
  const [colour, setColour] = useState("");
  const [note, setNote] = useState("");
  const [visible, setVisible] = useState(true);
  const [followUp, setFollowUp] = useState("");
  const [costTarget, setCostTarget] = useState<{ colour: string; supplier: string } | null>(null);
  const [trailFilter, setTrailFilter] = useState("All");

  if (!d) return <AppShell breadcrumb={["Sourcing", "Development"]}><h1 className="text-2xl font-semibold">Development not in this reference</h1><Button className="mt-4" asChild><Link to="/sourcing/developments">Back to the tracker</Link></Button></AppShell>;

  const saveColour = (colourName: string, change: Partial<DevelopmentColour>) => update(id, { colours: d.colours.map((item) => item.name === colourName ? { ...item, ...change } : item) });
  const updateTrack = (colourName: string, supplierName: string, change: Partial<SupplierColourTrack>) => update(id, { colours: d.colours.map((item) => item.name === colourName ? { ...item, supplierTracks: item.supplierTracks.map((track) => track.supplier === supplierName ? { ...track, ...change } : track) } : item) });
  const addSupplier = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = supplier.trim();
    if (!name) return;
    const nextColours = d.colours.map((item) => ({ ...item, supplierTracks: item.supplierTracks.some((track) => track.supplier === name) ? item.supplierTracks : [...item.supplierTracks, { supplier: name, stage: "Requirement ready", ratePerKg: "", costSheetStatus: "Not requested", sampleNo: "—", feedback: "", proof: [] }] }));
    update(id, { suppliers: d.suppliers.includes(name) ? d.suppliers : [...d.suppliers, name], colours: nextColours });
    setSupplier("");
  };
  const addColour = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = colour.trim();
    if (!name || d.colours.some((item) => item.name.toLowerCase() === name.toLowerCase())) return;
    const supplierTracks = d.suppliers.map((supplierName) => ({ supplier: supplierName, stage: "Requirement ready", ratePerKg: "", costSheetStatus: "Not requested", sampleNo: "—", feedback: "", proof: [] }));
    update(id, { colours: [...d.colours, { name, status: "Not requested", sampleNo: "—", supplierTracks }] });
    setColour("");
  };
  const addTrackSupplier = (colourName: string, supplierName: string) => {
    const name = supplierName.trim();
    if (!name) return;
    const item = d.colours.find((entry) => entry.name === colourName);
    if (!item || item.supplierTracks.some((track) => track.supplier.toLowerCase() === name.toLowerCase())) return;
    update(id, { suppliers: d.suppliers.some((value) => value.toLowerCase() === name.toLowerCase()) ? d.suppliers : [...d.suppliers, name], colours: d.colours.map((entry) => entry.name === colourName ? { ...entry, supplierTracks: [...entry.supplierTracks, { supplier: name, stage: "Requirement ready", ratePerKg: "", costSheetStatus: "Not requested", sampleNo: "—", feedback: "", proof: [] }] } : entry) });
  };

  const approvedTracks = d.colours.reduce((sum, item) => sum + item.supplierTracks.filter((track) => track.stage === "Approved" || track.stage === "Cost accepted").length, 0);
  const pendingDecisions = d.colours.reduce((sum, item) => sum + item.supplierTracks.filter((track) => track.stage === "Feedback due").length, 0);

  const addNote = () => {
    const text = note.trim();
    if (!text) return;
    update(id, { notes: [...d.notes, `${visible ? "Team" : "Private"} · ${text}${followUp ? ` · Follow-up ${followUp}` : ""}`] });
    setNote("");
    setFollowUp("");
  };

  return <AppShell breadcrumb={["Sourcing", d.id]}><ModuleNav active="developments" /><Link to="/sourcing/developments" className="inline-flex items-center gap-2 text-xs text-muted-foreground"><ArrowLeft className="size-3" />Stage tracker</Link>

    <header className="mb-5 border-b border-border pb-4"><div className="flex flex-wrap items-center gap-2"><span className="num text-xs font-medium text-primary">{d.id}</span><Pill tone={d.status === "Samples approved" ? "success" : "info"}>{d.status}</Pill></div><h1 className="mt-2 max-w-2xl text-xl font-semibold leading-tight sm:text-2xl">{d.title}</h1><p className="mt-2 text-xs text-muted-foreground">{d.collection || "No collection"} · {d.category} · {d.colours.length} colours · {d.colours.reduce((sum, item) => sum + item.supplierTracks.length, 0)} supplier tracks</p>
      <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">{[`${d.samples} samples asked`, `${approvedTracks} approved`, `${pendingDecisions} decisions waiting`, `${d.documents.length} papers`].map((chip) => <span key={chip} className="rounded-sm border border-border bg-surface px-2 py-1 text-muted-foreground">{chip}</span>)}</div>
    </header>

    <section aria-label="Suppliers on this development" className="mb-5"><div className="flex flex-wrap items-center gap-1.5">{d.suppliers.map((name) => <span key={name} className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-surface px-2 py-1 text-xs font-medium">{name}<button type="button" aria-label={`Remove ${name}`} onClick={() => { update(id, { suppliers: d.suppliers.filter((value) => value !== name), colours: d.colours.map((item) => ({ ...item, supplierTracks: item.supplierTracks.filter((track) => track.supplier !== name) })) }); }}><X className="size-3 text-muted-foreground" /></button></span>)}{d.suppliers.length === 0 && <span className="text-xs text-muted-foreground">No supplier linked yet.</span>}</div>
      <form className="mt-2 flex gap-2" onSubmit={addSupplier}><input aria-label="New supplier" className="reference-input" placeholder="Add a mill or supplier…" value={supplier} onChange={(e) => setSupplier(e.target.value)} /><Button variant="outline" type="submit" size="icon" aria-label="Add supplier" disabled={!supplier.trim()}><Plus /></Button></form>
    </section>

    <section aria-label="Where things stand" className="mb-6"><h2 className="text-base font-semibold">Where things stand</h2><p className="mt-1 text-xs text-muted-foreground">Every colour moves on its own; each supplier answers separately.</p>
      <div className="mt-3 divide-y divide-border border-y border-border">{d.colours.map((c) => <article key={c.name} className="py-3">
        <div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-semibold">{c.name}</h3><Pill tone={c.status === "Approved" ? "success" : c.status === "Rejected" ? "danger" : "warn"}>{c.status}</Pill><Button className="ml-auto" variant="outline" size="sm" disabled={c.supplierTracks.length === 0} onClick={() => { update(id, { samples: d.samples + c.supplierTracks.length, colours: d.colours.map((item) => item.name === c.name ? { ...item, status: "Sampling", supplierTracks: item.supplierTracks.map((track) => ({ ...track, stage: track.stage === "Approved" || track.stage === "Rejected" ? track.stage : "Sample requested", sampleNo: track.sampleNo === "—" ? `SS-REF-${String(d.samples + 1).padStart(4, "0")}` : track.sampleNo })) } : item), notes: [...d.notes, `Sample requested · ${c.name} · ${c.supplierTracks.length} suppliers`] }); }}><Plus />Ask samples</Button></div>
        {c.supplierTracks.length === 0 ? <p className="mt-2 border-l-2 border-border pl-3 text-xs text-muted-foreground">No supplier assigned for this colour yet — add one below.</p>
          : <div className="mt-2 space-y-2">{c.supplierTracks.map((track) => <TrackRow key={track.supplier} colour={c} track={track} onUpdate={(change) => updateTrack(c.name, track.supplier, change)} onCostSheet={() => setCostTarget({ colour: c.name, supplier: track.supplier })} onAskSample={() => { updateTrack(c.name, track.supplier, { stage: "Sample requested", sampleNo: `SS-REF-${String(d.samples + 1).padStart(4, "0")}` }); saveColour(c.name, { status: "Sampling" }); update(id, { samples: d.samples + 1, notes: [...d.notes, `Sample requested · ${c.name} · ${track.supplier}`] }); }} onProof={(file) => updateTrack(c.name, track.supplier, { proof: [...track.proof, file] })} />)}</div>}
        <form className="mt-2 flex gap-2" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); addTrackSupplier(c.name, String(data.get("supplier") ?? "")); event.currentTarget.reset(); }}><input name="supplier" aria-label={`Supplier for ${c.name}`} className="reference-input min-w-0 flex-1" placeholder={`Add supplier for ${c.name}…`} /><Button variant="outline" size="sm" type="submit"><Plus />Assign</Button></form>
      </article>)}</div>
      <form className="mt-3 flex gap-2" onSubmit={addColour}><input className="reference-input" aria-label="New colour" placeholder="Add a colour, e.g. Navy…" value={colour} onChange={(e) => setColour(e.target.value)} /><Button variant="outline" size="icon" aria-label="Add colour" disabled={!colour.trim() || d.colours.some((item) => item.name.toLowerCase() === colour.trim().toLowerCase())}><Plus /></Button></form>
    </section>

    <section aria-label="What has happened" className="mb-6"><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-base font-semibold">What has happened</h2><div className="flex">{["All", "Notes", "Changes"].map((tab) => <Button key={tab} size="sm" variant={trailFilter === tab ? "secondary" : "ghost"} onClick={() => setTrailFilter(tab)}>{tab}</Button>)}</div></div>
      <div className="divide-y divide-border border-y border-border">
        {trailFilter !== "Changes" && d.notes.map((n, i) => <p key={`note-${i}`} className="py-2.5 text-xs">{n}</p>)}
        {trailFilter !== "Notes" && <p className="py-2.5 text-xs text-muted-foreground">Concept created · Demo Owner · 09 Oct 2026</p>}
        {trailFilter !== "Changes" && d.notes.length === 0 && <p className="py-2.5 text-xs text-muted-foreground">Nothing noted yet — team updates will appear here.</p>}
      </div>
      <form className="mt-3" onSubmit={(event) => { event.preventDefault(); addNote(); }}><input aria-label="Development note" className="reference-input" placeholder="What was said, decided or asked…" value={note} onChange={(e) => setNote(e.target.value)} />
        <div className="mt-2 flex flex-wrap items-center gap-3"><label className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} className="size-3.5" />Visible to team</label><input aria-label="Follow-up date" type="date" className="reference-input w-auto text-xs" value={followUp} onChange={(e) => setFollowUp(e.target.value)} /><Button className="ml-auto" size="sm" disabled={!note.trim()}><Check />Add note</Button></div>
      </form>
    </section>

    <details className="mb-6 border-y border-border" aria-label="Papers and proof"><summary className="flex cursor-pointer items-center gap-2 py-3 text-sm font-semibold"><Paperclip className="size-4 text-muted-foreground" />Papers &amp; proof<span className="num ml-auto text-xs text-muted-foreground">{d.documents.length}</span></summary>
      {d.documents.length ? <ul className="divide-y divide-border border-t border-border">{d.documents.map((name, i) => <li key={`${name}-${i}`} className="flex items-center gap-2 py-2.5 text-xs"><Paperclip className="size-3.5 text-muted-foreground" />{name}</li>)}</ul>
        : <p className="border-t border-border py-3 text-xs text-muted-foreground">Swatch photos, lab dips and costing sheets will collect here.</p>}
      <label className="mb-3 inline-flex cursor-pointer items-center gap-2 rounded-sm border border-border px-3 py-2 text-xs font-medium"><ImagePlus className="size-3.5" />Attach photo or document<input type="file" className="sr-only" onChange={(e) => { const file = e.target.files?.[0]; if (file) update(id, { documents: [...d.documents, file.name] }); }} /></label>
    </details>

    <CostSheetReference open={costTarget !== null} onOpenChange={(open) => { if (!open) setCostTarget(null); }} colourName={costTarget?.colour} supplierName={costTarget?.supplier} onSaved={(approved) => { if (!costTarget) return; const target = costTarget; update(id, { colours: d.colours.map((item) => item.name === target.colour ? { ...item, supplierTracks: item.supplierTracks.map((track) => track.supplier === target.supplier ? { ...track, costSheetStatus: approved ? "Approved" : "Draft saved", stage: approved ? "Cost accepted" : track.stage } : track) } : item), notes: [...d.notes, `${approved ? "Cost sheet approved" : "Cost sheet draft saved"} · ${target.colour} · ${target.supplier}`] }); if (approved) setCostTarget(null); }} />
  </AppShell>;
}

function TrackRow({ colour, track, onUpdate, onCostSheet, onAskSample, onProof }: { colour: DevelopmentColour; track: SupplierColourTrack; onUpdate: (change: Partial<SupplierColourTrack>) => void; onCostSheet: () => void; onAskSample: () => void; onProof: (file: string) => void }) {
  return <div className="border-l-2 border-primary/30 bg-surface-sunken/40 px-3 py-2.5">
    <div className="flex flex-wrap items-center gap-2"><p className="text-[13px] font-semibold">{track.supplier}</p><Pill tone={stageTone(track.stage)}>{track.stage}</Pill>
      <div className="ml-auto flex gap-1"><Button variant="outline" size="sm" onClick={onCostSheet}><FileText />Cost</Button><Button variant="ghost" size="sm" onClick={onAskSample}><Plus />Sample</Button></div></div>
    <p className="mt-1 text-[11px] text-muted-foreground">Cost sheet: {track.costSheetStatus}{track.ratePerKg ? ` · ₹${track.ratePerKg}/kg` : ""}{track.sampleNo !== "—" ? ` · Sample ${track.sampleNo}` : ""}{track.proof.length > 0 ? ` · Proof: ${track.proof.join(", ")}` : ""}</p>
    <div className="mt-2 grid gap-2 sm:grid-cols-[110px_110px_minmax(0,1fr)]">
      <label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Rate / kg<input aria-label={`${colour.name} ${track.supplier} rate per kg`} type="number" min="0" step="any" value={track.ratePerKg} onChange={(event) => onUpdate({ ratePerKg: event.target.value })} className="reference-input mt-1" placeholder="Not quoted" /></label>
      <label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Decision<select aria-label={`${colour.name} ${track.supplier} decision`} value={track.stage} onChange={(event) => onUpdate({ stage: event.target.value })} className="reference-input mt-1">{STAGES.map((stage) => <option key={stage}>{stage}</option>)}</select></label>
      <label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Feedback<input aria-label={`${colour.name} ${track.supplier} feedback`} value={track.feedback} onChange={(event) => onUpdate({ feedback: event.target.value })} className="reference-input mt-1" placeholder="What the supplier said…" /></label>
    </div>
    <label className="mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-sm border border-border px-2 py-1.5 text-[11px] font-medium"><ImagePlus className="size-3" />Add proof<input type="file" accept="image/*,.pdf" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) onProof(file.name); }} /></label>
  </div>;
}
