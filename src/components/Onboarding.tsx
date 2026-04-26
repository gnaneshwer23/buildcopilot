"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type RoleKey = "Product Manager" | "Architect / Tech Lead" | "Business Analyst" | "Delivery Manager";

// ─── Data ─────────────────────────────────────────────────────────────────────
const MODULES = [
  { label: "Capture",   color: "#7C3AED" },
  { label: "Strategy",  color: "#2563EB" },
  { label: "Draft",     color: "#D97706" },
  { label: "Breakdown", color: "#EA580C" },
  { label: "Build",     color: "#059669" },
  { label: "Verify",    color: "#DC2626" },
  { label: "Insight",   color: "#4F46E5" },
] as const;

const ROLES: Array<{
  id: RoleKey;
  tagline: string;
  highlights: string[];
  iconColor: string;
  bgColor: string;
  borderColor: string;
  activeBorder: string;
  icon: React.ReactNode;
}> = [
  {
    id: "Product Manager",
    tagline: "Turn ideas into PRDs in minutes, not days.",
    highlights: [
      "AI-powered PRD, BRD & FRD generation",
      "Now / Next / Later roadmap builder",
      "Stakeholder review & approval workflows",
      "Product strategy with market positioning",
    ],
    iconColor: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-100",
    activeBorder: "border-blue-500",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
    ),
  },
  {
    id: "Architect / Tech Lead",
    tagline: "Auto-generate architecture from requirements.",
    highlights: [
      "Mermaid architecture diagrams from PRDs",
      "Tech spec generated from requirements",
      "Code → requirement traceability",
      "Non-functional requirement tracking",
    ],
    iconColor: "text-violet-600",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-100",
    activeBorder: "border-violet-500",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
    ),
  },
  {
    id: "Business Analyst",
    tagline: "Requirements that trace all the way to tests.",
    highlights: [
      "FRD / BRD with acceptance criteria",
      "User story mapping from requirements",
      "Full traceability matrix (req → test → result)",
      "Gap detection and coverage reporting",
    ],
    iconColor: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-100",
    activeBorder: "border-emerald-500",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
    ),
  },
  {
    id: "Delivery Manager",
    tagline: "See every sprint risk before it becomes a blocker.",
    highlights: [
      "Sprint velocity and burndown tracking",
      "Risk prediction with AI-flagged blockers",
      "Jira / Linear sync with scheduling",
      "Executive stakeholder report generation",
    ],
    iconColor: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-100",
    activeBorder: "border-amber-500",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
    ),
  },
];

const PROJECT_TAGS = ["Healthcare AI", "FinTech Platform", "SaaS Product", "Internal Tool", "Mobile App", "E-commerce"];

// ─── Right Panel Components ───────────────────────────────────────────────────

