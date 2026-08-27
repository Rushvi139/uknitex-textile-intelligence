import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Clock, Download, FileText, ListChecks, Send, Sparkles } from "lucide-react";
import { AppShell } from "@/components/erp/AppShell";
import { AiTag, Confidence, PageHeader, Panel, Pill, SourceChip, Td, Th } from "@/components/erp/primitives";
import { aiHistory, aiPrompts } from "@/lib/erp-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ai-workbench")({
  head: () => ({
    meta: [
      { title: "AI Workbench — UKNITEX Management Reporting" },
      {
        name: "description",
        content:
          "Embedded AI workbench for a fabric trading ERP: suggested prompts, previewable sources, report and task outputs, plus a full audit history.",
      },
      { property: "og:title", content: "UKNITEX — AI Workbench" },
      {
        property: "og:description",
        content: "Turn ledgers into management reports and tasks, with sources shown before anything is generated.",
      },
    ],
  }),
  component: Workbench,
});

function Workbench() {
  const [active, setActive] = useState(aiPrompts[0]!.id);
  const [generated, setGenerated] = useState(false);
  const [draft, setDraft] = useState("");

  const p = aiPrompts.find((x) => x.id === active) ?? aiPrompts[0]!;

  return (
    <AppShell breadcrumb={["Intelligence", "AI workbench"]}>
      <div className="space-y-5">
        <PageHeader
          eyebrow="Intelligence"
          title="AI workbench"
          subtitle="Ask a management question, see which ledgers it will read, then generate a report or a task list. Everything is logged."
          actions={<AiTag>Grounded on your data</AiTag>}
        />

        <div className="grid gap-4 xl:grid-cols-[330px_1fr] xl:items-start">
          <div className="min-w-0 space-y-3">
            <Panel title="Suggested prompts" subtitle="Picked from today's book" bodyClassName="p-0">
              <ul className="divide-y divide-border">
                {aiPrompts.map((x) => {
                  const on = x.id === active;
                  return (
                    <li key={x.id}>
                      <button
                        onClick={() => {
                          setActive(x.id);
                          setGenerated(false);
                        }}
                        className={cn(
                          "w-full px-4 py-3 text-left hover:bg-ai-soft/40",
                          on && "bg-ai-soft/60 shadow-[inset_2px_0_0_0_var(--color-ai)]",
                        )}
                      >
                        <span className="block text-[13px] font-semibold leading-snug">{x.title}</span>
                        <span className="mt-0.5 block text-[11.5px] text-muted-foreground">{x.hint}</span>
                        <span className="mt-1.5 flex items-center gap-1.5">
                          <Pill tone="ai">{x.output}</Pill>
                          <span className="num text-[10px] text-muted-foreground">{x.sources.length} sources</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </Panel>

            <Panel title="Ask something else">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={3}
                placeholder="e.g. Which customers slipped on payment while holding reserved stock?"
                className="w-full resize-none rounded-sm border border-border bg-surface-sunken px-2.5 py-2 text-[12.5px] outline-none placeholder:text-muted-foreground focus:border-ai"
              />
              <button
                onClick={() => setGenerated(true)}
                className="mt-2 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-sm bg-ai text-sm font-semibold text-ai-foreground"
              >
                <Send className="size-3.5" /> Run on my data
              </button>
              <p className="mt-2 text-[11px] leading-4 text-muted-foreground">
                Reads only the ledgers listed for this workspace. Nothing leaves your tenant.
              </p>
            </Panel>
          </div>

          <div className="min-w-0 space-y-3">
            <Panel
              title={p.title}
              subtitle={`Output: ${p.output}`}
              action={
                <button
                  onClick={() => setGenerated(true)}
                  className="inline-flex h-8 items-center gap-1.5 rounded-sm bg-ai px-3 text-[12.5px] font-semibold text-ai-foreground"
                >
                  <Sparkles className="size-3.5" /> {generated ? "Regenerate" : "Generate"}
                </button>
              }
            >
              <div>
                <p className="label-caps">Sources it will read</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {p.sources.map((s) => (
                    <SourceChip key={s}>{s}</SourceChip>
                  ))}
                </div>
              </div>

              <div className="mt-3 rounded-sm border border-border bg-surface-sunken px-3 py-2.5">
                <p className="label-caps">Preview</p>
                <p className="mt-1 text-[13px] leading-relaxed">{p.preview.summary}</p>
              </div>

              {generated ? (
                <div className="mt-3 overflow-x-auto rounded-sm border border-border">
                  <table className="w-full min-w-[520px] border-collapse">
                    <thead>
                      <tr>
                        {p.preview.cols.map((c) => (
                          <Th key={c}>{c}</Th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {p.preview.rows.map((r) => (
                        <tr key={r[0]} className="hover:bg-surface-sunken">
                          {r.map((cell, i) => (
                            <Td key={i} className={i === 0 ? "font-medium" : "num text-muted-foreground"}>
                              {cell}
                            </Td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="mt-3 rounded-sm border border-dashed border-border px-3 py-8 text-center text-[12.5px] text-muted-foreground">
                  Nothing generated yet. Review the sources, then generate.
                </p>
              )}

              {generated && (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                  <Confidence value={91} />
                  <div className="flex flex-wrap gap-2">
                    <button className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-border px-3 text-[12.5px] font-medium">
                      <ListChecks className="size-3.5" /> Create tasks
                    </button>
                    <button className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-border px-3 text-[12.5px] font-medium">
                      <FileText className="size-3.5" /> Save as report
                    </button>
                    <button className="inline-flex h-9 items-center gap-1.5 rounded-sm bg-primary px-3 text-[12.5px] font-semibold text-primary-foreground">
                      <Download className="size-3.5" /> Export PDF
                    </button>
                  </div>
                </div>
              )}
            </Panel>

            <Panel title="Audit history" subtitle="Every generation is logged with its author and outcome" bodyClassName="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] border-collapse">
                  <thead>
                    <tr>
                      <Th>When</Th>
                      <Th>Request</Th>
                      <Th>Output</Th>
                      <Th>By</Th>
                      <Th>Outcome</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {aiHistory.map((h) => (
                      <tr key={h.time} className="hover:bg-surface-sunken">
                        <Td className="num text-muted-foreground">
                          <Clock className="mr-1.5 inline size-3" />
                          {h.time}
                        </Td>
                        <Td className="font-medium">{h.title}</Td>
                        <Td>
                          <Pill tone="ai">{h.output}</Pill>
                        </Td>
                        <Td className="text-muted-foreground">{h.by}</Td>
                        <Td className="text-muted-foreground">{h.status}</Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
