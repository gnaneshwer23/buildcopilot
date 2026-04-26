"use client";

import React, { useState, useCallback, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type RoleKey = "Product Manager" | "Architect / Tech Lead" | "Business Analyst" | "Delivery Manager";

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconTarget = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
);
const IconLayers = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
);
const IconClipboard = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
);
const IconTrendingUp = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
);
const IconCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
);
const IconArrowRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
);
const IconArrowLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5m7-7-7 7 7 7"/></svg>
);

// ─── Data ─────────────────────────────────────────────────────────────────────
const MODULES = [
  { label: "Capture",   color: "#a78bfa" },
  { label: "Strategy",  color: "#60a5fa" },
  { label: "Draft",     color: "#fbbf24" },
  { label: "Breakdown", color: "#fb923c" },
  { label: "Build",     color: "#34d399" },
  { label: "Verify",    color: "#fb7185" },
  { label: "Insight",   color: "#818cf8" },
] as const;

const ROLES: Array<{
  id: RoleKey;
  Icon: () => React.ReactElement;
  tagline: string;
  highlights: string[];
  gradient: string;
  dot: string;
}> = [
  {
    id: "Product Manager",
    Icon: IconTarget,
    tagline: "Turn ideas into PRDs in minutes, not days.",
    highlights: [
      "AI-powered PRD, BRD & FRD generation",
      "Now / Next / Later roadmap builder",
      "Stakeholder review & approval workflows",
      "Product strategy with market positioning",
    ],
    gradient: "from-blue-600 to-cyan-500",
    dot: "bg-blue-500",
  },
  {
    id: "Architect / Tech Lead",
    Icon: IconLayers,
    tagline: "Auto-generate architecture from requirements.",
    highlights: [
      "Mermaid architecture diagrams from PRDs",
      "Tech spec generated from requirements",
      "Code → requirement traceability",
      "Non-functional requirement tracking",
    ],
    gradient: "from-violet-600 to-purple-500",
    dot: "bg-violet-500",
  },
  {
    id: "Business Analyst",
    Icon: IconClipboard,
    tagline: "Requirements that trace all the way to tests.",
    highlights: [
      "FRD / BRD with acceptance criteria",
      "User story mapping from requirements",
      "Full traceability matrix (req → test → result)",
      "Gap detection and coverage reporting",
    ],
    gradient: "from-emerald-600 to-teal-500",
    dot: "bg-emerald-500",
  },
  {
    id: "Delivery Manager",
    Icon: IconTrendingUp,
    tagline: "See every sprint risk before it becomes a blocker.",
    highlights: [
      "Sprint velocity and burndown tracking",
      "Risk prediction with AI-flagged blockers",
      "Jira / Linear sync with scheduling",
      "Executive stakeholder report generation",
    ],
    gradient: "from-amber-500 to-orange-500",
    dot: "bg-amber-500",
  },
];

const PROJECT_TAGS = ["Healthcare AI", "FinTech Platform", "SaaS Product", "Internal Tool", "Mobile App", "E-commerce"];

// ─── Right Panel Components ───────────────────────────────────────────────────

function PanelLoopOverview() {
  return (
    <div className="flex flex-col h-full justify-center px-10 py-12">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-8">
        The BuildCopilot Intelligence Loop
      </p>
      <div className="relative">
        {MODULES.map((mod, i) => (
          <div key={mod.label} className="flex items-center gap-3 mb-3 last:mb-0">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0"
              style={{ backgroundColor: `${mod.color}22`, border: `1px solid ${mod.color}44` }}
            >
              <span style={{ color: mod.color }}>{String(i + 1).padStart(2, "0")}</span>
            </div>
            <div className="flex-1 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5">
              <span className="text-sm font-medium" style={{ color: mod.color }}>{mod.label}</span>
            </div>
            {i < MODULES.length - 1 && (
              <div className="absolute left-3.5 ml-px w-px" style={{
                top: `${(i + 1) * 44}px`,
                height: "12px",
                backgroundColor: `${MODULES[i + 1].color}33`,
              }} />
            )}
          </div>
        ))}
      </div>
      <p className="mt-8 text-xs text-slate-600 leading-relaxed">
        Every layer auto-links to the next. Idea&thinsp;→&thinsp;validated code, fully traced.
      </p>
    </div>
  );
}

