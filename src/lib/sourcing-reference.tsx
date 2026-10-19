import { createContext, useContext, useState, type ReactNode } from "react";

export type Development = {
  id: string; title: string; category: string; collection: string; status: string;
  suppliers: string[]; samples: number; colours: { name: string; status: string; sampleNo: string }[];
  notes: string[]; documents: string[];
};

// Screenshot-backed reference records, never production data or database writes.
const initial: Development[] = [
  { id: "PD-2026-0005", title: "YARN DYED SWEATER KNIT STRIPER", category: "STRIPER", collection: "AW-27", status: "Samples approved", suppliers: ["BHUMIT INTERNATIONAL"], samples: 2, colours: [{ name: "Black", status: "Approved", sampleNo: "SS-2026-0001" }, { name: "Grey", status: "Rejected", sampleNo: "SS-2026-0002" }], notes: [], documents: [] },
  { id: "PD-2026-0004", title: "Lycra", category: "PLAIN", collection: "Winter 26", status: "Samples pending", suppliers: ["BHUMIT INTERNATIONAL", "Krunal", "ki"], samples: 0, colours: [], notes: [], documents: [] },
];

type Store = { developments: Development[]; update: (id: string, change: Partial<Development>) => void; add: (title: string, category: string, collection: string) => string };
const Context = createContext<Store | null>(null);
export function SourcingProvider({ children }: { children: ReactNode }) {
  const [developments, setDevelopments] = useState(initial);
  const update: Store["update"] = (id, change) => setDevelopments((rows) => rows.map((row) => row.id === id ? { ...row, ...change } : row));
  const add: Store["add"] = (title, category, collection) => {
    const id = `PD-REF-${String(developments.length + 1).padStart(4, "0")}`;
    setDevelopments((rows) => [...rows, { id, title, category, collection, status: "Supplier pending", suppliers: [], samples: 0, colours: [], notes: [], documents: [] }]);
    return id;
  };
  return <Context.Provider value={{ developments, update, add }}>{children}</Context.Provider>;
}
export function useSourcing() {
  const store = useContext(Context);
  if (!store) throw new Error("SourcingProvider is required");
  return store;
}