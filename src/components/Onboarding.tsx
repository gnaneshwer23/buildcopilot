"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

type RoleKey = "Product Manager" | "Architect / Tech Lead" | "Business Analyst" | "Delivery Manager";

const MODULES = [
  "Capture", "Strategy", "Draft", "Breakdown", "Build", "Verify", "Insight",
] as const;

const ROLES: Array<{ id: RoleKey; tagline: string; highlights: string[] }> = [
  {
    id: "Product Manager",
    tagline: "Turn ideas into PRDs in minutes.",
    highlights: ["AI-powered PRD, BRD & FRD", "Now / Next / Later roadmap", "Stakeholder workflows", "Market positioning"],
  },
  {
    id: "Architect / Tech Lead",
    tagline: "Auto-generate architecture from requirements.",
    highlights: ["Mermaid architecture diagrams", "Tech spec generation", "Code traceability", "NFR tracking"],
  },
  {
    id: "Business Analyst",
    tagline: "Requirements that trace to tests.",
    highlights: ["FRD / BRD with AC", "User story mapping", "Traceability matrix", "Gap detection"],
  },
  {
    id: "Delivery Manager",
    tagline: "See sprint risks before they block.",
    highlights: ["Sprint velocity tracking", "AI risk prediction", "Jira / Linear sync", "Executive reports"],
  },
];

const PROJECT_TAGS = ["Healthcare AI", "FinTech Platform", "SaaS Product", "Internal Tool", "Mobile App", "E-commerce"];

