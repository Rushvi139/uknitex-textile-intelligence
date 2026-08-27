// Seeded reference data for the UKNITEX ERP UI prototype.
// No backend — everything here is static demo material.

export const inr = (v: number) => {
  if (v >= 1_00_00_000) return `₹${(v / 1_00_00_000).toFixed(2)} Cr`;
  if (v >= 1_00_000) return `₹${(v / 1_00_000).toFixed(2)} L`;
  return `₹${v.toLocaleString("en-IN")}`;
};

export const num = (v: number) => v.toLocaleString("en-IN");

export type Tone = "success" | "warn" | "danger" | "info" | "neutral" | "ai";

export const kpis = [
  { label: "Inventory value", value: "₹12.48 Cr", delta: "+8.6%", dir: "up" as const, note: "18,420 rolls on shelf" },
  { label: "Open purchase orders", value: "48", delta: "+12.4%", dir: "up" as const, note: "₹6.12 Cr committed" },
  { label: "Goods in transit", value: "5", delta: "-5.2%", dir: "down" as const, note: "9,240 kg arriving" },
  { label: "Sales this month", value: "₹3.72 Cr", delta: "+15.7%", dir: "up" as const, note: "126 dispatches" },
  { label: "Invoice pending", value: "₹4.81 Cr", delta: "+9.3%", dir: "up" as const, note: "32 delivered, unbilled" },
];

export const attention = [
  {
    id: "AT-1",
    severity: "critical" as const,
    title: "484 kg promised to customers, not covered by stock",
    meta: "3 qualities · SO-2026-0003, SO-2026-0007, DEMO-SO-018",
    value: "₹3.60 L",
    action: "Raise PO",
    to: "/procurement",
  },
  {
    id: "AT-2",
    severity: "critical" as const,
    title: "12 purchase orders past expected delivery",
    meta: "Star Vihan, Shri Ganesh Mills, Sun Arihant · avg 6 days late",
    value: "₹8.74 L",
    action: "Open follow-up",
    to: "/procurement",
  },
  {
    id: "AT-3",
    severity: "high" as const,
    title: "82 rolls awaiting QC beyond 48 hours",
    meta: "GRN-0009 to GRN-0014 · Ahmedabad godown",
    value: "1,856 rolls",
    action: "Open QC queue",
    to: "/quality",
  },
  {
    id: "AT-4",
    severity: "medium" as const,
    title: "20 customer orders without arrival date",
    meta: "Sales confirmed, procurement not linked",
    value: "₹6.12 L",
    action: "Review orders",
    to: "/procurement",
  },
  {
    id: "AT-5",
    severity: "medium" as const,
    title: "Delivered but invoice pending · 12 dispatches",
    meta: "Oldest 14 days · Accounts",
    value: "₹4.81 L",
    action: "Send to billing",
    to: "/procurement",
  },
];

export const pipeline = [
  { stage: "Ordered", value: 18.42, pct: 100 },
  { stage: "Purchased", value: 16.8, pct: 91 },
  { stage: "Received", value: 14.23, pct: 77 },
  { stage: "QC passed", value: 12.48, pct: 68 },
  { stage: "In stock", value: 10.32, pct: 56 },
  { stage: "Reserved", value: 6.71, pct: 36 },
  { stage: "Dispatched", value: 4.32, pct: 23 },
  { stage: "Invoiced", value: 2.95, pct: 16 },
];

export const trend = [
  { month: "Mar", purchase: 3.1, sales: 2.4 },
  { month: "Apr", purchase: 3.6, sales: 2.9 },
  { month: "May", purchase: 3.2, sales: 3.1 },
  { month: "Jun", purchase: 4.1, sales: 3.4 },
  { month: "Jul", purchase: 3.8, sales: 3.2 },
  { month: "Aug", purchase: 4.4, sales: 3.72 },
];

export const activeOrders = [
  { id: "SO-2026-0154", customer: "Vardhman Retail", quality: "Cotton Single Jersey", qty: "1,200 kg", stage: "Reserved", due: "29 Aug", value: 428000, risk: "on-track" },
  { id: "SO-2026-0151", customer: "Nandan Apparels", quality: "Fine Brick Knit · Black", qty: "800 kg", stage: "Awaiting stock", due: "28 Aug", value: 312000, risk: "at-risk" },
  { id: "SO-2026-0148", customer: "Rangoli Fashions", quality: "Drop Needle Scuba", qty: "450 kg", stage: "In QC", due: "30 Aug", value: 234000, risk: "on-track" },
  { id: "SO-2026-0143", customer: "Shree Kapda House", quality: "Polyester Lycra", qty: "600 kg", stage: "Dispatched", due: "26 Aug", value: 576000, risk: "on-track" },
  { id: "SO-2026-0139", customer: "Kalpana Textiles", quality: "Rayon Blend", qty: "400 kg", stage: "Part covered", due: "27 Aug", value: 198000, risk: "at-risk" },
];

