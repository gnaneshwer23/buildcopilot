"use client";

import React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Zap, Cpu, ShieldCheck, ArrowRight, ChevronRight, Sparkles } from "lucide-react";

interface LandingPageProps { onGetStarted: () => void; }

const features = [
  {
    icon: Zap,
    title: "Problem-to-Plan In Minutes",
    desc: "Convert rough thoughts into structured outcomes, assumptions, and measurable goals without context loss.",
    gradient: "from-[#3D76F4] to-[#54AEF5]",
    bg: "from-[#EEF0FD] to-[#DCE8FD]",
  },
  {
    icon: Cpu,
    title: "Requirements With Lineage",
    desc: "Every requirement traces to strategy, then to stories, then to delivery evidence in one continuous graph.",
    gradient: "from-[#54AEF5] to-[#98CDF9]",
    bg: "from-[#EEF5FD] to-[#DCF0FE]",
  },
  {
    icon: ShieldCheck,
    title: "Verification As A System",
    desc: "Coverage gaps surface before release, so teams respond to risk while there is still time to act.",
    gradient: "from-[#CACEFA] to-[#98CDF9]",
    bg: "from-[#F0EFFE] to-[#E4E8FD]",
  },
];

const metrics = [
  { value: "7",    label: "Connected modules",        suffix: "" },
  { value: "100",  label: "Traceability coverage",    suffix: "%" },
  { value: "15",   label: "Minutes, idea to plan",    suffix: "m" },
  { value: "24/7", label: "Execution intelligence",   suffix: "" },
];

const MODULES = [
  { label: "Capture",   color: "#7C3AED", dot: "bg-purple-500" },
  { label: "Strategy",  color: "#3D76F4", dot: "bg-[#3D76F4]" },
  { label: "Draft",     color: "#D97706", dot: "bg-amber-500" },
  { label: "Breakdown", color: "#EA580C", dot: "bg-orange-500" },
  { label: "Build",     color: "#059669", dot: "bg-emerald-500" },
  { label: "Verify",    color: "#DC2626", dot: "bg-rose-500" },
  { label: "Insight",   color: "#4F46E5", dot: "bg-indigo-500" },
];

