"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

type RoleKey = "Founder" | "Product Manager" | "Engineer" | "Delivery Lead" | "Business Analyst";

const ROLES: RoleKey[] = ["Founder", "Product Manager", "Engineer", "Delivery Lead", "Business Analyst"];

const ROLE_TAGLINE: Record<RoleKey, string> = {
  "Founder":           "founder",
  "Product Manager":   "product manager",
  "Engineer":          "engineering",
  "Delivery Lead":     "delivery management",
  "Business Analyst":  "business analysis",
};

const LOOP = [
  { label: "Capture",   sub: "Idea captured" },
  { label: "Strategy",  sub: "Direction defined" },
  { label: "Draft",     sub: "PRD generated" },
  { label: "Breakdown", sub: "Stories created" },
  { label: "Build",     sub: "Code linked" },
  { label: "Verify",    sub: "Gaps detected" },
  { label: "Insight",   sub: "Progress reported" },
];

const TRACE = ["Idea", "PRD", "Story", "Code", "Test", "Validated"];

const PROJECT_TAGS = ["SaaS Product", "FinTech Platform", "Healthcare AI", "Internal Tool", "Mobile App"];

// ── Brand mark ────────────────────────────────────────────────────────────
function Logo({ size = 26 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-md"
      style={{ width: size, height: size, background: "var(--primary)" }}
    >
      <svg width={size * 0.42} height={size * 0.42} viewBox="0 0 14 14" fill="none">
        <path d="M2 7L5.5 10.5L12 3.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

// ── Right preview card ────────────────────────────────────────────────────
function PreviewCard({ activeStep }: { activeStep: 1 | 2 | 3 }) {
  // Highlight progresses with the wizard so the preview reflects state
  const activeIndex = activeStep === 1 ? 0 : activeStep === 2 ? 1 : 2;

  return (
    <div
      className="rounded-2xl p-7 lg:p-8"
      style={{ background: "var(--card)", border: "1px solid var(--border)" }}
    >
      <span className="eyebrow mb-1 block">Preview</span>
      <h3
        className="text-base font-semibold tracking-tight mb-6"
        style={{ color: "var(--text)" }}
      >
        Your delivery intelligence loop
      </h3>

      <ul className="space-y-3" data-testid="onboarding-loop">
        {LOOP.map((item, i) => {
          const isActive = i === activeIndex;
          const isDone = i < activeIndex;
          return (
            <li key={item.label} className="flex items-center gap-3">
              <span
                className="flex h-6 w-6 items-center justify-center rounded-md shrink-0 font-mono text-[11px] font-semibold"
                style={{
                  background: isActive ? "var(--primary-soft)" : "transparent",
                  color: isActive ? "var(--primary)" : isDone ? "var(--text)" : "var(--text-subtle)",
                  border: isActive ? "1px solid var(--primary-soft)" : "1px solid var(--border)",
                }}
              >
                {isDone ? <Check className="h-3 w-3" /> : String(i + 1).padStart(2, "0")}
              </span>
              <span
                className="text-sm flex-1 min-w-0"
                style={{ color: isActive ? "var(--text)" : "var(--text-muted)", fontWeight: isActive ? 600 : 500 }}
              >
                {item.label}
              </span>
              <span className="text-xs hidden sm:block" style={{ color: "var(--text-subtle)" }}>
                {item.sub}
              </span>
            </li>
          );
        })}
      </ul>

      {/* Traceability stepper */}
      <div className="mt-8 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
        <p className="eyebrow mb-3">Traceability</p>
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-2">
          {TRACE.map((t, i) => (
            <React.Fragment key={t}>
              <span
                className="font-mono text-xs"
                style={{
                  color: i === TRACE.length - 1 ? "var(--success)" : "var(--text-muted)",
                }}
              >
                {t}
              </span>
              {i < TRACE.length - 1 && (
                <span className="text-xs" style={{ color: "var(--text-subtle)" }}>→</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Launch screen ─────────────────────────────────────────────────────────
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

// ── Main ──────────────────────────────────────────────────────────────────
interface OnboardingProps {
  onComplete: (data: { name: string; role: string; project: string }) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [data, setData] = useState({ name: "", role: "" as RoleKey | "", project: "" });
  const [launching, setLaunching] = useState(false);
  const shortName = data.name.split(" ")[0] || "there";

  const canContinueStep1 = data.name.trim().length > 0 && !!data.role;
  const canContinueStep2 = data.project.trim().length > 0;

  const handleLaunch = useCallback(() => {
    if (!canContinueStep2) return;
    setStep(3);
    setTimeout(() => setLaunching(true), 600);
  }, [canContinueStep2]);

  useEffect(() => {
    if (!launching) return;
    const t = setTimeout(() => onComplete({ name: data.name, role: data.role, project: data.project }), 1200);
    return () => clearTimeout(t);
  }, [launching, data, onComplete]);

  if (launching) return <LaunchScreen role={data.role} />;

  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{ background: "var(--bg)" }}
      data-testid="onboarding-wrapper"
    >
      {/* ── Top bar ───────────────────────────────────────────── */}
      <header
        className="flex items-center justify-between px-6 py-5 lg:px-10"
      >
        <div className="flex items-center gap-2.5">
          <Logo size={26} />
          <span className="font-semibold text-sm tracking-tight" style={{ color: "var(--text)" }}>
            BuildCopilot
          </span>
        </div>
        <ThemeToggle />
      </header>

      {/* ── Centered split layout ─────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center px-6 py-10 lg:py-14">
        <div className="w-full max-w-[1080px] grid gap-6 lg:gap-10 lg:grid-cols-[minmax(0,520px)_minmax(0,1fr)] items-stretch">
          {/* ── Left: form card ─────────────────────────────── */}
          <section
            className="rounded-2xl p-7 sm:p-9"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
            data-testid="onboarding-card"
          >
            {/* Step indicator */}
            <div className="mb-7 flex items-center gap-3" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={3} data-testid="onboarding-progress">
              <div className="flex items-center gap-1.5">
                {([1, 2, 3] as const).map((s) => (
                  <span
                    key={s}
                    className="h-1 rounded-full transition-all duration-300"
                    style={{
                      width: s === step ? 24 : 12,
                      background: s <= step ? "var(--primary)" : "var(--border)",
                    }}
                  />
                ))}
              </div>
              <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                Step {step} of 3
              </span>
            </div>

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="s1"
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  data-testid="onboarding-step-1"
                >
                  <h1
                    className="text-2xl sm:text-[1.75rem] font-semibold tracking-tight leading-[1.15]"
                    style={{ color: "var(--text)" }}
                  >
                    Let&apos;s personalise your workspace.
                  </h1>
                  <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    BuildCopilot will tailor your AI guidance, delivery views, and validation workflow around you.
                  </p>

                  {/* Name */}
                  <div className="mt-7">
                    <label
                      htmlFor="onb-name"
                      className="block text-xs font-semibold mb-2"
                      style={{ color: "var(--text)" }}
                    >
                      Your name
                    </label>
                    <input
                      id="onb-name"
                      type="text"
                      autoFocus
                      value={data.name}
                      onChange={(e) => setData((d) => ({ ...d, name: e.target.value }))}
                      placeholder="e.g. Alex"
                      data-testid="input-your-name"
                      className="input"
                      style={{ fontSize: "0.9375rem" }}
                    />
                  </div>

                  {/* Role */}
                  <div className="mt-6">
                    <span
                      className="block text-xs font-semibold mb-2"
                      style={{ color: "var(--text)" }}
                    >
                      Your role
                    </span>
                    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Select your role">
                      {ROLES.map((role) => {
                        const isActive = data.role === role;
                        return (
                          <button
                            type="button"
                            key={role}
                            role="radio"
                            aria-checked={isActive}
                            onClick={() => setData((d) => ({ ...d, role }))}
                            data-testid={`role-pill-${role.toLowerCase().replace(/\s+/g, '-')}`}
                            className="rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors"
                            style={{
                              background: isActive ? "var(--primary-soft)" : "transparent",
                              color: isActive ? "var(--primary)" : "var(--text-muted)",
                              border: `1px solid ${isActive ? "var(--primary-soft)" : "var(--border)"}`,
                            }}
                            onMouseEnter={(e) => {
                              if (isActive) return;
                              e.currentTarget.style.color = "var(--text)";
                              e.currentTarget.style.borderColor = "var(--border-strong)";
                            }}
                            onMouseLeave={(e) => {
                              if (isActive) return;
                              e.currentTarget.style.color = "var(--text-muted)";
                              e.currentTarget.style.borderColor = "var(--border)";
                            }}
                          >
                            {role}
                          </button>
                        );
                      })}
                    </div>

                    {/* Contextual message */}
                    <div className="h-5 mt-3">
                      <AnimatePresence mode="wait">
                        {data.role && (
                          <motion.p
                            key={data.role}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.2 }}
                            className="text-xs"
                            style={{ color: "var(--text-muted)" }}
                            data-testid="role-context-message"
                          >
                            We&apos;ll tailor your workspace for {ROLE_TAGLINE[data.role as RoleKey]} workflows.
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="mt-8">
                    <button
                      type="button"
                      disabled={!canContinueStep1}
                      onClick={() => setStep(2)}
                      data-testid="step1-continue-btn"
                      className="btn-primary w-full justify-center"
                      style={{ padding: "0.75rem 1.25rem", fontSize: "0.9375rem" }}
                    >
                      Continue <ArrowRight className="h-4 w-4" />
                    </button>
                    <p className="mt-3 text-center text-xs" style={{ color: "var(--text-subtle)" }}>
                      Takes less than 30 seconds.
                    </p>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="s2"
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  data-testid="onboarding-step-2"
                >
                  <h1
                    className="text-2xl sm:text-[1.75rem] font-semibold tracking-tight leading-[1.15]"
                    style={{ color: "var(--text)" }}
                  >
                    What are we building, {shortName}?
                  </h1>
                  <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    Name your first project. You can change this anytime.
                  </p>

                  <div className="mt-7">
                    <label
                      htmlFor="onb-project"
                      className="block text-xs font-semibold mb-2"
                      style={{ color: "var(--text)" }}
                    >
                      Project name
                    </label>
                    <input
                      id="onb-project"
                      type="text"
                      autoFocus
                      value={data.project}
                      onChange={(e) => setData((d) => ({ ...d, project: e.target.value }))}
                      onKeyDown={(e) => e.key === "Enter" && canContinueStep2 && handleLaunch()}
                      placeholder="e.g. AI Delivery OS"
                      data-testid="input-project-name"
                      className="input"
                      style={{ fontSize: "0.9375rem" }}
                    />

                    <div className="mt-3 flex flex-wrap gap-2">
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
                  </div>

                  <div className="mt-8 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      data-testid="step2-back-btn"
                      className="btn-ghost inline-flex items-center"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
                    </button>
                    <button
                      type="button"
                      disabled={!canContinueStep2}
                      onClick={handleLaunch}
                      data-testid="launch-workspace-btn"
                      className="btn-primary flex-1 justify-center"
                      style={{ padding: "0.75rem 1.25rem", fontSize: "0.9375rem" }}
                    >
                      Enter workspace <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="s3"
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  data-testid="onboarding-step-3"
                >
                  <h1
                    className="text-2xl sm:text-[1.75rem] font-semibold tracking-tight leading-[1.15]"
                    style={{ color: "var(--text)" }}
                  >
                    All set, {shortName}.
                  </h1>
                  <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    Spinning up your {data.project} workspace, tuned for {ROLE_TAGLINE[data.role as RoleKey]}.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* ── Right: preview card ─────────────────────────── */}
          <aside className="hidden lg:flex items-center" data-testid="onboarding-preview">
            <div className="w-full">
              <PreviewCard activeStep={step} />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};