export const aiBriefing = {
  generated: "27 Aug 2026, 09:12 IST",
  headline: "Coverage risk is concentrated in two knit qualities, not spread across the book.",
  insights: [
    {
      title: "Fine Brick Knit · 1 Black is the single biggest exposure",
      body: "260 kg committed against 8 rolls on shelf. Deep Universal Knit Mills quoted ₹250/kg and has held a 9-day lead time for six months.",
      confidence: 92,
      sources: ["SO-2026-0003", "SO-2026-0007", "Stock ledger", "PO history 6M"],
      action: "Raise PO · 100 kg",
    },
    {
      title: "Star Vihan slipped from a 21-day to a 31-day cycle",
      body: "Three of the last four POs landed late by 6-11 days. Two customer commitments sit behind their next arrival.",
      confidence: 84,
      sources: ["PO-2026-0022", "GRN trail", "Supplier scorecard"],
      action: "Prepare follow-up brief",
    },
    {
      title: "₹4.81 L delivered and still unbilled",
      body: "12 dispatches cleared gate pass but no invoice was raised. Oldest is 14 days, which is beyond the 7-day policy.",
      confidence: 97,
      sources: ["Dispatch register", "Accounts ledger"],
      action: "Generate billing list",
    },
  ],
};

// ---------- Procurement ----------

export type PO = {
  id: string;
  supplier: string;
  city: string;
  quality: string;
  shade: string;
  date: string;
  expected: string;
  ordered: number;
  received: number;
  value: number;
  status: "Draft" | "Issued" | "In Transit" | "Partially Received" | "Completed" | "Cancelled";
  priority: "High" | "Medium" | "Low";
  risk: "On time" | "Due today" | "Delayed" | "Closed";
};

export const purchaseOrders: PO[] = [
  { id: "PO-2026-0024", supplier: "ABC Textiles", city: "Surat", quality: "Cotton Single Jersey", shade: "Natural", date: "24 Aug", expected: "28 Aug", ordered: 1200, received: 600, value: 428000, status: "Partially Received", priority: "High", risk: "Due today" },
  { id: "PO-2026-0023", supplier: "Deep Universal Knit Mills", city: "Ahmedabad", quality: "Polyester Lycra", shade: "Black", date: "23 Aug", expected: "25 Aug", ordered: 800, received: 800, value: 684000, status: "Completed", priority: "Medium", risk: "Closed" },
  { id: "PO-2026-0022", supplier: "Shri Ganesh Mills", city: "Rajkot", quality: "Rayon Blend", shade: "Grey", date: "22 Aug", expected: "27 Aug", ordered: 400, received: 0, value: 312000, status: "In Transit", priority: "High", risk: "Delayed" },
  { id: "PO-2026-0021", supplier: "Mahalaxmi Fabrics", city: "Anand", quality: "Viscose", shade: "Ivory", date: "21 Aug", expected: "24 Aug", ordered: 600, received: 600, value: 576000, status: "Completed", priority: "Low", risk: "Closed" },
  { id: "PO-2026-0020", supplier: "Surya Mills", city: "Vadodara", quality: "Linen Slub", shade: "Beige", date: "20 Aug", expected: "26 Aug", ordered: 1000, received: 400, value: 525000, status: "Partially Received", priority: "Medium", risk: "Delayed" },
  { id: "PO-2026-0019", supplier: "Royal Textiles", city: "Surat", quality: "Jacquard D.N-777", shade: "Butter", date: "19 Aug", expected: "23 Aug", ordered: 500, received: 500, value: 296000, status: "Completed", priority: "Low", risk: "Closed" },
  { id: "PO-2026-0018", supplier: "Star Vihan Industries", city: "Surat", quality: "Drop Needle Scuba", shade: "4 Wine", date: "18 Aug", expected: "29 Aug", ordered: 900, received: 0, value: 468000, status: "Issued", priority: "High", risk: "On time" },
  { id: "PO-2026-0017", supplier: "Sun Arihant Fabrics", city: "Surat", quality: "Fine Brick Knit", shade: "1 Black", date: "17 Aug", expected: "30 Aug", ordered: 700, received: 0, value: 175000, status: "Draft", priority: "Medium", risk: "On time" },
  { id: "PO-2026-0016", supplier: "Textile Hub", city: "Bhiwandi", quality: "Lycra 4-Way", shade: "White", date: "16 Aug", expected: "22 Aug", ordered: 1100, received: 1100, value: 742000, status: "Completed", priority: "Medium", risk: "Closed" },
  { id: "PO-2026-0015", supplier: "Kohinoor Knits", city: "Ludhiana", quality: "Interlock 180 GSM", shade: "Navy", date: "15 Aug", expected: "21 Aug", ordered: 350, received: 0, value: 168000, status: "Cancelled", priority: "Low", risk: "Closed" },
];