const steps = [
  { n: "01", title: "Capture",   sub: "AI structures raw input into product-ready context." },
  { n: "02", title: "Strategy",  sub: "Strategy becomes draft requirements with explicit assumptions." },
  { n: "03", title: "Breakdown", sub: "Breakdown generates traceable epics and delivery stories." },
  { n: "04", title: "Verify",    sub: "Verification closes gaps before release confidence drops." },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const reduceMotion = useReducedMotion();

  const up = (delay = 0) => ({
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 as const },
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const, delay },
  });

  return (
    <div className="min-h-dvh" style={{ backgroundColor: "#F4F7FE" }}>

      {/* ── Nav ─────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 backdrop-blur-xl"
        style={{ background: "rgba(255,255,255,0.85)", borderBottom: "1px solid rgba(202,206,250,0.5)" }}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8" data-testid="main-nav">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-[0_4px_12px_rgba(61,118,244,0.3)]">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7L5.5 10.5L12 3.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-bold text-base" style={{ color: "#0F1433" }}>BuildCopilot</span>
          </div>

          <ul className="hidden items-center gap-7 text-sm font-medium md:flex" style={{ color: "#64748B" }}>
            <li><a href="#platform" className="hover:text-[#3D76F4] transition-colors">Platform</a></li>
            <li><a href="#outcomes" className="hover:text-[#3D76F4] transition-colors">Outcomes</a></li>
            <li><a href="#loop" className="hover:text-[#3D76F4] transition-colors">How It Works</a></li>
          </ul>

          <div className="flex items-center gap-2.5">
            <Link
              href="/login"
              data-testid="nav-signin-btn"
              className="rounded-xl px-4 py-2 text-sm font-semibold transition-all hover:bg-[#EEF0FD]"
              style={{ color: "#3D76F4", border: "1px solid rgba(202,206,250,0.6)" }}
            >
              Sign in
            </Link>
            <button
              type="button"
              onClick={onGetStarted}
              data-testid="nav-start-btn"
              className="btn-primary text-sm"
            >
              Start now <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-5 sm:px-8">

        {/* ── Hero ────────────────────────────────────────────────── */}
        <section id="platform" className="pt-16 pb-20 lg:pt-24 grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 items-center">
          <motion.div {...up(0)}>
            <span className="pill mb-6 inline-flex">
              <Sparkles className="h-3.5 w-3.5" />
              Product Delivery Intelligence OS
            </span>

            <h1 className="text-5xl font-bold leading-[1.06] tracking-tight sm:text-6xl lg:text-[4.5rem]" style={{ color: "#0F1433" }}>
              Build the product,<br />
              <span className="gradient-text">not coordination</span><br />
              debt.
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed" style={{ color: "#64748B" }}>
              BuildCopilot collapses ideation, strategy, requirements, backlog, build, and verification into one intelligent loop so teams ship with continuity.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <motion.button
                type="button"
                onClick={onGetStarted}
                data-testid="hero-launch-btn"
                className="btn-primary text-base px-7 py-3.5"
                whileHover={reduceMotion ? undefined : { y: -2 }}
                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              >
                Launch Workspace <ArrowRight className="h-4.5 w-4.5" />
              </motion.button>
              <motion.a
                href="#loop"
                data-testid="hero-seeloop-btn"
                className="btn-secondary text-base px-7 py-3.5"
                whileHover={reduceMotion ? undefined : { y: -2 }}
              >
                See the loop <ChevronRight className="h-4 w-4" />
              </motion.a>
            </div>

            {/* Trust strip */}
            <div className="mt-10 flex items-center gap-4 flex-wrap">
              {["Strategy", "PRD/BRD/FRD", "Backlog", "Delivery Insights"].map((t, i) => (
                <div key={t} className="flex items-center gap-2 text-sm" style={{ color: "#64748B" }}>
                  {i > 0 && <span className="w-1 h-1 rounded-full" style={{ backgroundColor: "#CACEFA" }} />}
                  <span className="font-medium">{t}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Live Command Surface */}
          <motion.div
            {...up(0.12)}
            className="card-lg p-6"
            data-testid="live-command-surface"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "#CACEFA", fontFamily: "var(--font-mono)" }}>
                  Live Command Surface
                </p>
                <p className="text-sm font-semibold mt-0.5" style={{ color: "#0F1433" }}>7-Module Pipeline</p>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold" style={{ background: "#EEF0FD", color: "#3D76F4", border: "1px solid rgba(202,206,250,0.6)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </div>
            </div>

            <motion.div
              className="space-y-2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
            >
              {MODULES.map((m, i) => (
                <motion.div
                  key={m.label}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all cursor-default"
                  style={{
                    background: i === 1 ? "linear-gradient(135deg, #3D76F4, #54AEF5)" : "rgba(244,247,254,0.8)",
                    border: i === 1 ? "none" : "1px solid rgba(202,206,250,0.35)",
                  }}
                  variants={{ hidden: { opacity: 0, x: 10 }, visible: { opacity: 1, x: 0 } }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={reduceMotion ? undefined : { scale: 1.01 }}
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${m.dot}`} style={i !== 1 ? { backgroundColor: m.color } : {}} />
                  <span className="text-sm font-semibold" style={{ color: i === 1 ? "white" : "#0F1433" }}>{m.label}</span>
                  <span className="ml-auto text-[10px] font-mono" style={{ color: i === 1 ? "rgba(255,255,255,0.7)" : "#CACEFA" }}>
                    {i === 0 ? "done" : i === 1 ? "active" : "idle"}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            <div className="mt-5 rounded-xl p-4" style={{ background: "#F4F7FE", border: "1px solid rgba(202,206,250,0.4)" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold" style={{ color: "#64748B" }}>Pipeline Progress</span>
                <span className="text-xs font-bold" style={{ color: "#3D76F4" }}>2/7</span>
              </div>
              <div className="h-2 rounded-full" style={{ background: "#EEF0FD" }}>
                <div className="h-2 rounded-full gradient-primary" style={{ width: "29%" }} />
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── Metrics ─────────────────────────────────────────────── */}
        <motion.section id="outcomes" className="pb-20" {...up(0)} data-testid="metrics-section">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((m, i) => (
              <motion.div
                key={m.label}
                className="card p-6 text-center"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="text-4xl font-bold gradient-text font-mono">{m.value}{m.suffix}</p>
                <p className="mt-2 text-sm" style={{ color: "#64748B" }}>{m.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── Features ────────────────────────────────────────────── */}
        <motion.section
          id="value"
          className="pb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
        >
          <div className="mb-10 text-center">
            <span className="pill mb-4 inline-flex">Platform</span>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: "#0F1433" }}>
              Built for delivery teams<br className="hidden sm:block" /> that ship.
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {features.map((f) => (
              <motion.article
                key={f.title}
                className="card p-7 group"
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                data-testid={`feature-card-${f.title.toLowerCase().split(" ")[0]}`}
              >
                <div className={`mb-5 inline-flex rounded-2xl bg-gradient-to-br ${f.bg} p-3.5`}>
                  <div className={`w-7 h-7 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center shadow-sm`}>
                    <f.icon className="h-4 w-4 text-white" />
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: "#0F1433" }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#64748B" }}>{f.desc}</p>
              </motion.article>
            ))}
          </div>
        </motion.section>

        {/* ── How It Works ────────────────────────────────────────── */}
        <motion.section id="loop" className="pb-20" {...up(0)} data-testid="how-it-works-section">
          <div
            className="rounded-3xl p-8 sm:p-10"
            style={{ background: "linear-gradient(135deg, #EEF0FD 0%, #DCE8FD 100%)", border: "1px solid rgba(202,206,250,0.5)" }}
          >
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
              <div>
                <span className="pill mb-3 inline-flex">How It Works</span>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: "#0F1433" }}>
                  One flow. Seven modules.<br className="hidden sm:block" /> Full delivery continuity.
                </h2>
              </div>
              <button
                type="button"
                onClick={onGetStarted}
                data-testid="configure-workspace-btn"
                className="btn-primary whitespace-nowrap"
              >
                Configure workspace <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((s, i) => (
                <motion.div
                  key={s.n}
                  className="card p-6"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center mb-4 shadow-[0_4px_12px_rgba(61,118,244,0.25)]">
                    <span className="text-xs font-bold text-white font-mono">{s.n}</span>
                  </div>
                  <h3 className="text-sm font-bold mb-2" style={{ color: "#0F1433" }}>{s.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: "#64748B" }}>{s.sub}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      </main>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <motion.section className="gradient-hero" {...up(0)} data-testid="cta-banner">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-7">
            <div>
              <span className="pill mb-4 inline-flex" style={{ background: "rgba(255,255,255,0.15)", color: "white", borderColor: "rgba(255,255,255,0.3)" }}>
                Ready To Execute
              </span>
              <h2 className="text-2xl font-bold text-white sm:text-3xl tracking-tight">
                Design once. Deliver continuously.
              </h2>
              <p className="mt-2 max-w-lg text-sm leading-relaxed sm:text-base" style={{ color: "rgba(255,255,255,0.8)" }}>
                Start with one idea and leave with strategy, requirements, backlog and verification signals aligned for shipping.
              </p>
            </div>
            <motion.button
              type="button"
              onClick={onGetStarted}
              data-testid="cta-start-onboarding-btn"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold whitespace-nowrap transition-all hover:bg-[#EEF0FD] shadow-lg"
              style={{ color: "#3D76F4" }}
              whileHover={reduceMotion ? undefined : { y: -2 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            >
              Start onboarding <ArrowRight className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </motion.section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer style={{ background: "#F4F7FE", borderTop: "1px solid rgba(202,206,250,0.5)" }}>
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
              <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                <path d="M2 7L5.5 10.5L12 3.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-sm font-bold" style={{ color: "#0F1433" }}>BuildCopilot</span>
          </div>
          <p className="text-sm" style={{ color: "#94A3B8" }}>
            From idea capture to delivery insight, with traceability at every step.
          </p>
        </div>
      </footer>
    </div>
  );
};
