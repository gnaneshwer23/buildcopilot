"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight, CheckCircle2, AlertCircle,
  GitBranch, Code2, FileText, Target,
  Lightbulb, ShieldCheck, BarChart3, XCircle,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

interface LandingPageProps { onGetStarted: () => void; }

// ── Pipeline stages ──────────────────────────────────────────────────────────
const STAGES: Array<{ id: string; label: string; output: string; icon: React.ElementType }> = [
  { id: "capture",   label: "Capture",   output: "Structured idea",  icon: Lightbulb },
  { id: "strategy",  label: "Strategy",  output: "Clear direction",  icon: Target },
  { id: "draft",     label: "Draft",     output: "PRD",              icon: FileText },
  { id: "breakdown", label: "Breakdown", output: "Stories",          icon: GitBranch },
  { id: "build",     label: "Build",     output: "Code",             icon: Code2 },
  { id: "verify",    label: "Verify",    output: "Proof",            icon: ShieldCheck },
  { id: "insight",   label: "Insight",   output: "Decisions",        icon: BarChart3 },
];

// ── Wrapper ──────────────────────────────────────────────────────────────────
function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 12 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function Logo({ size = 28 }: { size?: number }) {
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

// ── Nav ──────────────────────────────────────────────────────────────────────
function Nav({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <header
      className="sticky top-0 z-50"
      style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}
    >
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-2.5">
          <Logo size={26} />
          <span className="font-semibold text-sm tracking-tight" style={{ color: "var(--text)" }}>
            BuildCopilot
          </span>
        </div>
        <ul className="hidden md:flex items-center gap-7 text-sm" style={{ color: "var(--text-muted)" }}>
          {[["#problem", "Problem"], ["#solution", "Solution"], ["#how-it-works", "How it works"], ["#trace", "Traceability"]].map(([h, l]) => (
            <li key={h}>
              <a
                href={h}
                className="transition-colors"
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
              >
                {l}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/login"
            data-testid="nav-signin-link"
            className="hidden sm:inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            Sign in
          </Link>
          <button
            type="button"
            onClick={onGetStarted}
            data-testid="nav-start-btn"
            className="btn-primary"
          >
            Get started <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </nav>
    </header>
  );
}

// ── Section wrapper ──────────────────────────────────────────────────────────
function Section({ id, children, className = "" }: { id?: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={`mx-auto max-w-6xl px-6 py-24 ${className}`}>
      {children}
    </section>
  );
}

// ── Hero pipeline preview (one clean system visual on the right) ────────────
function HeroPreview() {
  return (
    <div
      className="rounded-2xl p-6 lg:p-7"
      style={{ background: "var(--card)", border: "1px solid var(--border)" }}
      data-testid="hero-pipeline-preview"
    >
      <div className="flex items-center justify-between mb-5">
        <span className="eyebrow">Delivery loop</span>
        <span className="status-pill primary">Live</span>
      </div>
      <ol className="space-y-2.5">
        {STAGES.map((stage, i) => {
          const Icon = stage.icon;
          const isActive = i === 1; // Strategy step active
          const isDone = i < 1;
          return (
            <li key={stage.id} className="flex items-center gap-3">
              <span
                className="flex h-6 w-6 items-center justify-center rounded-md shrink-0 font-mono text-[11px] font-semibold"
                style={{
                  background: isActive ? "var(--primary-soft)" : "transparent",
                  color: isActive ? "var(--primary)" : isDone ? "var(--text)" : "var(--text-subtle)",
                  border: `1px solid ${isActive ? "var(--primary-soft)" : "var(--border)"}`,
                }}
              >
                {isDone ? <CheckCircle2 className="h-3 w-3" /> : String(i + 1).padStart(2, "0")}
              </span>
              <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--text-subtle)" }} />
              <span
                className="text-sm flex-1 min-w-0"
                style={{
                  color: isActive ? "var(--text)" : "var(--text-muted)",
                  fontWeight: isActive ? 600 : 500,
                }}
              >
                {stage.label}
              </span>
              <span className="text-xs font-mono hidden sm:inline" style={{ color: "var(--text-subtle)" }}>
                {stage.output}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────
function Hero({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <section className="relative overflow-hidden">
      {/* Subtle radial — hero only */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-0"
        style={{
          height: 640,
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, var(--primary-soft) 0%, transparent 70%)",
          opacity: 0.7,
        }}
      />
      <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-28 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 items-center">
          <div>
            <FadeUp>
              <span className="eyebrow mb-6 block">AI delivery intelligence</span>
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-tight"
                style={{ color: "var(--text)" }}
              >
                Ship the right product.<br />
                <span style={{ color: "var(--text-muted)" }}>Not just more code.</span>
              </h1>
              <p
                className="mt-6 max-w-xl text-base leading-relaxed"
                style={{ color: "var(--text-muted)" }}
              >
                BuildCopilot connects idea, strategy, requirements, code and validation in one continuous,
                traceable loop — so your team always knows what&apos;s built, what&apos;s missing, and what&apos;s
                ready to ship.
              </p>
            </FadeUp>

            <FadeUp delay={0.1}>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onGetStarted}
                  data-testid="hero-launch-btn"
                  className="btn-primary"
                  style={{ padding: "0.75rem 1.5rem", fontSize: "0.9375rem" }}
                >
                  Start building
                  <ArrowRight className="h-4 w-4" />
                </button>
                <a
                  href="#how-it-works"
                  data-testid="hero-see-how-link"
                  className="btn-secondary"
                  style={{ padding: "0.75rem 1.5rem", fontSize: "0.9375rem" }}
                >
                  See how it works
                </a>
              </div>
            </FadeUp>

            <FadeUp delay={0.2}>
              <ul className="mt-10 grid gap-2 sm:grid-cols-2">
                {[
                  "Idea → PRD in minutes",
                  "Requirement → code traceability",
                  "Gaps detected automatically",
                  "Validation before release",
                ].map((p) => (
                  <li key={p} className="flex items-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--success)" }} />
                    {p}
                  </li>
                ))}
              </ul>
            </FadeUp>
          </div>

          <FadeUp delay={0.15}>
            <HeroPreview />
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

// ── Problem section ──────────────────────────────────────────────────────────
function Problem() {
  const items = [
    { label: "Strategy lives in documents",   sub: "Confluence, Notion, Google Docs" },
    { label: "Requirements live in PRDs",     sub: "Disconnected from development" },
    { label: "Stories live in Jira",          sub: "No link to original intent" },
    { label: "Code lives in GitHub",          sub: "No trace to requirements" },
    { label: "Tests live somewhere else",     sub: "Coverage is a mystery" },
  ];
  return (
    <div id="problem" className="surface-section">
      <Section>
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <FadeUp>
            <span className="eyebrow mb-5 block">The problem</span>
            <h2
              className="text-3xl sm:text-4xl font-semibold tracking-tight leading-[1.1]"
              style={{ color: "var(--text)" }}
            >
              Your product is scattered across tools.
            </h2>
            <p className="mt-5 text-base leading-relaxed max-w-md" style={{ color: "var(--text-muted)" }}>
              No one knows if what shipped matches what was planned. The chain breaks at every handoff.
            </p>
          </FadeUp>

          <FadeUp delay={0.1}>
            <ul className="divide-y" style={{ borderColor: "var(--border)" }}>
              {items.map((it, i) => (
                <li
                  key={it.label}
                  className="flex items-start gap-4 py-4"
                  style={{ borderTop: i === 0 ? "1px solid var(--border)" : undefined, borderBottom: i === items.length - 1 ? "1px solid var(--border)" : "1px solid var(--border)" }}
                >
                  <span
                    className="mt-1.5 h-1.5 w-1.5 rounded-full shrink-0"
                    style={{ background: "var(--error)" }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{it.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-subtle)" }}>{it.sub}</p>
                  </div>
                </li>
              ))}
            </ul>
          </FadeUp>
        </div>
      </Section>
    </div>
  );
}

// ── Solution / Pillars ───────────────────────────────────────────────────────
function Solution() {
  const pillars = [
    { title: "Plan in minutes",        desc: "Convert raw ideas into structured product direction. No blank-page paralysis.",       icon: Lightbulb },
    { title: "Requirements with proof", desc: "Every requirement links to stories, code and tests — with full lineage.",            icon: GitBranch },
    { title: "Validation before release", desc: "Gaps surface before users do. Always know what's covered and what's at risk.",      icon: ShieldCheck },
  ];
  return (
    <Section id="solution">
      <FadeUp>
        <span className="eyebrow mb-5 block">The solution</span>
        <h2
          className="text-3xl sm:text-4xl font-semibold tracking-tight leading-[1.1] max-w-2xl"
          style={{ color: "var(--text)" }}
        >
          From idea to validated delivery, in one system.
        </h2>
      </FadeUp>

      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {pillars.map(({ title, desc, icon: Icon }, i) => (
          <FadeUp key={title} delay={i * 0.06}>
            <div
              className="surface-card p-6 h-full"
            >
              <Icon className="h-5 w-5 mb-5" style={{ color: "var(--primary)" }} />
              <h3 className="text-base font-semibold mb-2" style={{ color: "var(--text)" }}>{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{desc}</p>
            </div>
          </FadeUp>
        ))}
      </div>
    </Section>
  );
}

// ── How it works (horizontal flow) ──────────────────────────────────────────
function HowItWorks() {
  return (
    <div id="how-it-works" className="surface-section">
      <Section>
        <FadeUp>
          <span className="eyebrow mb-5 block">How it works</span>
          <h2
            className="text-3xl sm:text-4xl font-semibold tracking-tight leading-[1.1] max-w-2xl"
            style={{ color: "var(--text)" }}
          >
            One system. Seven steps. Full clarity.
          </h2>
          <p className="mt-5 text-base leading-relaxed max-w-xl" style={{ color: "var(--text-muted)" }}>
            Each stage produces a clear output. Every output feeds the next stage automatically.
          </p>
        </FadeUp>

        <FadeUp delay={0.1}>
          <div className="relative mt-14">
            {/* Connector line behind icons */}
            <div
              aria-hidden
              className="absolute left-0 right-0 top-5 hidden md:block"
              style={{ height: 1, background: "var(--border)" }}
            />
            <ol className="relative grid grid-cols-2 gap-y-10 gap-x-4 sm:grid-cols-3 md:grid-cols-7 md:gap-x-2">
              {STAGES.map((stage, i) => {
                const Icon = stage.icon;
                return (
                  <li key={stage.id} className="flex flex-col items-center text-center">
                    <span
                      className="relative z-10 flex h-10 w-10 items-center justify-center rounded-lg shrink-0"
                      style={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <Icon className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
                    </span>
                    <span
                      className="mt-4 text-[10px] font-mono font-semibold tracking-wider"
                      style={{ color: "var(--text-subtle)" }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="mt-1 text-sm font-semibold" style={{ color: "var(--text)" }}>
                      {stage.label}
                    </span>
                    <span className="mt-1 text-xs" style={{ color: "var(--text-subtle)" }}>
                      {stage.output}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        </FadeUp>
      </Section>
    </div>
  );
}

// ── Traceability table ───────────────────────────────────────────────────────
function Traceability() {
  const rows = [
    { req: "User Login",  story: "US-1", code: "auth.ts",     test: "test_auth.ts",  status: "Validated" as const },
    { req: "Onboarding",  story: "US-2", code: "setup.ts",    test: "test_setup.ts", status: "Validated" as const },
    { req: "Payment",     story: "US-3", code: "payment.ts",  test: null,            status: "Gap" as const },
    { req: "Dashboard",   story: "US-4", code: "dash.tsx",    test: null,            status: "Gap" as const },
    { req: "Export CSV",  story: "US-5", code: "export.ts",   test: "test_exp.ts",   status: "Validated" as const },
    { req: "Notifications", story: "US-6", code: "notify.ts", test: "test_notif.ts", status: "Validated" as const },
  ];
  return (
    <Section id="trace">
      <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 items-start">
        <FadeUp>
          <span className="eyebrow mb-5 block">Traceability</span>
          <h2
            className="text-3xl sm:text-4xl font-semibold tracking-tight leading-[1.1]"
            style={{ color: "var(--text)" }}
          >
            Most tools manage work. BuildCopilot proves it.
          </h2>
          <p className="mt-5 text-base leading-relaxed max-w-md" style={{ color: "var(--text-muted)" }}>
            Every requirement has a story. Every story has code. Every piece of code has a test. Gaps
            are visible at a glance.
          </p>
          <ul className="mt-8 space-y-3">
            {[
              "Requirement → Story",
              "Story → Code",
              "Code → Test",
              "Feature → Validation",
            ].map((label) => (
              <li key={label} className="flex items-center gap-3 text-sm" style={{ color: "var(--text)" }}>
                <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: "var(--success)" }} />
                {label}
              </li>
            ))}
          </ul>
        </FadeUp>

        <FadeUp delay={0.08}>
          <div className="surface-card overflow-hidden p-0">
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>Traceability matrix</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-subtle)" }}>Real-time delivery proof</p>
              </div>
              <span className="status-pill primary">Live</span>
            </div>
            <div className="overflow-x-auto">
              <table className="l-table">
                <thead>
                  <tr>
                    {["Requirement", "Story", "Code", "Test", "Status"].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.req}>
                      <td style={{ fontWeight: 500 }}>{row.req}</td>
                      <td><span className="font-mono text-xs" style={{ color: "var(--primary)" }}>{row.story}</span></td>
                      <td><span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>{row.code}</span></td>
                      <td>
                        {row.test ? (
                          <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>{row.test}</span>
                        ) : (
                          <span className="font-mono text-xs" style={{ color: "var(--error)" }}>missing</span>
                        )}
                      </td>
                      <td>
                        {row.status === "Validated" ? (
                          <span className="status-pill success">
                            <CheckCircle2 className="h-3 w-3" /> Validated
                          </span>
                        ) : (
                          <span className="status-pill error">
                            <XCircle className="h-3 w-3" /> Gap
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </FadeUp>
      </div>
    </Section>
  );
}

// ── AI section ───────────────────────────────────────────────────────────────
function AI() {
  return (
    <div className="surface-section">
      <Section>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-start">
          <FadeUp>
            <span className="eyebrow mb-5 block">AI Copilot</span>
            <h2
              className="text-3xl sm:text-4xl font-semibold tracking-tight leading-[1.1]"
              style={{ color: "var(--text)" }}
            >
              Your AI copilot for product delivery.
            </h2>
            <ul className="mt-8 space-y-4">
              {[
                "Generate PRDs from rough ideas in seconds",
                "Create user stories with acceptance criteria",
                "Detect missing links in your delivery chain",
                "Highlight risks before they become blockers",
                "Summarise delivery status for stakeholders",
              ].map((text) => (
                <li key={text} className="flex items-start gap-3 text-sm" style={{ color: "var(--text)" }}>
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "var(--primary)" }} />
                  {text}
                </li>
              ))}
            </ul>
          </FadeUp>

          <FadeUp delay={0.08}>
            <div className="surface-card overflow-hidden p-0">
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
                <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>BuildCopilot AI</span>
                <span className="status-pill success">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--success)" }} /> Live
                </span>
              </div>
              <ul className="divide-y" style={{ borderColor: "var(--border)" }}>
                {[
                  { type: "warn",    label: "Story US-3 has no test",          sub: "Payment flow untested → high risk" },
                  { type: "warn",    label: "REQ-12 not linked to code",       sub: "Dashboard export may not be implemented" },
                  { type: "error",   label: "3 requirements have no stories",   sub: "Breakdown incomplete for current sprint" },
                  { type: "success", label: "Auth flow fully traced",           sub: "REQ-1 → US-1 → auth.ts → test_auth.ts" },
                  { type: "success", label: "Onboarding 100% covered",          sub: "All stories, code, and tests linked" },
                ].map((row) => (
                  <li key={row.label} className="flex items-start gap-3 px-4 py-3" style={{ borderTop: "1px solid var(--border)" }}>
                    {row.type === "success" && <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "var(--success)" }} />}
                    {row.type === "warn"    && <AlertCircle  className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "var(--warn)" }} />}
                    {row.type === "error"   && <XCircle      className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "var(--error)" }} />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{row.label}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-subtle)" }}>{row.sub}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </FadeUp>
        </div>
      </Section>
    </div>
  );
}

// ── Outcomes ─────────────────────────────────────────────────────────────────
function Outcomes() {
  const items = [
    { value: "<10 min", label: "Idea to PRD",           sub: "Not hours. Minutes." },
    { value: "100%",    label: "Traceability coverage", sub: "Every requirement linked" },
    { value: "100%",    label: "Gap detection",         sub: "Before users find them" },
    { value: "24/7",    label: "Delivery visibility",   sub: "Real-time insight" },
  ];
  return (
    <Section>
      <FadeUp>
        <span className="eyebrow mb-5 block">Outcomes</span>
        <h2
          className="text-3xl sm:text-4xl font-semibold tracking-tight leading-[1.1] max-w-2xl"
          style={{ color: "var(--text)" }}
        >
          Real results from day one.
        </h2>
      </FadeUp>

      <div className="mt-12 grid gap-px overflow-hidden rounded-xl sm:grid-cols-2 lg:grid-cols-4" style={{ background: "var(--border)", border: "1px solid var(--border)" }}>
        {items.map((m, i) => (
          <FadeUp key={m.label} delay={i * 0.05}>
            <div className="p-6" style={{ background: "var(--card)" }}>
              <p className="text-3xl font-semibold tracking-tight" style={{ color: "var(--text)" }}>{m.value}</p>
              <p className="mt-3 text-sm font-medium" style={{ color: "var(--text)" }}>{m.label}</p>
              <p className="mt-1 text-xs" style={{ color: "var(--text-subtle)" }}>{m.sub}</p>
            </div>
          </FadeUp>
        ))}
      </div>
    </Section>
  );
}

// ── Built-for ────────────────────────────────────────────────────────────────
function BuiltFor() {
  const items = [
    { label: "Product Managers",  desc: "Turn ideas into traceable PRDs without blank-page paralysis." },
    { label: "Engineering Leads", desc: "See exactly which requirements map to code, tests and PRs." },
    { label: "Founders",          desc: "Ship with confidence. Build the right thing, prove it, then release." },
    { label: "Delivery Teams",    desc: "Real-time visibility across the whole chain. No more status meetings." },
  ];
  return (
    <div className="surface-section">
      <Section>
        <FadeUp>
          <span className="eyebrow mb-5 block">Built for</span>
          <h2
            className="text-3xl sm:text-4xl font-semibold tracking-tight leading-[1.1] max-w-2xl"
            style={{ color: "var(--text)" }}
          >
            Teams that ship.
          </h2>
        </FadeUp>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it, i) => (
            <FadeUp key={it.label} delay={i * 0.05}>
              <div className="surface-card p-6 h-full">
                <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{it.label}</p>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{it.desc}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </Section>
    </div>
  );
}

// ── Final CTA ────────────────────────────────────────────────────────────────
function FinalCTA({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <Section className="!py-28">
      <FadeUp>
        <div className="max-w-2xl">
          <h2
            className="text-3xl sm:text-4xl font-semibold tracking-tight leading-[1.1]"
            style={{ color: "var(--text)" }}
          >
            Start building with clarity and proof.
          </h2>
          <p className="mt-5 text-base leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Eliminate delivery blind spots from day one.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onGetStarted}
              data-testid="cta-start-btn"
              className="btn-primary"
              style={{ padding: "0.75rem 1.5rem", fontSize: "0.9375rem" }}
            >
              Start your workspace <ArrowRight className="h-4 w-4" />
            </button>
            <Link
              href="/login"
              data-testid="cta-signin-link"
              className="btn-secondary"
              style={{ padding: "0.75rem 1.5rem", fontSize: "0.9375rem" }}
            >
              Sign in
            </Link>
          </div>
        </div>
      </FadeUp>
    </Section>
  );
}

// ── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--border)", background: "var(--bg)" }}>
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <Logo size={22} />
          <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>BuildCopilot</span>
        </div>
        <p className="text-xs" style={{ color: "var(--text-subtle)" }}>
          From idea to validated delivery. One continuous loop.
        </p>
      </div>
    </footer>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100dvh" }}>
      <Nav onGetStarted={onGetStarted} />
      <Hero onGetStarted={onGetStarted} />
      <Problem />
      <Solution />
      <HowItWorks />
      <Traceability />
      <AI />
      <Outcomes />
      <BuiltFor />
      <FinalCTA onGetStarted={onGetStarted} />
      <Footer />
    </div>
  );
};