export const poKpis = [
  { label: "Total POs", value: "324", delta: "+12%" },
  { label: "Open POs", value: "48", delta: "+8%" },
  { label: "Received this month", value: "76%", delta: "+6%" },
  { label: "Value this month", value: "₹3.75 Cr", delta: "+14%" },
  { label: "Delayed POs", value: "12", delta: "-20%" },
];

export const reorderSuggestions = [
  {
    quality: "UK-1000 Fine Brick Knit",
    shade: "1 Black",
    inStock: "8 rolls",
    needed: "260 kg",
    buy: "100 kg",
    supplier: "Deep Universal Knit Mills",
    rate: "₹250/kg",
    reason: "Committed to SO-2026-0003, SO-2026-0007",
    confidence: 92,
  },
  {
    quality: "UK-1451 Drop Needle Scuba",
    shade: "4 Wine",
    inStock: "20 rolls",
    needed: "450 kg",
    buy: "52 kg",
    supplier: "Star Vihan Industries",
    rate: "₹520/kg",
    reason: "Part covered · SO-2026-0002 balance owed",
    confidence: 87,
  },
  {
    quality: "UK-1001 Wave Knit Heavy",
    shade: "3 M.Grey",
    inStock: "0 rolls",
    needed: "13 kg",
    buy: "13 kg",
    supplier: "Deep Universal Knit Mills",
    rate: "₹250/kg",
    reason: "Below reorder line, nothing promised yet",
    confidence: 71,
  },
  {
    quality: "UK-362 Imp Print JL",
    shade: "Assorted",
    inStock: "3 rolls",
    needed: "61 kg",
    buy: "61 kg",
    supplier: "Royal Textiles",
    rate: "₹410/kg",
    reason: "Uncovered against DEMO-SO-013, DEMO-SO-018",
    confidence: 79,
  },
];

// ---------- Inventory ----------

export const product = {
  name: "Cotton Single Jersey 180 GSM",
  shade: "Optical White",
  sku: "UK-1000-WHT",
  hsn: "6006 2100",
  category: "Knitted Cotton",
  uom: "Roll",
  width: "60 inches",
  gsm: "180",
  brand: "UKNITEX Fashion",
  created: "10 Jan 2026",
  updated: "24 Aug 2026",
  totalRolls: 320,
  totalMtrs: "19,840.00",
  available: 240,
  availableMtrs: "14,880.00",
  reserved: 40,
  reservedMtrs: "2,480.00",
  inQc: 20,
  qcMtrs: "1,240.00",
  damaged: 20,
};

export const composition = [
  { name: "Available", value: 240, pct: "75%", color: "var(--color-primary)" },
  { name: "Reserved", value: 40, pct: "12%", color: "var(--color-ai)" },
  { name: "In QC", value: 20, pct: "6%", color: "var(--color-warn)" },
  { name: "Damaged / Hold", value: 20, pct: "6%", color: "var(--color-danger)" },
];

export type Roll = {
  roll: string;
  batch: string;
  grn: string;
  received: string;
  mtrs: string;
  kg: string;
  status: "Available" | "Reserved" | "In QC" | "Damaged";
  location: string;
  reservedFor: string;
};

