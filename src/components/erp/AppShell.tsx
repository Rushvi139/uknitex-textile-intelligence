import { useEffect, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  Boxes,
  ChevronRight,
  Command as CommandIcon,
  Factory,
  Gauge,
  LayoutGrid,
  LineChart,
  Menu,
  MessageSquare,
  Receipt,
  Search,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Users,
  Warehouse,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type NavItem = { label: string; to?: string; icon: typeof Gauge; badge?: string; ai?: boolean };

const groups: { group: string; items: NavItem[] }[] = [
  { group: "Overview", items: [{ label: "Executive dashboard", to: "/", icon: Gauge }] },
  {
    group: "Operations",
    items: [
      { label: "Procurement", to: "/procurement", icon: ShoppingCart, badge: "48" },
      { label: "Inventory", to: "/inventory", icon: Boxes },
      { label: "Quality check", to: "/quality", icon: ShieldCheck, badge: "12" },
      { label: "Sales", icon: LineChart },
      { label: "Godown", icon: Warehouse },
    ],
  },
  {
    group: "Commercial",
    items: [
      { label: "CRM", icon: Users },
      { label: "Accounts", icon: Receipt },
    ],
  },
  {
    group: "Intelligence",
    items: [
      { label: "AI workbench", to: "/ai-workbench", icon: Sparkles, ai: true },
      { label: "Reports", icon: LayoutGrid },
    ],
  },
  { group: "Settings", items: [{ label: "Settings & access", icon: Settings }] },
];

const paletteCommands = [
  { group: "Go to", items: ["Executive dashboard", "Purchase orders", "Product detail", "Quality check", "AI workbench"] },
  { group: "Create", items: ["New purchase order", "New sales order", "New GRN", "New QC case"] },
  { group: "Ask AI", items: ["Create delayed PO report", "Stock exposed against confirmed orders", "Supplier follow-up brief"] },
];

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="flex flex-col gap-5 px-3 py-4">
      {groups.map((g) => (
        <div key={g.group}>
          <p className="label-caps px-2 pb-1.5">{g.group}</p>
          <ul className="space-y-0.5">
            {g.items.map((item) => {
              const active = item.to === pathname;
              const inner = (
                <>
                  <item.icon
                    className={cn("size-4 shrink-0", item.ai && !active && "text-ai")}
                    strokeWidth={active ? 2.2 : 1.7}
                  />
                  <span className="flex-1 truncate text-left">{item.label}</span>
                  {item.badge && (
                    <span className="num rounded-sm bg-surface-sunken px-1 text-[10px] text-muted-foreground">
                      {item.badge}
                    </span>
                  )}
                </>
              );
              const base = cn(
                "flex w-full items-center gap-2.5 rounded-sm px-2 py-1.5 text-[13px] transition-colors",
                active
                  ? "bg-accent font-semibold text-accent-foreground shadow-[inset_2px_0_0_0_var(--color-primary)]"
                  : "text-sidebar-foreground hover:bg-surface-sunken",
              );
              return (
                <li key={item.label}>
                  {item.to ? (
                    <Link to={item.to} className={base} onClick={onNavigate}>
                      {inner}
                    </Link>
                  ) : (
                    <button type="button" className={cn(base, "cursor-default opacity-55")} title="Reference only">
                      {inner}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5 border-b border-sidebar-border px-4 py-3.5">
      <span className="grid size-9 place-items-center rounded-sm bg-primary text-primary-foreground">
        <Factory className="size-4.5" strokeWidth={2} />
      </span>
      <span className="leading-tight">
        <span className="block text-[15px] font-semibold tracking-[0.04em]">UKNITEX</span>
        <span className="label-caps">Fashion ERP</span>
      </span>
    </div>
  );
}

export function AppShell({
  children,
  breadcrumb,
}: {
  children: ReactNode;
  breadcrumb: string[];
}) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[236px] flex-col overflow-y-auto border-r border-sidebar-border bg-sidebar lg:flex">
        <Brand />
        <NavList />
        <div className="mt-auto border-t border-sidebar-border p-3">
          <div className="rounded-sm border border-ai/20 bg-ai-soft p-3">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-ai">
              <Sparkles className="size-3.5" /> UKNITEX AI
            </p>
            <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
              3 management insights waiting on today's book.
            </p>
            <Link
              to="/ai-workbench"
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-ai hover:underline"
            >
              Open workbench <ChevronRight className="size-3" />
            </Link>
          </div>
        </div>
      </aside>

      <Sheet open={navOpen} onOpenChange={setNavOpen}>
        <SheetContent side="left" className="w-[260px] bg-sidebar p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <Brand />
          <div className="overflow-y-auto">
            <NavList onNavigate={() => setNavOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <div className="lg:pl-[236px]">
        <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
          <div className="flex h-14 items-center gap-3 px-4 lg:px-6">
            <button
              type="button"
              onClick={() => setNavOpen(true)}
              className="grid size-8 place-items-center rounded-sm border border-border lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="size-4" />
            </button>

            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-sm border border-border bg-surface px-3 text-left text-sm text-muted-foreground transition-colors hover:border-border-strong md:max-w-md"
            >
              <Search className="size-4 shrink-0" />
              <span className="truncate">Search PO, GRN, roll, supplier, quality…</span>
              <kbd className="num ml-auto hidden shrink-0 items-center gap-0.5 rounded-sm border border-border px-1 text-[10px] md:inline-flex">
                <CommandIcon className="size-2.5" />K
              </kbd>
            </button>

            <div className="ml-auto flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPaletteOpen(true)}
                className="hidden h-9 items-center gap-1.5 rounded-sm border border-ai/25 bg-ai-soft px-2.5 text-xs font-semibold text-ai md:inline-flex"
              >
                <Sparkles className="size-3.5" /> Ask AI
              </button>
              <button type="button" className="relative grid size-9 place-items-center rounded-sm hover:bg-surface-sunken" aria-label="Messages">
                <MessageSquare className="size-4" />
              </button>
              <button type="button" className="relative grid size-9 place-items-center rounded-sm hover:bg-surface-sunken" aria-label="Notifications">
                <Bell className="size-4" />
                <span className="num absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-danger text-[9px] font-semibold text-primary-foreground">
                  12
                </span>
              </button>
              <div className="ml-1 hidden items-center gap-2.5 border-l border-border pl-3 sm:flex">
                <span className="leading-tight">
                  <span className="block text-xs font-semibold">Shree Arihant Textiles</span>
                  <span className="num block text-[11px] text-muted-foreground">FY 2026-27</span>
                </span>
                <span className="num grid size-8 place-items-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                  RS
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 border-t border-border px-4 py-1.5 text-[11px] text-muted-foreground lg:px-6">
            {breadcrumb.map((b, i) => (
              <span key={b} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="size-3 opacity-50" />}
                <span className={i === breadcrumb.length - 1 ? "font-semibold text-foreground" : ""}>{b}</span>
              </span>
            ))}
          </div>
        </header>

        <main className="px-4 py-5 lg:px-6 lg:py-6">{children}</main>

        <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-3 text-[11px] text-muted-foreground lg:px-6">
          <span>© 2026 UKNITEX Fashion ERP — UI reference build, no live backend.</span>
          <span className="num">v1.0.0 · Surat · IST</span>
        </footer>
      </div>

      <CommandDialog open={paletteOpen} onOpenChange={setPaletteOpen}>
        <CommandInput placeholder="Type a command, PO number or quality…" />
        <CommandList>
          <CommandEmpty>Nothing matched. Try “PO-2026” or “Fine Brick Knit”.</CommandEmpty>
          {paletteCommands.map((g) => (
            <CommandGroup key={g.group} heading={g.group}>
              {g.items.map((i) => (
                <CommandItem key={i} onSelect={() => setPaletteOpen(false)}>
                  {i}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </div>
  );
}
