"use client";

import React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

const IconZap = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
);
const IconShield = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
);
const IconCpu = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/></svg>
);

interface LandingPageProps {
  onGetStarted: () => void;
}

const features = [
  {
    icon: IconZap,
    title: "Problem-to-Plan In Minutes",
    desc: "Convert rough thoughts into structured outcomes, assumptions, and measurable goals without context loss.",
  },
  {
    icon: IconCpu,
    title: "Requirements With Lineage",
    desc: "Every requirement traces to strategy, then to stories, then to delivery evidence in one continuous graph.",
  },
  {
    icon: IconShield,
    title: "Verification As A System",
    desc: "Coverage gaps surface before release, so teams respond to risk while there is still time to act.",
  },
];

const metrics = [
  { value: "7", label: "Connected modules" },
  { value: "100%", label: "Traceability loop" },
  { value: "< 15m", label: "Idea to actionable plan" },
  { value: "24/7", label: "Execution intelligence" },
];

const stages = [
  "Capture",
  "Strategy",
  "Draft",
  "Breakdown",
  "Build",
  "Verify",
  "Insight",
];

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const reduceMotion = useReducedMotion();

  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.45, ease: [0.23, 1, 0.32, 1] as const },
    viewport: { once: true, amount: 0.2 },
  };

  return (
    <div className="min-h-dvh bg-[#070D14] text-white selection:bg-cyan-500/30">
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
        <motion.div
          className="absolute -top-24 left-[-12%] h-96 w-96 rounded-full bg-cyan-500/20 blur-[130px]"
          animate={
            reduceMotion
              ? undefined
              : { y: [0, -18, 0], x: [0, 10, 0], scale: [1, 1.06, 1] }
          }
          transition={
            reduceMotion
              ? undefined
              : { duration: 10, repeat: Infinity, ease: "easeInOut" }
          }
        />
        <motion.div
          className="absolute top-[36%] right-[-10%] h-96 w-96 rounded-full bg-blue-500/25 blur-[130px]"
          animate={
            reduceMotion
              ? undefined
              : { y: [0, 12, 0], x: [0, -12, 0], scale: [1, 1.04, 1] }
          }
          transition={
            reduceMotion
              ? undefined
              : { duration: 12, repeat: Infinity, ease: "easeInOut", delay: 0.6 }
          }
        />
        <motion.div
          className="absolute bottom-[-8%] left-[30%] h-72 w-72 rounded-full bg-emerald-500/15 blur-[120px]"
          animate={
            reduceMotion
              ? undefined
              : { y: [0, -10, 0], scale: [1, 1.05, 1] }
          }
          transition={
            reduceMotion
              ? undefined
              : { duration: 9, repeat: Infinity, ease: "easeInOut", delay: 0.4 }
          }
        />
      </div>

      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#070D14]/80 backdrop-blur-xl">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8" aria-label="Site navigation">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 to-blue-500 font-bold text-white shadow-lg shadow-cyan-500/20" aria-hidden="true">
              F
            </div>
            <span className="text-xl font-bold tracking-tight">BuildCopilot</span>
          </div>
          <ul className="hidden items-center gap-8 text-sm font-medium text-slate-300 md:flex" role="list">
            <li><a href="#platform" className="transition-colors hover:text-white">Platform</a></li>
            <li><a href="#proof" className="transition-colors hover:text-white">Outcomes</a></li>
            <li><a href="#loop" className="transition-colors hover:text-white">Execution Loop</a></li>
          </ul>
          <div className="flex items-center gap-2.5">
            <Link
              href="/login"
              className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Sign in
            </Link>
            <button
              type="button"
              onClick={onGetStarted}
              className="rounded-xl bg-cyan-300 px-4 py-2 text-sm font-bold text-[#03101A] transition-colors hover:bg-cyan-200"
            >
              Start now
            </button>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-5 pb-24 pt-10 sm:px-8 sm:pt-16 lg:pt-20">
        <section id="platform" className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr]" aria-labelledby="hero-heading">
          <motion.div {...fadeUp}>
            <motion.p
              className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-100"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            >
              Product Delivery Intelligence OS
            </motion.p>
            <h1 id="hero-heading" className="mt-6 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
              Build the product, not the coordination debt.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
              BuildCopilot collapses ideation, strategy, requirements, backlog, build, verification, and delivery insight into one command surface so teams ship with continuity.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <motion.button
                type="button"
                onClick={onGetStarted}
                className="rounded-2xl bg-cyan-300 px-7 py-3 text-base font-bold text-[#041019] transition-colors hover:bg-cyan-200"
                whileHover={reduceMotion ? undefined : { y: -2 }}
                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              >
                Launch Workspace
              </motion.button>
              <motion.a
                href="#loop"
                className="rounded-2xl border border-white/15 bg-white/5 px-7 py-3 text-base font-semibold text-white transition-colors hover:bg-white/10"
                whileHover={reduceMotion ? undefined : { y: -2 }}
                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              >
                See the loop
              </motion.a>
            </div>
          </motion.div>

          <motion.div
            className="rounded-3xl border border-white/15 bg-[#0E1620]/80 p-5 shadow-2xl shadow-cyan-900/30 backdrop-blur-xl sm:p-6"
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1], delay: 0.08 }}
            viewport={{ once: true, amount: 0.2 }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Live Command Surface</p>
            <motion.div
              className="mt-5 space-y-2.5"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={{
                hidden: {},
                visible: {
                  transition: { staggerChildren: 0.05 },
                },
              }}
            >
              {stages.map((stage, idx) => (
                <motion.div
                  key={stage}
                  className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5"
                  variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                >
                  <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-cyan-400/15 text-[11px] font-bold text-cyan-200">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm font-semibold text-slate-100">{stage}</span>
                </motion.div>
              ))}
            </motion.div>
            <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-3">
              <div className="mb-2 h-1.5 w-2/5 rounded-full bg-cyan-300/50" />
              <div className="space-y-1.5">
                <div className="h-1.5 w-full rounded-full bg-white/10" />
                <div className="h-1.5 w-4/5 rounded-full bg-white/10" />
                <div className="h-1.5 w-3/5 rounded-full bg-white/10" />
              </div>
            </div>
          </motion.div>
        </section>

        <motion.section id="proof" className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" {...fadeUp}>
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
              <p className="text-2xl font-bold text-cyan-200 sm:text-3xl">{metric.value}</p>
              <p className="mt-1 text-sm text-slate-300">{metric.label}</p>
            </div>
          ))}
        </motion.section>

        <motion.section
          id="value"
          className="mt-20 grid gap-5 md:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.08 },
            },
          }}
        >
          {features.map((feature) => (
            <motion.article
              key={feature.title}
              className="group rounded-3xl border border-white/10 bg-[#101A25]/70 p-7 transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-300/30 hover:bg-[#122131]"
              variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
              whileHover={reduceMotion ? undefined : { y: -4 }}
            >
              <div className="mb-5 inline-flex rounded-2xl border border-cyan-200/20 bg-cyan-200/10 p-3.5 text-cyan-200">
                <feature.icon />
              </div>
              <h2 className="text-xl font-semibold text-white">{feature.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">{feature.desc}</p>
            </motion.article>
          ))}
        </motion.section>

        <motion.section
          id="loop"
          className="mt-20 rounded-3xl border border-white/10 bg-[#0D151F]/75 p-6 sm:p-8"
          {...fadeUp}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">How It Works</p>
              <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">One flow. Seven modules. Full delivery continuity.</h2>
            </div>
            <motion.button
              type="button"
              onClick={onGetStarted}
              className="w-full rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-400 sm:w-auto"
              whileHover={reduceMotion ? undefined : { y: -2 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            >
              Configure workspace
            </motion.button>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "AI structures raw input into product-ready context.",
              "Strategy becomes draft requirements with explicit assumptions.",
              "Breakdown generates traceable epics and delivery stories.",
              "Verification closes gaps before release confidence drops.",
            ].map((line) => (
              <motion.div
                key={line}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-relaxed text-slate-300"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                viewport={{ once: true, amount: 0.3 }}
              >
                {line}
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="mt-20 rounded-3xl border border-white/15 bg-gradient-to-r from-cyan-300/20 via-blue-400/20 to-emerald-300/20 p-[1px]"
          {...fadeUp}
        >
          <div className="rounded-[22px] bg-[#0B131D] px-6 py-8 sm:px-10 sm:py-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-200">Ready To Execute</p>
                <h3 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Design once. Deliver continuously.</h3>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
                  Start with one idea and leave with strategy, requirements, backlog and verification signals aligned for shipping.
                </p>
              </div>
              <motion.button
                type="button"
                onClick={onGetStarted}
                className="rounded-2xl bg-cyan-300 px-6 py-3 text-sm font-bold text-[#041019] transition-colors hover:bg-cyan-200"
                whileHover={reduceMotion ? undefined : { y: -2 }}
                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              >
                Start onboarding
              </motion.button>
            </div>
          </div>
        </motion.section>
      </main>

      <footer className="border-t border-white/10 bg-[#090E14]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-cyan-400 font-bold text-[#041019]" aria-hidden="true">F</div>
            <span className="text-sm font-semibold text-slate-200">BuildCopilot</span>
          </div>
          <p className="text-sm text-slate-400">From idea capture to delivery insight, with traceability at every step.</p>
        </div>
      </footer>
    </div>
  );
};
