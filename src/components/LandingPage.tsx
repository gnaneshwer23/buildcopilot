"use client";

import React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Zap, Cpu, ShieldCheck, ArrowRight, ChevronRight } from "lucide-react";

interface LandingPageProps {
  onGetStarted: () => void;
}

const features = [
  {
    icon: Zap,
    title: "Problem-to-Plan In Minutes",
    desc: "Convert rough thoughts into structured outcomes, assumptions, and measurable goals without context loss.",
    accent: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: Cpu,
    title: "Requirements With Lineage",
    desc: "Every requirement traces to strategy, then to stories, then to delivery evidence in one continuous graph.",
    accent: "text-indigo-600",
    bg: "bg-indigo-50",
  },
  {
    icon: ShieldCheck,
    title: "Verification As A System",
    desc: "Coverage gaps surface before release, so teams respond to risk while there is still time to act.",
    accent: "text-emerald-600",
    bg: "bg-emerald-50",
  },
];

const metrics = [
  { value: "7", label: "Connected modules" },
  { value: "100%", label: "Traceability loop" },
  { value: "< 15m", label: "Idea to actionable plan" },
  { value: "24/7", label: "Execution intelligence" },
];

const stages = [
  { label: "Capture", color: "#7C3AED" },
  { label: "Strategy", color: "#2563EB" },
  { label: "Draft", color: "#D97706" },
  { label: "Breakdown", color: "#EA580C" },
  { label: "Build", color: "#059669" },
  { label: "Verify", color: "#DC2626" },
  { label: "Insight", color: "#4F46E5" },
];