function PanelRoleSelect({ selectedRole }: { selectedRole: RoleKey | "" }) {
  const role = ROLES.find((r) => r.id === selectedRole);

  if (!role) {
    return (
      <div className="flex flex-col h-full justify-center px-10 py-12">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Built for your whole team</p>
        <div className="grid grid-cols-2 gap-3">
          {ROLES.map((r) => (
            <div key={r.id} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${r.gradient} flex items-center justify-center text-white mb-3`}>
                <r.Icon />
              </div>
              <p className="text-xs font-semibold text-slate-300">{r.id.split(" / ")[0]}</p>
              <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{r.tagline}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full justify-center px-10 py-12 animate-fade-in">
      <div className={`inline-flex items-center gap-2.5 w-fit rounded-2xl bg-gradient-to-br ${role.gradient} p-px mb-7`}>
        <div className="flex items-center gap-2.5 bg-[#0D121A] rounded-[14px] px-4 py-2.5">
          <role.Icon />
          <span className="text-sm font-bold text-white">{role.id}</span>
        </div>
      </div>
      <p className="text-xl font-bold text-white mb-7 leading-snug">{role.tagline}</p>
      <ul className="space-y-3.5" aria-label={`${role.id} features`}>
        {role.highlights.map((h) => (
          <li key={h} className="flex items-start gap-3 text-sm text-slate-300">
            <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
              <IconCheck />
            </span>
            {h}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PanelWorkspacePreview({ name, role }: { name: string; role: RoleKey | "" }) {
  const shortName = name.split(" ")[0] || "You";
  const roleObj = ROLES.find((r) => r.id === role);

  return (
    <div className="flex flex-col h-full justify-center px-10 py-12 animate-fade-in">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Your workspace preview</p>

      {/* Mini workspace mock */}
      <div className="rounded-2xl border border-white/10 bg-[#080C11] overflow-hidden shadow-2xl shadow-black/40">
        {/* Topbar */}
        <div className="flex items-center gap-2.5 border-b border-white/[0.07] px-4 py-3">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-[9px] font-bold text-white">F</div>
          <span className="text-xs font-semibold text-slate-400">BuildCopilot</span>
          <span className="ml-auto flex items-center gap-1.5 text-[10px] text-slate-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Live
          </span>
        </div>

        {/* Welcome strip */}
        <div className="px-4 py-3 border-b border-white/[0.05] bg-gradient-to-r from-blue-600/10 to-transparent">
          <p className="text-xs font-semibold text-white">Welcome, {shortName}</p>
          <p className="text-[10px] text-slate-500 mt-0.5 font-medium">{role || "Your role"} workspace</p>
        </div>

        {/* Layout */}
        <div className="flex">
          {/* Mini sidebar */}
          <div className="w-28 border-r border-white/[0.05] p-2.5 space-y-1">
            {MODULES.slice(0, 5).map((m, i) => (
              <div
                key={m.label}
                className="rounded-lg px-2 py-1.5 text-[9px] font-medium"
                style={i === 0 ? { color: m.color, backgroundColor: `${m.color}15` } : { color: "#475569" }}
              >
                {m.label}
              </div>
            ))}
          </div>

          {/* Content skeleton */}
          <div className="flex-1 p-4 space-y-2.5">
            <div className="h-2 rounded-full bg-white/10 w-4/5" />
            <div className="h-1.5 rounded-full bg-white/[0.05] w-3/5" />
            <div className="h-1.5 rounded-full bg-white/[0.05] w-2/3" />
            <div className="mt-3 h-7 rounded-xl bg-blue-500/20 border border-blue-500/20 w-full" />
            <div className="mt-1 grid grid-cols-2 gap-1.5">
              <div className="h-6 rounded-lg bg-white/[0.03] border border-white/[0.05]" />
              <div className="h-6 rounded-lg bg-white/[0.03] border border-white/[0.05]" />
            </div>
          </div>
        </div>
      </div>

      {roleObj && (
        <p className="mt-6 text-xs text-slate-500 leading-relaxed">
          AI tuned for <span className="text-slate-300 font-medium">{role}</span> — {roleObj.tagline}
        </p>
      )}
    </div>
  );
}

// ─── Launch Screen ────────────────────────────────────────────────────────────

function LaunchScreen({ role }: { role: string }) {
  return (
    <div className="min-h-dvh bg-[#0B0F14] flex flex-col items-center justify-center gap-7">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-2xl font-bold text-white shadow-2xl shadow-blue-500/30">
        F
      </div>
      <div className="text-center">
        <p className="text-white font-semibold text-lg">Configuring your workspace…</p>
        <p className="text-slate-500 text-sm mt-1.5">AI tuned for {role || "your role"}</p>
      </div>
      <div className="w-48 h-1 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full bg-blue-500 rounded-full animate-load-bar" />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface OnboardingProps {
  onComplete: (data: { name: string; role: string; project: string }) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [data, setData] = useState({ name: "", role: "" as RoleKey | "", project: "" });
  const [launching, setLaunching] = useState(false);

  const shortName = data.name.split(" ")[0] || "there";

  const handleLaunch = useCallback(() => {
    if (!data.project.trim()) return;
    setLaunching(true);
  }, [data.project]);

  useEffect(() => {
    if (!launching) return;
    const t = setTimeout(() => onComplete({ name: data.name, role: data.role, project: data.project }), 1600);
    return () => clearTimeout(t);
  }, [launching, data, onComplete]);

  if (launching) return <LaunchScreen role={data.role} />;

  const inputClass =
    "w-full rounded-2xl border border-white/10 bg-[#121821] px-6 py-5 text-2xl font-semibold outline-none placeholder:text-slate-700 focus-visible:ring-4 focus-visible:ring-blue-500/40 focus-visible:border-blue-500/50 transition-all text-white";

  return (
    <div className="min-h-dvh bg-[#0B0F14] text-white flex">
      {/* ── Left: Form ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col px-8 py-10 lg:px-14 lg:py-14 min-w-0">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-14">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">F</div>
          <span className="text-base font-bold tracking-tight">BuildCopilot</span>
        </div>

        {/* Step dots */}
        <div className="flex items-center gap-2 mb-12" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={3} aria-label={`Step ${step} of 3`}>
          {([1, 2, 3] as const).map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-500 ${s < step ? "bg-blue-500/40 w-5" : s === step ? "bg-blue-500 w-9" : "bg-white/10 w-5"}`}
            />
          ))}
          <span className="ml-2 text-xs font-medium text-slate-600">{step} / 3</span>
        </div>

        {/* ── Step 1: Name ── */}
        {step === 1 && (
          <div className="animate-fade-up flex-1 flex flex-col">
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1] mb-4">
              What should we<br />call you?
            </h2>
            <p className="text-slate-400 mb-10">We&apos;ll personalise your workspace and AI guidance.</p>
            <input
              type="text"
              autoFocus
              value={data.name}
              onChange={(e) => setData((d) => ({ ...d, name: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && data.name.trim() && setStep(2)}
              placeholder="Your name"
              className={inputClass}
              aria-label="Your name"
            />
            <div className="mt-auto pt-10">
              <button
                type="button"
                disabled={!data.name.trim()}
                onClick={() => setStep(2)}
                className="flex items-center gap-3 rounded-2xl bg-blue-500 px-8 py-3.5 text-base font-bold text-white shadow-xl shadow-blue-500/30 hover:bg-blue-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue <IconArrowRight />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Role ── */}
        {step === 2 && (
          <div className="animate-fade-up flex-1 flex flex-col">
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1] mb-4">
              What&apos;s your<br />primary role?
            </h2>
            <p className="text-slate-400 mb-10">
              BuildCopilot tailors AI suggestions, dashboards, and reporting to how <em>you</em> work.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="group" aria-label="Select your role">
              {ROLES.map((role) => (
                <button
                  type="button"
                  key={role.id}
                  aria-pressed={data.role === role.id}
                  onClick={() => {
                    setData((d) => ({ ...d, role: role.id }));
                    setTimeout(() => setStep(3), 160);
                  }}
                  className={`rounded-2xl border p-5 text-left transition-all ${
                    data.role === role.id
                      ? "border-blue-500/50 bg-blue-500/8"
                      : "border-white/10 bg-[#121821] hover:border-white/20 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${role.gradient} flex items-center justify-center text-white mb-4`}>
                    <role.Icon />
                  </div>
                  <p className="text-sm font-semibold text-white">{role.id}</p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{role.tagline}</p>
                </button>
              ))}
            </div>
            <div className="mt-auto pt-8">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-white transition-colors"
              >
                <IconArrowLeft /> Back
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Project ── */}
        {step === 3 && (
          <div className="animate-fade-up flex-1 flex flex-col">
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1] mb-4">
              What are we<br />building, {shortName}?
            </h2>
            <p className="text-slate-400 mb-10">
              Name your first project. You can change this anytime.
            </p>
            <input
              type="text"
              autoFocus
              value={data.project}
              onChange={(e) => setData((d) => ({ ...d, project: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && data.project.trim() && handleLaunch()}
              placeholder="e.g. AI Delivery OS"
              className={inputClass}
              aria-label="Project name"
            />
            {/* Quick-select tags */}
            <div className="mt-4 flex flex-wrap gap-2" aria-label="Suggested project types">
              {PROJECT_TAGS.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => setData((d) => ({ ...d, project: tag }))}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs font-medium text-slate-400 hover:border-white/20 hover:text-white transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>
            <div className="mt-auto pt-10 flex items-center gap-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-white transition-colors"
              >
                <IconArrowLeft /> Back
              </button>
              <button
                type="button"
                disabled={!data.project.trim()}
                onClick={handleLaunch}
                className="flex items-center gap-3 rounded-2xl bg-blue-500 px-8 py-3.5 text-base font-bold text-white shadow-xl shadow-blue-500/30 hover:bg-blue-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Enter Workspace <IconArrowRight />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Right: Contextual preview (lg+ only) ─────────────── */}
      <div className="hidden lg:flex w-[420px] xl:w-[460px] shrink-0 flex-col border-l border-white/[0.06] bg-[#0D121A] overflow-hidden">
        {step === 1 && <PanelLoopOverview />}
        {step === 2 && <PanelRoleSelect selectedRole={data.role} />}
        {step === 3 && <PanelWorkspacePreview name={data.name} role={data.role} />}
      </div>
    </div>
  );
};
