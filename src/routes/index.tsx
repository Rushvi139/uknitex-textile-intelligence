import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowRight, ChevronRight, Download, Sparkles } from "lucide-react";
import { AppShell } from "@/components/erp/AppShell";
import {
  AiTag,
  Confidence,
  KpiCard,
  Panel,
  Pill,
  SourceChip,
  Td,
  Th,
  PageHeader,
  statusTone,
} from "@/components/erp/primitives";
import { activeOrders, aiBriefing, attention, inr, kpis, pipeline, trend } from "@/lib/erp-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "UKNITEX — Executive Dashboard | Fabric Trading ERP" },
      {
        name: "description",
        content:
          "Decision-first executive dashboard for a fabric textile trading ERP: KPIs, attention queue, order pipeline and AI management briefing.",
      },
      { property: "og:title", content: "UKNITEX — Executive Dashboard" },
      {
        property: "og:description",
        content: "Decision-first overview of procurement, inventory and sales for a fabric trading house.",
      },
    ],
  }),
  component: Dashboard,
});

const severityTone = { critical: "danger", high: "warn", medium: "info" } as const;

function Dashboard() {
  const [range, setRange] = useState("Monthly");
  const [activeInsight, setActiveInsight] = useState(0);

  return (
    <AppShell breadcrumb={["Overview", "Executive dashboard"]}>
      <div className="space-y-5">
        <PageHeader
          eyebrow="Thursday, 27 August 2026"
          title="Where the book stands today"
          subtitle="Five things decide the day: uncovered commitments, late suppliers, QC backlog, unlinked orders and unbilled dispatches."
          actions={
            <>
              <button className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-border bg-surface px-3 text-sm font-medium hover:border-border-strong">
                <Download className="size-3.5" /> Export
              </button>
              <Link
                to="/ai-workbench"
                className="inline-flex h-9 items-center gap-1.5 rounded-sm bg-primary px-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                <Sparkles className="size-3.5" /> Generate briefing
              </Link>
            </>
          }
        />

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          {kpis.map((k) => (
            <KpiCard key={k.label} {...k} />
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.55fr_1fr]">
          <Panel
            title="Today needs attention"
            subtitle="Ordered by money at stake, then by age"
            action={<span className="label-caps">5 open</span>}
            bodyClassName="p-0"
          >
            <ul className="divide-y divide-border">
              {attention.map((a, i) => (
                <li key={a.id} className="flex flex-wrap items-center gap-3 px-4 py-3 hover:bg-surface-sunken">
                  <span className="num w-5 text-xs text-muted-foreground">{i + 1}</span>
                  <span
                    className={cn(
                      "h-8 w-0.5 rounded-full",
                      a.severity === "critical" ? "bg-danger" : a.severity === "high" ? "bg-warn" : "bg-info",
                    )}
                  />
                  <div className="min-w-[220px] flex-1">
                    <p className="text-[13.5px] font-medium leading-snug">{a.title}</p>
                    <p className="mt-0.5 text-[11.5px] text-muted-foreground">{a.meta}</p>
                  </div>
                  <Pill tone={severityTone[a.severity]}>{a.severity}</Pill>
                  <span className="num w-20 text-right text-sm font-semibold">{a.value}</span>
                  <Link
                    to={a.to}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    {a.action} <ChevronRight className="size-3" />
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel
            title={
              <span className="flex items-center gap-2">
                AI briefing <AiTag />
              </span>
            }
            subtitle={`Generated ${aiBriefing.generated} · reviewed by no one yet`}
            bodyClassName="p-0"
          >
            <p className="border-b border-border px-4 py-3 text-[13px] font-medium leading-snug">
              {aiBriefing.headline}
            </p>
            <ul className="divide-y divide-border">
              {aiBriefing.insights.map((ins, i) => {
                const open = activeInsight === i;
                return (
                  <li key={ins.title}>
                    <button
                      type="button"
                      onClick={() => setActiveInsight(i)}
                      className="flex w-full items-start gap-2 px-4 py-3 text-left hover:bg-ai-soft/50"
                    >
                      <span className="num mt-0.5 text-[11px] text-ai">0{i + 1}</span>
                      <span className="flex-1">
                        <span className="block text-[13px] font-semibold leading-snug">{ins.title}</span>
                        {open && (
                          <>
                            <span className="mt-1 block text-[12.5px] leading-relaxed text-muted-foreground">
                              {ins.body}
                            </span>
                            <span className="mt-2 flex flex-wrap items-center gap-1.5">
                              {ins.sources.map((s) => (
                                <SourceChip key={s}>{s}</SourceChip>
                              ))}
                            </span>
                            <span className="mt-2 flex items-center justify-between gap-2">
                              <Confidence value={ins.confidence} />
                              <span className="inline-flex items-center gap-1 rounded-sm border border-ai/25 bg-ai-soft px-2 py-1 text-[11px] font-semibold text-ai">
                                {ins.action} <ArrowRight className="size-3" />
                              </span>
                            </span>
                          </>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="border-t border-border px-4 py-2.5 text-[11px] text-muted-foreground">
              Grounded in your ledgers. Every claim links back to a document.
            </div>
          </Panel>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1fr_1.4fr]">
          <Panel title="Operations flow" subtitle="Value moving through the pipeline, ₹ Cr">
            <ul className="space-y-2">
              {pipeline.map((p) => (
                <li key={p.stage} className="flex items-center gap-3">
                  <span className="w-[92px] shrink-0 text-xs text-muted-foreground">{p.stage}</span>
                  <span className="relative h-5 flex-1 overflow-hidden rounded-sm bg-surface-sunken">
                    <span
                      className="absolute inset-y-0 left-0 rounded-sm bg-primary"
                      style={{ width: `${p.pct}%`, opacity: 0.35 + (p.pct / 100) * 0.65 }}
                    />
                  </span>
                  <span className="num w-14 text-right text-xs font-semibold">₹{p.value.toFixed(2)}</span>
                  <span className="num w-9 text-right text-[11px] text-muted-foreground">{p.pct}%</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-center justify-between rounded-sm bg-surface-sunken px-3 py-2 text-xs">
              <span className="text-muted-foreground">Order → invoice conversion</span>
              <span className="num font-semibold">16%</span>
            </div>
          </Panel>

          <Panel
            title="Purchase vs sales"
            subtitle="₹ Cr, last six months"
            action={
              <div className="flex rounded-sm border border-border p-0.5">
                {["Monthly", "Weekly"].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    className={cn(
                      "rounded-[3px] px-2 py-1 text-[11px] font-medium",
                      range === r ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            }
          >
            <div className="h-[236px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fillPurchase" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.22} />
                      <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={11} stroke="var(--color-muted-foreground)" />
                  <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="var(--color-muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 6,
                      fontSize: 12,
                    }}
                  />
                  <Legend iconType="plainline" wrapperStyle={{ fontSize: 11 }} />
                  <Area
                    type="monotone"
                    dataKey="purchase"
                    name="Purchase"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    fill="url(#fillPurchase)"
                  />
                  <Line type="monotone" dataKey="sales" name="Sales" stroke="var(--color-chart-2)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>

        <Panel
          title="Active customer orders"
          subtitle="Confirmed orders currently moving through the floor"
          action={
            <Link to="/procurement" className="text-xs font-semibold text-primary hover:underline">
              View all 126
            </Link>
          }
          bodyClassName="p-0"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse">
              <thead>
                <tr>
                  <Th>SO No.</Th>
                  <Th>Customer</Th>
                  <Th>Quality</Th>
                  <Th className="text-right">Qty</Th>
                  <Th>Stage</Th>
                  <Th>Due</Th>
                  <Th className="text-right">Value</Th>
                  <Th>Risk</Th>
                </tr>
              </thead>
              <tbody>
                {activeOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-surface-sunken">
                    <Td className="num font-semibold text-primary">{o.id}</Td>
                    <Td>{o.customer}</Td>
                    <Td className="text-muted-foreground">{o.quality}</Td>
                    <Td className="num text-right">{o.qty}</Td>
                    <Td>
                      <Pill tone={statusTone(o.stage)}>{o.stage}</Pill>
                    </Td>
                    <Td className="num text-muted-foreground">{o.due}</Td>
                    <Td className="num text-right font-semibold">{inr(o.value)}</Td>
                    <Td>
                      <Pill tone={o.risk === "at-risk" ? "danger" : "success"}>
                        {o.risk === "at-risk" ? "At risk" : "On track"}
                      </Pill>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
