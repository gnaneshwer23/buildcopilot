"use client";

import React from "react";
import Link from "next/link";

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
    title: "Capture With Context",
    desc: "Convert fragmented ideas into structured problem statements, users, goals, and constraints in one step.",
  },
  {
    icon: IconCpu,
    title: "Build With Traceability",
    desc: "Generate requirements and backlog with direct linkage from strategy to story and delivery status.",
  },
  {
    icon: IconShield,
    title: "Verify Before Release",
    desc: "Detect coverage gaps early with requirement-to-validation checks before your sprint closes.",
  },
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
  return (
    <div className="min-h-dvh bg-[#0A0F15] text-white selection:bg-cyan-500/30">
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
        <div className="absolute -top-24 left-[-12%] h-96 w-96 rounded-full bg-cyan-500/15 blur-[120px]" />
        <div className="absolute top-[36%] right-[-10%] h-96 w-96 rounded-full bg-blue-500/20 blur-[120px]" />
        <div className="absolute bottom-[-8%] left-[30%] h-72 w-72 rounded-full bg-emerald-500/10 blur-[120px]" />
      </div>

      <header className="sticky top-0 z-30 border-b border-white/5 bg-[#0A0F15]/80 backdrop-blur-xl">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8" aria-label="Site navigation">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 font-bold text-white shadow-lg shadow-cyan-500/20" aria-hidden="true">
              F
            </div>
            <span className="text-xl font-bold tracking-tight">BuildCopilot</span>
          </div>
          <ul className="hidden items-center gap-8 text-sm font-medium text-slate-300 md:flex" role="list">
            <li><a href="#platform" className="transition-colors hover:text-white">Platform</a></li>
            <li><a href="#loop" className="transition-colors hover:text-white">Intelligence Loop</a></li>
            <li><a href="#value" className="transition-colors hover:text-white">Why Teams Switch</a></li>
          </ul>
          <div className="flex items-center gap-2.5">
            <Link
              href="/login"
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Sign in
            </Link>
            <button
              type="button"
              onClick={onGetStarted}
              className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-bold text-[#05101A] transition-colors hover:bg-cyan-300"
            >
              Start now
            </button>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-5 pb-24 pt-10 sm:px-8 sm:pt-16 lg:pt-20">
        <section id="platform" className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]" aria-labelledby="hero-heading">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-200">
              Delivery Intelligence OS
            </p>
            <h1 id="hero-heading" className="mt-6 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              Move from idea to validated delivery without losing context.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
              BuildCopilot unifies capture, strategy, requirements, backlog, build and verification into one AI-guided loop so product, engineering and delivery operate from the same source of truth.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onGetStarted}
                className="rounded-2xl bg-cyan-400 px-7 py-3 text-base font-bold text-[#041019] transition-colors hover:bg-cyan-300"
              >
                Launch Workspace
              </button>
              <a
                href="#loop"
                className="rounded-2xl border border-white/15 bg-white/5 px-7 py-3 text-base font-semibold text-white transition-colors hover:bg-white/10"
              >
                See the loop
              </a>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#0E1620]/70 p-5 shadow-2xl shadow-cyan-900/25 backdrop-blur-xl sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Live Intelligence Loop</p>
            <div className="mt-5 space-y-2.5">
              {stages.map((stage, idx) => (
                <div key={stage} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5">
                  <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-cyan-400/15 text-[11px] font-bold text-cyan-200">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm font-semibold text-slate-100">{stage}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="value" className="mt-20 grid gap-5 md:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="group rounded-3xl border border-white/10 bg-[#101A25]/70 p-7 transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-300/30 hover:bg-[#122131]">
              <div className="mb-5 inline-flex rounded-2xl border border-cyan-200/20 bg-cyan-200/10 p-3.5 text-cyan-200">
                <feature.icon />
              </div>
              <h2 className="text-xl font-semibold text-white">{feature.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">{feature.desc}</p>
            </article>
          ))}
        </section>

        <section id="loop" className="mt-20 rounded-3xl border border-white/10 bg-[#0D151F]/75 p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">How It Works</p>
              <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">One flow. Seven modules. Full delivery continuity.</h2>
            </div>
            <button
              type="button"
              onClick={onGetStarted}
              className="w-full rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-400 sm:w-auto"
            >
              Configure workspace
            </button>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "AI structures raw input into product-ready context.",
              "Strategy becomes draft requirements with explicit assumptions.",
              "Breakdown generates traceable epics and delivery stories.",
              "Verification closes gaps before release confidence drops.",
            ].map((line) => (
              <div key={line} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-relaxed text-slate-300">
                {line}
              </div>
            ))}
          </div>
        </section>
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
