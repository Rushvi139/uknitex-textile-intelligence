import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import {
  seedExhibitions,
  seedLeads,
  type CrmStatus,
  type Exhibition,
  type Inquiry,
  type Lead,
  type PartyKind,
  type Source,
  type Temperature,
} from "./crm-data";

const today = "08 Sep 2026";

type NewLeadInput = {
  name: string;
  firm: string;
  mobile: string;
  city: string;
  kind: PartyKind;
  source: Source;
  fair: string | null;
  owner: string | null;
  temperature: Temperature;
};

type Store = {
  leads: Lead[];
  exhibitions: (Exhibition & { links: { id: string; kind: string; collection?: string; fair: string; expiry: string; cap: number }[] })[];
  collections: string[];
  openLeadId: string | null;
  openLead: (id: string | null) => void;
  addLead: (input: NewLeadInput) => string;
  logTouch: (id: string, text: string) => void;
  assign: (id: string, owner: string) => void;
  setFollowUp: (id: string, date: string) => void;
  markLost: (id: string, reason: string) => void;
  reopen: (id: string) => void;
  sendPrice: (leadId: string, inquiryId: string) => void;
  raiseQuotation: (leadId: string, inquiryId: string) => void;
  requestSample: (leadId: string, inquiryId: string) => void;
  createOrder: (leadId: string, inquiryId: string) => void;
  confirmOrder: (leadId: string, orderId: string) => void;
  addInquiry: (leadId: string, data: { quality: string; qualityName: string; colour: string; askedKg: number }) => void;
  closeInquiry: (leadId: string, inquiryId: string, reason: string) => void;
  addToMaster: (leadId: string) => void;
  fillMasterField: (leadId: string, field: string) => void;
  addDocument: (leadId: string, name: string, kind: string) => void;
  addNote: (leadId: string, text: string, verdict: string, assignee: string) => void;
  addCollection: (name: string) => void;
  addExhibition: (input: { name: string; place: string; dates: string }) => void;
  addLink: (exId: string, kind: string, collection?: string) => void;
};

const CrmContext = createContext<Store | null>(null);

const rank: CrmStatus[] = [
  "New",
  "Contacted",
  "Inquiry raised",
  "Price sent",
  "Quotation sent",
  "Sample order",
  "Order created",
  "Order confirmed",
  "In master",
  "Closed",
];

/** Status is read, never typed: the party sits at the highest rung its records reached. */
export function deriveStatus(lead: Lead): CrmStatus {
  if (lead.lostReason) return "Closed";
  let s: CrmStatus = lead.history.some((h) => h.kind === "Touch") ? "Contacted" : "New";
  const up = (next: CrmStatus) => {
    if (rank.indexOf(next) > rank.indexOf(s)) s = next;
  };
  if (lead.inquiries.length) up("Inquiry raised");
  if (lead.inquiries.some((i) => i.priceSentOn)) up("Price sent");
  if (lead.quotations.some((qt) => qt.sent)) up("Quotation sent");
  if (lead.orders.some((o) => o.kindOf === "Sample")) up("Sample order");
  if (lead.orders.some((o) => o.kindOf === "Regular")) up("Order created");
  if (lead.orders.some((o) => o.status === "Confirmed")) up("Order confirmed");
  if (lead.inMaster) up("In master");
  return s;
}

let seq = 100;
const nextId = (prefix: string) => `${prefix}-${++seq}`;