const howItWorks = [
  "AI structures raw input into product-ready context.",
  "Strategy becomes draft requirements with explicit assumptions.",
  "Breakdown generates traceable epics and delivery stories.",
  "Verification closes gaps before release confidence drops.",
];

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const reduceMotion = useReducedMotion();

  const fadeUp = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
    viewport: { once: true, amount: 0.2 },
  };

  return (
    <div className="min-h-dvh bg-white text-slate-900 selection:bg-blue-100">

      {/* ── Sticky Nav ──────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-slate-200/60">
        <nav
          className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8"
          aria-label="Site navigation"
          data-testid="main-nav"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7L5.5 10.5L12 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-slate-900 font-bold text-base tracking-tight">BuildCopilot</span>
          </div>

          <ul className="hidden items-center gap-7 text-sm font-medium text-slate-500 md:flex" role="list">
            <li><a href="#platform" className="hover:text-slate-900 transition-colors">Platform</a></li>
            <li><a href="#proof" className="hover:text-slate-900 transition-colors">Outcomes</a></li>
            <li><a href="#loop" className="hover:text-slate-900 transition-colors">How It Works</a></li>
          </ul>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              data-testid="nav-signin-btn"
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300 shadow-sm"
            >
              Sign in
            </Link>
            <button
              type="button"
              onClick={onGetStarted}
              data-testid="nav-start-btn"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-blue-700 shadow-sm active:scale-95"
            >
              Start now
            </button>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-5 pb-0 pt-10 sm:px-8 sm:pt-16 lg:pt-20">

        {/* ── Hero ────────────────────────────────────────────────── */}
        <section
          id="platform"
          className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 pb-20"
          aria-labelledby="hero-heading"
        >
          <motion.div {...fadeUp}>
            <motion.span
              className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-mono font-semibold uppercase tracking-[0.16em] text-blue-700"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              Product Delivery Intelligence OS
            </motion.span>

            <h1
              id="hero-heading"
              className="mt-6 text-5xl font-bold leading-[1.08] text-slate-900 tracking-tight sm:text-6xl lg:text-[4.25rem]"
            >
              Build the product,<br />
              <span className="text-blue-600">not the coordination</span><br />
              debt.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-500">
              BuildCopilot collapses ideation, strategy, requirements, backlog, build, and verification into one command surface so teams ship with continuity.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <motion.button
                type="button"
                onClick={onGetStarted}
                data-testid="hero-launch-btn"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-base font-bold text-white transition-all hover:bg-blue-700 shadow-sm active:scale-95"
                whileHover={reduceMotion ? undefined : { y: -1 }}
                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              >
                Launch Workspace <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </motion.button>
              <motion.a
                href="#loop"
                data-testid="hero-seeloop-btn"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-3 text-base font-semibold text-slate-700 transition-all hover:bg-slate-50 shadow-sm"
                whileHover={reduceMotion ? undefined : { y: -1 }}
                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              >
                See the loop <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </motion.a>
            </div>
          </motion.div>

          {/* Live Command Surface */}
          <motion.div
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] sm:p-6"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            viewport={{ once: true, amount: 0.2 }}
            data-testid="live-command-surface"
          >
            <p className="text-xs font-mono font-semibold uppercase tracking-[0.16em] text-slate-400 mb-4">
              Live Command Surface
            </p>
            <motion.div
              className="space-y-2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
            >
              {stages.map((stage) => (
                <motion.div
                  key={stage.label}
                  className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 hover:border-slate-200 hover:bg-white transition-all"
                  variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: stage.color }}
                  />
                  <span className="text-sm font-semibold text-slate-700">{stage.label}</span>
                  <span className="ml-auto text-[10px] font-mono text-slate-400">module</span>
                </motion.div>
              ))}
            </motion.div>

            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/80 p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="h-1.5 w-2/5 rounded-full bg-blue-200" />
                <span className="text-[10px] font-mono text-slate-400">active</span>
              </div>
              <div className="space-y-1.5">
                <div className="h-1.5 w-full rounded-full bg-slate-200" />
                <div className="h-1.5 w-4/5 rounded-full bg-slate-200" />
                <div className="h-1.5 w-3/5 rounded-full bg-slate-200" />
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── Metrics ─────────────────────────────────────────────── */}
        <motion.section
          id="proof"
          className="grid gap-px sm:grid-cols-2 lg:grid-cols-4 bg-slate-200 rounded-2xl overflow-hidden border border-slate-200 mb-20"
          {...fadeUp}
          data-testid="metrics-section"
        >
          {metrics.map((metric) => (
            <div key={metric.label} className="bg-white px-7 py-8">
              <p className="text-4xl font-bold text-slate-900 font-mono tracking-tight">{metric.value}</p>
              <p className="mt-2 text-sm text-slate-500">{metric.label}</p>
            </div>
          ))}
        </motion.section>

        {/* ── Features ────────────────────────────────────────────── */}
        <motion.section
          id="value"
          className="mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
        >
          <div className="mb-10 text-center">
            <p className="text-xs font-mono font-semibold uppercase tracking-[0.2em] text-slate-400 mb-3">Platform</p>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight sm:text-4xl">Built for delivery teams that ship.</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {features.map((feature) => (
              <motion.article
                key={feature.title}
                className="group rounded-xl border border-slate-200 bg-white p-7 transition-all duration-200 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-0.5"
                variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                data-testid={`feature-card-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className={`mb-5 inline-flex rounded-xl ${feature.bg} p-3 ${feature.accent}`}>
                  <feature.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{feature.desc}</p>
              </motion.article>
            ))}
          </div>
        </motion.section>

        {/* ── How It Works ────────────────────────────────────────── */}
        <motion.section
          id="loop"
          className="mb-20 rounded-2xl border border-slate-200 bg-slate-50 p-8 sm:p-10"
          {...fadeUp}
          data-testid="how-it-works-section"
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between mb-8">
            <div>
              <p className="text-xs font-mono font-semibold uppercase tracking-[0.2em] text-slate-400 mb-2">How It Works</p>
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl tracking-tight">
                One flow. Seven modules.<br className="hidden sm:block" /> Full delivery continuity.
              </h2>
            </div>
            <motion.button
              type="button"
              onClick={onGetStarted}
              data-testid="configure-workspace-btn"
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-slate-800 shadow-sm whitespace-nowrap"
              whileHover={reduceMotion ? undefined : { y: -1 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            >
              Configure workspace <ArrowRight className="h-4 w-4" />
            </motion.button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {howItWorks.map((line, i) => (
              <motion.div
                key={line}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true, amount: 0.3 }}
              >
                <span className="inline-block w-6 h-6 rounded-md bg-blue-50 text-blue-600 text-[10px] font-mono font-bold flex items-center justify-center mb-3">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-sm leading-relaxed text-slate-600">{line}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </main>

      {/* ── CTA Banner ──────────────────────────────────────────── */}
      <motion.section
        className="bg-blue-600"
        {...fadeUp}
        data-testid="cta-banner"
      >
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16">
          <div className="flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-mono font-semibold uppercase tracking-[0.2em] text-blue-200 mb-2">
                Ready To Execute
              </p>
              <h2 className="text-2xl font-bold text-white sm:text-3xl tracking-tight">
                Design once. Deliver continuously.
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-blue-100 sm:text-base">
                Start with one idea and leave with strategy, requirements, backlog and verification signals aligned for shipping.
              </p>
            </div>
            <motion.button
              type="button"
              onClick={onGetStarted}
              data-testid="cta-start-onboarding-btn"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3.5 text-sm font-bold text-blue-600 transition-all hover:bg-blue-50 shadow-sm whitespace-nowrap"
              whileHover={reduceMotion ? undefined : { y: -2 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            >
              Start onboarding <ArrowRight className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </motion.section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center" aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M2 7L5.5 10.5L12 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-sm font-bold text-slate-800">BuildCopilot</span>
          </div>
          <p className="text-sm text-slate-400">From idea capture to delivery insight, with traceability at every step.</p>
        </div>
      </footer>
    </div>
  );
};
