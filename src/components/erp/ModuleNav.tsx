import { Link } from "@tanstack/react-router";
import { ArrowUpRight, FlaskConical, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

export function ModuleNav({ active }: { active: "desk" | "developments" }) {
  return <nav aria-label="Sourcing navigation" className="-mx-4 mb-6 border-b border-border bg-surface px-4 lg:-mx-6 lg:px-6">
    <div className="flex min-w-0 gap-6 overflow-x-auto">
      <Link to="/sourcing" className={cn("inline-flex shrink-0 items-center gap-2 border-b-2 py-3 text-sm", active === "desk" ? "border-primary font-semibold text-primary" : "border-transparent text-muted-foreground")}><LayoutDashboard className="size-4" />Sourcing desk</Link>
      <Link to="/sourcing/developments" className={cn("inline-flex shrink-0 items-center gap-2 border-b-2 py-3 text-sm", active === "developments" ? "border-primary font-semibold text-primary" : "border-transparent text-muted-foreground")}><FlaskConical className="size-4" />Design & development</Link>
      <span className="ml-auto hidden shrink-0 items-center gap-1 text-[11px] text-muted-foreground md:inline-flex">Commercial <ArrowUpRight className="size-3" /></span>
    </div>
  </nav>;
}