function Logo({ size = 26 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-md"
      style={{ width: size, height: size, background: "var(--primary)" }}
    >
      <svg width={size * 0.42} height={size * 0.42} viewBox="0 0 14 14" fill="none">
        <path d="M2 7L5.5 10.5L12 3.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

// ── Side panel content (calm, monochrome, structured) ──────────────────────
function SidePanel({ step, name, role }: { step: 1 | 2 | 3; name: string; role: RoleKey | "" }) {
  return (
    <div
      className="hidden lg:flex h-full flex-col px-10 py-12 justify-between"
      style={{ background: "var(--surface)", borderLeft: "1px solid var(--border)" }}
    >
      <div>
        <span className="eyebrow mb-8 block">Intelligence loop</span>
        <ol className="space-y-px overflow-hidden rounded-lg" style={{ background: "var(--border)", border: "1px solid var(--border)" }}>
          {MODULES.map((label, i) => (
            <li
              key={label}
              className="flex items-center gap-3 px-4 py-3"
              style={{ background: "var(--card)" }}
            >
              <span
                className="flex h-6 w-6 items-center justify-center rounded-md font-mono text-xs font-semibold shrink-0"
                style={{
                  background: i === 0 ? "var(--primary-soft)" : "transparent",
                  color: i === 0 ? "var(--primary)" : "var(--text-subtle)",
                  border: i === 0 ? "none" : "1px solid var(--border)",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-sm font-medium" style={{ color: "var(--text)" }}>{label}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="surface-card p-5">
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
          {step === 1 && "Every layer auto-links to the next. Idea → validated code, fully traced."}
          {step === 2 && (role
            ? `BuildCopilot tunes its AI guidance for ${role}.`
            : "Select your role so we can tune AI guidance to how you actually work.")}
          {step === 3 && (name
            ? `Welcome, ${name.split(" ")[0]}. Name your first project to enter the workspace.`
            : "Name your first project to enter the workspace.")}
        </p>
      </div>
    </div>
  );
}

// ── Launch (post-submit) ───────────────────────────────────────────────────
function LaunchScreen({ role }: { role: string }) {
  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center gap-6"
      style={{ background: "var(--bg)" }}
    >
      <Logo size={36} />
      <div className="text-center">
        <p className="text-base font-semibold tracking-tight" style={{ color: "var(--text)" }}>
          Configuring your workspace…
        </p>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          AI tuned for {role || "your role"}
        </p>
      </div>
      <div className="w-48 h-1 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
        <div className="h-full animate-load-bar" style={{ background: "var(--primary)" }} />
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
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
    const t = setTimeout(() => onComplete({ name: data.name, role: data.role, project: data.project }), 1200);
    return () => clearTimeout(t);
  }, [launching, data, onComplete]);

  if (launching) return <LaunchScreen role={data.role} />;

  return (
    <div
      className="min-h-dvh flex"
      style={{ background: "var(--bg)" }}
      data-testid="onboarding-wrapper"
    >
      {/* Form panel */}
      <div className="flex-1 flex flex-col px-8 py-10 lg:px-14 lg:py-14 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-14">
          <div className="flex items-center gap-2.5">
            <Logo size={26} />
            <span className="font-semibold text-sm tracking-tight" style={{ color: "var(--text)" }}>BuildCopilot</span>
          </div>
          <ThemeToggle />
        </div>

        {/* Step progress */}
        <div className="flex items-center gap-2 mb-12" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={3} data-testid="onboarding-progress">
          {([1, 2, 3] as const).map((s) => (
            <div
              key={s}
              className="h-1 rounded-full transition-all duration-300"
              style={{
                width: s === step ? 32 : 16,
                background: s <= step ? "var(--primary)" : "var(--border)",
              }}
            />
          ))}
          <span className="ml-3 text-xs font-mono" style={{ color: "var(--text-muted)" }}>{step} / 3</span>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="s1"
              className="flex-1 flex flex-col max-w-lg"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              data-testid="onboarding-step-1"
            >
              <h2
                className="text-3xl lg:text-4xl font-semibold tracking-tight leading-[1.1] mb-3"
                style={{ color: "var(--text)" }}
              >
                What should we call you?
              </h2>
              <p className="mb-10 text-sm" style={{ color: "var(--text-muted)" }}>
                We&apos;ll personalise your workspace and AI guidance.
              </p>
              <input
                type="text"
                autoFocus
                value={data.name}
                onChange={(e) => setData((d) => ({ ...d, name: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && data.name.trim() && setStep(2)}
                placeholder="Your name"
                data-testid="input-your-name"
                className="input"
                style={{ fontSize: "1rem", padding: "0.875rem 1rem" }}
              />
              <div className="mt-auto pt-10">
                <button
                  type="button"
                  disabled={!data.name.trim()}
                  onClick={() => setStep(2)}
                  data-testid="step1-continue-btn"
                  className="btn-primary"
                  style={{ padding: "0.75rem 1.5rem" }}
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="s2"
              className="flex-1 flex flex-col"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              data-testid="onboarding-step-2"
            >
              <h2
                className="text-3xl lg:text-4xl font-semibold tracking-tight leading-[1.1] mb-3"
                style={{ color: "var(--text)" }}
              >
                What&apos;s your primary role?
              </h2>
              <p className="mb-10 text-sm" style={{ color: "var(--text-muted)" }}>
                BuildCopilot tailors AI suggestions to how you work.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="group">
                {ROLES.map((role) => {
                  const isActive = data.role === role.id;
                  return (
                    <button
                      type="button"
                      key={role.id}
                      aria-pressed={isActive}
                      onClick={() => { setData((d) => ({ ...d, role: role.id })); setTimeout(() => setStep(3), 160); }}
                      data-testid={`role-btn-${role.id.toLowerCase().replace(/[\s/]+/g, '-')}`}
                      className="surface-card p-5 text-left transition-all"
                      style={{
                        borderColor: isActive ? "var(--primary)" : "var(--border)",
                        background: isActive ? "var(--primary-soft)" : "var(--card)",
                      }}
                    >
                      <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{role.id}</p>
                      <p className="text-xs mt-1.5 leading-relaxed" style={{ color: "var(--text-muted)" }}>{role.tagline}</p>
                    </button>
                  );
                })}
              </div>
              <div className="mt-auto pt-8">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  data-testid="step2-back-btn"
                  className="btn-ghost inline-flex items-center"
                >
                  <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="s3"
              className="flex-1 flex flex-col max-w-lg"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              data-testid="onboarding-step-3"
            >
              <h2
                className="text-3xl lg:text-4xl font-semibold tracking-tight leading-[1.1] mb-3"
                style={{ color: "var(--text)" }}
              >
                What are we building, {shortName}?
              </h2>
              <p className="mb-10 text-sm" style={{ color: "var(--text-muted)" }}>
                Name your first project. You can change this anytime.
              </p>
              <input
                type="text"
                autoFocus
                value={data.project}
                onChange={(e) => setData((d) => ({ ...d, project: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && data.project.trim() && handleLaunch()}
                placeholder="e.g. AI Delivery OS"
                data-testid="input-project-name"
                className="input"
                style={{ fontSize: "1rem", padding: "0.875rem 1rem" }}
              />
              <div className="mt-4 flex flex-wrap gap-2">
                {PROJECT_TAGS.map((tag) => (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => setData((d) => ({ ...d, project: tag }))}
                    data-testid={`tag-${tag.toLowerCase().replace(/\s+/g, '-')}`}
                    className="rounded-full px-3 py-1 text-xs font-medium transition-colors"
                    style={{
                      background: "transparent",
                      color: "var(--text-muted)",
                      border: "1px solid var(--border)",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.borderColor = "var(--border-strong)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.borderColor = "var(--border)"; }}
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
                  className="btn-ghost inline-flex items-center"
                >
                  <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
                </button>
                <button
                  type="button"
                  disabled={!data.project.trim()}
                  onClick={handleLaunch}
                  data-testid="launch-workspace-btn"
                  className="btn-primary"
                  style={{ padding: "0.75rem 1.5rem" }}
                >
                  Enter workspace <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Side panel */}
      <div className="hidden lg:block w-[400px] xl:w-[440px] shrink-0">
        <SidePanel step={step} name={data.name} role={data.role} />
      </div>
    </div>
  );
};