export const rolls: Roll[] = [
  { roll: "R-260824-001", batch: "B-260824-WE", grn: "GRN-0001", received: "24 Aug 2026", mtrs: "60.00", kg: "72.50", status: "Available", location: "A1-Rack-02", reservedFor: "—" },
  { roll: "R-260824-002", batch: "B-260824-WE", grn: "GRN-0001", received: "24 Aug 2026", mtrs: "60.00", kg: "72.40", status: "Available", location: "A1-Rack-02", reservedFor: "—" },
  { roll: "R-260824-003", batch: "B-260824-WE", grn: "GRN-0001", received: "24 Aug 2026", mtrs: "60.00", kg: "72.60", status: "Reserved", location: "A1-Rack-03", reservedFor: "SO-2026-0154" },
  { roll: "R-260824-004", batch: "B-260824-WE", grn: "GRN-0001", received: "24 Aug 2026", mtrs: "60.00", kg: "72.55", status: "Reserved", location: "A1-Rack-03", reservedFor: "SO-2026-0154" },
  { roll: "R-260824-005", batch: "B-260824-WE", grn: "GRN-0001", received: "24 Aug 2026", mtrs: "60.00", kg: "72.45", status: "In QC", location: "QC Area 1", reservedFor: "—" },
  { roll: "R-260824-006", batch: "B-260824-WE", grn: "GRN-0001", received: "24 Aug 2026", mtrs: "60.00", kg: "72.40", status: "In QC", location: "QC Area 1", reservedFor: "—" },
  { roll: "R-260824-007", batch: "B-260824-WE", grn: "GRN-0001", received: "24 Aug 2026", mtrs: "60.00", kg: "72.30", status: "Damaged", location: "Hold Area", reservedFor: "—" },
  { roll: "R-230824-001", batch: "B-230824-WH", grn: "GRN-0231", received: "23 Aug 2026", mtrs: "60.00", kg: "72.50", status: "Available", location: "A2-Rack-01", reservedFor: "—" },
  { roll: "R-220824-001", batch: "B-220824-WH", grn: "GRN-0210", received: "22 Aug 2026", mtrs: "60.00", kg: "72.35", status: "Available", location: "A2-Rack-01", reservedFor: "—" },
  { roll: "R-210824-002", batch: "B-210824-WH", grn: "GRN-0189", received: "21 Aug 2026", mtrs: "60.00", kg: "72.60", status: "Available", location: "A2-Rack-02", reservedFor: "—" },
];

export const batches = [
  { batch: "B-260824-WE", grn: "GRN-0001", po: "PO-2026-0024", received: "24 Aug 2026", rolls: 120, available: 100, reserved: 10, qc: "Passed" },
  { batch: "B-230824-WH", grn: "GRN-0231", po: "PO-2026-0018", received: "23 Aug 2026", rolls: 100, available: 70, reserved: 20, qc: "Passed" },
  { batch: "B-220824-WH", grn: "GRN-0210", po: "PO-2026-0012", received: "22 Aug 2026", rolls: 80, available: 70, reserved: 10, qc: "Passed" },
  { batch: "B-210824-WH", grn: "GRN-0189", po: "PO-2026-0008", received: "21 Aug 2026", rolls: 20, available: 0, reserved: 0, qc: "In QC" },
];

export const supplierContext = [
  { label: "Primary supplier", value: "ABC Textiles, Surat" },
  { label: "Last purchase rate", value: "₹120.00 / mtr" },
  { label: "Landed cost", value: "₹126.40 / mtr" },
  { label: "Min order qty", value: "50 rolls" },
  { label: "Lead time (median)", value: "9 days" },
  { label: "GST rate", value: "5%" },
];

export const documents = [
  { name: "Supplier challan · 240826.pdf", date: "24 Aug 2026" },
  { name: "GRN-0001.pdf", date: "24 Aug 2026" },
  { name: "QC report · B-260824-WE.pdf", date: "25 Aug 2026" },
  { name: "Lab test report.pdf", date: "25 Aug 2026" },
];

export const timeline = [
  { time: "24 Aug 2026, 10:15", text: "GRN-0001 created for batch B-260824-WE", by: "Rushvi Shah" },
  { time: "24 Aug 2026, 11:30", text: "100 rolls passed QC", by: "QC team" },
  { time: "24 Aug 2026, 14:45", text: "40 rolls reserved for SO-2026-0154", by: "Sales team" },
  { time: "25 Aug 2026, 09:20", text: "QC in progress for 20 rolls", by: "Godown team" },
  { time: "26 Aug 2026, 16:05", text: "7 rolls moved to hold area · shade deviation", by: "Ravi Patel" },
];

// ---------- Quality ----------

