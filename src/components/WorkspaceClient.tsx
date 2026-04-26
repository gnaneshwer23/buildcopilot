"use client";

import React, { useEffect, useMemo, useRef, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";
import {
  Lightbulb, Target, FileText, GitBranch, Code2, ShieldCheck, BarChart3,
  Sparkles, ArrowRight, Loader2, AlertCircle, X, Search, Rocket,
  CheckCircle2, Circle, GitPullRequest, Clock, Activity, Gauge,
  AlertTriangle, TrendingUp, Trash2, Copy, Check, Users,
} from "lucide-react";
import {
  IdeaRecord, IdeaStructuringResponse, IdeaListResponse,
  ProductStrategy, RequirementsPack, BacklogPack, StoryStatus,
} from "@/lib/buildcopilot-types";
import { generateMermaidFromRequirements } from "@/lib/mermaid-generator";

export type ModuleId = "capture"|"strategy"|"draft"|"breakdown"|"build"|"verify"|"insight";

interface WorkspaceClientProps {
  userProfile: { name: string; role: string; project: string };
}

// ── Design tokens (inline for Tailwind v4 compat) ─────────────────────────────
const T = {
  pageBg:      "#F4F7FE",
  card:        "#FFFFFF",
  border:      "rgba(202,206,250,0.45)",
  primary:     "#3D76F4",
  primaryLight:"#54AEF5",
  sky:         "#98CDF9",
  lavender:    "#CACEFA",
  lavLight:    "#EEF0FD",
  text:        "#0F1433",
  muted:       "#64748B",
  shadow:      "0 4px 24px rgba(61,118,244,0.07), 0 1px 4px rgba(61,118,244,0.04)",
  shadowHover: "0 8px 40px rgba(61,118,244,0.12), 0 2px 8px rgba(61,118,244,0.06)",
} as const;

const MODULES: Array<{ id: ModuleId; label: string; icon: React.ElementType; color: string }> = [
  { id: "capture",   label: "Capture",   icon: Lightbulb,   color: "#7C3AED" },
  { id: "strategy",  label: "Strategy",  icon: Target,      color: "#3D76F4" },
  { id: "draft",     label: "Draft",     icon: FileText,    color: "#D97706" },
  { id: "breakdown", label: "Breakdown", icon: GitBranch,   color: "#EA580C" },
  { id: "build",     label: "Build",     icon: Code2,       color: "#059669" },
  { id: "verify",    label: "Verify",    icon: ShieldCheck, color: "#DC2626" },
  { id: "insight",   label: "Insight",   icon: BarChart3,   color: "#4F46E5" },
];

function cn(...cls: (string|false|null|undefined)[]) { return cls.filter(Boolean).join(" "); }

// ── Shared Components ─────────────────────────────────────────────────────────

function Card({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={cn("rounded-2xl", className)}
         style={{ background: T.card, border: `1px solid ${T.border}`, boxShadow: T.shadow, ...style }}>
      {children}
    </div>
  );
}

function GradientBtn({ onClick, loading, label = "Run AI", disabled, icon: Icon }: {
  onClick: () => void; loading: boolean; label?: string; disabled?: boolean; icon?: React.ElementType;
}) {
  const BtnIcon = Icon ?? (loading ? Loader2 : Sparkles);
  return (
    <button type="button" onClick={onClick} disabled={loading || disabled}
      data-testid="run-ai-btn"
      className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      style={{ background: "linear-gradient(135deg, #3D76F4, #54AEF5)", boxShadow: "0 4px 14px rgba(61,118,244,0.3)" }}
      onMouseEnter={e => !loading && !disabled && ((e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 20px rgba(61,118,244,0.4)")}
      onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 14px rgba(61,118,244,0.3)")}
    >
      <BtnIcon className={cn("h-4 w-4", loading && "animate-spin")} />
      {loading ? "Generating…" : label}
    </button>
  );
}

function ModuleHeader({ title, subtitle, icon: Icon, color, action }: {
  title: string; subtitle: string; icon: React.ElementType; color: string; action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-[0_4px_12px_rgba(61,118,244,0.2)]"
             style={{ background: "linear-gradient(135deg, #3D76F4, #54AEF5)" }}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: T.text }}>{title}</h1>
          <p className="text-sm mt-0.5" style={{ color: T.muted }}>{subtitle}</p>
        </div>
      </div>
      {action}
    </div>
  );
}

function EmptyState({ icon: Icon, title, body, action }: {
  icon: React.ElementType; title: string; body: string; action?: React.ReactNode;
}) {
  return (
    <Card className="flex flex-col items-center justify-center gap-5 py-20 text-center p-8">
      <div className="w-16 h-16 rounded-3xl flex items-center justify-center" style={{ background: T.lavLight }}>
        <Icon className="h-7 w-7" style={{ color: T.primary }} />
      </div>
      <div>
        <h2 className="text-lg font-bold" style={{ color: T.text }}>{title}</h2>
        <p className="mt-2 text-sm max-w-sm mx-auto leading-relaxed" style={{ color: T.muted }}>{body}</p>
      </div>
      {action}
    </Card>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, React.CSSProperties> = {
    Done:          { background: "#ECFDF5", color: "#059669", border: "1px solid #A7F3D0" },
    "In Progress": { background: "#EEF0FD", color: "#3D76F4", border: "1px solid #CACEFA" },
    "To Do":       { background: "#F4F7FE", color: "#64748B", border: "1px solid rgba(202,206,250,0.5)" },
    Validated:     { background: "#ECFDF5", color: "#059669", border: "1px solid #A7F3D0" },
    Partial:       { background: "#FFFBEB", color: "#D97706", border: "1px solid #FDE68A" },
    Gap:           { background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" },
    complete:      { background: "#ECFDF5", color: "#059669", border: "1px solid #A7F3D0" },
    partial:       { background: "#FFFBEB", color: "#D97706", border: "1px solid #FDE68A" },
    missing:       { background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" },
    High:          { background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" },
    Medium:        { background: "#FFFBEB", color: "#D97706", border: "1px solid #FDE68A" },
    Low:           { background: "#F4F7FE", color: "#64748B", border: "1px solid rgba(202,206,250,0.5)" },
    Must:          { background: "#EEF0FD", color: "#3D76F4", border: "1px solid #CACEFA" },
    Should:        { background: "#F3F0FF", color: "#7C3AED", border: "1px solid #DDD6FE" },
    Could:         { background: "#F4F7FE", color: "#64748B", border: "1px solid rgba(202,206,250,0.5)" },
  };
  const s = map[status] ?? map["To Do"];
  return (
    <span className="rounded-lg px-2.5 py-0.5 text-xs font-semibold capitalize"
          style={{ ...s }}>
      {status}
    </span>
  );
}

// ── Module Screens ────────────────────────────────────────────────────────────

function CaptureScreen({ rawIdea, setRawIdea, structuring, onStructure, activeIdea }: {
  rawIdea: string; setRawIdea: (v: string) => void;
  structuring: boolean; onStructure: () => void; activeIdea: IdeaRecord | null;
}) {
  const a = activeIdea?.analysis;
  const score = a ? Math.min(100, (a.problemStatement ? 30:0)+(a.targetUsers?.length?25:0)+(a.usp?25:0)+(a.goals?.length?20:0)) : 0;
  const circ = 2 * Math.PI * 38;

  return (
    <div>
      <ModuleHeader title="BuildCopilot Capture" subtitle="Turn raw ideas into structured product clarity." icon={Lightbulb} color="#7C3AED"
        action={<GradientBtn onClick={onStructure} loading={structuring} label="Generate Structure" disabled={!rawIdea.trim()} />} />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-2 p-6">
          <label htmlFor="capture-idea" className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: T.muted, fontFamily: "var(--font-mono)" }}>
            Write your idea
          </label>
          <textarea id="capture-idea" value={rawIdea} onChange={(e) => setRawIdea(e.target.value)}
            placeholder="Describe your project, the problem it solves, and who it's for…"
            data-testid="capture-idea-textarea"
            className="mt-3 h-44 w-full resize-none rounded-xl px-4 py-3.5 text-sm outline-none leading-relaxed transition-all"
            style={{ color: T.text, background: T.pageBg, border: `1px solid ${T.border}` }}
            onFocus={e => { e.target.style.borderColor = T.primary; e.target.style.boxShadow = "0 0 0 3px rgba(61,118,244,0.1)"; }}
            onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = "none"; }}
          />
          <p className="mt-2 text-xs" style={{ color: "#94A3B8" }}>Be specific about the problem, target users, and value.</p>
        </Card>
        <Card className="p-6 flex flex-col justify-between">
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] mb-4" style={{ color: T.muted, fontFamily: "var(--font-mono)" }}>AI Clarity Score</h2>
          <div className="flex items-center gap-5 my-2">
            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center" role="img" aria-label={`Clarity ${score}%`}>
              <svg className="w-full h-full -rotate-90">
                <circle cx="48" cy="48" r="38" stroke={T.lavLight} strokeWidth="8" fill="transparent"/>
                <circle cx="48" cy="48" r="38" strokeWidth="8" fill="transparent"
                  style={{ stroke: "url(#scoreGrad)" }}
                  strokeDasharray={circ} strokeDashoffset={circ*(1-score/100)} strokeLinecap="round"/>
                <defs>
                  <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3D76F4"/><stop offset="100%" stopColor="#54AEF5"/>
                  </linearGradient>
                </defs>
              </svg>
              <span className="absolute text-xl font-bold font-mono" style={{ color: T.text }}>{score}%</span>
            </div>
            <ul className="space-y-2.5 text-xs" style={{ color: T.muted }}>
              {[["Problem", a?.problemStatement],["Target users",a?.targetUsers?.length],["Unique value",a?.usp],["Goals",a?.goals?.length]].map(([l, v]) => (
                <li key={l as string} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: v ? "#3D76F4" : T.lavLight, border: `1px solid ${v ? "#3D76F4" : T.lavender}` }}/>
                  {l}
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>
      {a && (
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {([["Problem",a.problemStatement],["Target Users",a.targetUsers.join(", ")],["Goals",a.goals[0]??"—"],["USP",a.usp]] as [string,string][]).map(([title,text]) => (
            <Card key={title} className="p-5" style={{ transition: "all 0.2s" }}>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] mb-2" style={{ color: T.lavender, fontFamily: "var(--font-mono)" }}>{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: T.text }}>{text}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function StrategyScreen({ activeIdea, generating, onRun }: { activeIdea: IdeaRecord|null; generating: boolean; onRun: () => void }) {
  if (!activeIdea) return <div><ModuleHeader title="BuildCopilot Strategy" subtitle="Define vision, positioning and roadmap." icon={Target} color="#3D76F4"/>
    <EmptyState icon={Target} title="Capture an idea first" body="Structure your idea in Capture to unlock strategy generation."/></div>;
  const strategy: ProductStrategy|undefined = activeIdea.strategy;
  return (
    <div>
      <ModuleHeader title="BuildCopilot Strategy" subtitle="Define vision, positioning and roadmap." icon={Target} color="#3D76F4"
        action={<GradientBtn onClick={onRun} loading={generating} label={strategy?"Regenerate":"Generate Strategy"}/>}/>
      {!strategy ? <EmptyState icon={Target} title="Generate Product Strategy"
        body="AI will prioritise features, build a Now-Next-Later roadmap, and define success metrics."
        action={<GradientBtn onClick={onRun} loading={generating} label="Generate Strategy & Roadmap"/>}/> : (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            <Card className="xl:col-span-2 p-6">
              <h2 className="text-sm font-bold mb-3" style={{ color: T.text }}>Product Vision</h2>
              <p className="text-sm leading-relaxed rounded-xl p-4" style={{ color: T.muted, background: T.pageBg, border: `1px solid ${T.border}` }}>{strategy.vision}</p>
              <div className="mt-5 grid grid-cols-2 gap-4">
                {[["Market Position",strategy.marketPosition],["Business Model",strategy.businessModel]].map(([k,v]) => (
                  <div key={k as string}>
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.16em] mb-1.5" style={{ color: T.lavender, fontFamily: "var(--font-mono)" }}>{k}</h3>
                    <p className="text-sm" style={{ color: T.muted }}>{v}</p>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-6">
              <h2 className="text-sm font-bold mb-4" style={{ color: T.text }}>Success Metrics</h2>
              <ul className="space-y-2.5">
                {strategy.successMetrics.map((m,i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: T.muted }}>
                    <TrendingUp className="h-4 w-4 shrink-0 mt-0.5" style={{ color: T.primary }} />{m}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {(["now","next","later"] as const).map((phase) => {
              const cfg = { now:{dot:"#059669",bg:"#ECFDF5",border:"#A7F3D0",text:"#059669",label:"Now (MVP)"},
                next:{dot:"#3D76F4",bg:"#EEF0FD",border:"#CACEFA",text:"#3D76F4",label:"Next (Scale)"},
                later:{dot:"#7C3AED",bg:"#F3F0FF",border:"#DDD6FE",text:"#7C3AED",label:"Later (Vision)"}}[phase];
              return (
                <Card key={phase} className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-2 h-2 rounded-full" style={{ background: cfg.dot }}/>
                    <h3 className="text-sm font-bold" style={{ color: T.text }}>{cfg.label}</h3>
                  </div>
                  <div className="space-y-2">
                    {strategy.roadmapNowNextLater[phase].map((item,i) => (
                      <div key={i} className="rounded-xl px-3 py-2 text-sm font-medium"
                           style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.text }}>{item}</div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
          {strategy.prioritization.length > 0 && (
            <Card className="overflow-hidden p-0">
              <div className="p-5" style={{ borderBottom: `1px solid ${T.border}` }}>
                <h2 className="text-sm font-bold" style={{ color: T.text }}>Feature Prioritization</h2>
              </div>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr style={{ background: T.pageBg }}>
                    {["Feature","Method","Rationale"].map(h => (
                      <th key={h} className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted, fontFamily: "var(--font-mono)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {strategy.prioritization.map((p,i) => (
                    <tr key={i} style={{ borderTop: `1px solid ${T.border}` }}
                        onMouseEnter={e => (e.currentTarget.style.background=T.pageBg)}
                        onMouseLeave={e => (e.currentTarget.style.background="transparent")}>
                      <td className="px-5 py-3 font-semibold" style={{ color: T.text }}>{p.item}</td>
                      <td className="px-5 py-3"><span className="rounded-lg px-2.5 py-0.5 text-xs font-semibold" style={{ background: T.lavLight, color: T.primary, border: `1px solid ${T.lavender}` }}>{p.method}</span></td>
                      <td className="px-5 py-3" style={{ color: T.muted }}>{p.rationale}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function DraftScreen({ activeIdea, generating, onRun }: { activeIdea: IdeaRecord|null; generating: boolean; onRun: () => void }) {
  const [tab, setTab] = useState<"prd"|"brd"|"frd">("prd");
  const [copied, setCopied] = useState(false);

  function buildMd(req: RequirementsPack) {
    if (tab==="prd") return `# ${req.prd.title}\n\n## Objectives\n${req.prd.objectives.map(o=>`- ${o}`).join("\n")}\n\n## Features\n${req.prd.features.map(f=>`- ${f}`).join("\n")}`;
    if (tab==="brd") return `# BRD\n\n## Business Case\n${req.brd.businessCase}\n\n## Stakeholders\n${req.brd.stakeholders.map(s=>`- ${s}`).join("\n")}`;
    return `# FRD\n\n| ID | Requirement | Priority |\n|---|---|---|\n${req.frd.functionalRequirements.map(r=>`| ${r.id} | ${r.text} | ${r.priority} |`).join("\n")}`;
  }

  if (!activeIdea) return <div><ModuleHeader title="BuildCopilot Draft" subtitle="Create PRDs, BRDs and FRDs." icon={FileText} color="#D97706"/>
    <EmptyState icon={FileText} title="Capture an idea first" body="Structure your idea in Capture before generating requirements."/></div>;
  const req: RequirementsPack|undefined = activeIdea.requirements;
  return (
    <div>
      <ModuleHeader title="BuildCopilot Draft" subtitle="Create PRDs, BRDs and FRDs." icon={FileText} color="#D97706"
        action={<GradientBtn onClick={onRun} loading={generating} label={req?"Regenerate":"Generate Requirements"}/>}/>
      {!req ? <EmptyState icon={FileText} title="Generate Requirements" body="AI will create a full PRD, BRD and FRD with functional requirements, personas, features, and dependencies."
        action={<GradientBtn onClick={onRun} loading={generating} label="Generate PRD, BRD & FRD"/>}/> : (
        <Card className="overflow-hidden p-0">
          <div className="px-6 py-4 flex items-center justify-between gap-4 flex-wrap" style={{ borderBottom: `1px solid ${T.border}`, background: T.pageBg }}>
            <div>
              <h2 className="text-base font-bold" style={{ color: T.text }}>{req.prd.title}</h2>
              <p className="text-xs mt-0.5" style={{ color: T.muted }}>Generated · {new Date(req.generatedAt).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => { void navigator.clipboard.writeText(buildMd(req)).then(() => { setCopied(true); setTimeout(()=>setCopied(false),2000); }); }}
                data-testid="copy-md-btn"
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all"
                style={{ background: T.card, border: `1px solid ${T.border}`, color: T.muted }}>
                {copied ? <Check className="h-3.5 w-3.5" style={{ color: "#059669" }}/> : <Copy className="h-3.5 w-3.5"/>}
                {copied ? "Copied!" : "Copy MD"}
              </button>
              <div className="flex gap-1 rounded-xl p-1" style={{ background: T.pageBg, border: `1px solid ${T.border}` }} data-testid="draft-tabs">
                {(["prd","brd","frd"] as const).map(t => (
                  <button key={t} type="button" onClick={() => setTab(t)} data-testid={`tab-${t}`}
                    className="rounded-lg px-4 py-1.5 text-xs font-bold uppercase tracking-[0.1em] transition-all"
                    style={{ background: tab===t ? "linear-gradient(135deg,#3D76F4,#54AEF5)" : "transparent",
                             color: tab===t ? "white" : T.muted, boxShadow: tab===t ? "0 2px 8px rgba(61,118,244,0.25)" : "none" }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="p-6">
            {tab==="prd" && (
              <div className="space-y-3">
                {[["Objectives",req.prd.objectives.join(" • ")],["Personas",req.prd.personas.join(", ")],["Features",req.prd.features.join(" • ")],["Dependencies",req.prd.dependencies.join(", ")],["Release Plan",req.prd.releasePlan.join(" → ")]].map(([k,v]) => (
                  <div key={k as string} className="rounded-xl p-4" style={{ background: T.pageBg, border: `1px solid ${T.border}` }}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.lavender, fontFamily: "var(--font-mono)" }}>{k}</h3>
                      <button type="button" className="text-xs font-semibold transition-colors" style={{ color: T.primary }}>Improve with AI</button>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: T.text }}>{v}</p>
                  </div>
                ))}
              </div>
            )}
            {tab==="brd" && (
              <div className="space-y-3">
                {[["Business Case",req.brd.businessCase],["Stakeholders",req.brd.stakeholders.join(", ")],["Assumptions",req.brd.assumptions.join(" • ")],["Constraints",req.brd.constraints.join(" • ")],["Benefits",req.brd.benefits.join(" • ")]].map(([k,v]) => (
                  <div key={k as string} className="rounded-xl p-4" style={{ background: T.pageBg, border: `1px solid ${T.border}` }}>
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.16em] mb-2" style={{ color: T.lavender, fontFamily: "var(--font-mono)" }}>{k}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: T.text }}>{v}</p>
                  </div>
                ))}
              </div>
            )}
            {tab==="frd" && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.16em] mb-3" style={{ color: T.lavender, fontFamily: "var(--font-mono)" }}>Functional Requirements</h3>
                  <div className="overflow-hidden rounded-2xl" style={{ border: `1px solid ${T.border}` }}>
                    <table className="w-full text-left text-sm">
                      <thead style={{ background: T.pageBg }}>
                        <tr>{["ID","Requirement","Priority"].map(h=><th key={h} className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted, fontFamily: "var(--font-mono)" }}>{h}</th>)}</tr>
                      </thead>
                      <tbody>
                        {req.frd.functionalRequirements.map((fr) => (
                          <tr key={fr.id} style={{ borderTop: `1px solid ${T.border}` }}>
                            <td className="px-5 py-3 font-mono text-xs font-semibold" style={{ color: T.primary }}>{fr.id}</td>
                            <td className="px-5 py-3" style={{ color: T.text }}>{fr.text}</td>
                            <td className="px-5 py-3"><StatusPill status={fr.priority}/></td>
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

function BreakdownScreen({ activeIdea, generating, onRun, onStoryStatusChange }: {
  activeIdea: IdeaRecord|null; generating: boolean; onRun: () => void; onStoryStatusChange: (id: string, s: StoryStatus) => void;
}) {
  const [selEpicId, setSelEpicId] = useState<string|null>(null);
  const backlog: BacklogPack|undefined = activeIdea?.backlog;
  const allStories = backlog?.epics.flatMap(e=>e.stories)??[];
  const selEpic = backlog?.epics.find(e=>e.id===selEpicId)??backlog?.epics[0];
  if (!activeIdea) return <div><ModuleHeader title="BuildCopilot Breakdown" subtitle="Convert PRD into epics and user stories." icon={GitBranch} color="#EA580C"/>
    <EmptyState icon={GitBranch} title="Capture an idea first" body="Structure your idea in Capture to unlock backlog generation."/></div>;
  if (!activeIdea.requirements) return <div><ModuleHeader title="BuildCopilot Breakdown" subtitle="Convert PRD into epics and user stories." icon={GitBranch} color="#EA580C"/>
    <EmptyState icon={FileText} title="Requirements needed" body="Generate PRD, BRD & FRD in the Draft module first."/></div>;
  return (
    <div>
      <ModuleHeader title="BuildCopilot Breakdown" subtitle="Convert PRD into epics and user stories." icon={GitBranch} color="#EA580C"
        action={<GradientBtn onClick={onRun} loading={generating} label={backlog?"Regenerate":"Generate Stories"}/>}/>
      {!backlog ? <EmptyState icon={GitBranch} title="Generate Backlog" body="AI will derive user stories and epics from your functional requirements."
        action={<GradientBtn onClick={onRun} loading={generating} label="Generate Backlog"/>}/> : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-4">
          <Card className="p-5">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.18em] mb-4" style={{ color: T.muted, fontFamily: "var(--font-mono)" }}>Epic Tree ({backlog.epics.length})</h2>
            <div className="space-y-2">
              {backlog.epics.map(epic => (
                <button key={epic.id} type="button" onClick={() => setSelEpicId(epic.id)}
                  className="w-full rounded-xl p-3 text-left transition-all"
                  style={{
                    border: selEpic?.id===epic.id ? `1.5px solid ${T.primary}` : `1px solid ${T.border}`,
                    background: selEpic?.id===epic.id ? T.lavLight : T.card,
                    boxShadow: selEpic?.id===epic.id ? "0 4px 14px rgba(61,118,244,0.12)" : "none",
                  }}>
                  <GitBranch className="h-4 w-4 mb-2" style={{ color: selEpic?.id===epic.id ? T.primary : T.muted }}/>
                  <p className="text-xs font-semibold" style={{ color: selEpic?.id===epic.id ? T.primary : T.text }}>{epic.title}</p>
                  <p className="mt-1 text-[10px]" style={{ color: T.muted }}>{epic.stories.length} stories</p>
                </button>
              ))}
            </div>
            <div className="mt-4 pt-3" style={{ borderTop: `1px solid ${T.border}` }}>
              <p className="text-xs" style={{ color: T.muted }}>{allStories.length} total stories</p>
            </div>
          </Card>
          <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            {(["todo","in_progress","done"] as const).map(col => {
              const label = col==="todo"?"To Do":col==="in_progress"?"In Progress":"Done";
              const next: StoryStatus = col==="todo"?"in_progress":col==="in_progress"?"done":"todo";
              const colStories = (selEpic?.stories??allStories).filter(s=>(s.status??"todo")===col);
              const colStyle = {todo:{bg:"#F4F7FE",text:"#64748B"},in_progress:{bg:T.lavLight,text:T.primary},done:{bg:"#ECFDF5",text:"#059669"}}[col];
              return (
                <div key={col}>
                  <div className="mb-3 flex items-center justify-between rounded-xl px-3 py-2" style={{ background: colStyle.bg }}>
                    <h3 className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: colStyle.text }}>{label}</h3>
                    <span className="text-xs font-bold" style={{ color: colStyle.text }}>{colStories.length}</span>
                  </div>
                  <div className="space-y-3 rounded-2xl p-3 min-h-48" style={{ background: T.pageBg, border: `1px solid ${T.border}` }}>
                    {colStories.map(story => (
                      <div key={story.id} className="rounded-xl p-4 transition-all"
                           style={{ background: T.card, border: `1px solid ${T.border}`, boxShadow: T.shadow }}>
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-[10px] font-mono font-semibold" style={{ color: T.lavender }}>{story.id}</span>
                          <button type="button" onClick={() => onStoryStatusChange(story.id, next)}
                            className="rounded-lg px-2 py-0.5 text-[10px] font-semibold transition-all"
                            style={{ background: T.lavLight, color: T.primary, border: `1px solid ${T.lavender}` }}>
                            → {next==="in_progress"?"In Progress":next==="done"?"Done":"To Do"}
                          </button>
                        </div>
                        <h4 className="text-sm font-semibold leading-snug" style={{ color: T.text }}>{story.title}</h4>
                        <p className="mt-2 text-[10px]" style={{ color: T.muted }}>As a <span className="font-semibold">{story.asA}</span></p>
                        <div className="mt-4 flex items-center justify-between pt-3" style={{ borderTop: `1px solid ${T.border}` }}>
                          <StatusPill status={label}/><span className="text-[10px]" style={{ color: T.muted }}>{story.acceptanceCriteria.length} AC</span>
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

function BuildScreen({ activeIdea, onStoryStatusChange }: { activeIdea: IdeaRecord|null; onStoryStatusChange: (id: string, s: StoryStatus) => void }) {
  const stories = activeIdea?.backlog?.epics.flatMap(e=>e.stories)??[];
  const done = stories.filter(s=>s.status==="done").length;
  const inp = stories.filter(s=>s.status==="in_progress").length;
  const pct = stories.length ? Math.round(((done+inp*0.5)/stories.length)*100) : 0;
  return (
    <div>
      <ModuleHeader title="BuildCopilot Build" subtitle="Track sprint execution, tasks, PRs and commits." icon={Code2} color="#059669"/>
      {!activeIdea?.backlog ? <EmptyState icon={Code2} title="Generate backlog first" body="The Build module derives sprint tasks from your backlog."/> : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <Card className="xl:col-span-2 p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold" style={{ color: T.text }}>Sprint 1 — Core Pipeline</h2>
                <p className="mt-0.5 text-xs" style={{ color: T.muted }}>Goal: idea-to-PRD workflow</p>
              </div>
              <StatusPill status="In Progress"/>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: T.lavLight }} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full rounded-full gradient-primary transition-all" style={{ width: `${pct}%` }}/>
            </div>
            <p className="mt-2 text-xs font-mono" style={{ color: T.muted }}>{pct}% · {done} done · {inp} in progress</p>
            <div className="mt-6 space-y-2.5">
              {stories.slice(0,6).map((story,i) => {
                const s = story.status??"todo";
                const slabel = s==="done"?"Done":s==="in_progress"?"In Progress":"To Do";
                const next: StoryStatus = s==="todo"?"in_progress":s==="in_progress"?"done":"todo";
                return (
                  <div key={story.id} className="flex items-center justify-between rounded-xl p-4 transition-all"
                       style={{ background: T.pageBg, border: `1px solid ${T.border}` }}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono shrink-0" style={{ color: T.lavender }}>{story.id}</span>
                        <StatusPill status={slabel}/>
                      </div>
                      <h3 className="text-sm font-semibold truncate" style={{ color: T.text }}>{story.title}</h3>
                      <p className="mt-0.5 text-[10px]" style={{ color: T.muted }}>As a {story.asA}</p>
                    </div>
                    <div className="ml-4 flex items-center gap-3 shrink-0">
                      <button type="button" onClick={() => onStoryStatusChange(story.id,next)}
                        className="rounded-lg px-2 py-1 text-[10px] font-semibold transition-all"
                        style={{ background: T.lavLight, color: T.primary, border: `1px solid ${T.lavender}` }}>
                        → {next==="in_progress"?"In Progress":next==="done"?"Done":"To Do"}
                      </button>
                      <div className="text-right text-xs" style={{ color: T.muted }}>
                        <div className="flex items-center gap-1.5 justify-end"><GitPullRequest className="h-3.5 w-3.5"/>PR #{i+14}</div>
                        <div className="mt-1 font-mono text-[10px]">{s==="done"?`feat/${story.id.toLowerCase()}`:"—"}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
          <div className="space-y-5">
            <Card className="p-6">
              <h2 className="text-sm font-bold mb-4" style={{ color: T.text }}>Sprint Health</h2>
              <div className="space-y-2.5">
                {([[CheckCircle2,`${done} stories done`,"#059669"],[Activity,`${inp} in progress`,T.primary],[Clock,`${stories.length-done-inp} to do`,"#D97706"],[AlertTriangle,"0 blockers","#94A3B8"]] as [React.ElementType,string,string][]).map(([Icon,text,c]) => (
                  <div key={text} className="flex items-center gap-3 rounded-xl p-3" style={{ background: T.pageBg, border: `1px solid ${T.border}` }}>
                    <Icon className="h-4 w-4" style={{ color: c }}/><span className="text-sm" style={{ color: T.text }}>{text}</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-6">
              <h2 className="text-sm font-bold mb-4" style={{ color: T.text }}>Velocity</h2>
              <div className="flex h-28 items-end gap-2">
                {[0.4,0.55,0.65,0.5,0.75,0.8,pct/100].map((h,i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1">
                    <div className="w-full rounded-t overflow-hidden" style={{ height: `${h*100}%`, background: T.lavLight }}>
                      <div className="w-full h-full rounded-t gradient-primary opacity-80"/>
                    </div>
                    <span className="text-[9px] font-mono" style={{ color: T.muted }}>W{i+1}</span>
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

function VerifyScreen({ activeIdea }: { activeIdea: IdeaRecord|null }) {
  const rows = useMemo(() => {
    if (!activeIdea?.requirements || !activeIdea.backlog) return [];
    const frs = activeIdea.requirements.frd.functionalRequirements;
    const stories = activeIdea.backlog.epics.flatMap(e=>e.stories.map(s=>({...s,epicTitle:e.title})));
    return frs.map((fr,i) => {
      const story = stories[i];
      const hasStory = !!story, hasCommit = i<Math.floor(frs.length*0.6), hasTest = i<Math.floor(frs.length*0.45);
      const status = !hasStory?"missing":!hasCommit?"partial":!hasTest?"partial":"complete";
      return { id:fr.id, req:fr.text.slice(0,55)+(fr.text.length>55?"…":""), epic:story?.epicTitle??"—", story:story?.id??"—",
               commit:hasCommit?`feat/${story?.id.toLowerCase().replace("-","/")}`:null, test:hasTest?`${story?.id.toLowerCase()}.spec.ts`:null, status };
    });
  }, [activeIdea]);
  const cov = rows.length ? Math.round((rows.filter(r=>r.status==="complete").length/rows.length)*100) : 0;
  return (
    <div>
      <ModuleHeader title="BuildCopilot Verify" subtitle="Validate that what was built matches what was planned." icon={ShieldCheck} color="#DC2626"
        action={
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted, fontFamily: "var(--font-mono)" }}>Coverage</p>
              <p className="text-2xl font-bold font-mono gradient-text">{cov}%</p>
            </div>
            <button type="button" className="rounded-xl px-4 py-2.5 text-xs font-semibold transition-all"
              style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}>Run Gap Scan</button>
          </div>
        }/>
      {rows.length===0 ? <EmptyState icon={ShieldCheck} title="Requirements & backlog needed" body="Complete Draft and Breakdown modules to generate the traceability matrix."/> : (
        <div className="space-y-5">
          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead style={{ background: T.pageBg }}>
                  <tr>{["Requirement","Epic","Story","Commit","Test","Status"].map(h=><th key={h} className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.muted, fontFamily: "var(--font-mono)" }}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {rows.map((row,idx) => (
                    <tr key={row.id} style={{ borderTop: `1px solid ${T.border}`, background: idx%2===0?"transparent":T.pageBg }}>
                      <td className="px-5 py-3">
                        <span className="font-mono text-[10px] font-semibold" style={{ color: T.primary }}>{row.id}</span>
                        <p className="text-xs mt-0.5" style={{ color: T.muted }}>{row.req}</p>
                      </td>
                      <td className="px-5 py-3 text-xs" style={{ color: T.muted }}>{row.epic}</td>
                      <td className="px-5 py-3 text-xs font-mono" style={{ color: T.muted }}>{row.story}</td>
                      <td className="px-5 py-3">
                        {row.commit ? <span className="rounded-lg px-2 py-0.5 font-mono text-[10px] font-semibold" style={{ background: T.lavLight, color: T.primary, border: `1px solid ${T.lavender}` }}>{row.commit}</span>
                          : <span className="rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase" style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}>Missing</span>}
                      </td>
                      <td className="px-5 py-3">
                        {row.test ? <span className="rounded-lg px-2 py-0.5 font-mono text-[10px] font-semibold" style={{ background: "#ECFDF5", color: "#059669", border: "1px solid #A7F3D0" }}>{row.test}</span>
                          : <span className="rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase" style={{ background: "#FFFBEB", color: "#D97706", border: "1px solid #FDE68A" }}>No Test</span>}
                      </td>
                      <td className="px-5 py-3"><StatusPill status={row.status}/></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              {icon:ShieldCheck,label:"Coverage",value:`${cov}%`,note:"requirements traced",bg:"#EEF0FD",c:T.primary},
              {icon:AlertTriangle,label:"Gaps",value:`${rows.filter(r=>r.status==="missing").length}`,note:"missing artifacts",bg:"#FEF2F2",c:"#DC2626"},
              {icon:CheckCircle2,label:"Validated",value:`${rows.filter(r=>r.status==="complete").length}`,note:"fully traced",bg:"#ECFDF5",c:"#059669"},
            ].map(s=>(
              <Card key={s.label} className="p-6" style={{ background: s.bg }}>
                <s.icon className="h-5 w-5 mb-4" style={{ color: s.c }}/>
                <div className="text-3xl font-bold font-mono" style={{ color: s.c }}>{s.value}</div>
                <div className="mt-1 text-sm font-bold" style={{ color: T.text }}>{s.label}</div>
                <p className="mt-1 text-xs" style={{ color: T.muted }}>{s.note}</p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

declare global { interface Window { mermaid?: { initialize: (c: object) => void; contentLoaded: () => void } } }

function InsightScreen({ activeIdea }: { activeIdea: IdeaRecord|null }) {
  const mermaidRef = useRef<HTMLDivElement>(null);
  const mermaidCode = useMemo(() => activeIdea?.requirements ? generateMermaidFromRequirements(activeIdea.requirements) :
    `flowchart TD\n  A[Idea] --> B[Strategy]\n  B --> C[Draft]\n  C --> D[Breakdown]\n  D --> E[Build]\n  E --> F[Verify]\n  F --> G[Insight]`, [activeIdea]);
  useEffect(() => { if (typeof window!=="undefined"&&window.mermaid) window.mermaid.initialize({startOnLoad:true,theme:"default",securityLevel:"loose"}); }, []);
  useEffect(() => { if (mermaidRef.current&&typeof window!=="undefined"&&window.mermaid) { mermaidRef.current.removeAttribute("data-processed"); window.mermaid.contentLoaded(); } }, [mermaidCode]);
  const done = [!!activeIdea,!!activeIdea?.strategy,!!activeIdea?.requirements,!!activeIdea?.backlog].filter(Boolean).length;
  const score = Math.round((done/4)*100);
  const kpis = [
    {icon:Gauge,label:"Product Completeness",value:`${score}%`,note:`${done}/4 phases done`,bg:T.lavLight,c:T.primary},
    {icon:Activity,label:"Delivery Progress",value:score>75?"On Track":"In Progress",note:"Sprint 1",bg:"#ECFDF5",c:"#059669"},
    {icon:ShieldCheck,label:"Backlog Health",value:activeIdea?.backlog?`${activeIdea.backlog.epics.length} epics`:"—",note:"stories generated",bg:"#F3F0FF",c:"#7C3AED"},
    {icon:AlertTriangle,label:"Risk Level",value:score>50?"Low":"Medium",note:"automated scan",bg:"#FFFBEB",c:"#D97706"},
  ];
  return (
    <div>
      <ModuleHeader title="BuildCopilot Insight" subtitle="Dashboards, delivery health, and architecture diagrams." icon={BarChart3} color="#4F46E5"/>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 mb-5">
        {kpis.map(k=>(
          <Card key={k.label} className="p-6" style={{ background: k.bg }}>
            <k.icon className="h-5 w-5 mb-4" style={{ color: k.c }}/>
            <div className="text-3xl font-bold font-mono" style={{ color: k.c }}>{k.value}</div>
            <div className="mt-1 text-sm font-bold" style={{ color: T.text }}>{k.label}</div>
            <p className="mt-1 text-xs" style={{ color: T.muted }}>{k.note}</p>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-sm font-bold mb-5" style={{ color: T.text }}>Architecture Diagram</h2>
          <div className="rounded-2xl p-6 overflow-x-auto flex justify-center" style={{ background: T.pageBg, border: `1px solid ${T.border}` }}>
            <div ref={mermaidRef} className="mermaid text-sm">{mermaidCode}</div>
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="text-sm font-bold mb-5" style={{ color: T.text }}>AI Progress Summary</h2>
          <div className="space-y-3">
            {[
              `Idea captured: ${activeIdea?"structured":"pending"}`,
              `Strategy: ${activeIdea?.strategy?"generated":"not generated yet"}`,
              `Requirements: ${activeIdea?.requirements?`PRD/BRD/FRD ready (${activeIdea.requirements.frd.functionalRequirements.length} FRs)`:"pending"}`,
              `Backlog: ${activeIdea?.backlog?`${activeIdea.backlog.epics.reduce((a,e)=>a+e.stories.length,0)} stories across ${activeIdea.backlog.epics.length} epics`:"pending"}`,
            ].map(item=>(
              <div key={item} className="flex items-start gap-3 rounded-xl p-4 text-sm leading-relaxed" style={{ background: T.pageBg, border: `1px solid ${T.border}`, color: T.muted }}>
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0" style={{ color: T.primary }}/>{item}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── AI Assistant ──────────────────────────────────────────────────────────────
const AI_HINTS: Record<ModuleId, string[]> = {
  capture:   ["Clarify target user segments","Add a measurable success goal","Convert the idea into a problem statement"],
  strategy:  ["Prioritise Verify module as USP","Add a buyer persona","Convert roadmap into MVP phases"],
  draft:     ["Add non-functional requirements","Define measurable KPIs","Highlight assumptions"],
  breakdown: ["Split large stories into smaller ones","Add missing acceptance criteria","Estimate story complexity"],
  build:     ["Link stories to commits","Sprint risk is increasing","Assign QA owner"],
  verify:    ["One story has missing code and test","Validation coverage below 80%","Create gap ticket"],
  insight:   ["Prepare stakeholder summary","Explain risk trend","Recommend next sprint focus"],
};

function AIPanel({ mod }: { mod: ModuleId }) {
  return (
    <aside className="hidden w-64 shrink-0 xl:flex xl:flex-col p-5"
           style={{ borderLeft: `1px solid ${T.border}`, background: T.pageBg }}
           aria-label="AI Assistant" data-testid="ai-assistant-panel">
      <div className="mb-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-[0_4px_12px_rgba(61,118,244,0.2)]"
             style={{ background: "linear-gradient(135deg,#3D76F4,#54AEF5)" }}>
          <Sparkles className="h-4 w-4 text-white"/>
        </div>
        <div>
          <h2 className="text-sm font-bold" style={{ color: T.text }}>AI Assistant</h2>
          <p className="text-xs" style={{ color: T.muted }}>Context-aware</p>
        </div>
      </div>
      <ul className="space-y-2.5">
        {AI_HINTS[mod].map(h=>(
          <li key={h} className="rounded-xl p-3.5 text-xs leading-relaxed" style={{ background: T.card, border: `1px solid ${T.border}`, color: T.muted, boxShadow: T.shadow }}>{h}</li>
        ))}
      </ul>
      <div className="mt-5 rounded-2xl p-4" style={{ background: T.lavLight, border: `1px solid ${T.lavender}` }}>
        <h3 className="text-xs font-bold mb-3" style={{ color: T.primary }}>Quick Actions</h3>
        <div className="space-y-1.5">
          {["Generate stories","Summarise sprint","Detect blockers","Run validation"].map(a=>(
            <button key={a} type="button" className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all"
              style={{ background: T.card, border: `1px solid ${T.border}`, color: T.text }}
              onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.background=T.pageBg;}}
              onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.background=T.card;}}>
              {a}<ArrowRight className="h-3.5 w-3.5" style={{ color: T.muted }}/>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export function WorkspaceClient({ userProfile }: WorkspaceClientProps) {
  const [activeModule, setActiveModule] = useState<ModuleId>("capture");
  const [rawIdea, setRawIdea] = useState("");
  const [savedIdeas, setSavedIdeas] = useState<IdeaRecord[]>([]);
  const [activeIdeaId, setActiveIdeaId] = useState<string|null>(null);
  const [structureResponse, setStructureResponse] = useState<IdeaStructuringResponse|null>(null);
  const [structuring, setStructuring] = useState(false);
  const [genStrategy, setGenStrategy] = useState(false);
  const [genReqs, setGenReqs] = useState(false);
  const [genBacklog, setGenBacklog] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [health, setHealth] = useState<{mode:string;connected:boolean}|null>(null);

  const activeIdea = useMemo<IdeaRecord|null>(() => {
    if (!savedIdeas.length) return null;
    if (activeIdeaId) { const p = savedIdeas.find(i=>i.ideaId===activeIdeaId); if (p) return p; }
    if (structureResponse?.ideaId) { const m = savedIdeas.find(i=>i.ideaId===structureResponse.ideaId); if (m) return m; }
    return [...savedIdeas].sort((a,b)=>new Date(b.generatedAt).getTime()-new Date(a.generatedAt).getTime())[0];
  }, [savedIdeas, activeIdeaId, structureResponse?.ideaId]);

  const refresh = useCallback(async () => {
    try { const r = await fetch("/api/ideas",{cache:"no-store"}); if(r.ok) setSavedIdeas(((await r.json()) as IdeaListResponse).items); } catch{}
  }, []);

  useEffect(() => {
    void refresh();
    void (async()=>{try{const r=await fetch("/api/health/persistence");if(r.ok)setHealth(await r.json());}catch{}})();
  }, [refresh]);

  const runStructure = useCallback(async () => {
    if (!rawIdea.trim()) return; setStructuring(true); setError(null);
    try {
      const r = await fetch("/api/ideas/structure",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({rawIdea,clarifications:[]})});
      if(!r.ok) throw new Error(`Structure failed (${r.status})`);
      const d = (await r.json()) as IdeaStructuringResponse; setStructureResponse(d); setActiveIdeaId(d.ideaId);
      await refresh(); setTimeout(()=>setActiveModule("strategy"),1200);
    } catch(e){ setError(e instanceof Error?e.message:"Failed to structure idea."); } finally{ setStructuring(false); }
  }, [rawIdea, refresh]);

  const runStrategy = useCallback(async () => {
    if (!activeIdea) return; setGenStrategy(true); setError(null);
    try { const r=await fetch(`/api/ideas/${activeIdea.ideaId}/strategy`,{method:"POST"}); if(!r.ok) throw new Error(`Strategy failed (${r.status})`); await refresh(); }
    catch(e){ setError(e instanceof Error?e.message:"Failed to generate strategy."); } finally{ setGenStrategy(false); }
  }, [activeIdea, refresh]);

  const runReqs = useCallback(async () => {
    if (!activeIdea) return; setGenReqs(true); setError(null);
    try { const r=await fetch(`/api/ideas/${activeIdea.ideaId}/requirements`,{method:"POST"}); if(!r.ok) throw new Error(`Requirements failed (${r.status})`); await refresh(); }
    catch(e){ setError(e instanceof Error?e.message:"Failed to generate requirements."); } finally{ setGenReqs(false); }
  }, [activeIdea, refresh]);

  const runBacklog = useCallback(async () => {
    if (!activeIdea) return; setGenBacklog(true); setError(null);
    try { const r=await fetch(`/api/ideas/${activeIdea.ideaId}/backlog`,{method:"POST"}); if(!r.ok) throw new Error(`Backlog failed (${r.status})`); await refresh(); }
    catch(e){ setError(e instanceof Error?e.message:"Failed to generate backlog."); } finally{ setGenBacklog(false); }
  }, [activeIdea, refresh]);

  const runDelete = useCallback(async (id: string) => {
    setSavedIdeas(p=>p.filter(i=>i.ideaId!==id));
    if (activeIdea?.ideaId===id) { setActiveIdeaId(null); setStructureResponse(null); }
    try { await fetch(`/api/ideas/${id}`,{method:"DELETE"}); } catch { await refresh(); }
  }, [activeIdea?.ideaId, refresh]);

  const runStoryStatus = useCallback(async (storyId: string, status: StoryStatus) => {
    if (!activeIdea) return;
    setSavedIdeas(prev=>prev.map(idea=>idea.ideaId!==activeIdea.ideaId?idea:{...idea,backlog:idea.backlog?{...idea.backlog,epics:idea.backlog.epics.map(e=>({...e,stories:e.stories.map(s=>s.id===storyId?{...s,status}:s)}))}:idea.backlog}));
    try { const r=await fetch(`/api/ideas/${activeIdea.ideaId}/backlog/stories/${storyId}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status})}); if(!r.ok) await refresh(); }
    catch { await refresh(); }
  }, [activeIdea, refresh]);

  return (
    <div className="min-h-dvh selection:bg-[#EEF0FD]" style={{ backgroundColor: T.pageBg }} data-testid="workspace-root">
      <div className="flex h-dvh overflow-hidden">

        {/* ── Sidebar ──────────────────────────────────── */}
        <aside className="w-60 xl:w-64 shrink-0 flex flex-col h-full"
               style={{ background: T.card, borderRight: `1px solid ${T.border}` }}
               data-testid="workspace-sidebar">
          <div className="p-5">
            {/* Logo */}
            <div className="mb-7 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-[0_4px_12px_rgba(61,118,244,0.25)]"
                   style={{ background: "linear-gradient(135deg,#3D76F4,#54AEF5)" }}>
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7L5.5 10.5L12 3.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-bold tracking-tight leading-none" style={{ color: T.text }}>BuildCopilot</h2>
                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.lavender, fontFamily: "var(--font-mono)" }}>
                  Intelligence OS
                </p>
              </div>
            </div>

            {/* Search */}
            <div className="mb-5 flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs cursor-pointer transition-all"
                 style={{ background: T.pageBg, border: `1px solid ${T.border}`, color: T.muted }}
                 role="button" tabIndex={0} aria-label="Search workspace" data-testid="workspace-search">
              <Search className="h-3.5 w-3.5"/> Search workspace
            </div>

            {/* Nav */}
            <nav>
              <ul className="space-y-1">
                {MODULES.map(m => {
                  const Icon = m.icon; const active = activeModule===m.id;
                  return (
                    <li key={m.id}>
                      <button type="button" onClick={()=>setActiveModule(m.id)}
                        aria-current={active?"page":undefined} data-testid={`nav-${m.id}`}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all"
                        style={{
                          background: active ? "linear-gradient(135deg,#3D76F4,#54AEF5)" : "transparent",
                          color: active ? "white" : T.muted,
                          boxShadow: active ? "0 4px 14px rgba(61,118,244,0.25)" : "none",
                        }}>
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                             style={{ background: active ? "rgba(255,255,255,0.2)" : T.pageBg }}>
                          <Icon className="h-3.5 w-3.5" style={{ color: active ? "white" : m.color }}/>
                        </div>
                        {m.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {/* Ideas */}
          {savedIdeas.length > 0 && (
            <div className="mx-4 mb-3">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] px-1" style={{ color: T.lavender, fontFamily: "var(--font-mono)" }}>
                Ideas ({savedIdeas.length})
              </p>
              <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                {savedIdeas.map(idea => {
                  const isActive = idea.ideaId===activeIdea?.ideaId;
                  return (
                    <div key={idea.ideaId} className="group relative">
                      <button type="button"
                        onClick={()=>{setActiveIdeaId(idea.ideaId);setActiveModule("capture");}}
                        className="w-full rounded-xl px-3 py-2 pr-8 text-left text-[11px] transition-all font-medium"
                        style={{
                          background: isActive ? T.lavLight : "transparent",
                          border: isActive ? `1px solid ${T.lavender}` : "1px solid transparent",
                          color: isActive ? T.primary : T.muted,
                        }}>
                        <span className="line-clamp-1">{idea.rawIdea.slice(0,48)}{idea.rawIdea.length>48?"…":""}</span>
                      </button>
                      <button type="button" onClick={e=>{e.stopPropagation();void runDelete(idea.ideaId);}} title="Delete"
                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="h-3 w-3" style={{ color: "#DC2626" }}/>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bottom */}
          <div className="mt-auto p-4">
            <div className="rounded-2xl p-4" style={{ background: T.lavLight, border: `1px solid ${T.lavender}` }}>
              <div className="flex items-center gap-2 text-xs font-bold mb-3" style={{ color: T.primary }}>
                <Rocket className="h-3.5 w-3.5"/> MVP Status
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(202,206,250,0.3)" }}
                   role="progressbar" aria-valuenow={activeIdea?58:10} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-full rounded-full gradient-primary transition-all" style={{ width: activeIdea?"58%":"10%" }}/>
              </div>
              <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: T.primary, fontFamily: "var(--font-mono)" }}>
                {activeIdea?"Core loop 58%":"Capture to begin"}
              </p>
            </div>
            <button type="button" onClick={()=>signOut({callbackUrl:"/login"})} data-testid="signout-btn"
              className="mt-2.5 w-full rounded-xl px-3 py-2 text-xs font-medium text-center transition-all"
              style={{ border: `1px solid ${T.border}`, color: T.muted, background: T.card }}>
              Sign out
            </button>
          </div>
        </aside>

        {/* ── Main ─────────────────────────────────────── */}
        <main className="flex-1 flex flex-col min-w-0" style={{ background: T.pageBg }}>
          {/* Topbar */}
          <div className="shrink-0 px-6 py-3.5 z-10 backdrop-blur-xl"
               style={{ background: "rgba(255,255,255,0.85)", borderBottom: `1px solid ${T.border}`, boxShadow: "0 1px 8px rgba(61,118,244,0.05)" }}
               data-testid="workspace-topbar">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-xl px-3 py-1.5" style={{ background: T.lavLight, border: `1px solid ${T.lavender}` }}>
                  <Users className="h-3.5 w-3.5" style={{ color: T.primary }}/>
                  <span className="text-xs font-bold" style={{ color: T.text }}>{userProfile.project}</span>
                </div>
                <span style={{ color: T.lavender }}>/</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: T.muted, fontFamily: "var(--font-mono)" }}>{userProfile.role}</span>
              </div>
              <div className="flex items-center gap-2.5">
                {activeIdea && (
                  <div className="flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em]"
                       style={{ background: "#ECFDF5", border: "1px solid #A7F3D0", color: "#059669" }}
                       data-testid="context-loaded-badge">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"/>
                    Project Context Loaded
                  </div>
                )}
                {health && (
                  <div className="flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em]"
                       style={{ background: health.connected?T.lavLight:"#FFFBEB", border: `1px solid ${health.connected?T.lavender:"#FDE68A"}`, color: health.connected?T.primary:"#D97706" }}>
                    <Gauge className="h-3 w-3"/>{health.mode}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Error toast */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{opacity:0,y:-20,scale:0.95}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:-20,scale:0.95}}
                role="alert" data-testid="error-toast"
                className="fixed top-6 right-6 z-50 flex items-center gap-4 rounded-2xl p-4 text-sm font-medium"
                style={{ background: T.card, border: "1px solid #FECACA", color: "#DC2626", boxShadow: "0 8px 32px rgba(220,38,38,0.12)" }}>
                <div className="rounded-xl p-2" style={{ background: "#FEF2F2" }}>
                  <AlertCircle className="h-4 w-4" style={{ color: "#DC2626" }}/>
                </div>
                <span>{error}</span>
                <button type="button" onClick={()=>setError(null)} className="ml-2 rounded-lg p-1.5 transition-colors hover:bg-slate-100">
                  <X className="h-4 w-4" style={{ color: T.muted }}/>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Module content */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div key={activeModule}
                initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}
                transition={{duration:0.3,ease:[0.22,1,0.36,1]}}
                className="p-6 lg:p-8">
                {activeModule==="capture" && <CaptureScreen rawIdea={rawIdea} setRawIdea={setRawIdea} structuring={structuring} onStructure={runStructure} activeIdea={activeIdea}/>}
                {activeModule==="strategy" && <StrategyScreen activeIdea={activeIdea} generating={genStrategy} onRun={runStrategy}/>}
                {activeModule==="draft" && <DraftScreen activeIdea={activeIdea} generating={genReqs} onRun={runReqs}/>}
                {activeModule==="breakdown" && <BreakdownScreen activeIdea={activeIdea} generating={genBacklog} onRun={runBacklog} onStoryStatusChange={runStoryStatus}/>}
                {activeModule==="build" && <BuildScreen activeIdea={activeIdea} onStoryStatusChange={runStoryStatus}/>}
                {activeModule==="verify" && <VerifyScreen activeIdea={activeIdea}/>}
                {activeModule==="insight" && <InsightScreen activeIdea={activeIdea}/>}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        <AIPanel mod={activeModule}/>
      </div>
    </div>
  );
}
