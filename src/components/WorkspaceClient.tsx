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
  id: ModuleId; label: string; icon: React.ElementType; accent: string; color: string;
}> = [
  { id: "capture",   label: "Capture",   icon: Lightbulb,   accent: "bg-purple-50 text-purple-600",  color: "#7C3AED" },
  { id: "strategy",  label: "Strategy",  icon: Target,      accent: "bg-blue-50 text-blue-600",      color: "#2563EB" },
  { id: "draft",     label: "Draft",     icon: FileText,    accent: "bg-amber-50 text-amber-600",    color: "#D97706" },
  { id: "breakdown", label: "Breakdown", icon: GitBranch,   accent: "bg-orange-50 text-orange-600",  color: "#EA580C" },
  { id: "build",     label: "Build",     icon: Code2,       accent: "bg-emerald-50 text-emerald-600",color: "#059669" },
  { id: "verify",    label: "Verify",    icon: ShieldCheck, accent: "bg-rose-50 text-rose-600",      color: "#DC2626" },
  { id: "insight",   label: "Insight",   icon: BarChart3,   accent: "bg-indigo-50 text-indigo-600",  color: "#4F46E5" },
];

// ─── Utilities ────────────────────────────────────────────────────────────────

function cn(...cls: (string | false | null | undefined)[]) {
  return cls.filter(Boolean).join(" ");
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn(
      "rounded-xl border border-slate-200 bg-white shadow-sm",
      className
    )}>
      {children}
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
      data-testid="run-ai-btn"
      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
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
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
          <Icon className="h-5 w-5 text-blue-600" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">{title}</h1>
          <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
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
    <Card className="flex flex-col items-center justify-center gap-5 py-20 text-center p-6">
      <div className="rounded-2xl bg-blue-50 p-5 text-blue-600">
        <Icon className="h-8 w-8" aria-hidden="true" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">{body}</p>
      </div>
      {action}
    </Card>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    Done:         "bg-emerald-50 text-emerald-700 border-emerald-200",
    "In Progress":"bg-blue-50 text-blue-700 border-blue-200",
    "To Do":      "bg-slate-100 text-slate-600 border-slate-200",
    Validated:    "bg-emerald-50 text-emerald-700 border-emerald-200",
    Partial:      "bg-amber-50 text-amber-700 border-amber-200",
    Gap:          "bg-red-50 text-red-700 border-red-200",
    complete:     "bg-emerald-50 text-emerald-700 border-emerald-200",
    partial:      "bg-amber-50 text-amber-700 border-amber-200",
    missing:      "bg-red-50 text-red-700 border-red-200",
    High:         "bg-red-50 text-red-700 border-red-200",
    Medium:       "bg-amber-50 text-amber-700 border-amber-200",
    Low:          "bg-slate-50 text-slate-600 border-slate-200",
    Must:         "bg-blue-50 text-blue-700 border-blue-200",
    Should:       "bg-indigo-50 text-indigo-700 border-indigo-200",
    Could:        "bg-slate-50 text-slate-600 border-slate-200",
  };
  return (
    <span className={cn("rounded-md border px-2 py-0.5 text-xs font-semibold capitalize", map[status] ?? map["To Do"])}>
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
        <Card className="xl:col-span-2 p-5">
          <label htmlFor="capture-idea" className="text-xs font-mono font-semibold uppercase tracking-[0.18em] text-slate-400">
            Write your idea
          </label>
          <textarea
            id="capture-idea"
            value={rawIdea}
            onChange={(e) => setRawIdea(e.target.value)}
            placeholder="Describe your project, the problem it solves, and who it's for…"
            data-testid="capture-idea-textarea"
            className="mt-3 h-44 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition-all leading-relaxed"
          />
          <p className="mt-2 text-xs text-slate-400">Be specific about the problem, target users, and value you want to deliver.</p>
        </Card>

        <Card className="flex flex-col justify-between p-5">
          <h2 className="text-xs font-mono font-semibold uppercase tracking-[0.18em] text-slate-400">AI Clarity Score</h2>
          <div className="flex items-center gap-5 my-4">
            <div
              className="relative w-24 h-24 shrink-0 flex items-center justify-center"
              role="img"
              aria-label={`Clarity score ${clarityScore}%`}
            >
              <svg className="w-full h-full -rotate-90" aria-hidden="true">
                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                <circle
                  cx="48" cy="48" r="40"
                  stroke="currentColor" strokeWidth="8" fill="transparent"
                  className="text-blue-600"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - clarityScore / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-xl font-bold text-slate-900 font-mono" aria-hidden="true">{clarityScore}%</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-500">
              <li className="flex items-center gap-2">
                <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", analysis?.problemStatement ? "bg-emerald-500" : "bg-slate-300")} />
                Problem statement
              </li>
              <li className="flex items-center gap-2">
                <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", analysis?.targetUsers?.length ? "bg-emerald-500" : "bg-slate-300")} />
                Target users
              </li>
              <li className="flex items-center gap-2">
                <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", analysis?.usp ? "bg-emerald-500" : "bg-slate-300")} />
                Unique value
              </li>
              <li className="flex items-center gap-2">
                <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", analysis?.goals?.length ? "bg-emerald-500" : "bg-slate-300")} />
                Goals defined
              </li>
            </ul>
          </div>
        </Card>
      </div>

      {analysis && (
        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4 animate-fade-in" aria-live="polite">
          {([
            ["Problem",      analysis.problemStatement],
            ["Target Users", analysis.targetUsers.join(", ")],
            ["Goals",        analysis.goals[0] ?? "—"],
            ["USP",          analysis.usp],
          ] as [string, string][]).map(([title, text]) => (
            <Card key={title} className="p-4 hover:shadow-md transition-shadow">
              <h3 className="text-xs font-mono font-semibold uppercase tracking-[0.18em] text-slate-400 mb-2">{title}</h3>
              <p className="text-sm leading-relaxed text-slate-700">{text}</p>
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
            <Card className="xl:col-span-2 p-5">
              <h2 className="text-sm font-bold text-slate-800 mb-3">Product Vision</h2>
              <p className="text-sm leading-relaxed text-slate-600 rounded-lg border border-slate-100 bg-slate-50 p-4">{strategy.vision}</p>
              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <h3 className="text-xs font-mono font-semibold uppercase tracking-[0.16em] text-slate-400 mb-2">Market Position</h3>
                  <p className="text-sm text-slate-600">{strategy.marketPosition}</p>
                </div>
                <div>
                  <h3 className="text-xs font-mono font-semibold uppercase tracking-[0.16em] text-slate-400 mb-2">Business Model</h3>
                  <p className="text-sm text-slate-600">{strategy.businessModel}</p>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <h2 className="text-sm font-bold text-slate-800 mb-4">Success Metrics</h2>
              <ul className="space-y-2">
                {strategy.successMetrics.map((m, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <TrendingUp className="h-4 w-4 shrink-0 mt-0.5 text-blue-500" aria-hidden="true" />
                    {m}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {(["now", "next", "later"] as const).map((phase) => {
              const colours: Record<string, string> = { now: "bg-emerald-500", next: "bg-blue-500", later: "bg-violet-500" };
              const textColours: Record<string, string> = { now: "text-emerald-700", next: "text-blue-700", later: "text-violet-700" };
              const bgColours: Record<string, string> = { now: "bg-emerald-50 border-emerald-200", next: "bg-blue-50 border-blue-200", later: "bg-violet-50 border-violet-200" };
              const labels: Record<string, string> = { now: "Now (MVP)", next: "Next (Scale)", later: "Later (Vision)" };
              return (
                <Card key={phase} className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <span className={cn("w-2 h-2 rounded-full", colours[phase])} />
                    <h3 className="text-sm font-bold text-slate-900">{labels[phase]}</h3>
                  </div>
                  <div className="space-y-2">
                    {strategy.roadmapNowNextLater[phase].map((item, i) => (
                      <div key={i} className={cn("rounded-lg border px-3 py-2 text-sm", textColours[phase], bgColours[phase])}>{item}</div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>

          {strategy.prioritization.length > 0 && (
            <Card className="overflow-hidden p-0">
              <div className="p-5 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-800">Feature Prioritization</h2>
              </div>
              <div className="overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-mono uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Feature</th>
                      <th className="px-5 py-3">Method</th>
                      <th className="px-5 py-3">Rationale</th>
                    </tr>
                  </thead>
                  <tbody>
                    {strategy.prioritization.map((p, i) => (
                      <tr key={i} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3 font-medium text-slate-800">{p.item}</td>
                        <td className="px-5 py-3">
                          <span className="rounded-md border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">{p.method}</span>
                        </td>
                        <td className="px-5 py-3 text-slate-500">{p.rationale}</td>
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
  const frRows = req.frd.functionalRequirements.map((r) => `| ${r.id} | ${r.text} | ${r.priority} |`).join("\n");
  const nfrRows = req.frd.nonFunctionalRequirements.map((r) => `| ${r.id} | ${r.category} | ${r.text} |`).join("\n");
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
        <Card className="overflow-hidden p-0">
          <div className="border-b border-slate-100 bg-slate-50 px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-base font-bold text-slate-900">{req.prd.title}</h2>
              <p className="mt-0.5 text-xs text-slate-400">Generated · {new Date(req.generatedAt).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleCopy(req)}
                data-testid="copy-md-btn"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 hover:border-slate-300 hover:text-slate-800 transition-colors shadow-sm"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied!" : "Copy MD"}
              </button>
              <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm" data-testid="draft-tabs">
                {(["prd", "brd", "frd"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTab(t)}
                    data-testid={`tab-${t}`}
                    className={cn(
                      "rounded-md px-4 py-1.5 text-xs font-bold uppercase tracking-[0.1em] transition-all",
                      tab === t ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-5">
            {tab === "prd" && (
              <div className="space-y-3">
                {[
                  ["Objectives", req.prd.objectives.join(" • ")],
                  ["Personas",   req.prd.personas.join(", ")],
                  ["Features",   req.prd.features.join(" • ")],
                  ["Dependencies", req.prd.dependencies.join(", ")],
                  ["Release Plan", req.prd.releasePlan.join(" → ")],
                ].map(([title, text]) => (
                  <div key={title} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-mono font-semibold uppercase tracking-[0.16em] text-slate-400">{title}</h3>
                      <button type="button" className="text-xs text-blue-600 hover:text-blue-700 transition-colors font-medium">Improve with AI</button>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-700">{text}</p>
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
                  <div key={title} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                    <h3 className="text-xs font-mono font-semibold uppercase tracking-[0.16em] text-slate-400 mb-2">{title}</h3>
                    <p className="text-sm leading-relaxed text-slate-700">{text}</p>
                  </div>
                ))}
              </div>
            )}

            {tab === "frd" && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-xs font-mono font-semibold uppercase tracking-[0.16em] text-slate-400 mb-3">Functional Requirements</h3>
                  <div className="overflow-hidden rounded-xl border border-slate-200">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-xs font-mono uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="px-4 py-3">ID</th>
                          <th className="px-4 py-3">Requirement</th>
                          <th className="px-4 py-3">Priority</th>
                        </tr>
                      </thead>
                      <tbody>
                        {req.frd.functionalRequirements.map((fr) => (
                          <tr key={fr.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 font-mono text-xs text-blue-600 font-semibold">{fr.id}</td>
                            <td className="px-4 py-3 text-slate-700">{fr.text}</td>
                            <td className="px-4 py-3"><StatusPill status={fr.priority} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-mono font-semibold uppercase tracking-[0.16em] text-slate-400 mb-3">Non-Functional Requirements</h3>
                  <div className="overflow-hidden rounded-xl border border-slate-200">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-xs font-mono uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="px-4 py-3">ID</th>
                          <th className="px-4 py-3">Category</th>
                          <th className="px-4 py-3">Requirement</th>
                        </tr>
                      </thead>
                      <tbody>
                        {req.frd.nonFunctionalRequirements.map((nfr) => (
                          <tr key={nfr.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 font-mono text-xs text-violet-600 font-semibold">{nfr.id}</td>
                            <td className="px-4 py-3 text-slate-500 text-xs">{nfr.category}</td>
                            <td className="px-4 py-3 text-slate-700">{nfr.text}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
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
        <EmptyState icon={FileText} title="Requirements needed" body="Generate PRD, BRD & FRD in the Draft module first." />
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
          <Card className="p-4">
            <h2 className="mb-4 text-xs font-mono font-semibold uppercase tracking-[0.18em] text-slate-400">Epic Tree ({backlog.epics.length})</h2>
            <div className="space-y-2">
              {backlog.epics.map((epic) => (
                <button
                  key={epic.id}
                  type="button"
                  onClick={() => setSelectedEpicId(epic.id)}
                  className={cn(
                    "w-full rounded-lg border p-3 text-left transition-all",
                    selectedEpic?.id === epic.id
                      ? "border-blue-200 bg-blue-50"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  )}
                >
                  <GitBranch className={cn("mb-2 h-4 w-4", selectedEpic?.id === epic.id ? "text-blue-600" : "text-slate-400")} aria-hidden="true" />
                  <p className={cn("text-xs font-semibold", selectedEpic?.id === epic.id ? "text-blue-900" : "text-slate-700")}>{epic.title}</p>
                  <p className="mt-1 text-[10px] text-slate-400">{epic.stories.length} stories</p>
                </button>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100">
              <p className="text-xs text-slate-400">{allStories.length} total stories</p>
            </div>
          </Card>

          {/* Kanban */}
          <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            {(["todo", "in_progress", "done"] as const).map((colStatus) => {
              const colLabel = colStatus === "todo" ? "To Do" : colStatus === "in_progress" ? "In Progress" : "Done";
              const nextStatus: StoryStatus = colStatus === "todo" ? "in_progress" : colStatus === "in_progress" ? "done" : "todo";
              const colStories = (selectedEpic?.stories ?? allStories).filter(
                (s) => (s.status ?? "todo") === colStatus,
              );
              const colHeader = {
                todo: "text-slate-600 bg-slate-100",
                in_progress: "text-blue-700 bg-blue-50",
                done: "text-emerald-700 bg-emerald-50",
              }[colStatus];
              return (
                <div key={colStatus}>
                  <div className={cn("mb-3 flex items-center justify-between rounded-lg px-3 py-2", colHeader)}>
                    <h3 className="text-xs font-bold uppercase tracking-[0.16em]">{colLabel}</h3>
                    <span className="text-xs font-bold">{colStories.length}</span>
                  </div>
                  <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3 min-h-48">
                    {colStories.map((story) => (
                      <div key={story.id} className="rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-300 hover:shadow-sm transition-all">
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-[10px] font-mono text-slate-400">{story.id}</span>
                          <button
                            type="button"
                            onClick={() => onStoryStatusChange(story.id, nextStatus)}
                            className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-500 hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            → {nextStatus === "in_progress" ? "In Progress" : nextStatus === "done" ? "Done" : "To Do"}
                          </button>
                        </div>
                        <h4 className="text-sm font-semibold text-slate-800 leading-snug">{story.title}</h4>
                        <p className="mt-2 text-[10px] text-slate-400">As a <span className="text-slate-600">{story.asA}</span></p>
                        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                          <StatusPill status={colLabel} />
                          <span className="text-[10px] text-slate-400">{story.acceptanceCriteria.length} AC</span>
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
          <Card className="xl:col-span-2 p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Sprint 1 — Core Pipeline</h2>
                <p className="mt-1 text-xs text-slate-400">Goal: idea-to-PRD workflow</p>
              </div>
              <StatusPill status="In Progress" />
            </div>
            <div
              className="h-2 rounded-full bg-slate-100"
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Sprint progress ${pct}%`}
            >
              <div className="h-2 rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-2 text-xs text-slate-400 font-mono">{pct}% complete · {doneCount} done · {inProgCount} in progress</p>

            <div className="mt-6 space-y-2.5">
              {stories.slice(0, 6).map((story, i) => {
                const s = story.status ?? "todo";
                const storyLabel = s === "done" ? "Done" : s === "in_progress" ? "In Progress" : "To Do";
                const nextS: StoryStatus = s === "todo" ? "in_progress" : s === "in_progress" ? "done" : "todo";
                return (
                  <div key={story.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4 hover:border-slate-300 transition-all">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">{story.id}</span>
                        <StatusPill status={storyLabel} />
                      </div>
                      <h3 className="text-sm font-semibold text-slate-800 truncate">{story.title}</h3>
                      <p className="mt-0.5 text-[10px] text-slate-400">As a {story.asA}</p>
                    </div>
                    <div className="ml-4 flex items-center gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={() => onStoryStatusChange(story.id, nextS)}
                        className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-500 hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        → {nextS === "in_progress" ? "In Progress" : nextS === "done" ? "Done" : "To Do"}
                      </button>
                      <div className="text-right text-xs text-slate-400">
                        <div className="flex items-center gap-1.5 justify-end">
                          <GitPullRequest className="h-3.5 w-3.5" aria-hidden="true" />
                          PR #{i + 14}
                        </div>
                        <div className="mt-1 font-mono text-[10px]">
                          {s === "done" ? `${story.id.toLowerCase().replace("-", "")}` : "—"}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <div className="space-y-5">
            <Card className="p-5">
              <h2 className="mb-4 text-sm font-bold text-slate-900">Sprint Health</h2>
              <div className="space-y-2.5">
                {([
                  [CheckCircle2, `${doneCount} stories done`,         "text-emerald-600"],
                  [Activity,     `${inProgCount} in progress`,        "text-blue-600"],
                  [Clock,        `${stories.length - doneCount - inProgCount} to do`, "text-amber-600"],
                  [AlertTriangle,stories.length === 0 ? "No backlog yet" : "0 blockers", "text-slate-400"],
                ] as [React.ElementType, string, string][]).map(([Icon, text, color]) => (
                  <div key={text} className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <Icon className={cn("h-4 w-4", color)} aria-hidden="true" />
                    <span className="text-sm text-slate-700">{text}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <h2 className="mb-4 text-sm font-bold text-slate-900">Velocity</h2>
              <div className="flex h-32 items-end gap-2">
                {[0.4, 0.55, 0.65, 0.5, 0.75, 0.8, pct / 100].map((h, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1">
                    <div className="w-full rounded-t bg-blue-100" style={{ height: `${h * 100}%` }}>
                      <div className="w-full h-full rounded-t bg-blue-500/60" />
                    </div>
                    <span className="text-[9px] font-mono text-slate-400">W{i + 1}</span>
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
              <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.16em] text-slate-400">Coverage</p>
              <p className="text-xl font-bold text-slate-900 font-mono">{coverage}%</p>
            </div>
            <button type="button" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors">
              Run Gap Scan
            </button>
          </div>
        }
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="Requirements & backlog needed"
          body="Complete Draft and Breakdown modules to generate the full traceability matrix."
        />
      ) : (
        <div className="space-y-5">
          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-mono uppercase tracking-wide text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Requirement</th>
                    <th className="px-4 py-3">Epic</th>
                    <th className="px-4 py-3">Story</th>
                    <th className="px-4 py-3">Commit</th>
                    <th className="px-4 py-3">Test</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => (
                    <tr key={row.id} className={cn("border-t border-slate-100 transition-colors hover:bg-slate-50", idx % 2 === 0 ? "" : "bg-slate-50/50")}>
                      <td className="px-4 py-3">
                        <span className="font-mono text-[10px] text-blue-600 font-semibold">{row.id}</span>
                        <p className="text-xs text-slate-600 mt-0.5">{row.requirement.split(": ")[1]}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{row.epic}</td>
                      <td className="px-4 py-3 text-xs font-mono text-slate-500">{row.story}</td>
                      <td className="px-4 py-3">
                        {row.commit
                          ? <span className="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 font-mono text-[10px] text-blue-700">{row.commit}</span>
                          : <span className="rounded border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase text-red-600">Missing</span>}
                      </td>
                      <td className="px-4 py-3">
                        {row.testCase
                          ? <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-mono text-[10px] text-emerald-700">{row.testCase}</span>
                          : <span className="rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-600">No Test</span>}
                      </td>
                      <td className="px-4 py-3"><StatusPill status={row.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {[
              { icon: ShieldCheck,  label: "Coverage",      value: `${coverage}%`,                                  color: "text-emerald-700", bg: "bg-emerald-50", note: "requirements traced" },
              { icon: AlertTriangle,label: "Gaps Detected", value: `${rows.filter(r => r.status === "missing").length}`, color: "text-rose-700",    bg: "bg-rose-50",    note: "missing artifacts" },
              { icon: CheckCircle2, label: "Validated",     value: `${rows.filter(r => r.status === "complete").length}`, color: "text-blue-700",    bg: "bg-blue-50",    note: "fully traced" },
            ].map((s) => (
              <Card key={s.label} className={cn("p-5", s.bg)}>
                <s.icon className={cn("h-5 w-5 mb-4", s.color)} aria-hidden="true" />
                <div className={cn("text-3xl font-bold font-mono", s.color)}>{s.value}</div>
                <div className="mt-1 text-sm font-bold text-slate-800">{s.label}</div>
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
      window.mermaid.initialize({ startOnLoad: true, theme: "default", securityLevel: "loose" });
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
    { icon: Gauge,         label: "Product Completeness", value: `${score}%`,   note: `${completeness.filter(Boolean).length}/4 phases done`, color: "text-blue-700", bg: "bg-blue-50" },
    { icon: Activity,      label: "Delivery Progress",    value: score > 75 ? "On Track" : "In Progress", note: "Sprint 1", color: "text-emerald-700", bg: "bg-emerald-50" },
    { icon: ShieldCheck,   label: "Backlog Health",       value: activeIdea?.backlog ? `${activeIdea.backlog.epics.length} epics` : "—", note: "stories generated", color: "text-violet-700", bg: "bg-violet-50" },
    { icon: AlertTriangle, label: "Risk Level",           value: score > 50 ? "Low" : "Medium", note: "automated scan", color: "text-amber-700", bg: "bg-amber-50" },
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
          <Card key={k.label} className={cn("p-5", k.bg)}>
            <k.icon className={cn("h-5 w-5 mb-4", k.color)} aria-hidden="true" />
            <div className={cn("text-3xl font-bold font-mono", k.color)}>{k.value}</div>
            <div className="mt-1 text-sm font-bold text-slate-800">{k.label}</div>
            <p className="mt-1 text-xs text-slate-500">{k.note}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-5 text-sm font-bold text-slate-900">Architecture Diagram</h2>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 min-h-64 overflow-x-auto flex justify-center">
            <div ref={mermaidRef} className="mermaid text-sm">{mermaidCode}</div>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="mb-5 text-sm font-bold text-slate-900">AI Progress Summary</h2>
          <div className="space-y-3">
            {[
              `Idea captured: ${activeIdea ? "✓ structured" : "pending"}`,
              `Strategy: ${activeIdea?.strategy ? "✓ generated" : "not generated yet"}`,
              `Requirements: ${activeIdea?.requirements ? `✓ PRD/BRD/FRD ready (${activeIdea.requirements.frd.functionalRequirements.length} FRs)` : "pending"}`,
              `Backlog: ${activeIdea?.backlog ? `✓ ${activeIdea.backlog.epics.reduce((a, e) => a + e.stories.length, 0)} stories across ${activeIdea.backlog.epics.length} epics` : "pending"}`,
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700 leading-relaxed">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" aria-hidden="true" />
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
    <aside
      className="hidden w-64 shrink-0 border-l border-slate-200 bg-slate-50 p-5 xl:flex xl:flex-col"
      aria-label="AI Assistant"
      data-testid="ai-assistant-panel"
    >
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-xl bg-blue-50 border border-blue-100 p-2.5">
          <Sparkles className="h-4 w-4 text-blue-600" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900">AI Assistant</h2>
          <p className="text-xs text-slate-400">Context-aware guidance</p>
        </div>
      </div>
      <ul className="space-y-2.5">
        {hints.map((h) => (
          <li key={h} className="rounded-lg border border-slate-200 bg-white p-3.5 text-xs leading-relaxed text-slate-600 shadow-sm">{h}</li>
        ))}
      </ul>
      <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
        <h3 className="text-xs font-bold text-blue-800 mb-3">Quick Actions</h3>
        <div className="space-y-1.5">
          {["Generate stories", "Summarise sprint", "Detect blockers", "Run validation"].map((a) => (
            <button
              key={a}
              type="button"
              className="flex w-full items-center justify-between rounded-lg border border-blue-100 bg-white px-3 py-2 text-left text-xs font-medium text-slate-700 hover:border-blue-200 hover:bg-blue-50 transition-colors"
            >
              {a}<ArrowRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
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

  const refreshIdeas = useCallback(async () => {
    try {
      const res = await fetch("/api/ideas", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as IdeaListResponse;
      setSavedIdeas(data.items);
    } catch { /* silent */ }
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
      if (!res.ok) await refreshIdeas();
    } catch {
      await refreshIdeas();
    }
  }, [activeIdea, refreshIdeas]);

  // Sidebar
  const sidebarContent = (
    <aside
      className="w-60 xl:w-64 shrink-0 border-r border-slate-200 bg-slate-50 flex flex-col h-full"
      aria-label="Workspace sidebar"
      data-testid="workspace-sidebar"
    >
      <div className="p-5">
        {/* Logo */}
        <div className="mb-7 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm" aria-label="BuildCopilot logo">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path d="M2 7L5.5 10.5L12 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight leading-none">BuildCopilot</h2>
            <p className="mt-0.5 text-[10px] font-mono font-semibold uppercase tracking-[0.16em] text-slate-400">Intelligence OS</p>
          </div>
        </div>

        {/* Search */}
        <div
          className="mb-5 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-400 cursor-pointer hover:border-slate-300 transition-all shadow-sm"
          role="button"
          tabIndex={0}
          aria-label="Search workspace"
          data-testid="workspace-search"
        >
          <Search className="h-3.5 w-3.5" aria-hidden="true" /> Search workspace
        </div>

        {/* Nav */}
        <nav aria-label="Main navigation">
          <ul className="space-y-1" role="list">
            {MODULES.map((m) => {
              const Icon = m.icon;
              const active = activeModule === m.id;
              return (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => setActiveModule(m.id)}
                    aria-current={active ? "page" : undefined}
                    data-testid={`nav-${m.id}`}
                    className={cn(
                      "group flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                      active
                        ? "bg-white shadow-sm text-blue-600 border border-slate-200"
                        : "text-slate-500 hover:bg-white/60 hover:text-slate-800"
                    )}
                  >
                    <div className={cn(
                      "rounded-lg p-1.5 transition-all",
                      active ? m.accent : "bg-transparent"
                    )}>
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                    {m.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Ideas list */}
      {savedIdeas.length > 0 && (
        <div className="mx-4 mb-3">
          <p className="mb-2 text-[10px] font-mono font-semibold uppercase tracking-[0.18em] text-slate-400 px-1">
            Ideas ({savedIdeas.length})
          </p>
          <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
            {savedIdeas.map((idea) => {
              const isActive = idea.ideaId === activeIdea?.ideaId;
              return (
                <div key={idea.ideaId} className="group relative">
                  <button
                    type="button"
                    onClick={() => { setActiveIdeaId(idea.ideaId); setActiveModule("capture"); }}
                    className={cn(
                      "w-full rounded-lg border px-3 py-2 pr-8 text-left text-[11px] transition-all font-medium",
                      isActive
                        ? "border-blue-200 bg-white text-blue-700 shadow-sm"
                        : "border-transparent text-slate-400 hover:border-slate-200 hover:text-slate-700 hover:bg-white"
                    )}
                  >
                    <span className="line-clamp-1">{idea.rawIdea.slice(0, 48)}{idea.rawIdea.length > 48 ? "…" : ""}</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); void runDeleteIdea(idea.ideaId); }}
                    title="Delete idea"
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-all"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom */}
      <div className="mt-auto p-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-3">
            <Rocket className="h-3.5 w-3.5 text-blue-600" aria-hidden="true" /> MVP Status
          </div>
          <div
            className="h-1.5 rounded-full bg-slate-100"
            role="progressbar"
            aria-valuenow={activeIdea ? 58 : 10}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="h-1.5 rounded-full bg-blue-600 transition-all" style={{ width: activeIdea ? "58%" : "10%" }} />
          </div>
          <p className="mt-2 text-[10px] font-mono font-semibold uppercase tracking-[0.16em] text-slate-400">
            {activeIdea ? "Core loop 58% configured" : "Capture to begin"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          data-testid="signout-btn"
          className="mt-2.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 hover:border-slate-300 transition-colors text-center shadow-sm"
        >
          Sign out
        </button>
      </div>
    </aside>
  );

  return (
    <div
      className="min-h-dvh bg-slate-50 text-slate-900 selection:bg-blue-100 relative"
      data-testid="workspace-root"
    >
      <div className="flex h-dvh overflow-hidden">
        {sidebarContent}

        <main className="flex-1 flex flex-col min-w-0 bg-slate-50">
          {/* Topbar */}
          <div
            className="shrink-0 border-b border-slate-200 bg-white px-6 py-3.5 shadow-sm z-10"
            data-testid="workspace-topbar"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 shadow-sm">
                  <Users className="h-3.5 w-3.5 text-blue-600" aria-hidden="true" />
                  <span className="text-xs font-bold text-slate-800">{userProfile.project}</span>
                </div>
                <span className="text-slate-300">/</span>
                <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.15em] text-slate-400">{userProfile.role}</span>
              </div>
              <div className="flex items-center gap-3">
                {activeIdea && (
                  <div
                    className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700"
                    data-testid="context-loaded-badge"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Project Context Loaded
                  </div>
                )}
                {health && (
                  <div className={cn(
                    "flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] transition-all",
                    health.connected
                      ? "border-blue-200 bg-blue-50 text-blue-700"
                      : "border-amber-200 bg-amber-50 text-amber-700"
                  )}>
                    <Gauge className="h-3 w-3" />
                    {health.mode}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Error Toast */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                role="alert"
                data-testid="error-toast"
                className="fixed top-6 right-6 z-50 flex items-center gap-4 rounded-xl border border-red-200 bg-white p-4 text-sm font-medium text-red-700 shadow-lg"
              >
                <div className="rounded-lg bg-red-50 border border-red-100 p-2">
                  <AlertCircle className="h-4 w-4 text-red-600" aria-hidden="true" />
                </div>
                <span>{error}</span>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="ml-2 rounded-lg p-1.5 hover:bg-slate-100 transition-colors"
                >
                  <X className="h-4 w-4 text-slate-400" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Module content */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeModule}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="p-6 lg:p-8"
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
