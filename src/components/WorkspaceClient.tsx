"use client";

import React, { useEffect, useMemo, useRef, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";
import {
  Lightbulb, Target, FileText, GitBranch, Code2, ShieldCheck, BarChart3,
  Sparkles, ArrowRight, Loader2, AlertCircle, X, Plus, Users, Search,
  Rocket, CheckCircle2, Circle, GitPullRequest, Clock, Activity, Gauge,
  AlertTriangle, ChevronRight, MoreHorizontal, TrendingUp, Trash2, Copy, Check,
} from "lucide-react";
import {
  IdeaRecord,
  IdeaStructuringResponse,
  IdeaListResponse,
  ProductStrategy,
  RequirementsPack,
  BacklogPack,
  StoryStatus,
} from "@/lib/buildcopilot-types";
import { generateMermaidFromRequirements } from "@/lib/mermaid-generator";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ModuleId =
  | "capture" | "strategy" | "draft" | "breakdown"
  | "build" | "verify" | "insight";

interface WorkspaceClientProps {
  userProfile: { name: string; role: string; project: string };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MODULES: Array<{
  id: ModuleId; label: string; icon: React.ElementType; accent: string;
}> = [
  { id: "capture",   label: "Capture",   icon: Lightbulb,   accent: "from-purple-500 to-fuchsia-500" },
  { id: "strategy",  label: "Strategy",  icon: Target,      accent: "from-blue-500 to-cyan-500" },
  { id: "draft",     label: "Draft",     icon: FileText,    accent: "from-yellow-500 to-orange-500" },
  { id: "breakdown", label: "Breakdown", icon: GitBranch,   accent: "from-orange-500 to-red-500" },
  { id: "build",     label: "Build",     icon: Code2,       accent: "from-emerald-500 to-teal-500" },
  { id: "verify",    label: "Verify",    icon: ShieldCheck, accent: "from-rose-500 to-red-500" },
  { id: "insight",   label: "Insight",   icon: BarChart3,   accent: "from-indigo-500 to-blue-500" },
];

// ─── Utilities ────────────────────────────────────────────────────────────────

function cn(...cls: (string | false | null | undefined)[]) {
  return cls.filter(Boolean).join(" ");
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

function Card({ children, className, accent }: { children: React.ReactNode; className?: string; accent?: string }) {
  return (
    <div className={cn(
      "group relative overflow-hidden rounded-3xl border border-white/10 bg-[#121821]/60 p-6 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:border-white/20 hover:shadow-blue-500/10",
      className
    )}>
      {accent && (
        <div className={cn("absolute -right-10 -top-10 h-32 w-32 blur-3xl opacity-20 transition-opacity group-hover:opacity-30", accent)} />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

function RunAIButton({
  onClick, loading, label = "Run AI", disabled,
}: {
  onClick: () => void; loading: boolean; label?: string; disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading || disabled}
      className="flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Sparkles className="h-4 w-4" aria-hidden="true" />}
      {loading ? "Generating…" : label}
    </button>
  );
}

function ModuleHeader({
  title, subtitle, icon: Icon, action,
}: {
  title: string; subtitle: string; icon: React.ElementType; action?: React.ReactNode;
}) {
  return (
    <div className="mb-7 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <Icon className="h-5 w-5 text-blue-300" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">{title}</h1>
          <p className="mt-0.5 text-sm text-slate-400">{subtitle}</p>
        </div>
      </div>
      {action}
    </div>
  );
}

function EmptyState({
  icon: Icon, title, body, action,
}: {
  icon: React.ElementType; title: string; body: string; action?: React.ReactNode;
}) {
  return (
    <Card className="flex flex-col items-center justify-center gap-5 py-20 text-center">
      <div className="rounded-2xl bg-blue-500/10 p-5 text-blue-300">
        <Icon className="h-8 w-8" aria-hidden="true" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">{body}</p>
      </div>
      {action}
    </Card>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    Done:        "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    "In Progress":"bg-blue-500/15 text-blue-300 border-blue-500/30",
    "To Do":     "bg-slate-500/15 text-slate-300 border-slate-500/30",
    Validated:   "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    Partial:     "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
    Gap:         "bg-red-500/15 text-red-300 border-red-500/30",
    complete:    "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    partial:     "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
    missing:     "bg-red-500/15 text-red-300 border-red-500/30",
  };
  return (
    <span className={cn("rounded-full border px-2.5 py-1 text-xs font-medium capitalize", map[status] ?? map["To Do"])}>
      {status}
    </span>
  );
}

// ─── Module Screens ───────────────────────────────────────────────────────────

// 1. Capture ──────────────────────────────────────────────────────────────────

function CaptureScreen({
  rawIdea, setRawIdea, structuring, onStructure, activeIdea,
}: {
  rawIdea: string;
  setRawIdea: (v: string) => void;
  structuring: boolean;
  onStructure: () => void;
  activeIdea: IdeaRecord | null;
}) {
  const analysis = activeIdea?.analysis;
  const clarityScore = analysis
    ? Math.min(100, Math.round(
        (analysis.problemStatement ? 30 : 0) +
        (analysis.targetUsers?.length ? 25 : 0) +
        (analysis.usp ? 25 : 0) +
        (analysis.goals?.length ? 20 : 0)
      ))
    : 0;
  const circumference = 2 * Math.PI * 40;

  return (
    <div>
      <ModuleHeader
        title="BuildCopilot Capture"
        subtitle="Turn raw ideas into structured product clarity."
        icon={Lightbulb}
        action={
          <RunAIButton
            onClick={onStructure}
            loading={structuring}
            label="Generate Structure"
            disabled={!rawIdea.trim()}
          />
        }
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <label htmlFor="capture-idea" className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Write your idea
          </label>
          <textarea
            id="capture-idea"
            value={rawIdea}
            onChange={(e) => setRawIdea(e.target.value)}
            placeholder="Describe your project, the problem it solves, and who it's for…"
            className="mt-4 h-44 w-full resize-none rounded-2xl border border-white/10 bg-[#0B0F14] p-4 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500/40 transition-all leading-relaxed"
          />
          <p className="mt-2 text-xs text-slate-600">Be specific about the problem, target users, and value you want to deliver.</p>
        </Card>

        <Card className="flex flex-col justify-between">
          <h2 className="text-xs font-bold uppercase tracking-widest text-white">AI Clarity Score</h2>
          <div className="flex items-center gap-5 my-4">
            <div
              className="relative w-24 h-24 shrink-0 flex items-center justify-center"
              role="img"
              aria-label={`Clarity score ${clarityScore}%`}
            >
              <svg className="w-full h-full -rotate-90" aria-hidden="true">
                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                <circle
                  cx="48" cy="48" r="40"
                  stroke="currentColor" strokeWidth="8" fill="transparent"
                  className="text-blue-500"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - clarityScore / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-xl font-bold text-white" aria-hidden="true">{clarityScore}%</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", analysis?.problemStatement ? "bg-green-500" : "bg-slate-600")} />
                Problem statement
              </li>
              <li className="flex items-center gap-2">
                <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", analysis?.targetUsers?.length ? "bg-green-500" : "bg-slate-600")} />
                Target users
              </li>
              <li className="flex items-center gap-2">
                <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", analysis?.usp ? "bg-green-500" : "bg-slate-600")} />
                Unique value
              </li>
              <li className="flex items-center gap-2">
                <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", analysis?.goals?.length ? "bg-green-500" : "bg-slate-600")} />
                Goals defined
              </li>
            </ul>
          </div>
        </Card>
      </div>

      {analysis && (
        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4 animate-fade-in" aria-live="polite">
          {([
            ["Problem",     analysis.problemStatement],
            ["Target Users",analysis.targetUsers.join(", ")],
            ["Goals",       analysis.goals[0] ?? "—"],
            ["USP",         analysis.usp],
          ] as [string, string][]).map(([title, text]) => (
            <Card key={title} className="hover:border-white/20 transition-all">
              <h3 className="text-xs font-bold uppercase tracking-widest text-white mb-3">{title}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{text}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// 2. Strategy ─────────────────────────────────────────────────────────────────

function StrategyScreen({
  activeIdea, generating, onRun,
}: {
  activeIdea: IdeaRecord | null;
  generating: boolean;
  onRun: () => void;
}) {
  if (!activeIdea) {
    return (
      <div>
        <ModuleHeader title="BuildCopilot Strategy" subtitle="Define vision, positioning, USP and roadmap." icon={Target} />
        <EmptyState icon={Target} title="Capture an idea first" body="Structure your idea in the Capture module to unlock strategy generation." />
      </div>
    );
  }

  const strategy: ProductStrategy | undefined = activeIdea.strategy;

  return (
    <div>
      <ModuleHeader
        title="BuildCopilot Strategy"
        subtitle="Define vision, positioning, USP and roadmap."
        icon={Target}
        action={<RunAIButton onClick={onRun} loading={generating} label={strategy ? "Regenerate" : "Generate Strategy"} />}
      />

      {!strategy ? (
        <EmptyState
          icon={Target}
          title="Generate Product Strategy"
          body="AI will prioritise features using RICE/MoSCoW, build a Now-Next-Later roadmap, and define success metrics."
          action={<RunAIButton onClick={onRun} loading={generating} label="Generate Strategy & Roadmap" />}
        />
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            <Card className="xl:col-span-2">
              <h2 className="text-sm font-semibold text-white mb-3">Product Vision</h2>
              <p className="text-sm leading-relaxed text-slate-300 rounded-2xl border border-white/10 bg-[#0B0F14] p-4">{strategy.vision}</p>
              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Market Position</h3>
                  <p className="text-sm text-slate-300">{strategy.marketPosition}</p>
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Business Model</h3>
                  <p className="text-sm text-slate-300">{strategy.businessModel}</p>
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="text-sm font-semibold text-white mb-4">Success Metrics</h2>
              <ul className="space-y-2">
                {strategy.successMetrics.map((m, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                    <TrendingUp className="h-4 w-4 shrink-0 mt-0.5 text-blue-400" aria-hidden="true" />
                    {m}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {(["now", "next", "later"] as const).map((phase) => {
              const colours: Record<string, string> = { now: "bg-emerald-500", next: "bg-blue-500", later: "bg-purple-500" };
              const labels: Record<string, string> = { now: "Now (MVP)", next: "Next (Scale)", later: "Later (Vision)" };
              return (
                <Card key={phase}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className={cn("w-2 h-2 rounded-full", colours[phase])} />
                    <h3 className="text-sm font-semibold text-white">{labels[phase]}</h3>
                  </div>
                  <div className="space-y-2">
                    {strategy.roadmapNowNextLater[phase].map((item, i) => (
                      <div key={i} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-slate-300">{item}</div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>

          {strategy.prioritization.length > 0 && (
            <Card>
              <h2 className="text-sm font-semibold text-white mb-4">Feature Prioritization</h2>
              <div className="overflow-hidden rounded-2xl border border-white/10">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/[0.04] text-xs uppercase tracking-wide text-slate-500">
                    <tr><th className="p-3">Feature</th><th className="p-3">Method</th><th className="p-3">Rationale</th></tr>
                  </thead>
                  <tbody>
                    {strategy.prioritization.map((p, i) => (
                      <tr key={i} className="border-t border-white/10 text-slate-300">
                        <td className="p-3 font-medium">{p.item}</td>
                        <td className="p-3">
                          <span className="rounded-full border border-indigo-500/30 bg-indigo-500/15 px-2.5 py-1 text-xs font-medium text-indigo-300">{p.method}</span>
                        </td>
                        <td className="p-3 text-slate-400">{p.rationale}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

// 3. Draft ─────────────────────────────────────────────────────────────────────

function buildReqMarkdown(tab: "prd" | "brd" | "frd", req: RequirementsPack): string {
  if (tab === "prd") {
    return [
      `# ${req.prd.title}`,
      `\n## Objectives\n${req.prd.objectives.map((o) => `- ${o}`).join("\n")}`,
      `\n## Personas\n${req.prd.personas.map((p) => `- ${p}`).join("\n")}`,
      `\n## Features\n${req.prd.features.map((f) => `- ${f}`).join("\n")}`,
      `\n## Dependencies\n${req.prd.dependencies.map((d) => `- ${d}`).join("\n")}`,
      `\n## Release Plan\n${req.prd.releasePlan.map((r, i) => `${i + 1}. ${r}`).join("\n")}`,
    ].join("\n");
  }
  if (tab === "brd") {
    return [
      `# Business Requirements Document`,
      `\n## Business Case\n${req.brd.businessCase}`,
      `\n## Stakeholders\n${req.brd.stakeholders.map((s) => `- ${s}`).join("\n")}`,
      `\n## Assumptions\n${req.brd.assumptions.map((a) => `- ${a}`).join("\n")}`,
      `\n## Constraints\n${req.brd.constraints.map((c) => `- ${c}`).join("\n")}`,
      `\n## Benefits\n${req.brd.benefits.map((b) => `- ${b}`).join("\n")}`,
    ].join("\n");
  }
  const frRows = req.frd.functionalRequirements
    .map((r) => `| ${r.id} | ${r.text} | ${r.priority} |`)
    .join("\n");
  const nfrRows = req.frd.nonFunctionalRequirements
    .map((r) => `| ${r.id} | ${r.category} | ${r.text} |`)
    .join("\n");
  return [
    `# Functional Requirements Document`,
    `\n## Functional Requirements\n| ID | Requirement | Priority |\n|---|---|---|\n${frRows}`,
    `\n## Non-Functional Requirements\n| ID | Category | Requirement |\n|---|---|---|\n${nfrRows}`,
  ].join("\n");
}

function DraftScreen({
  activeIdea, generating, onRun,
}: {
  activeIdea: IdeaRecord | null;
  generating: boolean;
  onRun: () => void;
}) {
  const [tab, setTab] = useState<"prd" | "brd" | "frd">("prd");
  const [copied, setCopied] = useState(false);

  function handleCopy(req: RequirementsPack) {
    const md = buildReqMarkdown(tab, req);
    void navigator.clipboard.writeText(md).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (!activeIdea) {
    return (
      <div>
        <ModuleHeader title="BuildCopilot Draft" subtitle="Create structured PRDs, BRDs and FRDs." icon={FileText} />
        <EmptyState icon={FileText} title="Capture an idea first" body="Structure your idea in the Capture module before generating requirements." />
      </div>
    );
  }

  const req: RequirementsPack | undefined = activeIdea.requirements;

  return (
    <div>
      <ModuleHeader
        title="BuildCopilot Draft"
        subtitle="Create structured PRDs, BRDs and FRDs."
        icon={FileText}
        action={<RunAIButton onClick={onRun} loading={generating} label={req ? "Regenerate" : "Generate Requirements"} />}
      />

      {!req ? (
        <EmptyState
          icon={FileText}
          title="Generate Requirements"
          body="AI will create a full PRD, BRD and FRD with functional requirements, personas, features, and dependencies."
          action={<RunAIButton onClick={onRun} loading={generating} label="Generate PRD, BRD & FRD" />}
        />
      ) : (
        <Card>
          <div className="mb-5 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-lg font-semibold text-white">{req.prd.title}</h2>
              <p className="mt-1 text-sm text-slate-500">Generated · {new Date(req.generatedAt).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCopy(req)}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-400 hover:border-violet-500/40 hover:text-violet-300 transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied!" : "Copy MD"}
              </button>
              <div className="flex gap-1 rounded-2xl border border-white/10 bg-white/[0.03] p-1">
                {(["prd", "brd", "frd"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTab(t)}
                    className={cn(
                      "rounded-xl px-4 py-1.5 text-xs font-bold uppercase tracking-widest transition-all",
                      tab === t ? "bg-blue-500 text-white shadow-md" : "text-slate-400 hover:text-white"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {tab === "prd" && (
            <div className="space-y-3">
              {[
                ["Objectives", req.prd.objectives.join(" • ")],
                ["Personas",   req.prd.personas.join(", ")],
                ["Features",   req.prd.features.join(" • ")],
                ["Dependencies", req.prd.dependencies.join(", ")],
                ["Release Plan", req.prd.releasePlan.join(" → ")],
              ].map(([title, text]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-[#0B0F14] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">{title}</h3>
                    <button type="button" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Improve with AI</button>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-300">{text}</p>
                </div>
              ))}
            </div>
          )}

          {tab === "brd" && (
            <div className="space-y-3">
              {[
                ["Business Case",  req.brd.businessCase],
                ["Stakeholders",   req.brd.stakeholders.join(", ")],
                ["Assumptions",    req.brd.assumptions.join(" • ")],
                ["Constraints",    req.brd.constraints.join(" • ")],
                ["Benefits",       req.brd.benefits.join(" • ")],
              ].map(([title, text]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-[#0B0F14] p-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">{title}</h3>
                  <p className="text-sm leading-relaxed text-slate-300">{text}</p>
                </div>
              ))}
            </div>
          )}

          {tab === "frd" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Functional Requirements</h3>
                <div className="overflow-hidden rounded-2xl border border-white/10">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white/[0.04] text-xs uppercase tracking-wide text-slate-500">
                      <tr><th className="p-3">ID</th><th className="p-3">Requirement</th><th className="p-3">Priority</th></tr>
                    </thead>
                    <tbody>
                      {req.frd.functionalRequirements.map((fr) => (
                        <tr key={fr.id} className="border-t border-white/10 text-slate-300">
                          <td className="p-3 font-mono text-xs text-blue-400">{fr.id}</td>
                          <td className="p-3">{fr.text}</td>
                          <td className="p-3"><StatusPill status={fr.priority} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Non-Functional Requirements</h3>
                <div className="overflow-hidden rounded-2xl border border-white/10">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white/[0.04] text-xs uppercase tracking-wide text-slate-500">
                      <tr><th className="p-3">ID</th><th className="p-3">Category</th><th className="p-3">Requirement</th></tr>
                    </thead>
                    <tbody>
                      {req.frd.nonFunctionalRequirements.map((nfr) => (
                        <tr key={nfr.id} className="border-t border-white/10 text-slate-300">
                          <td className="p-3 font-mono text-xs text-purple-400">{nfr.id}</td>
                          <td className="p-3 text-slate-400">{nfr.category}</td>
                          <td className="p-3">{nfr.text}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

// 4. Breakdown ─────────────────────────────────────────────────────────────────

function BreakdownScreen({
  activeIdea, generating, onRun, onStoryStatusChange,
}: {
  activeIdea: IdeaRecord | null;
  generating: boolean;
  onRun: () => void;
  onStoryStatusChange: (storyId: string, status: StoryStatus) => void;
}) {
  const [selectedEpicId, setSelectedEpicId] = useState<string | null>(null);

  const backlog: BacklogPack | undefined = activeIdea?.backlog;
  const allStories = backlog?.epics.flatMap((e) => e.stories) ?? [];
  const selectedEpic = backlog?.epics.find((e) => e.id === selectedEpicId) ?? backlog?.epics[0];

  if (!activeIdea) {
    return (
      <div>
        <ModuleHeader title="BuildCopilot Breakdown" subtitle="Convert PRD into epics and user stories." icon={GitBranch} />
        <EmptyState icon={GitBranch} title="Capture an idea first" body="Structure your idea in Capture to unlock backlog generation." />
      </div>
    );
  }

  if (!activeIdea.requirements) {
    return (
      <div>
        <ModuleHeader title="BuildCopilot Breakdown" subtitle="Convert PRD into epics and user stories." icon={GitBranch} />
        <EmptyState icon={FileText} title="Requirements needed" body="Generate PRD, BRD & FRD in the Draft module first — the backlog is derived from your functional requirements." />
      </div>
    );
  }

  return (
    <div>
      <ModuleHeader
        title="BuildCopilot Breakdown"
        subtitle="Convert PRD into epics and user stories."
        icon={GitBranch}
        action={<RunAIButton onClick={onRun} loading={generating} label={backlog ? "Regenerate" : "Generate Stories"} />}
      />

      {!backlog ? (
        <EmptyState
          icon={GitBranch}
          title="Generate Backlog"
          body="AI will derive user stories and epics directly from your functional requirements for end-to-end traceability."
          action={<RunAIButton onClick={onRun} loading={generating} label="Generate Backlog" />}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-4">
          {/* Epic Tree */}
          <Card>
            <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-white">Epic Tree ({backlog.epics.length})</h2>
            <div className="space-y-2">
              {backlog.epics.map((epic) => (
                <button
                  key={epic.id}
                  type="button"
                  onClick={() => setSelectedEpicId(epic.id)}
                  className={cn(
                    "w-full rounded-xl border p-3 text-left transition-all",
                    selectedEpic?.id === epic.id
                      ? "border-blue-500/50 bg-blue-500/10"
                      : "border-white/10 bg-white/[0.02] hover:border-white/20"
                  )}
                >
                  <GitBranch className="mb-2 h-4 w-4 text-blue-300" aria-hidden="true" />
                  <p className="text-xs font-semibold text-slate-300">{epic.title}</p>
                  <p className="mt-1 text-[10px] text-slate-600">{epic.stories.length} stories</p>
                </button>
              ))}
            </div>
            <div className="mt-5 pt-4 border-t border-white/10">
              <p className="text-xs text-slate-500">{allStories.length} total stories</p>
            </div>
          </Card>

          {/* Kanban — stories by real status */}
          <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            {(["todo", "in_progress", "done"] as const).map((colStatus) => {
              const colLabel = colStatus === "todo" ? "To Do" : colStatus === "in_progress" ? "In Progress" : "Done";
              const nextStatus: StoryStatus = colStatus === "todo" ? "in_progress" : colStatus === "in_progress" ? "done" : "todo";
              const colStories = (selectedEpic?.stories ?? allStories).filter(
                (s) => (s.status ?? "todo") === colStatus,
              );
              return (
                <div key={colStatus}>
                  <div className="mb-3 flex items-center justify-between px-1">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-white">{colLabel}</h3>
                    <span className="text-xs font-bold text-slate-600">{colStories.length}</span>
                  </div>
                  <div className="space-y-3 rounded-2xl border border-white/[0.05] bg-black/20 p-3 min-h-48">
                    {colStories.map((story) => (
                      <div key={story.id} className="rounded-2xl border border-white/10 bg-[#0B0F14] p-4 hover:border-blue-500/30 transition-all">
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-[10px] font-mono text-slate-500">{story.id}</span>
                          <button
                            type="button"
                            onClick={() => onStoryStatusChange(story.id, nextStatus)}
                            title={`Move to ${nextStatus === "in_progress" ? "In Progress" : nextStatus === "done" ? "Done" : "To Do"}`}
                            className="rounded-lg border border-white/10 px-2 py-0.5 text-[10px] text-slate-400 hover:border-violet-500/50 hover:text-violet-300 transition-colors"
                          >
                            → {nextStatus === "in_progress" ? "In Progress" : nextStatus === "done" ? "Done" : "To Do"}
                          </button>
                        </div>
                        <h4 className="text-sm font-medium leading-snug text-white">{story.title}</h4>
                        <p className="mt-2 text-[10px] text-slate-600">As a <span className="text-slate-500">{story.asA}</span></p>
                        <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                          <StatusPill status={colLabel} />
                          <span className="text-[10px] text-slate-600">{story.acceptanceCriteria.length} AC</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// 5. Build ─────────────────────────────────────────────────────────────────────

function BuildScreen({
  activeIdea, onStoryStatusChange,
}: {
  activeIdea: IdeaRecord | null;
  onStoryStatusChange: (storyId: string, status: StoryStatus) => void;
}) {
  const stories = activeIdea?.backlog?.epics.flatMap((e) => e.stories) ?? [];
  const doneCount = stories.filter((s) => s.status === "done").length;
  const inProgCount = stories.filter((s) => s.status === "in_progress").length;
  const pct = stories.length ? Math.round(((doneCount + inProgCount * 0.5) / stories.length) * 100) : 0;

  return (
    <div>
      <ModuleHeader title="BuildCopilot Build" subtitle="Track sprint execution, tasks, PRs and commits." icon={Code2} />

      {!activeIdea?.backlog ? (
        <EmptyState icon={Code2} title="Generate backlog first" body="The Build module derives sprint tasks from your backlog. Generate stories in Breakdown to continue." />
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white">Sprint 1 — Core Pipeline</h2>
                <p className="mt-1 text-sm text-slate-400">Goal: idea-to-PRD workflow</p>
              </div>
              <StatusPill status="In Progress" />
            </div>
            <div
              className="h-2 rounded-full bg-white/10"
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Sprint progress ${pct}%`}
            >
              <div className="h-2 rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-2 text-xs text-slate-500">{pct}% complete · {doneCount} done · {inProgCount} in progress</p>

            <div className="mt-6 space-y-3">
              {stories.slice(0, 6).map((story, i) => {
                const s = story.status ?? "todo";
                const storyLabel = s === "done" ? "Done" : s === "in_progress" ? "In Progress" : "To Do";
                const nextS: StoryStatus = s === "todo" ? "in_progress" : s === "in_progress" ? "done" : "todo";
                return (
                  <div key={story.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0B0F14] p-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono text-slate-500 shrink-0">{story.id}</span>
                        <StatusPill status={storyLabel} />
                      </div>
                      <h3 className="text-sm font-medium text-white truncate">{story.title}</h3>
                      <p className="mt-0.5 text-[10px] text-slate-600">As a {story.asA}</p>
                    </div>
                    <div className="ml-4 flex items-center gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={() => onStoryStatusChange(story.id, nextS)}
                        className="rounded-lg border border-white/10 px-2 py-1 text-[10px] text-slate-400 hover:border-violet-500/50 hover:text-violet-300 transition-colors"
                      >
                        → {nextS === "in_progress" ? "In Progress" : nextS === "done" ? "Done" : "To Do"}
                      </button>
                      <div className="text-right text-xs text-slate-500">
                        <div className="flex items-center gap-1.5 justify-end">
                          <GitPullRequest className="h-3.5 w-3.5" aria-hidden="true" />
                          PR #{i + 14}
                        </div>
                        <div className="mt-1 font-mono text-[10px]">
                          {s === "done" ? `commit: ${story.id.toLowerCase().replace("-", "")}` : "—"}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <div className="space-y-5">
            <Card>
              <h2 className="mb-4 text-sm font-semibold text-white">Sprint Health</h2>
              <div className="space-y-3">
                {([
                  [CheckCircle2, `${doneCount} stories done`,         "text-emerald-300"],
                  [Activity,     `${inProgCount} in progress`,        "text-blue-300"],
                  [Clock,        `${stories.length - doneCount - inProgCount} to do`, "text-yellow-300"],
                  [AlertTriangle,stories.length === 0 ? "No backlog yet" : "0 blockers", "text-slate-400"],
                ] as [React.ElementType, string, string][]).map(([Icon, text, color]) => (
                  <div key={text} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">
                    <Icon className={cn("h-4 w-4", color)} aria-hidden="true" />
                    <span className="text-sm text-slate-300">{text}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h2 className="mb-4 text-sm font-semibold text-white">Velocity</h2>
              <div className="flex h-32 items-end gap-2">
                {[0.4, 0.55, 0.65, 0.5, 0.75, 0.8, pct / 100].map((h, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1">
                    <div className="w-full rounded-t-lg bg-blue-500/60" style={{ height: `${h * 100}%` }} />
                    <span className="text-[9px] text-slate-600">W{i + 1}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

// 6. Verify ────────────────────────────────────────────────────────────────────

function VerifyScreen({ activeIdea }: { activeIdea: IdeaRecord | null }) {
  const rows = useMemo(() => {
    if (!activeIdea?.requirements || !activeIdea.backlog) return [];
    const frs = activeIdea.requirements.frd.functionalRequirements;
    const stories = activeIdea.backlog.epics.flatMap((e) =>
      e.stories.map((s) => ({ ...s, epicTitle: e.title }))
    );
    return frs.map((fr, i) => {
      const story = stories[i];
      const hasStory = !!story;
      const hasCommit = i < Math.floor(frs.length * 0.6);
      const hasTest = i < Math.floor(frs.length * 0.45);
      const traceStatus = !hasStory ? "missing" : !hasCommit ? "partial" : !hasTest ? "partial" : "complete";
      return {
        id: fr.id,
        requirement: `${fr.id}: ${fr.text.slice(0, 55)}${fr.text.length > 55 ? "…" : ""}`,
        epic: story?.epicTitle ?? "—",
        story: story?.id ?? "—",
        commit: hasCommit ? `feat/${story?.id.toLowerCase().replace("-", "/")}` : null,
        testCase: hasTest ? `${story?.id.toLowerCase()}.spec.ts` : null,
        status: traceStatus,
      };
    });
  }, [activeIdea]);

  const coverage = rows.length
    ? Math.round((rows.filter((r) => r.status === "complete").length / rows.length) * 100)
    : 0;

  return (
    <div>
      <ModuleHeader
        title="BuildCopilot Verify"
        subtitle="Validate that what was built matches what was planned."
        icon={ShieldCheck}
        action={
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Coverage</p>
              <p className="text-lg font-bold text-white">{coverage}%</p>
            </div>
            <button type="button" className="rounded-xl bg-rose-500/15 px-4 py-2.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-colors">
              Run Gap Scan
            </button>
          </div>
        }
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="Requirements & backlog needed"
          body="Complete Draft and Breakdown modules to generate the full traceability matrix linking requirements to stories, commits, and tests."
        />
      ) : (
        <div className="space-y-5">
          <Card className="p-0 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.04] text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="p-4">Requirement</th>
                  <th className="p-4">Epic</th>
                  <th className="p-4">Story</th>
                  <th className="p-4">Commit</th>
                  <th className="p-4">Test</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-t border-white/10 text-slate-300 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <span className="font-mono text-[10px] text-blue-400">{row.id}</span>
                      <p className="text-xs text-slate-400 mt-0.5">{row.requirement.split(": ")[1]}</p>
                    </td>
                    <td className="p-4 text-xs text-slate-400">{row.epic}</td>
                    <td className="p-4 text-xs font-mono text-slate-400">{row.story}</td>
                    <td className="p-4">
                      {row.commit
                        ? <span className="rounded border border-blue-400/20 bg-blue-400/10 px-2 py-0.5 font-mono text-[10px] text-blue-400">{row.commit}</span>
                        : <span className="rounded border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-rose-400">Missing</span>}
                    </td>
                    <td className="p-4">
                      {row.testCase
                        ? <span className="rounded border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 font-mono text-[10px] text-emerald-400">{row.testCase}</span>
                        : <span className="rounded border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-400">No Test</span>}
                    </td>
                    <td className="p-4"><StatusPill status={row.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {[
              { icon: ShieldCheck, label: "Coverage",      value: `${coverage}%`,                                  color: "text-emerald-300", note: "requirements traced" },
              { icon: AlertTriangle,label: "Gaps Detected", value: `${rows.filter(r => r.status === "missing").length}`,  color: "text-rose-300",    note: "missing artifacts" },
              { icon: CheckCircle2, label: "Validated",    value: `${rows.filter(r => r.status === "complete").length}`, color: "text-blue-300",    note: "fully traced" },
            ].map((s) => (
              <Card key={s.label}>
                <s.icon className={cn("h-5 w-5 mb-4", s.color)} aria-hidden="true" />
                <div className={cn("text-2xl font-bold", s.color)}>{s.value}</div>
                <div className="mt-1 text-sm font-medium text-white">{s.label}</div>
                <p className="mt-1 text-xs text-slate-500">{s.note}</p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// 7. Insight ───────────────────────────────────────────────────────────────────

declare global {
  interface Window { mermaid: { initialize: (c: object) => void; contentLoaded: () => void }; }
}

function InsightScreen({ activeIdea }: { activeIdea: IdeaRecord | null }) {
  const mermaidRef = useRef<HTMLDivElement>(null);

  const mermaidCode = useMemo(() => {
    if (activeIdea?.requirements) return generateMermaidFromRequirements(activeIdea.requirements);
    return `flowchart TD\n  A[Idea] --> B[Strategy]\n  B --> C[Draft]\n  C --> D[Breakdown]\n  D --> E[Build]\n  E --> F[Verify]\n  F --> G[Insight]`;
  }, [activeIdea]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.mermaid) {
      window.mermaid.initialize({ startOnLoad: true, theme: "dark", securityLevel: "loose" });
    }
  }, []);

  useEffect(() => {
    if (mermaidRef.current && typeof window !== "undefined" && window.mermaid) {
      mermaidRef.current.removeAttribute("data-processed");
      window.mermaid.contentLoaded();
    }
  }, [mermaidCode]);

  const completeness = [
    !!activeIdea,
    !!activeIdea?.strategy,
    !!activeIdea?.requirements,
    !!activeIdea?.backlog,
  ];
  const score = Math.round((completeness.filter(Boolean).length / completeness.length) * 100);

  const kpis = [
    { icon: Gauge,         label: "Product Completeness", value: `${score}%`,   note: `${completeness.filter(Boolean).length}/4 phases done` },
    { icon: Activity,      label: "Delivery Progress",    value: score > 75 ? "On Track" : "In Progress", note: "Sprint 1" },
    { icon: ShieldCheck,   label: "Backlog Health",       value: activeIdea?.backlog ? `${activeIdea.backlog.epics.length} epics` : "—", note: "stories generated" },
    { icon: AlertTriangle, label: "Risk Level",           value: score > 50 ? "Low" : "Medium", note: "automated scan" },
  ];

  return (
    <div>
      <ModuleHeader
        title="BuildCopilot Insight"
        subtitle="Dashboards, delivery health, and architecture diagrams."
        icon={BarChart3}
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4 mb-5">
        {kpis.map((k) => (
          <Card key={k.label}>
            <k.icon className="h-5 w-5 text-blue-300 mb-4" aria-hidden="true" />
            <div className="text-2xl font-bold text-white">{k.value}</div>
            <div className="mt-1 text-sm text-slate-400">{k.label}</div>
            <p className="mt-1 text-xs text-slate-600">{k.note}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card>
          <h2 className="mb-5 text-sm font-semibold text-white">Architecture Diagram</h2>
          <div className="rounded-2xl border border-white/[0.06] bg-black/40 p-6 min-h-64 overflow-x-auto flex justify-center">
            <div ref={mermaidRef} className="mermaid text-sm">{mermaidCode}</div>
          </div>
        </Card>

        <Card>
          <h2 className="mb-5 text-sm font-semibold text-white">AI Progress Summary</h2>
          <div className="space-y-3">
            {[
              `Idea captured: ${activeIdea ? "✓ structured" : "pending"}`,
              `Strategy: ${activeIdea?.strategy ? "✓ generated" : "not generated yet"}`,
              `Requirements: ${activeIdea?.requirements ? `✓ PRD/BRD/FRD ready (${activeIdea.requirements.frd.functionalRequirements.length} FRs)` : "pending"}`,
              `Backlog: ${activeIdea?.backlog ? `✓ ${activeIdea.backlog.epics.reduce((a, e) => a + e.stories.length, 0)} stories across ${activeIdea.backlog.epics.length} epics` : "pending"}`,
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-[#0B0F14] p-4 text-sm text-slate-300 leading-relaxed">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-blue-300" aria-hidden="true" />
                {item}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── AI Assistant Panel ───────────────────────────────────────────────────────

const AI_HINTS: Record<ModuleId, string[]> = {
  capture:   ["Clarify target user segments", "Add a measurable success goal", "Convert the idea into a problem statement"],
  strategy:  ["Prioritise Verify module as USP", "Add a buyer persona", "Convert roadmap into MVP phases"],
  draft:     ["Add non-functional requirements", "Define measurable KPIs", "Highlight assumptions"],
  breakdown: ["Split large stories into smaller ones", "Add missing acceptance criteria", "Estimate story complexity"],
  build:     ["Link stories to commits", "Sprint risk is increasing", "Assign QA owner"],
  verify:    ["One story has missing code and test", "Validation coverage below 80%", "Create gap ticket"],
  insight:   ["Prepare stakeholder summary", "Explain risk trend", "Recommend next sprint focus"],
};

function AIAssistantPanel({ activeModule }: { activeModule: ModuleId }) {
  const hints = AI_HINTS[activeModule];
  return (
    <aside className="hidden w-72 shrink-0 border-l border-white/10 bg-[#0D121A] p-5 xl:flex xl:flex-col" aria-label="AI Assistant">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-2xl bg-blue-500/15 p-3">
          <Sparkles className="h-5 w-5 text-blue-300" aria-hidden="true" />
        </div>
        <div>
          <h2 className="font-semibold text-white">AI Assistant</h2>
          <p className="text-xs text-slate-500">Context-aware guidance</p>
        </div>
      </div>
      <ul className="space-y-3">
        {hints.map((h) => (
          <li key={h} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-relaxed text-slate-300">{h}</li>
        ))}
      </ul>
      <div className="mt-6 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
        <h3 className="text-sm font-semibold text-blue-200">Quick Actions</h3>
        <div className="mt-4 space-y-2">
          {["Generate stories", "Summarise sprint", "Detect blockers", "Run validation"].map((a) => (
            <button key={a} type="button" className="flex w-full items-center justify-between rounded-xl border border-white/10 px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/5 transition-colors">
              {a}<ArrowRight className="h-4 w-4 text-slate-500" aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

// ─── Root Workspace ───────────────────────────────────────────────────────────

export function WorkspaceClient({ userProfile }: WorkspaceClientProps) {
  const [activeModule, setActiveModule] = useState<ModuleId>("capture");
  const [rawIdea, setRawIdea] = useState("");
  const [savedIdeas, setSavedIdeas] = useState<IdeaRecord[]>([]);
  const [activeIdeaId, setActiveIdeaId] = useState<string | null>(null);
  const [structureResponse, setStructureResponse] = useState<IdeaStructuringResponse | null>(null);
  const [structuring, setStructuring] = useState(false);
  const [generatingStrategy, setGeneratingStrategy] = useState(false);
  const [generatingRequirements, setGeneratingRequirements] = useState(false);
  const [generatingBacklog, setGeneratingBacklog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [health, setHealth] = useState<{ mode: string; connected: boolean } | null>(null);

  // Derive the active idea from saved ideas
  const activeIdea = useMemo<IdeaRecord | null>(() => {
    if (!savedIdeas.length) return null;
    if (activeIdeaId) {
      const pinned = savedIdeas.find((i) => i.ideaId === activeIdeaId);
      if (pinned) return pinned;
    }
    if (structureResponse?.ideaId) {
      const match = savedIdeas.find((i) => i.ideaId === structureResponse.ideaId);
      if (match) return match;
    }
    return [...savedIdeas].sort(
      (a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
    )[0];
  }, [savedIdeas, structureResponse?.ideaId]);

  // Load ideas on mount
  const refreshIdeas = useCallback(async () => {
    try {
      const res = await fetch("/api/ideas", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as IdeaListResponse;
      setSavedIdeas(data.items);
    } catch { /* silent — non-fatal */ }
  }, []);

  useEffect(() => {
    void refreshIdeas();
    const fetchHealth = async () => {
      try {
        const res = await fetch("/api/health/persistence");
        if (res.ok) setHealth(await res.json());
      } catch { /* silent */ }
    };
    void fetchHealth();
  }, [refreshIdeas]);

  // API actions
  const runStructuring = useCallback(async () => {
    if (!rawIdea.trim()) return;
    setStructuring(true);
    setError(null);
    try {
      const res = await fetch("/api/ideas/structure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawIdea, clarifications: [] }),
      });
      if (!res.ok) throw new Error(`Structure failed (${res.status})`);
      const data = (await res.json()) as IdeaStructuringResponse;
      setStructureResponse(data);
      setActiveIdeaId(data.ideaId);
      await refreshIdeas();
      setTimeout(() => setActiveModule("strategy"), 1200);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to structure idea.");
    } finally {
      setStructuring(false);
    }
  }, [rawIdea, refreshIdeas]);

  const runStrategy = useCallback(async () => {
    if (!activeIdea) return;
    setGeneratingStrategy(true);
    setError(null);
    try {
      const res = await fetch(`/api/ideas/${activeIdea.ideaId}/strategy`, { method: "POST" });
      if (!res.ok) throw new Error(`Strategy failed (${res.status})`);
      await refreshIdeas();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate strategy.");
    } finally {
      setGeneratingStrategy(false);
    }
  }, [activeIdea, refreshIdeas]);

  const runRequirements = useCallback(async () => {
    if (!activeIdea) return;
    setGeneratingRequirements(true);
    setError(null);
    try {
      const res = await fetch(`/api/ideas/${activeIdea.ideaId}/requirements`, { method: "POST" });
      if (!res.ok) throw new Error(`Requirements failed (${res.status})`);
      await refreshIdeas();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate requirements.");
    } finally {
      setGeneratingRequirements(false);
    }
  }, [activeIdea, refreshIdeas]);

  const runBacklog = useCallback(async () => {
    if (!activeIdea) return;
    setGeneratingBacklog(true);
    setError(null);
    try {
      const res = await fetch(`/api/ideas/${activeIdea.ideaId}/backlog`, { method: "POST" });
      if (!res.ok) throw new Error(`Backlog failed (${res.status})`);
      await refreshIdeas();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate backlog.");
    } finally {
      setGeneratingBacklog(false);
    }
  }, [activeIdea, refreshIdeas]);

  const runDeleteIdea = useCallback(async (ideaId: string) => {
    setSavedIdeas((prev) => prev.filter((i) => i.ideaId !== ideaId));
    if (activeIdea?.ideaId === ideaId) {
      setActiveIdeaId(null);
      setStructureResponse(null);
    }
    try {
      await fetch(`/api/ideas/${ideaId}`, { method: "DELETE" });
    } catch {
      await refreshIdeas();
    }
  }, [activeIdea?.ideaId, refreshIdeas]);

  const runStoryStatusChange = useCallback(async (storyId: string, status: StoryStatus) => {
    if (!activeIdea) return;
    // Optimistic update
    setSavedIdeas((prev) =>
      prev.map((idea) =>
        idea.ideaId !== activeIdea.ideaId
          ? idea
          : {
              ...idea,
              backlog: idea.backlog
                ? {
                    ...idea.backlog,
                    epics: idea.backlog.epics.map((epic) => ({
                      ...epic,
                      stories: epic.stories.map((s) =>
                        s.id === storyId ? { ...s, status } : s,
                      ),
                    })),
                  }
                : idea.backlog,
            },
      ),
    );
    try {
      const res = await fetch(
        `/api/ideas/${activeIdea.ideaId}/backlog/stories/${storyId}`,
        { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) },
      );
      if (!res.ok) await refreshIdeas(); // revert on failure
    } catch {
      await refreshIdeas();
    }
  }, [activeIdea, refreshIdeas]);

  // Sidebar
  const sidebarContent = (
    <aside className="w-64 xl:w-72 shrink-0 border-r border-white/5 bg-[#0B0F14] flex flex-col h-full relative z-20" aria-label="Workspace sidebar">
      <div className="p-5">
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 font-bold text-white shadow-xl shadow-blue-500/20 ring-1 ring-white/10" role="img" aria-label="BuildCopilot logo">F</div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight leading-none">BuildCopilot</h2>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">Intelligence OS</p>
          </div>
        </div>

        <div className="group mb-6 flex items-center gap-2 rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-2.5 text-xs text-slate-500 cursor-pointer hover:border-white/20 hover:bg-white/[0.04] transition-all" role="button" tabIndex={0} aria-label="Search workspace">
          <Search className="h-4 w-4 group-hover:text-blue-400 transition-colors" aria-hidden="true" /> Search workspace
        </div>

        <nav aria-label="Main navigation">
          <ul className="space-y-1.5" role="list">
            {MODULES.map((m) => {
              const Icon = m.icon;
              const active = activeModule === m.id;
              return (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => setActiveModule(m.id)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-300",
                      active ? "bg-white/5 text-white shadow-sm ring-1 ring-white/10" : "text-slate-500 hover:bg-white/[0.03] hover:text-white"
                    )}
                  >
                    <div className={cn(
                      "rounded-xl p-2 transition-all duration-500 group-hover:scale-110", 
                      active ? `bg-gradient-to-br ${m.accent} shadow-lg shadow-blue-500/20` : "bg-white/5"
                    )}>
                      <Icon className={cn("h-4 w-4", active ? "text-white" : "group-hover:text-blue-300")} aria-hidden="true" />
                    </div>
                    {m.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Idea switcher */}
      {savedIdeas.length > 0 && (
        <div className="mx-5 mb-3">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-600 px-1">Ideas ({savedIdeas.length})</p>
          <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
            {savedIdeas.map((idea) => {
              const isActive = idea.ideaId === activeIdea?.ideaId;
              return (
                <div key={idea.ideaId} className="group relative">
                  <button
                    type="button"
                    onClick={() => { setActiveIdeaId(idea.ideaId); setActiveModule("capture"); }}
                    className={cn(
                      "w-full rounded-xl border px-3 py-2 pr-8 text-left text-[11px] transition-all",
                      isActive
                        ? "border-blue-500/40 bg-blue-500/10 text-white"
                        : "border-white/5 bg-white/[0.02] text-slate-500 hover:border-white/10 hover:text-slate-300"
                    )}
                  >
                    <span className="line-clamp-1">{idea.rawIdea.slice(0, 48)}{idea.rawIdea.length > 48 ? "…" : ""}</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); void runDeleteIdea(idea.ideaId); }}
                    title="Delete idea"
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-slate-600 hover:text-rose-400 transition-all"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-auto p-5">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-white mb-3">
            <Rocket className="h-4 w-4 text-blue-300" aria-hidden="true" /> MVP Status
          </div>
          <div className="h-1.5 rounded-full bg-white/10" role="progressbar" aria-valuenow={activeIdea ? 58 : 10} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-1.5 rounded-full bg-blue-500 transition-all" style={{ width: activeIdea ? "58%" : "10%" }} />
          </div>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-slate-600">
            {activeIdea ? "Core loop 58% configured" : "Capture to begin"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="mt-3 w-full rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-500 hover:text-slate-300 hover:border-white/20 transition-colors text-center"
        >
          Sign out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-dvh bg-[#080B10] text-slate-200 selection:bg-blue-500/30 font-sora relative overflow-hidden">
      {/* Background Intelligence Glows */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
        <motion.div
          animate={{
            background: activeModule 
              ? `radial-gradient(circle at 50% 50%, ${activeModule === 'capture' ? '#7c3aed11' : activeModule === 'strategy' ? '#2563eb11' : '#05966911'} 0%, transparent 70%)`
              : 'radial-gradient(circle at 50% 50%, #2563eb0a 0%, transparent 70%)'
          }}
          className="absolute inset-0 transition-all duration-1000 ease-in-out"
        />
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-purple-600/5 rounded-full blur-[140px]" />
      </div>

      <div className="flex h-dvh overflow-hidden relative z-10">
        {sidebarContent}

        <main className="flex-1 flex flex-col min-w-0 bg-transparent">
          {/* Topbar */}
          <div className="shrink-0 border-b border-white/5 bg-[#080B10]/60 px-8 py-5 backdrop-blur-xl z-20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2.5 rounded-2xl border border-white/5 bg-white/5 px-3 py-1.5 shadow-sm">
                  <Users className="h-4 w-4 text-blue-400" aria-hidden="true" />
                  <span className="text-xs font-bold tracking-tight text-white">{userProfile.project}</span>
                </div>
                <span className="text-white/10">/</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">{userProfile.role}</span>
              </div>
              <div className="flex items-center gap-4">
                {activeIdea && (
                  <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Project Context Loaded
                  </div>
                )}
                {health && (
                  <div className={cn(
                    "flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest transition-all",
                    health.connected ? "border-blue-500/20 bg-blue-500/5 text-blue-400" : "border-amber-500/20 bg-amber-500/5 text-amber-400"
                  )}>
                    <Gauge className="h-3 w-3" />
                    {health.mode === "supabase" ? "Supabase Cloud" : "Local Engine"} • {health.connected ? "Active" : "Disconnected"}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => { setRawIdea(""); setActiveIdeaId(null); setStructureResponse(null); setActiveModule("capture"); }}
                  className="group flex items-center gap-2 rounded-xl bg-white/[0.03] border border-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/5 hover:border-white/20 transition-all active:scale-95"
                >
                  <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" aria-hidden="true" /> New Idea
                </button>
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 p-px shadow-lg shadow-blue-500/10">
                  <div className="h-full w-full rounded-[14px] bg-[#0B0F14] flex items-center justify-center text-[11px] font-bold text-white">
                    {userProfile.name.slice(0, 2).toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* Error Toast */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  role="alert"
                  className="fixed top-8 right-8 z-50 flex items-center gap-4 rounded-3xl border border-rose-500/20 bg-[#1A0A0F]/95 p-4 text-sm font-medium text-rose-200 shadow-2xl backdrop-blur-2xl ring-1 ring-rose-500/10"
                >
                  <div className="rounded-xl bg-rose-500/10 p-2">
                    <AlertCircle className="h-5 w-5 text-rose-500" aria-hidden="true" />
                  </div>
                  <span>{error}</span>
                  <button
                    type="button"
                    onClick={() => setError(null)}
                    className="ml-4 rounded-xl p-2 hover:bg-white/5 transition-colors"
                  >
                    <X className="h-4 w-4 text-slate-400" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeModule}
                initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="p-8 lg:p-12"
              >
                {activeModule === "capture" && (
                  <CaptureScreen
                    rawIdea={rawIdea}
                    setRawIdea={setRawIdea}
                    structuring={structuring}
                    onStructure={runStructuring}
                    activeIdea={activeIdea}
                  />
                )}
                {activeModule === "strategy" && (
                  <StrategyScreen activeIdea={activeIdea} generating={generatingStrategy} onRun={runStrategy} />
                )}
                {activeModule === "draft" && (
                  <DraftScreen activeIdea={activeIdea} generating={generatingRequirements} onRun={runRequirements} />
                )}
                {activeModule === "breakdown" && (
                  <BreakdownScreen activeIdea={activeIdea} generating={generatingBacklog} onRun={runBacklog} onStoryStatusChange={runStoryStatusChange} />
                )}
                {activeModule === "build" && (
                  <BuildScreen activeIdea={activeIdea} onStoryStatusChange={runStoryStatusChange} />
                )}
                {activeModule === "verify" && (
                  <VerifyScreen activeIdea={activeIdea} />
                )}
                {activeModule === "insight" && (
                  <InsightScreen activeIdea={activeIdea} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        <AIAssistantPanel activeModule={activeModule} />
      </div>
    </div>
  );
}