export function CrmProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>(seedLeads);
  const [exhibitions, setExhibitions] = useState<Store["exhibitions"]>(
    seedExhibitions.map((e) => ({
      ...e,
      links:
        e.catalogueLinks > 0
          ? [{ id: nextId("LNK"), kind: "Catalogue link", collection: "Monsoon knits 2026", fair: e.name, expiry: "30 Sep 2026", cap: 200 }]
          : [],
    })),
  );
  const [collections, setCollections] = useState<string[]>([
    "Monsoon knits 2026",
    "Premium single jersey",
    "Fair sampling set",
  ]);
  const [openLeadId, setOpenLeadId] = useState<string | null>(null);

  const patch = useCallback((id: string, fn: (l: Lead) => Lead) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? fn(l) : l)));
  }, []);

  const withHistory = (l: Lead, kind: string, text: string, by = "RS"): Lead => ({
    ...l,
    history: [...l.history, { on: today, kind, text, by }],
    lastTouched: "Just now",
    daysInColumn: 0,
  });

  const finish = (l: Lead): Lead => ({ ...l, status: deriveStatus(l) });

  const api = useMemo<Store>(
    () => ({
      leads,
      exhibitions,
      collections,
      openLeadId,
      openLead: setOpenLeadId,

      addLead: (input) => {
        const n = leads.length + 1;
        const id = `LD-2026-${String(50 + n).padStart(4, "0")}`;
        const lead: Lead = {
          id,
          leadNo: id,
          name: input.name,
          firm: input.firm,
          kind: input.kind,
          mobile: input.mobile,
          city: input.city,
          source: input.source,
          fair: input.fair,
          agent: null,
          owner: input.owner,
          status: "New",
          temperature: input.temperature,
          lastTouched: "Just now",
          daysInColumn: 0,
          followUp: null,
          followUpOverdue: false,
          score: 40,
          inMaster: false,
          missingMaster: [],
          inquiries: [],
          quotations: [],
          samples: [],
          orders: [],
          dispatch: { shippedKg: 0, invoiced: 0, advanceOutstanding: 0 },
          documents: [],
          history: [{ on: today, kind: "Lead created", text: `Captured via ${input.source.toLowerCase()}`, by: "RS" }],
          notes: [],
        };
        setLeads((prev) => [lead, ...prev]);
        return id;
      },

      logTouch: (id, text) => patch(id, (l) => finish(withHistory(l, "Touch", text))),
      assign: (id, owner) =>
        patch(id, (l) =>
          finish(withHistory({ ...l, owner: owner === "Unassigned" ? null : owner }, "Assigned", `Owner set to ${owner}`)),
        ),
      setFollowUp: (id, date) =>
        patch(id, (l) => finish(withHistory({ ...l, followUp: date, followUpOverdue: false }, "Follow-up", `Follow-up set for ${date}`))),
      markLost: (id, reason) =>
        patch(id, (l) => ({ ...withHistory({ ...l, lostReason: reason }, "Closed", `Marked lost — ${reason}`), status: "Closed" })),
      reopen: (id) =>
        patch(id, (l) => {
          const { lostReason: _dropped, ...rest } = l;
          return finish(withHistory(rest as typeof l, "Reopened", "Lead reopened"));
        }),

      sendPrice: (leadId, inquiryId) =>
        patch(leadId, (l) => {
          const inq = l.inquiries.find((i) => i.id === inquiryId);
          const rate = inq?.rate ?? inq?.lastSoldRate ?? null;
          return finish(
            withHistory(
              {
                ...l,
                inquiries: l.inquiries.map((i) => (i.id === inquiryId ? { ...i, priceSentOn: today, rate } : i)),
              },
              "Price sent",
              `${inq?.quality} ${inq?.colour} ${rate ? `₹${rate}/kg` : "rate pending from desk"} sent on WhatsApp`,
            ),
          );
        }),

      raiseQuotation: (leadId, inquiryId) =>
        patch(leadId, (l) => {
          const inq = l.inquiries.find((i) => i.id === inquiryId);
          const rate = inq?.rate ?? inq?.lastSoldRate ?? 0;
          const total = Math.round((inq?.askedKg ?? 0) * rate);
          const id = `QT-2026-${String(20 + l.quotations.length + 1).padStart(4, "0")}`;
          return finish(
            withHistory(
              {
                ...l,
                quotations: [...l.quotations, { id, on: today, total, sent: true, converted: false }],
                inquiries: l.inquiries.map((i) => (i.id === inquiryId ? { ...i, priceSentOn: i.priceSentOn ?? today, rate: rate || null } : i)),
              },
              "Quotation sent",
              `${id} sent for ${inq?.quality} ${inq?.colour}`,
            ),
          );
        }),

      requestSample: (leadId, inquiryId) =>
        patch(leadId, (l) => {
          const inq = l.inquiries.find((i) => i.id === inquiryId);
          const id = `SMP-${String(50 + l.samples.length + 1)}`;
          return finish(
            withHistory(
              {
                ...l,
                samples: [...l.samples, { id, quality: `${inq?.quality} ${inq?.qualityName}`, sentOn: today, feedback: null }],
                orders: [...l.orders, { id: `SO-2026-${String(90 + l.orders.length + 1)}`, kindOf: "Sample", status: "Issued", value: 0 }],
              },
              "Sample order",
              `Sample ${id} raised for ${inq?.quality}`,
            ),
          );
        }),

      createOrder: (leadId, inquiryId) =>
        patch(leadId, (l) => {
          const inq = l.inquiries.find((i) => i.id === inquiryId);
          const rate = inq?.rate ?? inq?.lastSoldRate ?? 0;
          const id = `SO-2026-${String(90 + l.orders.length + 1)}`;
          return finish(
            withHistory(
              {
                ...l,
                orders: [...l.orders, { id, kindOf: "Regular", status: "Draft", value: Math.round((inq?.askedKg ?? 0) * rate) }],
                quotations: l.quotations.map((qt) => ({ ...qt, converted: true })),
              },
              "Order created",
              `${id} raised as a draft sales order`,
            ),
          );
        }),

      confirmOrder: (leadId, orderId) =>
        patch(leadId, (l) =>
          finish(
            withHistory(
              { ...l, orders: l.orders.map((o) => (o.id === orderId ? { ...o, status: "Confirmed" } : o)) },
              "Order confirmed",
              `${orderId} confirmed and stock reserved`,
            ),
          ),
        ),

      addInquiry: (leadId, data) =>
        patch(leadId, (l) => {
          const inq: Inquiry = {
            id: nextId("IQ"),
            quality: data.quality,
            qualityName: data.qualityName,
            colour: data.colour,
            swatch: "#8A8A85",
            askedKg: data.askedKg,
            rate: null,
            lastSoldRate: null,
            moq: null,
            leadTimeDays: null,
            availableKg: 0,
            onOrderKg: 0,
            priceSentOn: null,
            temperature: "Warm",
            askedOn: today,
            open: true,
          };
          return finish(
            withHistory({ ...l, inquiries: [...l.inquiries, inq] }, "Inquiry raised", `${data.quality} ${data.colour} ${data.askedKg} kg`),
          );
        }),

      closeInquiry: (leadId, inquiryId, reason) =>
        patch(leadId, (l) =>
          finish(
            withHistory(
              { ...l, inquiries: l.inquiries.map((i) => (i.id === inquiryId ? { ...i, open: false } : i)) },
              "Inquiry closed",
              `${inquiryId} closed — ${reason}`,
            ),
          ),
        ),

      addToMaster: (leadId) =>
        patch(leadId, (l) =>
          finish(
            withHistory(
              { ...l, inMaster: true, missingMaster: ["GST number", "delivery address", "credit terms"] },
              "In master",
              "Converted into a customer master record, inquiries carried across",
            ),
          ),
        ),

      fillMasterField: (leadId, field) =>
        patch(leadId, (l) =>
          finish(
            withHistory({ ...l, missingMaster: l.missingMaster.filter((f) => f !== field) }, "Master updated", `${field} filled`),
          ),
        ),

      addDocument: (leadId, name, kind) =>
        patch(leadId, (l) =>
          finish(withHistory({ ...l, documents: [...l.documents, { id: nextId("DOC"), name, kind }] }, "Document", `${kind}: ${name}`)),
        ),

      addNote: (leadId, text, verdict, assignee) =>
        patch(leadId, (l) =>
          finish(
            withHistory(
              { ...l, notes: [...l.notes, { id: nextId("NT"), text, verdict, assignee, on: today }] },
              "Note",
              `${verdict} — ${text}`,
            ),
          ),
        ),

      addCollection: (name) => setCollections((prev) => (prev.includes(name) ? prev : [...prev, name])),

      addExhibition: ({ name, place, dates }) =>
        setExhibitions((prev) => [
          {
            id: nextId("EX"),
            name,
            place,
            dates,
            leads: 0,
            scans: 0,
            devices: 0,
            liveLinks: 0,
            pricesSent: 0,
            documents: 0,
            catalogueLinks: 0,
            topQualities: [],
            links: [],
          },
          ...prev,
        ]),

      addLink: (exId, kind, collection) =>
        setExhibitions((prev) =>
          prev.map((e) =>
            e.id === exId
              ? {
                  ...e,
                  liveLinks: e.liveLinks + 1,
                  catalogueLinks: kind === "Catalogue link" ? e.catalogueLinks + 1 : e.catalogueLinks,
                  links: [
                    ...e.links,
                    {
                      id: nextId("LNK"),
                      kind,
                      ...(collection ? { collection } : {}),
                      fair: e.name,
                      expiry: "31 Dec 2026",
                      cap: 250,
                    },
                  ],
                }
              : e,
          ),
        ),
    }),
    [leads, exhibitions, collections, openLeadId, patch],
  );

  return <CrmContext.Provider value={api}>{children}</CrmContext.Provider>;
}

export function useCrm() {
  const ctx = useContext(CrmContext);
  if (!ctx) throw new Error("useCrm must be used inside CrmProvider");
  return ctx;
}
