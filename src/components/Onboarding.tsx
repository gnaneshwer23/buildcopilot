"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Check, Sparkles } from "lucide-react";

type RoleKey = "Product Manager" | "Architect / Tech Lead" | "Business Analyst" | "Delivery Manager";

const MODULES = [
  { label: "Capture",   color: "#7C3AED" },
  { label: "Strategy",  color: "#3D76F4" },
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
  gradient: string;
  iconBg: string;
  icon: React.ReactNode;
}> = [
  {
    id: "Product Manager",
    tagline: "Turn ideas into PRDs in minutes.",
    highlights: ["AI-powered PRD, BRD & FRD", "Now / Next / Later roadmap", "Stakeholder workflows", "Market positioning"],
    gradient: "from-[#3D76F4] to-[#54AEF5]",
    iconBg: "#EEF0FD",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3D76F4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  },
  {
    id: "Architect / Tech Lead",
    tagline: "Auto-generate architecture from requirements.",
    highlights: ["Mermaid architecture diagrams", "Tech spec generation", "Code traceability", "NFR tracking"],
    gradient: "from-[#7C3AED] to-[#CACEFA]",
    iconBg: "#F3F0FF",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
  },
  {
    id: "Business Analyst",
    tagline: "Requirements that trace all the way to tests.",
    highlights: ["FRD / BRD with AC", "User story mapping", "Traceability matrix", "Gap detection"],
    gradient: "from-[#059669] to-[#34D399]",
    iconBg: "#ECFDF5",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>,
  },
  {
    id: "Delivery Manager",
    tagline: "See sprint risks before they become blockers.",
    highlights: ["Sprint velocity tracking", "AI risk prediction", "Jira / Linear sync", "Executive reports"],
    gradient: "from-[#D97706] to-[#FBBF24]",
    iconBg: "#FFFBEB",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  },
];

const PROJECT_TAGS = ["Healthcare AI", "FinTech Platform", "SaaS Product", "Internal Tool", "Mobile App", "E-commerce"];

// ── Right panel ───────────────────────────────────────────────────────────────

function PanelLoopOverview() {
  return (
    <div
      className="h-full flex flex-col justify-center px-10 py-12"
      style={{ background: "linear-gradient(150deg, #3D76F4 0%, #54AEF5 55%, #CACEFA 100%)" }}
    >
      <p className="text-xs font-bold uppercase tracking-[0.2em] mb-8" style={{ color: "rgba(255,255,255,0.65)", fontFamily: "var(--font-mono)" }}>
        Intelligence Loop
      </p>
      <div className="space-y-3">
        {MODULES.map((mod, i) => (
          <motion.div
            key={mod.label}
            className="flex items-center gap-3 rounded-2xl px-4 py-3"
            style={{
              background: i === 0 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)",
              border: i === 0 ? "1px solid rgba(255,255,255,0.3)" : "1px solid rgba(255,255,255,0.12)",
              backdropFilter: "blur(8px)",
            }}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="w-2 h-2 rounded-full shrink-0 bg-white opacity-80" />
            <span className="text-sm font-semibold text-white">{mod.label}</span>
            <span className="ml-auto text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.5)" }}>
              {i === 0 ? "start" : `layer ${i + 1}`}
            </span>
          </motion.div>
        ))}
      </div>
      <p className="mt-8 text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
        Every layer auto-links to the next. Idea&thinsp;&rarr;&thinsp;validated code, fully traced.
      </p>
    </div>
  );
}

