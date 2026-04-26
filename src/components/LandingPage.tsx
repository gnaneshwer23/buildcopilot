"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight, ArrowUpRight, CheckCircle2, AlertTriangle, XCircle,
  Lightbulb, Target, FileText, GitBranch, Code2, ShieldCheck, BarChart3,
  Sparkles, Zap, Activity, Cpu, Brain, RefreshCcw, Network, Radar, Workflow,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

// ── Pipeline stages ──────────────────────────────────────────────────────────
const STAGES = [
  { id: "capture",   label: "Capture",   output: "Structured idea",  icon: Lightbulb   },
  { id: "strategy",  label: "Strategy",  output: "Clear direction",  icon: Target      },
  { id: "draft",     label: "Draft",     output: "PRD",              icon: FileText    },
  { id: "breakdown", label: "Breakdown", output: "Stories",          icon: GitBranch   },
  { id: "build",     label: "Build",     output: "Code",             icon: Code2       },
  { id: "verify",    label: "Verify",    output: "Proof",            icon: ShieldCheck },
  { id: "insight",   label: "Insight",   output: "Decisions",        icon: BarChart3   },
];

// ── Reusable wrapper ─────────────────────────────────────────────────────────
function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
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

// ── Crystal glass nav ────────────────────────────────────────────────────────
function Nav({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: "color-mix(in oklab, var(--bg) 70%, transparent)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-2.5">
          <Logo size={28} />
          <span className="font-semibold text-[15px] tracking-tight" style={{ color: "var(--text)" }}>
            BuildCopilot
          </span>
        </div>
        <ul className="hidden md:flex items-center gap-8 text-sm" style={{ color: "var(--text-muted)" }}>
          {[["#problem", "Problem"], ["#bento", "Platform"], ["#loop", "The Loop"], ["#trace", "Traceability"]].map(([h, l]) => (
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
            data-testid="nav-book-demo"
            className="btn-primary"
          >
            Get started <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.8} />
          </button>
        </div>
      </nav>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO CENTERPIECE — Traceability Constellation
// ─────────────────────────────────────────────────────────────────────────────
function Constellation() {
  // 7 nodes laid out as an asymmetric graph (paired pipeline stages)
  // SVG viewBox: 600 x 380
  const nodes = [
    { id: "idea",     x:  60, y: 200, label: "Idea",        icon: Lightbulb },
    { id: "strategy", x: 180, y:  90, label: "Strategy",    icon: Target },
    { id: "prd",      x: 180, y: 310, label: "PRD",         icon: FileText },
    { id: "story",    x: 320, y: 200, label: "Story",       icon: GitBranch },
    { id: "code",     x: 460, y:  90, label: "Code",        icon: Code2,        warn: true },
    { id: "test",     x: 460, y: 310, label: "Test",        icon: ShieldCheck },
    { id: "ship",     x: 560, y: 200, label: "Validated",   icon: CheckCircle2, success: true },
  ];

  // Curved connections (SVG path d attributes)
  const links = [
    { from: "idea",     to: "strategy", d: "M 60 200 Q 110 130, 180 90"    },
    { from: "idea",     to: "prd",      d: "M 60 200 Q 110 270, 180 310"   },
    { from: "strategy", to: "story",    d: "M 180 90 Q 245 140, 320 200"   },
    { from: "prd",      to: "story",    d: "M 180 310 Q 245 260, 320 200"  },
    { from: "story",    to: "code",     d: "M 320 200 Q 385 140, 460 90"   },
    { from: "story",    to: "test",     d: "M 320 200 Q 385 260, 460 310"  },
    { from: "code",     to: "ship",     d: "M 460 90 Q 510 130, 560 200"   },
    { from: "test",     to: "ship",     d: "M 460 310 Q 510 270, 560 200"  },
  ];

  // Travelling pulse along the main "happy path": Idea -> Strategy -> Story -> Code -> Validated
  const happyPathId = "happy-path";
  const happyPathD =
    "M 60 200 Q 110 130, 180 90 Q 245 140, 320 200 Q 385 140, 460 90 Q 510 130, 560 200";

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden"
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        boxShadow: "0 0 0 1px var(--border) inset",
      }}
      data-testid="hero-constellation"
    >
      {/* Soft inner glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, var(--primary-soft), transparent 70%)",
          opacity: 0.6,
        }}
      />

      {/* Header strip */}
      <div className="relative flex items-center justify-between px-5 pt-5">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span
              className="absolute inline-flex h-full w-full rounded-full"
              style={{ background: "var(--success)", opacity: 0.7, animation: "ai-ping 1.6s ease-out infinite" }}
            />
            <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "var(--success)" }} />
          </span>
          <span className="eyebrow" style={{ color: "var(--text-muted)" }}>AI traceability live</span>
        </div>
        <span className="text-[11px] font-mono" style={{ color: "var(--text-subtle)" }}>
          /buildcopilot
        </span>
      </div>

      {/* SVG constellation */}
      <div className="relative px-3 pt-2 pb-6">
        <svg
          viewBox="0 0 620 380"
          className="w-full h-auto"
          aria-hidden
        >
          <defs>
            <linearGradient id="link-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.05" />
              <stop offset="50%" stopColor="var(--primary)" stopOpacity="0.55" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.05" />
            </linearGradient>
            <radialGradient id="pulse-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="1" />
              <stop offset="60%" stopColor="var(--primary)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
            </radialGradient>
            <filter id="soft-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3.5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Connection lines (animated draw-in) */}
          {links.map((l, i) => (
            <motion.path
              key={`${l.from}-${l.to}`}
              d={l.d}
              fill="none"
              stroke="url(#link-grad)"
              strokeWidth={1.2}
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.2 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            />
          ))}

          {/* Hidden master path for travelling pulse */}
          <path id={happyPathId} d={happyPathD} fill="none" stroke="none" />

          {/* Travelling pulse (SVG SMIL — zero JS, runs continuously) */}
          <circle r="14" fill="url(#pulse-grad)" opacity="0.9">
            <animateMotion dur="5.2s" repeatCount="indefinite" rotate="auto">
              <mpath href={`#${happyPathId}`} />
            </animateMotion>
          </circle>
          <circle r="3.2" fill="var(--primary)" filter="url(#soft-glow)">
            <animateMotion dur="5.2s" repeatCount="indefinite" rotate="auto">
              <mpath href={`#${happyPathId}`} />
            </animateMotion>
          </circle>

          {/* Nodes */}
          {nodes.map((n, i) => (
            <motion.g
              key={n.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, delay: 0.1 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Halo */}
              <circle
                cx={n.x}
                cy={n.y}
                r="26"
                fill="var(--primary-soft)"
                opacity={n.warn ? 0 : 0.6}
              />
              {/* Outer ring */}
              <circle
                cx={n.x}
                cy={n.y}
                r="20"
                fill="var(--card)"
                stroke={n.warn ? "var(--error)" : n.success ? "var(--success)" : "var(--border)"}
                strokeWidth={n.warn || n.success ? 1.5 : 1}
              />
              {/* Subtle pulse on warning node */}
              {n.warn && (
                <circle
                  cx={n.x}
                  cy={n.y}
                  r="20"
                  fill="none"
                  stroke="var(--error)"
                  strokeWidth="1.2"
                >
                  <animate attributeName="r" from="20" to="34" dur="1.8s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.5" to="0" dur="1.8s" repeatCount="indefinite" />
                </circle>
              )}
              {/* Label */}
              <text
                x={n.x}
                y={n.y + 42}
                textAnchor="middle"
                fontSize="10"
                fontFamily="var(--font-mono)"
                fill="var(--text-muted)"
                style={{ letterSpacing: "0.08em" }}
              >
                {n.label.toUpperCase()}
              </text>
            </motion.g>
          ))}
        </svg>

        {/* Lucide icons positioned over SVG nodes (HTML, easier theming) */}
        <div className="pointer-events-none absolute inset-0">
          {nodes.map((n) => {
            const Icon = n.icon;
            // viewBox 620 wide ~ render width; use percentages
            const left = `${(n.x / 620) * 100}%`;
            const top = `${((n.y + 8) / 380) * 100}%`;
            return (
              <div
                key={n.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                style={{ left, top }}
              >
                <Icon
                  className="h-4 w-4"
                  strokeWidth={1.6}
                  style={{
                    color: n.warn ? "var(--error)" : n.success ? "var(--success)" : "var(--primary)",
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Floating gap alert (anchored to Code node) */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: [0, 1, 1, 0], y: [6, 0, 0, -6] }}
          transition={{ duration: 5.2, repeat: Infinity, times: [0, 0.15, 0.85, 1], delay: 1.4 }}
          className="pointer-events-none absolute"
          style={{ left: "62%", top: "12%" }}
        >
          <div
            className="rounded-lg px-3 py-2 text-[11px] flex items-start gap-2"
            style={{
              background: "var(--card)",
              border: "1px solid var(--error-soft)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
              minWidth: 200,
            }}
          >
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-px" strokeWidth={1.6} style={{ color: "var(--error)" }} />
            <div>
              <p className="font-semibold" style={{ color: "var(--text)" }}>Gap detected</p>
              <p className="font-mono" style={{ color: "var(--text-muted)" }}>PRD-12 → no test coverage</p>
            </div>
          </div>
        </motion.div>

        {/* Status tile bottom-left */}
        <div
          className="absolute bottom-3 left-4 flex items-center gap-2 rounded-md px-2.5 py-1"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        >
          <Brain className="h-3.5 w-3.5" strokeWidth={1.6} style={{ color: "var(--primary)" }} />
          <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
            13 reqs traced · 1 gap
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────
function Hero({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <section className="relative overflow-hidden">
      {/* Cinematic radial */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0"
        style={{
          height: 720,
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, var(--primary-soft) 0%, transparent 75%)",
          opacity: 0.85,
        }}
      />
      <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-24 sm:pt-24 sm:pb-32 lg:pt-28 lg:pb-36">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-12 items-center">
          <div className="lg:col-span-5">
            <FadeUp>
              <div
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-7"
                style={{
                  background: "var(--primary-soft)",
                  border: "1px solid var(--primary-soft)",
                }}
              >
                <Sparkles className="h-3 w-3" strokeWidth={1.8} style={{ color: "var(--primary)" }} />
                <span
                  className="text-[10px] font-mono font-semibold tracking-[0.18em] uppercase"
                  style={{ color: "var(--primary)" }}
                >
                  AI Delivery Intelligence
                </span>
              </div>

              <h1
                className="text-[2.75rem] sm:text-5xl lg:text-[3.75rem] leading-[1.02] tracking-tight font-semibold"
                style={{ color: "var(--text)" }}
              >
                Ship what you planned.<br />
                <span style={{ color: "var(--text-muted)" }}>Prove it</span>{" "}
                <span style={{ color: "var(--primary)" }}>automatically.</span>
              </h1>

              <p
                className="mt-6 max-w-md text-[15px] leading-relaxed"
                style={{ color: "var(--text-muted)" }}
              >
                BuildCopilot traces your entire product loop — Idea → PRD → Code → Validation —
                and detects the gaps so you don&apos;t have to.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onGetStarted}
                  data-testid="hero-cta-button"
                  className="btn-primary"
                  style={{ padding: "0.8rem 1.5rem", fontSize: "0.9375rem" }}
                >
                  Start tracing
                  <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
                </button>
                <a
                  href="#loop"
                  className="btn-secondary"
                  style={{ padding: "0.8rem 1.5rem", fontSize: "0.9375rem" }}
                >
                  See the loop
                </a>
              </div>

              <div
                className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs"
                style={{ color: "var(--text-subtle)" }}
              >
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.8} style={{ color: "var(--success)" }} />
                  Idea → PRD in minutes
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.8} style={{ color: "var(--success)" }} />
                  100% requirement traceability
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.8} style={{ color: "var(--success)" }} />
                  Auto gap detection
                </span>
              </div>
            </FadeUp>
          </div>

          <FadeUp delay={0.12} className="lg:col-span-7">
            <Constellation />
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROBLEM — Disconnected Stack
// ─────────────────────────────────────────────────────────────────────────────
function Problem() {
  const tools = [
    { label: "Confluence",    sub: "strategy"      },
    { label: "Notion",        sub: "PRDs"          },
    { label: "Jira",          sub: "stories"       },
    { label: "GitHub",        sub: "code"          },
    { label: "Test runners",  sub: "coverage"      },
    { label: "Spreadsheets",  sub: "release plans" },
  ];

  return (
    <section id="problem" className="relative py-24 sm:py-32" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="mx-auto max-w-7xl px-6">
        <FadeUp>
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <div>
              <span className="eyebrow mb-5 block">The problem</span>
              <h2
                className="text-3xl sm:text-4xl font-semibold tracking-tight leading-[1.1]"
                style={{ color: "var(--text)" }}
              >
                Your stack is connected by chance, not by design.
              </h2>
              <p className="mt-5 text-[15px] leading-relaxed max-w-md" style={{ color: "var(--text-muted)" }}>
                Strategy, requirements, code, and tests live in different tools. Nothing actually links to
                anything. The chain breaks at every handoff — silently.
              </p>
              <div
                className="mt-7 inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-mono"
                style={{
                  background: "var(--error-soft)",
                  border: "1px solid var(--error-soft)",
                  color: "var(--error)",
                }}
              >
                <XCircle className="h-3.5 w-3.5" strokeWidth={1.8} />
                42% of shipped features can&apos;t be traced back to a requirement
              </div>
            </div>

            <div
              className="relative rounded-2xl p-6 sm:p-8"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}
            >
              {/* Dashed broken-link grid */}
              <div className="grid grid-cols-3 gap-y-8 gap-x-6">
                {tools.map((t, i) => (
                  <div key={t.label} className="relative flex flex-col items-center text-center">
                    <div
                      className="relative flex h-14 w-14 items-center justify-center rounded-xl"
                      style={{ background: "var(--bg)", border: "1px dashed var(--border-strong)" }}
                    >
                      {/* Broken-link badge on a few */}
                      {[1, 3, 4].includes(i) && (
                        <span
                          className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full"
                          style={{ background: "var(--error-soft)", border: "1px solid var(--error)" }}
                        >
                          <XCircle className="h-2.5 w-2.5" strokeWidth={2} style={{ color: "var(--error)" }} />
                        </span>
                      )}
                      <Workflow className="h-5 w-5" strokeWidth={1.4} style={{ color: "var(--text-subtle)" }} />
                    </div>
                    <p className="mt-3 text-sm font-medium" style={{ color: "var(--text)" }}>{t.label}</p>
                    <p className="text-xs" style={{ color: "var(--text-subtle)" }}>{t.sub}</p>
                  </div>
                ))}
              </div>

              {/* Dashed broken connectors (decorative) */}
              <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%" preserveAspectRatio="none" aria-hidden>
                <line x1="20%" y1="40%" x2="48%" y2="40%" stroke="var(--border-strong)" strokeDasharray="3 5" strokeWidth="1" />
                <line x1="52%" y1="40%" x2="80%" y2="40%" stroke="var(--border-strong)" strokeDasharray="3 5" strokeWidth="1" />
                <line x1="20%" y1="80%" x2="48%" y2="80%" stroke="var(--border-strong)" strokeDasharray="3 5" strokeWidth="1" />
                <line x1="52%" y1="80%" x2="80%" y2="80%" stroke="var(--border-strong)" strokeDasharray="3 5" strokeWidth="1" />
              </svg>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SOLUTION — Bento grid
// ─────────────────────────────────────────────────────────────────────────────
function BentoFlowDiagram() {
  return (
    <svg viewBox="0 0 480 110" className="w-full h-auto" aria-hidden>
      {[
        { x:  40, label: "Idea" },
        { x: 130, label: "PRD"  },
        { x: 220, label: "Story"},
        { x: 310, label: "Code" },
        { x: 400, label: "Test" },
      ].map((n, i, arr) => (
        <g key={n.label}>
          {i < arr.length - 1 && (
            <motion.line
              x1={n.x + 14}
              y1="55"
              x2={arr[i + 1].x - 14}
              y2="55"
              stroke="var(--primary)"
              strokeOpacity="0.4"
              strokeWidth="1.2"
              strokeDasharray="2 4"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.12 }}
            />
          )}
          <circle cx={n.x} cy="55" r="14" fill="var(--card)" stroke="var(--primary)" strokeOpacity="0.5" strokeWidth="1" />
          <circle cx={n.x} cy="55" r="4"  fill="var(--primary)" />
          <text x={n.x} y="92" textAnchor="middle" fontSize="9" fill="var(--text-muted)" fontFamily="var(--font-mono)" style={{ letterSpacing: "0.1em" }}>
            {n.label.toUpperCase()}
          </text>
        </g>
      ))}
    </svg>
  );
}

function Bento() {
  return (
    <section id="bento" className="relative py-24 sm:py-32" style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
      <div className="mx-auto max-w-7xl px-6">
        <FadeUp>
          <span className="eyebrow mb-5 block">The platform</span>
          <h2
            className="text-3xl sm:text-4xl font-semibold tracking-tight leading-[1.1] max-w-2xl"
            style={{ color: "var(--text)" }}
          >
            One intelligence layer across your delivery stack.
          </h2>
        </FadeUp>

        <div className="mt-12 grid gap-4 md:grid-cols-12 md:auto-rows-[200px]">
          {/* Big — Continuous Traceability */}
          <FadeUp className="md:col-span-8 md:row-span-2">
            <div
              data-testid="bento-card-traceability"
              className="h-full rounded-2xl p-7 flex flex-col"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ background: "var(--primary-soft)" }}
                >
                  <Network className="h-4 w-4" strokeWidth={1.6} style={{ color: "var(--primary)" }} />
                </div>
                <span className="eyebrow" style={{ color: "var(--primary)" }}>Continuous traceability</span>
              </div>
              <h3 className="mt-5 text-2xl font-semibold tracking-tight" style={{ color: "var(--text)" }}>
                Every requirement, mapped to the code that ships it.
              </h3>
              <p className="mt-3 text-sm leading-relaxed max-w-md" style={{ color: "var(--text-muted)" }}>
                One unbroken thread from intent to release. Walk forward to verify coverage, or backward
                to audit any commit.
              </p>
              <div className="mt-auto pt-6">
                <BentoFlowDiagram />
              </div>
            </div>
          </FadeUp>

          {/* AI Gap Detection */}
          <FadeUp delay={0.06} className="md:col-span-4">
            <div
              data-testid="bento-card-gap-detection"
              className="h-full rounded-2xl p-6 flex flex-col"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}
            >
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg"
                style={{ background: "var(--error-soft)" }}
              >
                <Brain className="h-4 w-4" strokeWidth={1.6} style={{ color: "var(--error)" }} />
              </div>
              <h3 className="mt-4 text-base font-semibold" style={{ color: "var(--text)" }}>
                AI gap detection
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Flags missing tests, orphan code, and untraced requirements automatically.
              </p>
              <div
                className="mt-auto rounded-lg px-3 py-2 flex items-start gap-2"
                style={{ background: "var(--error-soft)", border: "1px solid var(--error-soft)" }}
              >
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-px" strokeWidth={1.8} style={{ color: "var(--error)" }} />
                <div>
                  <p className="text-[11px] font-semibold" style={{ color: "var(--error)" }}>Gap detected</p>
                  <p className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>PRD-12 · no test</p>
                </div>
              </div>
            </div>
          </FadeUp>

          {/* Live Sync */}
          <FadeUp delay={0.1} className="md:col-span-4">
            <div
              className="h-full rounded-2xl p-6 flex flex-col relative overflow-hidden"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full"
                style={{
                  background: "radial-gradient(circle, var(--primary-soft) 0%, transparent 70%)",
                }}
              />
              <div className="relative">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ background: "var(--primary-soft)" }}
                >
                  <RefreshCcw
                    className="h-4 w-4"
                    strokeWidth={1.6}
                    style={{
                      color: "var(--primary)",
                      animation: "ai-spin 6s linear infinite",
                    }}
                  />
                </div>
                <h3 className="mt-4 text-base font-semibold" style={{ color: "var(--text)" }}>
                  Live sync
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  Plugs into Jira, Linear, GitHub, and Confluence. Updates within seconds.
                </p>
              </div>
            </div>
          </FadeUp>

          {/* AI Copilot */}
          <FadeUp delay={0.14} className="md:col-span-6">
            <div
              className="h-full rounded-2xl p-6"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ background: "var(--primary-soft)" }}
                >
                  <Cpu className="h-4 w-4" strokeWidth={1.6} style={{ color: "var(--primary)" }} />
                </div>
                <h3 className="text-base font-semibold" style={{ color: "var(--text)" }}>
                  AI Copilot
                </h3>
              </div>
              <p className="mt-3 text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Generates PRDs, splits stories, summarises sprint risk for stakeholders.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {[
                  { label: "PRD draft",    icon: FileText },
                  { label: "Stories",      icon: GitBranch },
                  { label: "Risk summary", icon: AlertTriangle },
                  { label: "Coverage",     icon: ShieldCheck },
                ].map((c) => {
                  const I = c.icon;
                  return (
                    <div
                      key={c.label}
                      className="flex items-center gap-2 rounded-lg px-2.5 py-1.5"
                      style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
                    >
                      <I className="h-3.5 w-3.5" strokeWidth={1.5} style={{ color: "var(--text-muted)" }} />
                      <span className="text-[11px]" style={{ color: "var(--text)" }}>{c.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </FadeUp>

          {/* Validation */}
          <FadeUp delay={0.18} className="md:col-span-6">
            <div
              className="h-full rounded-2xl p-6"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ background: "var(--success-soft)" }}
                >
                  <ShieldCheck className="h-4 w-4" strokeWidth={1.6} style={{ color: "var(--success)" }} />
                </div>
                <h3 className="text-base font-semibold" style={{ color: "var(--text)" }}>
                  Validation before release
                </h3>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  { v: "100%", l: "traced",   c: "var(--success)" },
                  { v: "1",    l: "gap",      c: "var(--error)"   },
                  { v: "24/7", l: "monitor",  c: "var(--primary)" },
                ].map((m) => (
                  <div key={m.l} className="rounded-lg p-3" style={{ background: "var(--bg)", border: "1px solid var(--border)" }}>
                    <p className="text-xl font-semibold tracking-tight" style={{ color: m.c }}>{m.v}</p>
                    <p className="text-[10px] font-mono uppercase tracking-[0.14em] mt-0.5" style={{ color: "var(--text-subtle)" }}>{m.l}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HOW IT WORKS — 7-Stage Loop (orbital)
// ─────────────────────────────────────────────────────────────────────────────
function Loop() {
  // 7 nodes around an ellipse
  const cx = 300;
  const cy = 240;
  const rx = 240;
  const ry = 170;
  const N = STAGES.length;
  const angleStart = -Math.PI / 2; // start at top
  const nodes = STAGES.map((s, i) => {
    const a = angleStart + (i * (Math.PI * 2)) / N;
    return { ...s, x: cx + rx * Math.cos(a), y: cy + ry * Math.sin(a) };
  });

  return (
    <section id="loop" className="relative py-24 sm:py-32" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="mx-auto max-w-7xl px-6">
        <FadeUp>
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 items-center">
            <div>
              <span className="eyebrow mb-5 block">How it works</span>
              <h2
                className="text-3xl sm:text-4xl font-semibold tracking-tight leading-[1.1]"
                style={{ color: "var(--text)" }}
              >
                A continuous loop, not a linear waterfall.
              </h2>
              <p className="mt-5 text-[15px] leading-relaxed max-w-md" style={{ color: "var(--text-muted)" }}>
                Each stage produces a clear output. Every output feeds the next stage automatically — and
                Insight feeds back into the next Capture.
              </p>
              <ul className="mt-8 grid grid-cols-2 gap-y-3 gap-x-6">
                {STAGES.map((s, i) => {
                  const I = s.icon;
                  return (
                    <li key={s.id} className="flex items-center gap-2.5">
                      <span
                        className="flex h-6 w-6 items-center justify-center rounded-md font-mono text-[10px] font-semibold shrink-0"
                        style={{
                          background: i === 0 ? "var(--primary-soft)" : "transparent",
                          color: i === 0 ? "var(--primary)" : "var(--text-subtle)",
                          border: i === 0 ? "1px solid var(--primary-soft)" : "1px solid var(--border)",
                        }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <I className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} style={{ color: "var(--text-muted)" }} />
                      <span className="text-sm" style={{ color: "var(--text)" }}>{s.label}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="relative">
              <div
                className="rounded-2xl p-4 sm:p-6"
                style={{ background: "var(--card)", border: "1px solid var(--border)" }}
              >
                <svg viewBox="0 0 600 480" className="w-full h-auto" aria-hidden>
                  <defs>
                    <linearGradient id="orbit-grad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity="0" />
                      <stop offset="50%" stopColor="var(--primary)" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                    </linearGradient>
                    <radialGradient id="orbit-pulse" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity="1" />
                      <stop offset="60%" stopColor="var(--primary)" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {/* Static ellipse track */}
                  <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke="var(--border-strong)" strokeWidth="1" strokeDasharray="2 4" />

                  {/* Orbiting pulse ellipse path (separate path with id for animateMotion) */}
                  <path
                    id="orbit-path"
                    d={`M ${cx + rx} ${cy} A ${rx} ${ry} 0 1 1 ${cx - rx} ${cy} A ${rx} ${ry} 0 1 1 ${cx + rx} ${cy}`}
                    fill="none"
                    stroke="none"
                  />

                  {/* Big soft glow */}
                  <circle r="22" fill="url(#orbit-pulse)">
                    <animateMotion dur="9s" repeatCount="indefinite">
                      <mpath href="#orbit-path" />
                    </animateMotion>
                  </circle>
                  {/* Bright core */}
                  <circle r="3.5" fill="var(--primary)">
                    <animateMotion dur="9s" repeatCount="indefinite">
                      <mpath href="#orbit-path" />
                    </animateMotion>
                  </circle>

                  {/* Center label */}
                  <g>
                    <circle cx={cx} cy={cy} r="48" fill="var(--card)" stroke="var(--border)" />
                    <text x={cx} y={cy - 6} textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill="var(--text-muted)" style={{ letterSpacing: "0.18em" }}>
                      THE LOOP
                    </text>
                    <text x={cx} y={cy + 14} textAnchor="middle" fontSize="20" fontWeight="600" fill="var(--text)">
                      7 stages
                    </text>
                  </g>

                  {/* Nodes */}
                  {nodes.map((n, i) => (
                    <g key={n.id}>
                      <circle cx={n.x} cy={n.y} r="22" fill="var(--card)" stroke="var(--border)" />
                      <circle cx={n.x} cy={n.y} r="22" fill="var(--primary-soft)" opacity="0.6" />
                      <text x={n.x} y={n.y + 38} textAnchor="middle" fontSize="11" fill="var(--text)" fontWeight="600">
                        {n.label}
                      </text>
                      <text x={n.x} y={n.y - 30} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-subtle)" style={{ letterSpacing: "0.1em" }}>
                        {String(i + 1).padStart(2, "0")}
                      </text>
                    </g>
                  ))}
                </svg>

                {/* Lucide icons on top of nodes */}
                <div className="pointer-events-none absolute inset-0">
                  {nodes.map((n) => {
                    const Icon = n.icon;
                    const left = `${(n.x / 600) * 100}%`;
                    const top  = `${(n.y / 480) * 100}%`;
                    return (
                      <div
                        key={n.id}
                        className="absolute -translate-x-1/2 -translate-y-1/2"
                        style={{ left, top }}
                      >
                        <Icon className="h-4 w-4" strokeWidth={1.6} style={{ color: "var(--primary)" }} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TRACEABILITY MATRIX (kept — strongest section, polished)
// ─────────────────────────────────────────────────────────────────────────────
function TraceabilityMatrix() {
  const rows = [
    { req: "User Login",    story: "US-1", code: "auth.ts",     test: "test_auth.ts",  status: "Validated" as const },
    { req: "Onboarding",    story: "US-2", code: "setup.ts",    test: "test_setup.ts", status: "Validated" as const },
    { req: "Payment",       story: "US-3", code: "payment.ts",  test: null,            status: "Gap"       as const },
    { req: "Dashboard",     story: "US-4", code: "dash.tsx",    test: null,            status: "Gap"       as const },
    { req: "Export CSV",    story: "US-5", code: "export.ts",   test: "test_exp.ts",   status: "Validated" as const },
    { req: "Notifications", story: "US-6", code: "notify.ts",   test: "test_notif.ts", status: "Validated" as const },
  ];
  return (
    <section id="trace" className="relative py-24 sm:py-32" style={{ background: "var(--surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16 items-start">
          <FadeUp>
            <span className="eyebrow mb-5 block">Traceability matrix</span>
            <h2
              className="text-3xl sm:text-4xl font-semibold tracking-tight leading-[1.1]"
              style={{ color: "var(--text)" }}
            >
              Every line of code, traced to its origin.
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed max-w-md" style={{ color: "var(--text-muted)" }}>
              Real-time proof of what shipped vs what was planned. Gaps surface the moment they appear.
            </p>
          </FadeUp>

          <FadeUp delay={0.08}>
            <div className="rounded-2xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
                <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>Live coverage</p>
                <span className="status-pill primary">
                  <Activity className="h-3 w-3" strokeWidth={2} /> Streaming
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="l-table">
                  <thead>
                    <tr>{["Requirement", "Story", "Code", "Test", "Status"].map((h) => <th key={h}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.req}>
                        <td style={{ fontWeight: 500 }}>{row.req}</td>
                        <td><span className="font-mono text-xs" style={{ color: "var(--primary)" }}>{row.story}</span></td>
                        <td><span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>{row.code}</span></td>
                        <td>
                          {row.test
                            ? <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>{row.test}</span>
                            : <span className="font-mono text-xs" style={{ color: "var(--error)" }}>missing</span>}
                        </td>
                        <td>
                          {row.status === "Validated"
                            ? <span className="status-pill success"><CheckCircle2 className="h-3 w-3" strokeWidth={2} /> Validated</span>
                            : <span className="status-pill error"><XCircle      className="h-3 w-3" strokeWidth={2} /> Gap</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BUILT FOR
// ─────────────────────────────────────────────────────────────────────────────
function BuiltFor() {
  const items = [
    { label: "Founders",          desc: "Ship with confidence. Build the right thing, prove it, then release.", icon: Zap },
    { label: "Product Managers",  desc: "Turn ideas into traceable PRDs without blank-page paralysis.",         icon: Target },
    { label: "Engineering Leads", desc: "See exactly which requirements map to code, tests and PRs.",           icon: Code2 },
    { label: "Delivery Teams",    desc: "Real-time visibility across the whole chain. No more status meetings.",icon: Radar },
  ];
  return (
    <section className="relative py-24 sm:py-32" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="mx-auto max-w-7xl px-6">
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
          {items.map((it, i) => {
            const I = it.icon;
            return (
              <FadeUp key={it.label} delay={i * 0.05}>
                <div
                  className="h-full rounded-2xl p-6"
                  style={{ background: "var(--card)", border: "1px solid var(--border)" }}
                >
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-lg mb-5"
                    style={{ background: "var(--primary-soft)" }}
                  >
                    <I className="h-4 w-4" strokeWidth={1.6} style={{ color: "var(--primary)" }} />
                  </div>
                  <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{it.label}</p>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{it.desc}</p>
                </div>
              </FadeUp>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FINAL CTA — Massive type
// ─────────────────────────────────────────────────────────────────────────────
function FinalCTA({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <section className="relative py-28 sm:py-36 overflow-hidden" style={{ borderTop: "1px solid var(--border)" }}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0"
        style={{
          height: 600,
          background: "radial-gradient(ellipse 50% 60% at 50% 0%, var(--primary-soft) 0%, transparent 75%)",
          opacity: 0.7,
        }}
      />
      <div className="relative mx-auto max-w-5xl px-6 text-center">
        <FadeUp>
          <h2
            className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-[-0.02em] leading-[0.98]"
            style={{ color: "var(--text)" }}
          >
            Ready to close <br className="sm:hidden" />the loop?
          </h2>
          <p className="mt-7 text-base sm:text-lg max-w-xl mx-auto leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Eliminate delivery blind spots from day one. Trace every requirement. Ship with proof.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onGetStarted}
              data-testid="cta-start-btn"
              className="btn-primary"
              style={{ padding: "0.9rem 1.75rem", fontSize: "1rem" }}
            >
              Start tracing <ArrowUpRight className="h-4 w-4" strokeWidth={1.8} />
            </button>
            <Link
              href="/login"
              data-testid="cta-signin-link"
              className="btn-secondary"
              style={{ padding: "0.9rem 1.75rem", fontSize: "1rem" }}
            >
              Sign in
            </Link>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--border)", background: "var(--bg)" }}>
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
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

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
interface LandingPageProps { onGetStarted: () => void; }

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100dvh" }}>
      <Nav onGetStarted={onGetStarted} />
      <Hero onGetStarted={onGetStarted} />
      <Problem />
      <Bento />
      <Loop />
      <TraceabilityMatrix />
      <BuiltFor />
      <FinalCTA onGetStarted={onGetStarted} />
      <Footer />
    </div>
  );
};
