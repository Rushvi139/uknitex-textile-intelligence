// Seeded CRM (demand side) reference data — static demo material, no backend.

export const STATUS_LADDER = [
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
] as const;

export type CrmStatus = (typeof STATUS_LADDER)[number];

export const BOARD_COLUMNS: { key: string; label: string; empty: string; ageLimit: number; statuses: CrmStatus[] }[] = [
  { key: "new", label: "New lead", empty: "Nobody new waiting to be called.", ageLimit: 2, statuses: ["New", "Contacted"] },
  { key: "inquiry", label: "Inquiry", empty: "No open interest without a rate.", ageLimit: 3, statuses: ["Inquiry raised"] },
  { key: "price", label: "Price sent", empty: "Nothing waiting on a price.", ageLimit: 4, statuses: ["Price sent"] },
  { key: "quotation", label: "Quotation", empty: "No quotation is out.", ageLimit: 6, statuses: ["Quotation sent", "Sample order"] },
  { key: "order", label: "Order", empty: "No order written this week.", ageLimit: 5, statuses: ["Order created"] },
  {
    key: "dispatch",
    label: "Dispatch & advance",
    empty: "Nothing confirmed waiting on dispatch.",
    ageLimit: 8,
    statuses: ["Order confirmed", "In master"],
  },
];

export type Temperature = "Hot" | "Warm" | "Cold";
export type PartyKind = "Customer" | "Distributor" | "Brand" | "Merchandiser";
export type Source = "Fair" | "QR" | "WhatsApp" | "Walk-in" | "Call" | "Referral";

export type Inquiry = {
  id: string;
  quality: string;
  qualityName: string;
  colour: string;
  swatch: string;
  askedKg: number;
  rate: number | null;
  lastSoldRate: number | null;
  moq: number | null;
  leadTimeDays: number | null;
  availableKg: number;
  onOrderKg: number;
  priceSentOn: string | null;
  temperature: Temperature;
  askedOn: string;
  open: boolean;
};

export type HistoryEntry = { on: string; kind: string; text: string; by: string };

export type Lead = {
  id: string;
  leadNo: string;
  name: string;
  firm: string;
  kind: PartyKind;
  mobile: string;
  city: string;
  source: Source;
  fair: string | null;
  agent: string | null;
  owner: string | null;
  status: CrmStatus;
  temperature: Temperature;
  lastTouched: string;
  daysInColumn: number;
  followUp: string | null;
  followUpOverdue: boolean;
  score: number;
  lostReason?: string;
  inMaster: boolean;
  missingMaster: string[];
  inquiries: Inquiry[];
  quotations: { id: string; on: string; total: number; sent: boolean; converted: boolean }[];
  samples: { id: string; quality: string; sentOn: string | null; feedback: string | null }[];
  orders: { id: string; kindOf: "Sample" | "Regular"; status: string; value: number }[];
  dispatch: { shippedKg: number; invoiced: number; advanceOutstanding: number };
  documents: { id: string; name: string; kind: string }[];
  history: HistoryEntry[];
  notes: { id: string; text: string; verdict: string; assignee: string; on: string }[];
};

const swatches: Record<string, string> = {
  BLACK: "#161616",
  WHITE: "#F4F2EC",
  "R BLUE": "#1F3F8F",
  MAROON: "#6E1B26",
  BEIGE: "#D9C7A6",
  "OLIVE GREEN": "#5A6B33",
  "SKY BLUE": "#7FB2D9",
  MUSTARD: "#C99A1E",
  "RANI PINK": "#C2185B",
  GREY: "#8A8A85",
};

const q = (
  id: string,
  quality: string,
  qualityName: string,
  colour: string,
  askedKg: number,
  extra: Partial<Inquiry> = {},
): Inquiry => ({
  id,
  quality,
  qualityName,
  colour,
  swatch: swatches[colour] ?? "#8A8A85",
  askedKg,
  rate: null,
  lastSoldRate: null,
  moq: null,
  leadTimeDays: null,
  availableKg: 0,
  onOrderKg: 0,
  priceSentOn: null,
  temperature: "Warm",
  askedOn: "12 Aug 2026",
  open: true,
  ...extra,
});

const base = {
  quotations: [] as Lead["quotations"],
  samples: [] as Lead["samples"],
  orders: [] as Lead["orders"],
  dispatch: { shippedKg: 0, invoiced: 0, advanceOutstanding: 0 },
  documents: [] as Lead["documents"],
  notes: [] as Lead["notes"],
  inMaster: false,
  missingMaster: [] as string[],
};