function PanelRoleSelect({ selectedRole }: { selectedRole: RoleKey | "" }) {
  const role = ROLES.find((r) => r.id === selectedRole);
  return (
    <div
      className="h-full flex flex-col justify-center px-10 py-12"
      style={{ background: "linear-gradient(150deg, #3D76F4 0%, #54AEF5 55%, #CACEFA 100%)" }}
    >
      {!role ? (
        <>
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-8" style={{ color: "rgba(255,255,255,0.65)", fontFamily: "var(--font-mono)" }}>
            Built for your whole team
          </p>
          <div className="grid grid-cols-2 gap-3">
            {ROLES.map((r) => (
              <div
                key={r.id}
                className="rounded-2xl p-4"
                style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)", backdropFilter: "blur(8px)" }}
              >
                <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ background: r.iconBg }}>
                  {r.icon}
                </div>
                <p className="text-xs font-bold text-white leading-snug">{r.id.split(" / ")[0]}</p>
                <p className="text-[10px] mt-1 leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>{r.tagline}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <motion.div
          key={role.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="rounded-2xl p-4 mb-7 flex items-center gap-3" style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", backdropFilter: "blur(8px)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: role.iconBg }}>
              {role.icon}
            </div>
            <div>
              <p className="text-sm font-bold text-white">{role.id}</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.65)" }}>{role.tagline}</p>
            </div>
          </div>
          <ul className="space-y-3">
            {role.highlights.map((h) => (
              <li key={h} className="flex items-center gap-3 text-sm text-white">
                <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)" }}>
                  <Check className="h-3 w-3 text-white" />
                </span>
                {h}
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
}

function PanelWorkspacePreview({ name, role }: { name: string; role: RoleKey | "" }) {
  const shortName = name.split(" ")[0] || "You";
  return (
    <div
      className="h-full flex flex-col justify-center px-10 py-12"
      style={{ background: "linear-gradient(150deg, #3D76F4 0%, #54AEF5 55%, #CACEFA 100%)" }}
    >
      <p className="text-xs font-bold uppercase tracking-[0.2em] mb-7" style={{ color: "rgba(255,255,255,0.65)", fontFamily: "var(--font-mono)" }}>
        Your workspace preview
      </p>
      <motion.div
        className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.22)", backdropFilter: "blur(12px)" }}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Topbar */}
        <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.15)" }}>
          <div className="w-5 h-5 rounded-lg gradient-primary flex items-center justify-center">
            <svg width="9" height="9" viewBox="0 0 14 14" fill="none"><path d="M2 7L5.5 10.5L12 3.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span className="text-[11px] font-semibold text-white">BuildCopilot</span>
          <span className="ml-auto flex items-center gap-1 text-[10px]" style={{ color: "rgba(255,255,255,0.6)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> {shortName}
          </span>
        </div>
        {/* Welcome */}
        <div className="px-4 py-3" style={{ background: "rgba(255,255,255,0.1)", borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
          <p className="text-xs font-bold text-white">Welcome, {shortName}</p>
          <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>{role || "Your role"} workspace</p>
        </div>
        {/* Layout */}
        <div className="flex">
          <div className="w-24 p-2.5 space-y-1" style={{ borderRight: "1px solid rgba(255,255,255,0.12)" }}>
            {MODULES.slice(0, 5).map((m, i) => (
              <div key={m.label} className="rounded-lg px-2 py-1.5 text-[9px] font-semibold"
                   style={i === 0 ? { background: "rgba(255,255,255,0.2)", color: "white" } : { color: "rgba(255,255,255,0.5)" }}>
                {m.label}
              </div>
            ))}
          </div>
          <div className="flex-1 p-4 space-y-2.5">
            <div className="h-2 rounded-full" style={{ background: "rgba(255,255,255,0.25)", width: "75%" }} />
            <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.15)", width: "55%" }} />
            <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.15)", width: "65%" }} />
            <div className="mt-3 h-7 rounded-xl" style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }} />
          </div>
        </div>
      </motion.div>
      <p className="mt-6 text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
        {role ? `AI tuned for ${role} — fully personalised.` : "Select your role to personalise."}
      </p>
    </div>
  );
}

// ── Launch screen ─────────────────────────────────────────────────────────────

function LaunchScreen({ role }: { role: string }) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center gap-7" style={{ backgroundColor: "#F4F7FE" }}>
      <div className="w-16 h-16 rounded-3xl gradient-primary flex items-center justify-center shadow-[0_8px_32px_rgba(61,118,244,0.35)] animate-pulse-glow">
        <svg width="24" height="24" viewBox="0 0 14 14" fill="none">
          <path d="M2 7L5.5 10.5L12 3.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div className="text-center">
        <p className="font-bold text-xl tracking-tight" style={{ color: "#0F1433" }}>Configuring your workspace…</p>
        <p className="text-sm mt-1.5" style={{ color: "#64748B" }}>AI tuned for {role || "your role"}</p>
      </div>
      <div className="w-48 h-1.5 rounded-full overflow-hidden" style={{ background: "#EEF0FD" }}>
        <div className="h-full rounded-full gradient-primary animate-load-bar" />
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

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

  return (
    <div className="min-h-dvh flex" style={{ backgroundColor: "#F4F7FE" }} data-testid="onboarding-wrapper">

      {/* ── Left: Form ───────────────────────────────────── */}
      <div className="flex-1 flex flex-col px-8 py-10 lg:px-14 lg:py-14 bg-white min-w-0">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-14">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-[0_4px_12px_rgba(61,118,244,0.3)]">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path d="M2 7L5.5 10.5L12 3.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-bold text-base tracking-tight" style={{ color: "#0F1433" }}>BuildCopilot</span>
        </div>

        {/* Step progress */}
        <div className="flex items-center gap-2 mb-12" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={3} data-testid="onboarding-progress">
          {([1, 2, 3] as const).map((s) => (
            <div
              key={s}
              className="h-1.5 rounded-full transition-all duration-500"
              style={{
                width: s === step ? 40 : 24,
                background: s < step ? "#98CDF9" : s === step ? "linear-gradient(90deg, #3D76F4, #54AEF5)" : "#EEF0FD",
              }}
            />
          ))}
          <span className="ml-2 text-xs font-bold" style={{ color: "#CACEFA", fontFamily: "var(--font-mono)" }}>{step} / 3</span>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" className="flex-1 flex flex-col"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} data-testid="onboarding-step-1">
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight leading-[1.07] mb-3" style={{ color: "#0F1433" }}>
                What should<br />we call you?
              </h2>
              <p className="mb-10 text-sm" style={{ color: "#64748B" }}>We&apos;ll personalise your workspace and AI guidance.</p>
              <input
                type="text" autoFocus value={data.name}
                onChange={(e) => setData((d) => ({ ...d, name: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && data.name.trim() && setStep(2)}
                placeholder="Your name"
                data-testid="input-your-name"
                className="w-full rounded-2xl px-5 py-4 text-xl font-semibold outline-none transition-all"
                style={{ color: "#0F1433", background: "#F4F7FE", border: "1px solid rgba(202,206,250,0.6)" }}
                onFocus={e => { e.target.style.borderColor = "#3D76F4"; e.target.style.boxShadow = "0 0 0 4px rgba(61,118,244,0.1)"; }}
                onBlur={e => { e.target.style.borderColor = "rgba(202,206,250,0.6)"; e.target.style.boxShadow = "none"; }}
              />
              <div className="mt-auto pt-10">
                <button type="button" disabled={!data.name.trim()} onClick={() => setStep(2)}
                  data-testid="step1-continue-btn" className="btn-primary text-base px-8 py-3.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none">
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" className="flex-1 flex flex-col"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} data-testid="onboarding-step-2">
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight leading-[1.07] mb-3" style={{ color: "#0F1433" }}>
                What&apos;s your<br />primary role?
              </h2>
              <p className="mb-10 text-sm" style={{ color: "#64748B" }}>
                BuildCopilot tailors AI suggestions to how you work.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="group">
                {ROLES.map((role) => {
                  const isActive = data.role === role.id;
                  return (
                    <button type="button" key={role.id} aria-pressed={isActive}
                      onClick={() => { setData((d) => ({ ...d, role: role.id })); setTimeout(() => setStep(3), 160); }}
                      data-testid={`role-btn-${role.id.toLowerCase().replace(/[\s/]+/g, '-')}`}
                      className="rounded-2xl p-5 text-left transition-all duration-200"
                      style={{
                        border: isActive ? "1.5px solid #3D76F4" : "1px solid rgba(202,206,250,0.5)",
                        background: isActive ? "linear-gradient(135deg, #EEF0FD 0%, #DCE8FD 100%)" : "white",
                        boxShadow: isActive ? "0 4px 20px rgba(61,118,244,0.12)" : "none",
                      }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: role.iconBg }}>
                        {role.icon}
                      </div>
                      <p className="text-sm font-bold" style={{ color: "#0F1433" }}>{role.id}</p>
                      <p className="text-xs mt-1 leading-relaxed" style={{ color: "#64748B" }}>{role.tagline}</p>
                    </button>
                  );
                })}
              </div>
              <div className="mt-auto pt-8">
                <button type="button" onClick={() => setStep(1)} data-testid="step2-back-btn"
                  className="inline-flex items-center gap-2 text-sm transition-colors" style={{ color: "#94A3B8" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#64748B")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#94A3B8")}>
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" className="flex-1 flex flex-col"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} data-testid="onboarding-step-3">
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight leading-[1.07] mb-3" style={{ color: "#0F1433" }}>
                What are we<br />building, {shortName}?
              </h2>
              <p className="mb-10 text-sm" style={{ color: "#64748B" }}>Name your first project. You can change this anytime.</p>
              <input
                type="text" autoFocus value={data.project}
                onChange={(e) => setData((d) => ({ ...d, project: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && data.project.trim() && handleLaunch()}
                placeholder="e.g. AI Delivery OS"
                data-testid="input-project-name"
                className="w-full rounded-2xl px-5 py-4 text-xl font-semibold outline-none transition-all"
                style={{ color: "#0F1433", background: "#F4F7FE", border: "1px solid rgba(202,206,250,0.6)" }}
                onFocus={e => { e.target.style.borderColor = "#3D76F4"; e.target.style.boxShadow = "0 0 0 4px rgba(61,118,244,0.1)"; }}
                onBlur={e => { e.target.style.borderColor = "rgba(202,206,250,0.6)"; e.target.style.boxShadow = "none"; }}
              />
              <div className="mt-4 flex flex-wrap gap-2">
                {["Healthcare AI", "FinTech Platform", "SaaS Product", "Internal Tool", "Mobile App", "E-commerce"].map((tag) => (
                  <button type="button" key={tag} onClick={() => setData((d) => ({ ...d, project: tag }))}
                    data-testid={`tag-${tag.toLowerCase().replace(/\s+/g, '-')}`}
                    className="rounded-full px-4 py-1.5 text-xs font-semibold transition-all"
                    style={{ background: "#EEF0FD", color: "#3D76F4", border: "1px solid rgba(202,206,250,0.6)" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#DCE8FD")}
                    onMouseLeave={e => (e.currentTarget.style.background = "#EEF0FD")}>
                    {tag}
                  </button>
                ))}
              </div>
              <div className="mt-auto pt-10 flex items-center gap-4">
                <button type="button" onClick={() => setStep(2)} data-testid="step3-back-btn"
                  className="inline-flex items-center gap-2 text-sm" style={{ color: "#94A3B8" }}>
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button type="button" disabled={!data.project.trim()} onClick={handleLaunch}
                  data-testid="launch-workspace-btn"
                  className="btn-primary text-base px-8 py-3.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none">
                  Enter Workspace <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Right: Gradient Panel ──────────────────────── */}
      <div className="hidden lg:block w-[420px] xl:w-[460px] shrink-0 overflow-hidden">
        <AnimatePresence mode="wait">
          {step === 1 && <motion.div key="p1" className="h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}><PanelLoopOverview /></motion.div>}
          {step === 2 && <motion.div key="p2" className="h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}><PanelRoleSelect selectedRole={data.role} /></motion.div>}
          {step === 3 && <motion.div key="p3" className="h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}><PanelWorkspacePreview name={data.name} role={data.role} /></motion.div>}
        </AnimatePresence>
      </div>
    </div>
  );
};
