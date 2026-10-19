import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SourcingProvider } from "@/lib/sourcing-reference";
export const Route = createFileRoute("/sourcing")({ component: SourcingLayout });
function SourcingLayout() { return <SourcingProvider><Outlet /></SourcingProvider>; }