export type QcCase = {
  id: string;
  qcId: string;
  supplier: string;
  po: string;
  quality: string;
  shade: string;
  rolls: number;
  weight: string;
  status: "Awaiting QC" | "In Progress" | "Decision Pending" | "Passed" | "Rejected";
  pass: number;
  fail: number;
  pending: number;
  next: string;
  received: string;
  inspector: string;
};

export const qcCases: QcCase[] = [
  { id: "GRN-0009", qcId: "QC-2026-0098", supplier: "Star Vihan Industries", po: "PO-2026-0018", quality: "Cotton Single Jersey", shade: "Navy", rolls: 10, weight: "250.00 kg", status: "Decision Pending", pass: 9, fail: 1, pending: 0, next: "Resolve 1 failed", received: "25 Aug 2026", inspector: "Ravi Patel" },
  { id: "GRN-0010", qcId: "QC-2026-0097", supplier: "Sun Arihant Fabrics", po: "PO-2026-0017", quality: "Polyester Knit", shade: "Black", rolls: 12, weight: "300.00 kg", status: "Decision Pending", pass: 10, fail: 2, pending: 0, next: "Resolve 2 failed", received: "25 Aug 2026", inspector: "Meera Joshi" },
  { id: "GRN-0007", qcId: "QC-2026-0096", supplier: "Shri Ganesh Mills", po: "PO-2026-0022", quality: "Rib Fabric", shade: "Grey", rolls: 2, weight: "50.36 kg", status: "In Progress", pass: 2, fail: 0, pending: 0, next: "Continue QC", received: "24 Aug 2026", inspector: "Ravi Patel" },
  { id: "GRN-0008", qcId: "QC-2026-0095", supplier: "Deep Universal Knit Mills", po: "PO-2026-0023", quality: "Fleece", shade: "Maroon", rolls: 15, weight: "370.20 kg", status: "Passed", pass: 15, fail: 0, pending: 0, next: "Print labels", received: "24 Aug 2026", inspector: "Meera Joshi" },
  { id: "GRN-0006", qcId: "QC-2026-0094", supplier: "Textile Hub", po: "PO-2026-0016", quality: "Lycra 4-Way", shade: "White", rolls: 105, weight: "2,450.00 kg", status: "Awaiting QC", pass: 0, fail: 0, pending: 105, next: "Start QC", received: "23 Aug 2026", inspector: "Unassigned" },
  { id: "GRN-0005", qcId: "QC-2026-0093", supplier: "Royal Textiles", po: "PO-2026-0019", quality: "Jacquard D.N-777", shade: "Butter", rolls: 8, weight: "210.00 kg", status: "Rejected", pass: 3, fail: 5, pending: 0, next: "Create debit note", received: "22 Aug 2026", inspector: "Ravi Patel" },
];

export const qcKpis = [
  { label: "Received today", value: "24", note: "3,280 kg" },
  { label: "Awaiting QC", value: "12", note: "1,420 kg" },
  { label: "In progress", value: "6", note: "850 kg" },
  { label: "Decision pending", value: "4", note: "430 kg" },
  { label: "Passed, awaiting label", value: "18", note: "2,010 kg" },
  { label: "Rejected", value: "3", note: "210 kg" },
];

export const inspectionUnits = [
  { unit: "QC-009-001", weight: "25.18 kg", status: "Passed", note: "Shade match" },
  { unit: "QC-009-002", weight: "25.10 kg", status: "Passed", note: "Shade match" },
  { unit: "QC-009-003", weight: "25.05 kg", status: "Passed", note: "Shade match" },
  { unit: "QC-009-010", weight: "25.00 kg", status: "Failed", note: "Shade darker than PO sample" },
];

export const claimCase = {
  id: "RET-2026-0004",
  status: "Open",
  grn: "GRN-0009",
  po: "PO-2026-0018",
  supplier: "Star Vihan Industries",
  reason: "Wrong colour",
  rejected: "1 roll (25.00 kg)",
  value: "₹15,229",
  events: [
    { date: "26 Aug, 10:30", text: "QC rejected by Ravi Patel" },
    { date: "26 Aug, 14:15", text: "Supplier contacted — acknowledged" },
    { date: "27 Aug, 11:20", text: "Return requested" },
    { date: "28 Aug, 16:00", text: "Goods sent to supplier" },
    { date: "29 Aug, 09:10", text: "Debit note created" },
  ],
};

// ---------- AI workbench ----------