export const seedLeads: Lead[] = [
  {
    ...base,
    id: "LD-2026-0007",
    leadNo: "LD-2026-0007",
    name: "Rakesh Agarwal",
    firm: "Agarwal Knit House",
    kind: "Distributor",
    mobile: "+91 98240 11227",
    city: "Kolkata",
    source: "Fair",
    fair: "Knit Expo Surat",
    agent: "Bhavesh Shah",
    owner: "RS",
    status: "Price sent",
    temperature: "Hot",
    lastTouched: "2 days ago",
    daysInColumn: 5,
    followUp: "10 Sep 2026",
    followUpOverdue: true,
    score: 82,
    inquiries: [
      q("IQ-0181", "UK-1186", "SKEE", "BLACK", 200, {
        lastSoldRate: 288,
        availableKg: 640,
        onOrderKg: 300,
        priceSentOn: "04 Sep 2026",
        temperature: "Hot",
        leadTimeDays: 12,
      }),
      q("IQ-0182", "UK-614", "SERENITY", "R BLUE", 350, {
        lastSoldRate: 301,
        availableKg: 120,
        onOrderKg: 900,
        temperature: "Warm",
      }),
    ],
    quotations: [{ id: "QT-2026-0014", on: "05 Sep 2026", total: 118400, sent: true, converted: false }],
    history: [
      { on: "28 Aug 2026", kind: "Lead created", text: "Captured at Knit Expo Surat stand QR", by: "System" },
      { on: "30 Aug 2026", kind: "Touch", text: "Called — asked for SKEE black rate", by: "RS" },
      { on: "04 Sep 2026", kind: "Price sent", text: "SKEE BLACK ₹288/kg sent on WhatsApp", by: "RS" },
      { on: "05 Sep 2026", kind: "Quotation sent", text: "QT-2026-0014 sent, ₹1,18,400", by: "Back office" },
    ],
  },
  {
    ...base,
    id: "LD-2026-0011",
    leadNo: "LD-2026-0011",
    name: "Suresh Iyer",
    firm: "Iyer Textiles",
    kind: "Customer",
    mobile: "+91 90031 44518",
    city: "Chennai",
    source: "WhatsApp",
    fair: null,
    agent: null,
    owner: null,
    status: "Inquiry raised",
    temperature: "Warm",
    lastTouched: "4 days ago",
    daysInColumn: 4,
    followUp: null,
    followUpOverdue: false,
    score: 54,
    inquiries: [
      q("IQ-0166", "UK-902", "AURORA", "WHITE", 500, { availableKg: 1240, lastSoldRate: 264, temperature: "Warm" }),
    ],
    history: [
      { on: "02 Sep 2026", kind: "Lead created", text: "WhatsApp enquiry to Ahmedabad desk", by: "System" },
      { on: "03 Sep 2026", kind: "Inquiry raised", text: "AURORA WHITE 500 kg", by: "Back office" },
    ],
  },
  {
    ...base,
    id: "LD-2026-0014",
    leadNo: "LD-2026-0014",
    name: "Mohit Bansal",
    firm: "Bansal Apparels",
    kind: "Brand",
    mobile: "+91 98180 77234",
    city: "Delhi",
    source: "Referral",
    fair: null,
    agent: "Nilesh Patel",
    owner: "AD",
    status: "New",
    temperature: "Hot",
    lastTouched: "Today",
    daysInColumn: 1,
    followUp: "09 Sep 2026",
    followUpOverdue: false,
    score: 61,
    inquiries: [],
    history: [{ on: "08 Sep 2026", kind: "Lead created", text: "Referred by Agarwal Knit House", by: "AD" }],
  },
  {
    ...base,
    id: "LD-2026-0019",
    leadNo: "LD-2026-0019",
    name: "Prakash Rao",
    firm: "Rao Knits",
    kind: "Merchandiser",
    mobile: "+91 99860 20114",
    city: "Bengaluru",
    source: "QR",
    fair: "Vibrant Gujarat",
    agent: "Bhavesh Shah",
    owner: "RS",
    status: "Quotation sent",
    temperature: "Hot",
    lastTouched: "1 day ago",
    daysInColumn: 7,
    followUp: "11 Sep 2026",
    followUpOverdue: false,
    score: 88,
    inquiries: [
      q("IQ-0170", "UK-614", "SERENITY", "OLIVE GREEN", 800, {
        lastSoldRate: 301,
        availableKg: 260,
        onOrderKg: 1200,
        priceSentOn: "01 Sep 2026",
        temperature: "Hot",
        leadTimeDays: 14,
      }),
    ],
    quotations: [{ id: "QT-2026-0018", on: "03 Sep 2026", total: 240800, sent: true, converted: false }],
    samples: [{ id: "SMP-041", quality: "UK-614 SERENITY", sentOn: "29 Aug 2026", feedback: "Shade approved" }],
    history: [
      { on: "22 Aug 2026", kind: "Lead created", text: "Stand QR scan, Vibrant Gujarat", by: "System" },
      { on: "29 Aug 2026", kind: "Sample", text: "SERENITY olive sample courier", by: "RS" },
      { on: "01 Sep 2026", kind: "Price sent", text: "₹301/kg sent", by: "RS" },
      { on: "03 Sep 2026", kind: "Quotation sent", text: "QT-2026-0018 ₹2,40,800", by: "Back office" },
    ],
  },
  {
    ...base,
    id: "LD-2026-0023",
    leadNo: "LD-2026-0023",
    name: "Imran Shaikh",
    firm: "Shaikh Fabrics",
    kind: "Customer",
    mobile: "+91 98795 33120",
    city: "Surat",
    source: "Walk-in",
    fair: null,
    agent: null,
    owner: "MK",
    status: "Order created",
    temperature: "Hot",
    lastTouched: "Today",
    daysInColumn: 2,
    followUp: null,
    followUpOverdue: false,
    score: 90,
    inquiries: [
      q("IQ-0174", "UK-1186", "SKEE", "MAROON", 400, {
        rate: 292,
        lastSoldRate: 288,
        moq: 100,
        availableKg: 520,
        priceSentOn: "05 Sep 2026",
        temperature: "Hot",
        leadTimeDays: 10,
      }),
    ],
    orders: [{ id: "SO-2026-0091", kindOf: "Regular", status: "Draft", value: 116800 }],
    history: [
      { on: "01 Sep 2026", kind: "Lead created", text: "Walked into Ahmedabad office", by: "MK" },
      { on: "05 Sep 2026", kind: "Price sent", text: "SKEE MAROON ₹292/kg", by: "MK" },
      { on: "07 Sep 2026", kind: "Order created", text: "SO-2026-0091 draft, ₹1,16,800", by: "Back office" },
    ],
  },
  {
    ...base,
    id: "LD-2026-0027",
    leadNo: "LD-2026-0027",
    name: "Vikram Chawla",
    firm: "Chawla Hosiery",
    kind: "Distributor",
    mobile: "+91 98490 66201",
    city: "Hyderabad",
    source: "Fair",
    fair: "Surat Fabric Fair 2026",
    agent: "Jayesh Mehta",
    owner: "AD",
    status: "Order confirmed",
    temperature: "Hot",
    lastTouched: "Yesterday",
    daysInColumn: 3,
    followUp: null,
    followUpOverdue: false,
    score: 94,
    inMaster: true,
    missingMaster: ["GST number", "delivery address"],
    inquiries: [
      q("IQ-0159", "UK-902", "AURORA", "BEIGE", 1200, {
        rate: 268,
        lastSoldRate: 264,
        moq: 200,
        availableKg: 1800,
        priceSentOn: "20 Aug 2026",
        temperature: "Hot",
        leadTimeDays: 12,
      }),
    ],
    orders: [{ id: "SO-2026-0084", kindOf: "Regular", status: "Confirmed", value: 321600 }],
    dispatch: { shippedKg: 600, invoiced: 160800, advanceOutstanding: 80400 },
    history: [
      { on: "12 Aug 2026", kind: "Lead created", text: "Surat Fabric Fair visitor card", by: "System" },
      { on: "20 Aug 2026", kind: "Price sent", text: "AURORA BEIGE ₹268/kg", by: "AD" },
      { on: "29 Aug 2026", kind: "Order confirmed", text: "SO-2026-0084 confirmed, stock reserved", by: "Back office" },
      { on: "02 Sep 2026", kind: "Status", text: "Added to customer master", by: "Back office" },
    ],
  },
  {
    ...base,
    id: "LD-2026-0031",
    leadNo: "LD-2026-0031",
    name: "Deepak Joshi",
    firm: "Joshi Knitwear",
    kind: "Customer",
    mobile: "+91 90110 45632",
    city: "Pune",
    source: "Call",
    fair: null,
    agent: null,
    owner: null,
    status: "Contacted",
    temperature: "Cold",
    lastTouched: "6 days ago",
    daysInColumn: 6,
    followUp: "06 Sep 2026",
    followUpOverdue: true,
    score: 32,
    inquiries: [],
    history: [
      { on: "30 Aug 2026", kind: "Lead created", text: "Cold call from directory", by: "Back office" },
      { on: "02 Sep 2026", kind: "Touch", text: "Spoke, asked to call after Diwali sampling", by: "MK" },
    ],
  },
  {
    ...base,
    id: "LD-2026-0035",
    leadNo: "LD-2026-0035",
    name: "Anita Desai",
    firm: "Desai Fashions",
    kind: "Brand",
    mobile: "+91 98250 78811",
    city: "Ahmedabad",
    source: "QR",
    fair: "Knit Expo Surat",
    agent: "Nilesh Patel",
    owner: "RS",
    status: "Sample order",
    temperature: "Warm",
    lastTouched: "3 days ago",
    daysInColumn: 8,
    followUp: "12 Sep 2026",
    followUpOverdue: false,
    score: 70,
    inquiries: [
      q("IQ-0163", "UK-771", "MERIDIAN", "RANI PINK", 150, {
        lastSoldRate: 342,
        availableKg: 90,
        onOrderKg: 400,
        temperature: "Warm",
        priceSentOn: "31 Aug 2026",
      }),
      q("IQ-0164", "UK-771", "MERIDIAN", "MUSTARD", 150, { lastSoldRate: 342, availableKg: 210, temperature: "Cold" }),
    ],
    samples: [{ id: "SMP-046", quality: "UK-771 MERIDIAN", sentOn: "04 Sep 2026", feedback: null }],
    orders: [{ id: "SO-2026-0089", kindOf: "Sample", status: "Dispatched", value: 5130 }],
    history: [
      { on: "18 Aug 2026", kind: "Lead created", text: "Knit Expo Surat QR", by: "System" },
      { on: "31 Aug 2026", kind: "Price sent", text: "MERIDIAN rani pink ₹342/kg", by: "RS" },
      { on: "04 Sep 2026", kind: "Sample order", text: "Sample SO-2026-0089 raised", by: "Back office" },
    ],
  },
  {
    ...base,
    id: "LD-2026-0038",
    leadNo: "LD-2026-0038",
    name: "Harish Kumar",
    firm: "HK Trading Co",
    kind: "Distributor",
    mobile: "+91 98310 90455",
    city: "Kolkata",
    source: "WhatsApp",
    fair: null,
    agent: "Jayesh Mehta",
    owner: "MK",
    status: "Price sent",
    temperature: "Warm",
    lastTouched: "5 days ago",
    daysInColumn: 6,
    followUp: "07 Sep 2026",
    followUpOverdue: true,
    score: 58,
    inquiries: [
      q("IQ-0168", "UK-1186", "SKEE", "GREY", 250, {
        lastSoldRate: 288,
        availableKg: 380,
        priceSentOn: "02 Sep 2026",
        temperature: "Warm",
      }),
    ],
    history: [
      { on: "26 Aug 2026", kind: "Lead created", text: "WhatsApp broadcast reply", by: "System" },
      { on: "02 Sep 2026", kind: "Price sent", text: "SKEE GREY ₹288/kg", by: "MK" },
    ],
  },
  {
    ...base,
    id: "LD-2026-0042",
    leadNo: "LD-2026-0042",
    name: "Farhan Qureshi",
    firm: "Qureshi Knits",
    kind: "Customer",
    mobile: "+91 99400 21876",
    city: "Chennai",
    source: "Fair",
    fair: "Vibrant Gujarat",
    agent: null,
    owner: null,
    status: "New",
    temperature: "Warm",
    lastTouched: "Today",
    daysInColumn: 3,
    followUp: null,
    followUpOverdue: false,
    score: 44,
    inquiries: [],
    history: [{ on: "06 Sep 2026", kind: "Lead created", text: "Business card at Vibrant Gujarat", by: "System" }],
  },
  {
    ...base,
    id: "LD-2026-0046",
    leadNo: "LD-2026-0046",
    name: "Nitin Shah",
    firm: "Shah Fabrics Mart",
    kind: "Customer",
    mobile: "+91 98200 33447",
    city: "Bengaluru",
    source: "Walk-in",
    fair: null,
    agent: null,
    owner: "AD",
    status: "Inquiry raised",
    temperature: "Hot",
    lastTouched: "Yesterday",
    daysInColumn: 2,
    followUp: "09 Sep 2026",
    followUpOverdue: false,
    score: 66,
    inquiries: [
      q("IQ-0177", "UK-614", "SERENITY", "SKY BLUE", 300, { lastSoldRate: 301, availableKg: 0, onOrderKg: 600, temperature: "Hot" }),
      q("IQ-0178", "UK-902", "AURORA", "BLACK", 200, { lastSoldRate: 264, availableKg: 740, temperature: "Warm" }),
    ],
    history: [
      { on: "05 Sep 2026", kind: "Lead created", text: "Walk-in with a buyer", by: "AD" },
      { on: "07 Sep 2026", kind: "Inquiry raised", text: "2 qualities, 500 kg total", by: "AD" },
    ],
  },
  {
    ...base,
    id: "LD-2026-0049",
    leadNo: "LD-2026-0049",
    name: "Sandeep Reddy",
    firm: "Reddy Garments",
    kind: "Merchandiser",
    mobile: "+91 90005 71124",
    city: "Hyderabad",
    source: "Referral",
    fair: null,
    agent: "Nilesh Patel",
    owner: "RS",
    status: "Closed",
    temperature: "Cold",
    lastTouched: "9 days ago",
    daysInColumn: 9,
    followUp: null,
    followUpOverdue: false,
    score: 20,
    lostReason: "Rate too high against a Surat mill",
    inquiries: [q("IQ-0150", "UK-771", "MERIDIAN", "BLACK", 250, { lastSoldRate: 342, open: false, temperature: "Cold" })],
    history: [
      { on: "20 Aug 2026", kind: "Lead created", text: "Referral from Reddy Garments buyer", by: "RS" },
      { on: "30 Aug 2026", kind: "Closed", text: "Marked lost — rate too high against a Surat mill", by: "RS" },
    ],
  },
];

