"use client";

import React from "react";

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
  { icon: IconZap,    title: "Contextual Capture",  desc: "Convert raw brainstorming into structured PRDs and architecture in seconds." },
  { icon: IconCpu,    title: "Traceable Backlog",    desc: "Automated user stories linked directly to functional requirements and code." },
  { icon: IconShield, title: "Validation Engine",    desc: "Built-in gap detection ensuring every requirement is tested and verified." },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-dvh bg-[#0B0F14] text-white overflow-hidden selection:bg-blue-500/30">
      {/* Background Glows — aria-hidden so screen readers skip decorative blobs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]" aria-hidden="true" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" aria-hidden="true" />

      {/* Nav */}
      <header>
        <nav className="relative z-10 flex items-center justify-between px-10 py-8 max-w-7xl mx-auto" aria-label="Site navigation">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 font-bold text-white shadow-lg shadow-blue-500/20" aria-hidden="true">F</div>
            <span className="text-xl font-bold tracking-tight">BuildCopilot</span>
          </div>
          <ul className="hidden md:flex items-center gap-10 text-sm font-medium text-slate-400" role="list">
            {["Platform", "Intelligence", "Enterprise", "Pricing"].map((label) => (
              <li key={label}>
                <a href="#" className="hover:text-white transition-colors focus-visible:text-white">{label}</a>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={onGetStarted}
            className="rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-black hover:bg-slate-200 transition-all shadow-xl shadow-white/5"
          >
            Get Started
          </button>
        </nav>
      </header>

      {/* Hero */}
      <main>
        <section className="relative z-10 flex flex-col items-center justify-center pt-32 px-6 text-center max-w-5xl mx-auto" aria-labelledby="hero-heading">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-400 mb-8 backdrop-blur-md">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
            </span>
            v2.0 is now live with execution tracking
          </div>

          <h1 id="hero-heading" className="text-6xl md:text-8xl font-bold tracking-tight mb-8 leading-[1.1]">
            The Operating System <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400">for Delivery Intelligence</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed">
            From raw idea to validated code. BuildCopilot bridges the gap between product strategy and engineering execution with context-aware AI.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-5">
            <button
              type="button"
              onClick={onGetStarted}
              className="group relative flex items-center gap-3 rounded-2xl bg-blue-500 px-10 py-4 text-lg font-bold text-white shadow-2xl shadow-blue-500/40 hover:bg-blue-400 transition-all"
            >
              Launch Workspace
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
            </button>
            <button
              type="button"
              className="rounded-2xl border border-white/10 bg-white/5 px-10 py-4 text-lg font-bold text-white hover:bg-white/10 transition-all backdrop-blur-md"
            >
              View Live Demo
            </button>
          </div>

          {/* Feature Grid */}
          <div className="mt-40 grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            {features.map((f) => (
              <div key={f.title} className="group rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-left hover:border-blue-500/30 transition-all hover:bg-white/[0.05]">
                <div className="mb-6 inline-flex rounded-2xl bg-blue-500/10 p-4 text-blue-400 group-hover:scale-110 transition-transform" aria-hidden="true">
                  <f.icon />
                </div>
                <h3 className="text-xl font-bold mb-4">{f.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-40 border-t border-white/5 py-20 px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-blue-500 font-bold text-white" aria-hidden="true">F</div>
            <span className="text-lg font-bold tracking-tight">BuildCopilot</span>
          </div>
          <p className="text-slate-500 text-sm italic">&ldquo;Accelerating delivery with intelligence.&rdquo;</p>
          <nav aria-label="Footer navigation">
            <ul className="flex gap-8 text-slate-400 text-sm" role="list">
              {["Privacy", "Terms", "Contact"].map((label) => (
                <li key={label}><a href="#" className="hover:text-white transition-colors">{label}</a></li>
              ))}
            </ul>
          </nav>
        </div>
      </footer>
    </div>
  );
};