export const aiPrompts = [
  {
    id: "p1",
    title: "Create delayed PO report",
    hint: "Suppliers, ageing buckets, value at risk",
    output: "Report · PDF",
    sources: ["Purchase orders", "GRN trail", "Supplier scorecard"],
    preview: {
      summary: "12 purchase orders are past their expected date, carrying ₹8.74 L of committed value. Three suppliers account for 74% of the delay.",
      rows: [
        ["Star Vihan Industries", "4 POs", "avg 9 days late", "₹3.21 L"],
        ["Shri Ganesh Mills", "3 POs", "avg 7 days late", "₹2.28 L"],
        ["Sun Arihant Fabrics", "2 POs", "avg 6 days late", "₹0.98 L"],
        ["Others (3 suppliers)", "3 POs", "avg 4 days late", "₹2.27 L"],
      ],
      cols: ["Supplier", "Orders", "Ageing", "Value at risk"],
    },
  },
  {
    id: "p2",
    title: "Identify stock exposed against confirmed sales orders",
    hint: "Coverage gap by quality and shade",
    output: "Task list",
    sources: ["Sales orders", "Stock ledger", "Reserved rolls"],
    preview: {
      summary: "484 kg promised to customers is uncovered by shelf stock across 3 qualities. Raising 4 POs closes the gap within the current lead times.",
      rows: [
        ["UK-1000 Fine Brick Knit · 1 Black", "8 rolls", "260 kg short", "Raise PO 100 kg"],
        ["UK-1451 Drop Needle Scuba · 4 Wine", "20 rolls", "450 kg short", "Raise PO 52 kg"],
        ["UK-362 Imp Print JL", "3 rolls", "61 kg short", "Raise PO 61 kg"],
        ["UK-944 Vertical JQD · 3 New Wine", "0 rolls", "31 kg short", "Raise PO 31 kg"],
      ],
      cols: ["Quality", "In stock", "Exposure", "Suggested action"],
    },
  },
  {
    id: "p3",
    title: "Prepare a supplier follow-up brief",
    hint: "Talking points grounded in the PO trail",
    output: "Brief · Task",
    sources: ["PO-2026-0022", "Communication log", "Payment ledger"],
    preview: {
      summary: "Shri Ganesh Mills: PO-2026-0022 (400 kg Rayon Blend) is 2 days past expected date with nothing received. Payment terms are current, so the follow-up can be firm.",
      rows: [
        ["Cycle slipped", "21 days → 31 days over 4 orders", "Ask for a firm dispatch date", "High"],
        ["Nothing received", "0 of 400 kg", "Confirm loom allocation", "High"],
        ["Downstream", "SO-2026-0139 depends on it", "Warn customer if slipping", "Medium"],
        ["Payments", "No overdue balance", "No leverage issue", "Low"],
      ],
      cols: ["Point", "Evidence", "Ask", "Weight"],
    },
  },
  {
    id: "p4",
    title: "Month-end management summary",
    hint: "Purchase, sales, coverage and cash view",
    output: "Report · PDF",
    sources: ["Purchase ledger", "Sales ledger", "Inventory valuation"],
    preview: {
      summary: "August closed at ₹3.72 Cr of sales against ₹4.40 Cr of purchases. Inventory rose 8.6% while dispatch conversion held flat at 16%.",
      rows: [
        ["Sales", "₹3.72 Cr", "+15.7% vs Jul", "Healthy"],
        ["Purchases", "₹4.40 Cr", "+9.1% vs Jul", "Watch"],
        ["Inventory value", "₹12.48 Cr", "+8.6% vs Jul", "Watch"],
        ["Unbilled dispatches", "₹4.81 L", "12 dispatches", "Act"],
      ],
      cols: ["Measure", "Value", "Change", "Read"],
    },
  },
];

export const aiHistory = [
  { time: "27 Aug, 09:12", title: "Delayed PO report", output: "PDF", by: "Rushvi Shah", status: "Shared with procurement" },
  { time: "26 Aug, 18:40", title: "Stock exposure vs confirmed orders", output: "Task list", by: "Rushvi Shah", status: "4 tasks created" },
  { time: "26 Aug, 11:05", title: "Supplier follow-up · Star Vihan", output: "Brief", by: "Meera Joshi", status: "Sent on WhatsApp" },
  { time: "25 Aug, 20:15", title: "QC failure pattern, last 90 days", output: "Report", by: "Ravi Patel", status: "Archived" },
];