export const owners = ["RS", "AD", "MK", "Unassigned"];
export const agents = ["Bhavesh Shah", "Nilesh Patel", "Jayesh Mehta"];
export const cities = ["Kolkata", "Chennai", "Bengaluru", "Surat", "Hyderabad", "Delhi", "Ahmedabad", "Pune"];
export const sources: Source[] = ["Fair", "QR", "WhatsApp", "Walk-in", "Call", "Referral"];
export const partyKinds: PartyKind[] = ["Customer", "Distributor", "Brand", "Merchandiser"];
export const temperatures: Temperature[] = ["Hot", "Warm", "Cold"];
export const lostReasons = [
  "Rate too high",
  "Quality not matching",
  "Bought from another mill",
  "Party not responding",
  "Quantity too small",
];

export const seedExhibitions = [
  {
    id: "EX-01",
    name: "Knit Expo Surat",
    place: "Surat, Gujarat",
    dates: "14–17 Aug 2026",
    leads: 18,
    scans: 42,
    devices: 3,
    liveLinks: 2,
    pricesSent: 9,
    documents: 0,
    catalogueLinks: 1,
    topQualities: [
      { quality: "UK-1186 SKEE", asks: 11 },
      { quality: "UK-614 SERENITY", asks: 8 },
      { quality: "UK-902 AURORA", asks: 6 },
      { quality: "UK-771 MERIDIAN", asks: 4 },
    ],
  },
  {
    id: "EX-02",
    name: "Vibrant Gujarat",
    place: "Gandhinagar",
    dates: "02–05 Jul 2026",
    leads: 9,
    scans: 21,
    devices: 2,
    liveLinks: 1,
    pricesSent: 4,
    documents: 0,
    catalogueLinks: 0,
    topQualities: [
      { quality: "UK-614 SERENITY", asks: 6 },
      { quality: "UK-902 AURORA", asks: 3 },
    ],
  },
  {
    id: "EX-03",
    name: "Surat Fabric Fair 2026",
    place: "Surat, Gujarat",
    dates: "11–13 Jun 2026",
    leads: 26,
    scans: 58,
    devices: 4,
    liveLinks: 0,
    pricesSent: 12,
    documents: 0,
    catalogueLinks: 0,
    topQualities: [
      { quality: "UK-902 AURORA", asks: 9 },
      { quality: "UK-1186 SKEE", asks: 7 },
    ],
  },
];

export type Exhibition = (typeof seedExhibitions)[number];

export const masterFields = [
  "GST number",
  "state & place of supply",
  "billing address",
  "delivery address",
  "contact number",
  "credit terms",
];

export const collections = ["Monsoon knits 2026", "Premium single jersey", "Fair sampling set"];

export const columnOf = (status: CrmStatus) =>
  BOARD_COLUMNS.find((c) => c.statuses.includes(status))?.key ?? "new";
