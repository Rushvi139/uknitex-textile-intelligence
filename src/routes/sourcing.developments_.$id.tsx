import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, FileText, ImagePlus, MessageSquarePlus, Paperclip, Plus } from "lucide-react";
import { AppShell } from "@/components/erp/AppShell";
import { ModuleNav } from "@/components/erp/ModuleNav";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pill, Th, Td } from "@/components/erp/primitives";
import { CostSheetReference } from "@/components/erp/CostSheetReference";
import { useSourcing, type SupplierColourTrack } from "@/lib/sourcing-reference";

export const Route = createFileRoute("/sourcing/developments_/$id")({
  head: ({ params }) => ({ meta: [{ title: `${params.id} — UKNITEX Development` }, { name: "description", content: "Current status and full history of a fabric development, colour by colour and supplier by supplier." }, { property: "og:title", content: `UKNITEX Development ${params.id}` }, { property: "og:description", content: "What has happened and what needs a decision now." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: DevelopmentDetail,
});

const STAGES = ["Requirement ready", "Costing requested", "Cost received", "Cost accepted", "Sample requested", "Sample received", "Feedback due", "Approved", "Rejected"];
const stageTone = (stage: string) => (stage === "Approved" || stage === "Cost accepted" ? "success" : stage === "Rejected" ? "danger" : stage === "Feedback due" ? "warn" : "info");
const emptyTrack = (supplier: string): SupplierColourTrack => ({ supplier, stage: "Requirement ready", ratePerKg: "", costSheetStatus: "Not requested", sampleNo: "—", feedback: "", proof: [] });

function DevelopmentDetail() {
  const { id } = Route.useParams();
  const { developments, update } = useSourcing();
  const d = developments.find((row) => row.id === id);
  const [costTarget, setCostTarget] = useState<{ colour: string; supplier: string } | null>(null);
  const [remarkTarget, setRemarkTarget] = useState<{ colour: string; supplier: string } | null>(null);
  const [remarkOpen, setRemarkOpen] = useState(false);
  const [supplierOpen, setSupplierOpen] = useState(false);
  const [colourOpen, setColourOpen] = useState(false);
  const [trailFilter, setTrailFilter] = useState("All");
  // Remark pop-up state
  const [remarkText, setRemarkText] = useState("");
  const [remarkVisible, setRemarkVisible] = useState(true);
  const [remarkFollowUp, setRemarkFollowUp] = useState("");
  // Supplier / colour pop-up state
  const [supplierName, setSupplierName] = useState("");
  const [colourName, setColourName] = useState("");

  if (!d) return <AppShell breadcrumb={["Sourcing", "Development"]}><h1 className="text-2xl font-semibold">Development not in this reference</h1><Button className="mt-4" asChild><Link to="/sourcing/developments">Back to the tracker</Link></Button></AppShell>;

  const updateTrack = (colourName: string, supplierName: string, change: Partial<SupplierColourTrack>) => update(id, { colours: d.colours.map((item) => item.name === colourName ? { ...item, supplierTracks: item.supplierTracks.map((track) => track.supplier === supplierName ? { ...track, ...change } : track) } : item) });

  const addSupplier = () => {
    const name = supplierName.trim();
    if (!name || d.suppliers.some((value) => value.toLowerCase() === name.toLowerCase())) return;
    update(id, { suppliers: [...d.suppliers, name], colours: d.colours.map((item) => ({ ...item, supplierTracks: item.supplierTracks.some((track) => track.supplier.toLowerCase() === name.toLowerCase()) ? item.supplierTracks : [...item.supplierTracks, emptyTrack(name)] })) });
    setSupplierName("");
    setSupplierOpen(false);
  };
  const addColour = () => {
    const name = colourName.trim();
    if (!name || d.colours.some((item) => item.name.toLowerCase() === name.toLowerCase())) return;
    update(id, { colours: [...d.colours, { name, status: "Not requested", sampleNo: "—", supplierTracks: d.suppliers.map(emptyTrack) }] });
    setColourName("");
    setColourOpen(false);
  };
  const addRemark = () => {
    const text = remarkText.trim();
    if (!text) return;
    update(id, { notes: [...d.notes, `${remarkVisible ? "Team" : "Private"} · ${text}${remarkFollowUp ? ` · Follow-up ${remarkFollowUp}` : ""}`] });
    setRemarkText("");
    setRemarkFollowUp("");
    setRemarkOpen(false);
  };
  const saveTrackRemark = () => {
    if (!remarkTarget) return;
    const { colour, supplier } = remarkTarget;
    const text = remarkText.trim();
    updateTrack(colour, supplier, { feedback: text });
    if (text) update(id, { notes: [...d.notes, `Remark · ${colour} · ${supplier} · ${text}`] });
    setRemarkTarget(null);
    setRemarkText("");
  };
  const askSample = (colour: string, track: SupplierColourTrack) => {
    updateTrack(colour, track.supplier, { stage: "Sample requested", sampleNo: track.sampleNo === "—" ? `SS-REF-${String(d.samples + 1).padStart(4, "0")}` : track.sampleNo });
    update(id, { samples: d.samples + 1, notes: [...d.notes, `Sample requested · ${colour} · ${track.supplier}`], colours: d.colours.map((item) => item.name === colour ? { ...item, status: "Sampling" } : item) });
  };

  const approvedTracks = d.colours.reduce((sum, item) => sum + item.supplierTracks.filter((track) => track.stage === "Approved" || track.stage === "Cost accepted").length, 0);
  const pendingDecisions = d.colours.reduce((sum, item) => sum + item.supplierTracks.filter((track) => track.stage === "Feedback due").length, 0);

  return <AppShell breadcrumb={["Sourcing", d.id]}><ModuleNav active="developments" /><Link to="/sourcing/developments" className="inline-flex items-center gap-2 text-xs text-muted-foreground"><ArrowLeft className="size-3" />Stage tracker</Link>

    <header className="mb-5 border-b border-border pb-4"><div className="flex flex-wrap items-center gap-2"><span className="num text-xs font-medium text-primary">{d.id}</span><Pill tone={d.status === "Samples approved" ? "success" : "info"}>{d.status}</Pill></div><h1 className="mt-2 max-w-2xl text-xl font-semibold leading-tight sm:text-2xl">{d.title}</h1><p className="mt-2 text-xs text-muted-foreground">{d.collection || "No collection"} · {d.category} · {d.colours.length} colours · {d.colours.reduce((sum, item) => sum + item.supplierTracks.length, 0)} supplier tracks</p>
      <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">{[`${d.samples} samples asked`, `${approvedTracks} approved`, `${pendingDecisions} decisions waiting`, `${d.documents.length} papers`].map((chip) => <span key={chip} className="rounded-sm border border-border bg-surface px-2 py-1 text-muted-foreground">{chip}</span>)}</div>
    </header>

    <section aria-label="What has happened" className="mb-6"><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-base font-semibold">What has happened</h2><div className="flex items-center gap-1.5">{["All", "Notes", "Changes"].map((tab) => <Button key={tab} size="sm" variant={trailFilter === tab ? "secondary" : "ghost"} onClick={() => setTrailFilter(tab)}>{tab}</Button>)}<Button size="sm" onClick={() => { setRemarkText(""); setRemarkVisible(true); setRemarkFollowUp(""); setRemarkOpen(true); }}><MessageSquarePlus />Add remark</Button></div></div>
      <div className="divide-y divide-border border-y border-border">
        {trailFilter !== "Changes" && d.notes.map((n, i) => <p key={`note-${i}`} className="py-2.5 text-xs">{n}</p>)}
        {trailFilter !== "Notes" && <p className="py-2.5 text-xs text-muted-foreground">Concept created · Demo Owner · 09 Oct 2026</p>}
        {trailFilter !== "Changes" && d.notes.length === 0 && <p className="py-2.5 text-xs text-muted-foreground">Nothing noted yet — team updates will appear here.</p>}
      </div>
    </section>

    <section aria-label="Where things stand" className="mb-6"><div className="flex flex-wrap items-center justify-between gap-2"><div><h2 className="text-base font-semibold">Where things stand</h2><p className="mt-1 text-xs text-muted-foreground">Every colour moves on its own; each supplier answers separately.</p></div>
      <div className="flex gap-1.5"><Button variant="outline" size="sm" onClick={() => { setSupplierName(""); setSupplierOpen(true); }}><Plus />Supplier</Button><Button variant="outline" size="sm" onClick={() => { setColourName(""); setColourOpen(true); }}><Plus />Colour</Button></div>
    </div>
      <div className="mt-3 overflow-x-auto border-y border-border">
        <table className="w-full min-w-[820px] text-left"><thead><tr><Th>Colour · Supplier</Th><Th>Stage</Th><Th>Rate / kg</Th><Th>Sample</Th><Th>Cost sheet</Th><Th className="text-right">Actions</Th></tr></thead>
          <tbody>
            {d.colours.flatMap((c) => c.supplierTracks.length === 0
              ? [<tr key={`empty-${c.name}`}><Td colSpan={6} className="text-xs text-muted-foreground">No supplier assigned for {c.name} yet — use + Supplier above.</Td></tr>]
              : c.supplierTracks.map((track) => <tr key={`${c.name}-${track.supplier}`} className="hover:bg-surface-sunken/40">
                <Td><p className="flex items-center gap-1.5 text-[13px] font-semibold">{c.name}<Pill tone={c.status === "Approved" ? "success" : c.status === "Rejected" ? "danger" : "warn"}>{c.status}</Pill></p><p className="text-[11px] text-muted-foreground">{track.supplier}{track.feedback ? ` · ${track.feedback}` : ""}</p></Td>
                <Td><select aria-label={`${c.name} ${track.supplier} stage`} value={track.stage} onChange={(event) => updateTrack(c.name, track.supplier, { stage: event.target.value })} className="reference-input w-40 text-xs">{STAGES.map((stage) => <option key={stage}>{stage}</option>)}</select></Td>
                <Td><input aria-label={`${c.name} ${track.supplier} rate per kg`} type="number" min="0" step="any" placeholder="Not quoted" value={track.ratePerKg} onChange={(event) => updateTrack(c.name, track.supplier, { ratePerKg: event.target.value })} className="reference-input w-24 text-xs" /></Td>
                <Td className="num text-xs text-muted-foreground">{track.sampleNo}{track.proof.length > 0 ? ` · ${track.proof.length} proof` : ""}</Td>
                <Td className="text-xs">{track.costSheetStatus}</Td>
                <Td className="text-right"><div className="flex justify-end gap-1">
                  <Button variant="outline" size="sm" onClick={() => setCostTarget({ colour: c.name, supplier: track.supplier })}><FileText />Cost</Button>
                  <Button variant="ghost" size="sm" onClick={() => askSample(c.name, track)}><Plus />Sample</Button>
                  <Button variant="ghost" size="sm" onClick={() => { setRemarkText(track.feedback); setRemarkTarget({ colour: c.name, supplier: track.supplier }); }}><MessageSquarePlus />Remark</Button>
                </div></Td>
              </tr>))}
          </tbody>
        </table>
      </div>
    </section>

    <details className="mb-6 border-y border-border" aria-label="Papers and proof"><summary className="flex cursor-pointer items-center gap-2 py-3 text-sm font-semibold"><Paperclip className="size-4 text-muted-foreground" />Papers &amp; proof<span className="num ml-auto text-xs text-muted-foreground">{d.documents.length}</span></summary>
      {d.documents.length ? <ul className="divide-y divide-border border-t border-border">{d.documents.map((name, i) => <li key={`${name}-${i}`} className="flex items-center gap-2 py-2.5 text-xs"><Paperclip className="size-3.5 text-muted-foreground" />{name}</li>)}</ul>
        : <p className="border-t border-border py-3 text-xs text-muted-foreground">Swatch photos, lab dips and costing sheets will collect here.</p>}
      <label className="mb-3 inline-flex cursor-pointer items-center gap-2 rounded-sm border border-border px-3 py-2 text-xs font-medium"><ImagePlus className="size-3.5" />Attach photo or document<input type="file" className="sr-only" onChange={(e) => { const file = e.target.files?.[0]; if (file) update(id, { documents: [...d.documents, file.name] }); }} /></label>
    </details>

    {/* Development remark pop-up */}
    <Dialog open={remarkOpen} onOpenChange={setRemarkOpen}><DialogContent className="max-w-md"><DialogHeader><DialogTitle>Add a remark</DialogTitle><DialogDescription>What was said, decided or asked.</DialogDescription></DialogHeader>
      <form onSubmit={(event) => { event.preventDefault(); addRemark(); }}>
        <textarea aria-label="Remark" className="reference-input min-h-24 w-full" placeholder="What was said, decided or asked…" value={remarkText} onChange={(e) => setRemarkText(e.target.value)} />
        <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground"><label className="flex items-center gap-1.5"><input type="checkbox" checked={remarkVisible} onChange={(e) => setRemarkVisible(e.target.checked)} className="size-3.5" />Visible to team</label><input aria-label="Follow-up date" type="date" className="reference-input w-auto text-xs" value={remarkFollowUp} onChange={(e) => setRemarkFollowUp(e.target.value)} /></div>
        <DialogFooter className="mt-4"><Button type="button" variant="ghost" onClick={() => setRemarkOpen(false)}>Cancel</Button><Button type="submit" disabled={!remarkText.trim()}><Check />Add remark</Button></DialogFooter>
      </form>
    </DialogContent></Dialog>

    {/* Add supplier pop-up */}
    <Dialog open={supplierOpen} onOpenChange={setSupplierOpen}><DialogContent className="max-w-sm"><DialogHeader><DialogTitle>Add a supplier</DialogTitle><DialogDescription>They get their own track under every colour.</DialogDescription></DialogHeader>
      <form onSubmit={(event) => { event.preventDefault(); addSupplier(); }}><input aria-label="Supplier name" className="reference-input w-full" placeholder="Mill or supplier name…" value={supplierName} onChange={(e) => setSupplierName(e.target.value)} />
        <DialogFooter className="mt-4"><Button type="button" variant="ghost" onClick={() => setSupplierOpen(false)}>Cancel</Button><Button type="submit" disabled={!supplierName.trim()}><Plus />Add supplier</Button></DialogFooter>
      </form>
    </DialogContent></Dialog>

    {/* Add colour pop-up */}
    <Dialog open={colourOpen} onOpenChange={setColourOpen}><DialogContent className="max-w-sm"><DialogHeader><DialogTitle>Add a colour</DialogTitle><DialogDescription>Every linked supplier gets a track under it.</DialogDescription></DialogHeader>
      <form onSubmit={(event) => { event.preventDefault(); addColour(); }}><input aria-label="Colour name" className="reference-input w-full" placeholder="Colour, e.g. Navy…" value={colourName} onChange={(e) => setColourName(e.target.value)} />
        <DialogFooter className="mt-4"><Button type="button" variant="ghost" onClick={() => setColourOpen(false)}>Cancel</Button><Button type="submit" disabled={!colourName.trim()}><Plus />Add colour</Button></DialogFooter>
      </form>
    </DialogContent></Dialog>

    {/* Supplier remark pop-up */}
    <Dialog open={remarkTarget !== null} onOpenChange={(open) => { if (!open) { setRemarkTarget(null); setRemarkText(""); } }}><DialogContent className="max-w-md"><DialogHeader><DialogTitle>{remarkTarget ? `Remark — ${remarkTarget.colour} · ${remarkTarget.supplier}` : "Remark"}</DialogTitle><DialogDescription>What the supplier said or what your team decided.</DialogDescription></DialogHeader>
      <form onSubmit={(event) => { event.preventDefault(); saveTrackRemark(); }}><textarea aria-label="Supplier remark" className="reference-input min-h-24 w-full" placeholder="What the supplier said…" value={remarkText} onChange={(e) => setRemarkText(e.target.value)} />
        <DialogFooter className="mt-4"><Button type="button" variant="ghost" onClick={() => { setRemarkTarget(null); setRemarkText(""); }}>Cancel</Button><Button type="submit"><Check />Save remark</Button></DialogFooter>
      </form>
    </DialogContent></Dialog>

    <CostSheetReference open={costTarget !== null} onOpenChange={(open) => { if (!open) setCostTarget(null); }} colourName={costTarget?.colour} supplierName={costTarget?.supplier} onSaved={(approved) => { if (!costTarget) return; const target = costTarget; update(id, { colours: d.colours.map((item) => item.name === target.colour ? { ...item, supplierTracks: item.supplierTracks.map((track) => track.supplier === target.supplier ? { ...track, costSheetStatus: approved ? "Approved" : "Draft saved", stage: approved ? "Cost accepted" : track.stage } : track) } : item), notes: [...d.notes, `${approved ? "Cost sheet approved" : "Cost sheet draft saved"} · ${target.colour} · ${target.supplier}`] }); if (approved) setCostTarget(null); }} />
  </AppShell>;
}