function PanelLoopOverview() {
  return (
    <div className="flex flex-col h-full justify-center px-10 py-12">
      <p className="text-xs font-mono font-semibold uppercase tracking-[0.2em] text-slate-400 mb-8">
        The BuildCopilot Intelligence Loop
      </p>
      <div className="space-y-2.5">
        {MODULES.map((mod, i) => (
          <motion.div
            key={mod.label}
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold shrink-0"
              style={{ backgroundColor: `${mod.color}15`, border: `1px solid ${mod.color}30` }}
            >
              <span style={{ color: mod.color }}>{String(i + 1).padStart(2, "0")}</span>
            </div>
            <div className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
              <span className="text-sm font-semibold" style={{ color: mod.color }}>{mod.label}</span>
            </div>
          </motion.div>
        ))}
      </div>
      <p className="mt-8 text-xs text-slate-400 leading-relaxed">
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
        <p className="text-xs font-mono font-semibold uppercase tracking-[0.2em] text-slate-400 mb-7">
          Built for your whole team
        </p>
        <div className="grid grid-cols-2 gap-3">
          {ROLES.map((r) => (
            <div key={r.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className={`w-8 h-8 rounded-lg ${r.bgColor} ${r.iconColor} flex items-center justify-center mb-3`}>
                {r.icon}
              </div>
              <p className="text-xs font-bold text-slate-800">{r.id.split(" / ")[0]}</p>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{r.tagline}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      key={role.id}
      className="flex flex-col h-full justify-center px-10 py-12"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={`inline-flex items-center gap-2.5 w-fit rounded-lg ${role.bgColor} ${role.iconColor} px-3 py-2 mb-7 border ${role.borderColor}`}>
        {role.icon}
        <span className="text-sm font-bold">{role.id}</span>
      </div>
      <p className="text-lg font-bold text-slate-900 mb-7 leading-snug">{role.tagline}</p>
      <ul className="space-y-3.5" aria-label={`${role.id} features`}>
        {role.highlights.map((h) => (
          <li key={h} className="flex items-start gap-3 text-sm text-slate-600">
            <span className={`mt-0.5 shrink-0 w-5 h-5 rounded-full ${role.bgColor} ${role.iconColor} flex items-center justify-center border ${role.borderColor}`}>
              <Check className="h-3 w-3" />
            </span>
            {h}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

function PanelWorkspacePreview({ name, role }: { name: string; role: RoleKey | "" }) {
  const shortName = name.split(" ")[0] || "You";
  const roleObj = ROLES.find((r) => r.id === role);

  return (
    <motion.div
      className="flex flex-col h-full justify-center px-10 py-12"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <p className="text-xs font-mono font-semibold uppercase tracking-[0.2em] text-slate-400 mb-7">
        Your workspace preview
      </p>

      {/* Mini workspace mock */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
        {/* Topbar */}
        <div className="flex items-center gap-2.5 border-b border-slate-100 bg-slate-50 px-4 py-3">
          <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center">
            <svg width="9" height="9" viewBox="0 0 14 14" fill="none">
              <path d="M2 7L5.5 10.5L12 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-[11px] font-semibold text-slate-500">BuildCopilot</span>
          <span className="ml-auto flex items-center gap-1 text-[10px] text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Live
          </span>
        </div>

        {/* Welcome strip */}
        <div className="px-4 py-3 border-b border-slate-100 bg-blue-50">
          <p className="text-xs font-bold text-slate-800">Welcome, {shortName}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">{role || "Your role"} workspace</p>
        </div>

        {/* Layout */}
        <div className="flex">
          {/* Mini sidebar */}
          <div className="w-24 border-r border-slate-100 bg-slate-50 p-2.5 space-y-1">
            {MODULES.slice(0, 5).map((m, i) => (
              <div
                key={m.label}
                className="rounded-md px-2 py-1.5 text-[9px] font-semibold"
                style={i === 0 ? { color: m.color, backgroundColor: `${m.color}12` } : { color: "#94A3B8" }}
              >
                {m.label}
              </div>
            ))}
          </div>

          {/* Content skeleton */}
          <div className="flex-1 p-4 space-y-2.5">
            <div className="h-2 rounded-full bg-slate-200 w-4/5" />
            <div className="h-1.5 rounded-full bg-slate-100 w-3/5" />
            <div className="h-1.5 rounded-full bg-slate-100 w-2/3" />
            <div className="mt-3 h-7 rounded-lg bg-blue-50 border border-blue-100 w-full" />
            <div className="mt-1 grid grid-cols-2 gap-1.5">
              <div className="h-6 rounded-md bg-slate-50 border border-slate-100" />
              <div className="h-6 rounded-md bg-slate-50 border border-slate-100" />
            </div>
          </div>
        </div>
      </div>

      {roleObj && (
        <p className="mt-6 text-xs text-slate-400 leading-relaxed">
          AI tuned for <span className="text-slate-700 font-semibold">{role}</span> — {roleObj.tagline}
        </p>
      )}
    </motion.div>
  );
}

// ─── Launch Screen ────────────────────────────────────────────────────────────

function LaunchScreen({ role }: { role: string }) {
  return (
    <div className="min-h-dvh bg-white flex flex-col items-center justify-center gap-7">
      <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
        <svg width="22" height="22" viewBox="0 0 14 14" fill="none">
          <path d="M2 7L5.5 10.5L12 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-slate-900 font-bold text-xl tracking-tight">Configuring your workspace…</p>
        <p className="text-slate-400 text-sm mt-1.5">AI tuned for {role || "your role"}</p>
      </div>
      <div className="w-48 h-1 rounded-full bg-slate-200 overflow-hidden">
        <div className="h-full bg-blue-600 rounded-full animate-load-bar" />
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
    "w-full rounded-xl border border-slate-200 bg-white px-5 py-4 text-xl font-semibold text-slate-900 outline-none placeholder:text-slate-300 focus-visible:ring-2 focus-visible:ring-blue-100 focus-visible:border-blue-600 transition-all shadow-sm";

  const stepTitles = ["Who are you?", "What's your role?", "What are we building?"];

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900 flex" data-testid="onboarding-wrapper">
      {/* ── Left: Form ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col px-8 py-10 lg:px-14 lg:py-14 min-w-0 bg-white border-r border-slate-200">
        {/* Brand */}
        <div className="flex items-center gap-2.5 mb-14">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path d="M2 7L5.5 10.5L12 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-base font-bold tracking-tight text-slate-900">BuildCopilot</span>
        </div>

        {/* Step progress */}
        <div
          className="flex items-center gap-2 mb-12"
          role="progressbar"
          aria-valuenow={step}
          aria-valuemin={1}
          aria-valuemax={3}
          aria-label={`Step ${step} of 3`}
          data-testid="onboarding-progress"
        >
          {([1, 2, 3] as const).map((s) => (
            <div
              key={s}
              className={`h-1 rounded-full transition-all duration-500 ${s < step ? "bg-blue-300 w-6" : s === step ? "bg-blue-600 w-10" : "bg-slate-200 w-6"}`}
            />
          ))}
          <span className="ml-2 text-xs font-mono text-slate-400">{step} / 3</span>
        </div>

        <AnimatePresence mode="wait">
          {/* ── Step 1: Name ── */}
          {step === 1 && (
            <motion.div
              key="step-1"
              className="flex-1 flex flex-col"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              data-testid="onboarding-step-1"
            >
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight leading-[1.08] mb-3 text-slate-900">
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
                data-testid="input-your-name"
              />
              <div className="mt-auto pt-10">
                <button
                  type="button"
                  disabled={!data.name.trim()}
                  onClick={() => setStep(2)}
                  data-testid="step1-continue-btn"
                  className="inline-flex items-center gap-2.5 rounded-xl bg-blue-600 px-8 py-3.5 text-base font-bold text-white shadow-sm hover:bg-blue-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Role ── */}
          {step === 2 && (
            <motion.div
              key="step-2"
              className="flex-1 flex flex-col"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              data-testid="onboarding-step-2"
            >
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight leading-[1.08] mb-3 text-slate-900">
                What&apos;s your<br />primary role?
              </h2>
              <p className="text-slate-400 mb-10">
                BuildCopilot tailors AI suggestions and dashboards to how <em>you</em> work.
              </p>
              <div
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                role="group"
                aria-label="Select your role"
              >
                {ROLES.map((role) => (
                  <button
                    type="button"
                    key={role.id}
                    aria-pressed={data.role === role.id}
                    onClick={() => {
                      setData((d) => ({ ...d, role: role.id }));
                      setTimeout(() => setStep(3), 160);
                    }}
                    data-testid={`role-btn-${role.id.toLowerCase().replace(/[\s/]+/g, '-')}`}
                    className={`rounded-xl border p-5 text-left transition-all duration-200 ${
                      data.role === role.id
                        ? `${role.activeBorder} ${role.bgColor} shadow-sm`
                        : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg ${role.bgColor} ${role.iconColor} flex items-center justify-center mb-4 border ${role.borderColor}`}>
                      {role.icon}
                    </div>
                    <p className="text-sm font-bold text-slate-900">{role.id}</p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{role.tagline}</p>
                  </button>
                ))}
              </div>
              <div className="mt-auto pt-8">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  data-testid="step2-back-btn"
                  className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Project ── */}
          {step === 3 && (
            <motion.div
              key="step-3"
              className="flex-1 flex flex-col"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              data-testid="onboarding-step-3"
            >
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight leading-[1.08] mb-3 text-slate-900">
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
                data-testid="input-project-name"
              />
              {/* Quick-select tags */}
              <div className="mt-4 flex flex-wrap gap-2" aria-label="Suggested project types">
                {PROJECT_TAGS.map((tag) => (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => setData((d) => ({ ...d, project: tag }))}
                    data-testid={`tag-${tag.toLowerCase().replace(/\s+/g, '-')}`}
                    className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-500 hover:border-slate-300 hover:text-slate-800 transition-all shadow-sm"
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <div className="mt-auto pt-10 flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  data-testid="step3-back-btn"
                  className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button
                  type="button"
                  disabled={!data.project.trim()}
                  onClick={handleLaunch}
                  data-testid="launch-workspace-btn"
                  className="inline-flex items-center gap-2.5 rounded-xl bg-blue-600 px-8 py-3.5 text-base font-bold text-white shadow-sm hover:bg-blue-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                >
                  Enter Workspace <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Right: Contextual preview ─────────────────── */}
      <div className="hidden lg:flex w-[420px] xl:w-[460px] shrink-0 flex-col bg-slate-50 overflow-hidden">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="panel-1"
              className="h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <PanelLoopOverview />
            </motion.div>
          )}
          {step === 2 && (
            <motion.div
              key="panel-2"
              className="h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <PanelRoleSelect selectedRole={data.role} />
            </motion.div>
          )}
          {step === 3 && (
            <motion.div
              key="panel-3"
              className="h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <PanelWorkspacePreview name={data.name} role={data.role} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
