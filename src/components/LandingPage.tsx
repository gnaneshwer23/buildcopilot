"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { motion, useInView, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ArrowRight, ChevronRight, Sparkles, CheckCircle2, AlertCircle,
  Zap, Shield, GitBranch, Code2, FileText, BarChart3, Target,
  Lightbulb, AlertTriangle, CheckCheck, XCircle, Play, ArrowDown,
} from "lucide-react";

// ── Design Tokens ──────────────────────────────────────────────────────────
const C = {
  bg:      "#0B0F14",
  surface: "#0F1520",
  card:    "#121821",
  cardHov: "#161E2E",
  border:  "rgba(255,255,255,0.06)",
  borderHi:"rgba(79,140,255,0.3)",
  primary: "#4F8CFF",
  primaryD:"#3A70E3",
  text:    "#FFFFFF",
  muted:   "#64748B",
  subtle:  "#94A3B8",
  success: "#10B981",
  error:   "#EF4444",
  warn:    "#F59E0B",
} as const;

// ── Helpers ────────────────────────────────────────────────────────────────
function useCounter(target: number, duration = 1800) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);
  return { count, ref };
}

interface LandingPageProps { onGetStarted: () => void; }

// ── PIPELINE STAGES ────────────────────────────────────────────────────────
const STAGES = [
  { id: "capture",   label: "Capture",   icon: Lightbulb, output: "Structured idea",  color: "#A855F7" },
  { id: "strategy",  label: "Strategy",  icon: Target,    output: "Clear direction",  color: "#4F8CFF" },
  { id: "draft",     label: "Draft",     icon: FileText,  output: "PRD",              color: "#F59E0B" },
  { id: "breakdown", label: "Breakdown", icon: GitBranch, output: "Stories",          color: "#F97316" },
  { id: "build",     label: "Build",     icon: Code2,     output: "Code",             color: "#10B981" },
  { id: "verify",    label: "Verify",    icon: Shield,    output: "Proof",            color: "#EF4444" },
  { id: "insight",   label: "Insight",   icon: BarChart3, output: "Decisions",        color: "#6366F1" },
];

// ── NAV ────────────────────────────────────────────────────────────────────
function Nav({ onGetStarted }: { onGetStarted: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{ background: scrolled ? "rgba(11,15,20,0.92)" : "transparent", backdropFilter: scrolled ? "blur(20px)" : "none",
               borderBottom: scrolled ? `1px solid ${C.border}` : "none" }}>
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#4F8CFF,#A855F7)", boxShadow: "0 4px 14px rgba(79,140,255,0.3)" }}>
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 7L5.5 10.5L12 3.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span className="font-bold text-sm text-white tracking-tight">BuildCopilot</span>
        </div>
        <ul className="hidden items-center gap-7 text-sm font-medium md:flex" style={{ color: C.subtle }}>
          {[["#problem","Problem"],["#solution","Solution"],["#how-it-works","How It Works"],["#ai","AI Copilot"]].map(([h,l]) => (
            <li key={h}><a href={h} className="transition-colors hover:text-white">{l}</a></li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <Link href="/login" className="rounded-xl px-4 py-2 text-sm font-semibold transition-all hover:text-white"
                style={{ color: C.subtle, border: `1px solid ${C.border}` }}>
            Sign in
          </Link>
          <button type="button" onClick={onGetStarted} data-testid="nav-start-btn"
            className="rounded-xl px-4 py-2 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: "linear-gradient(135deg,#4F8CFF,#3A70E3)", boxShadow: "0 4px 14px rgba(79,140,255,0.25)" }}>
            Get started
          </button>
        </div>
      </nav>
    </header>
  );
}

// ── PIPELINE CARD ──────────────────────────────────────────────────────────
function PipelineCard() {
  const [active, setActive] = useState(1);
  const [hovered, setHovered] = useState<number | null>(null);
  const statuses: ("done"|"active"|"idle")[] = STAGES.map((_,i) => i < active ? "done" : i === active ? "active" : "idle");

  useEffect(() => {
    const t = setInterval(() => setActive(a => (a + 1) % STAGES.length), 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <motion.div className="rounded-2xl p-5 w-full"
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
      style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: "0 24px 80px rgba(0,0,0,0.4)" }}
      data-testid="live-command-surface">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: C.subtle, fontFamily: "var(--font-mono)" }}>Live Pipeline</span>
        </div>
        <span className="text-xs font-mono" style={{ color: C.muted }}>{active + 1}/{STAGES.length} active</span>
      </div>

      {/* Stage grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {STAGES.map((stage, i) => {
          const s = statuses[i];
          const Icon = stage.icon;
          const isHov = hovered === i;
          return (
            <motion.div key={stage.id} className="relative flex flex-col items-center gap-1.5 cursor-default"
              onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
              whileHover={{ y: -2 }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200"
                style={{
                  background: s === "done" ? `${stage.color}20` : s === "active" ? `${stage.color}30` : "rgba(255,255,255,0.04)",
                  border: `1px solid ${s === "idle" ? C.border : stage.color + "50"}`,
                  boxShadow: s === "active" ? `0 0 12px ${stage.color}30` : "none",
                }}>
                {s === "done" ? <CheckCheck className="h-3.5 w-3.5" style={{ color: stage.color }} /> :
                  s === "active" ? <Icon className="h-3.5 w-3.5" style={{ color: stage.color }} /> :
                  <Icon className="h-3.5 w-3.5" style={{ color: C.muted }} />}
              </div>
              <span className="text-[9px] font-semibold text-center leading-tight"
                    style={{ color: s === "idle" ? C.muted : C.subtle }}>{stage.label}</span>

              {/* Hover tooltip */}
              <AnimatePresence>
                {isHov && (
                  <motion.div className="absolute bottom-full mb-2 z-10 w-28 rounded-xl px-3 py-2 text-center"
                    initial={{ opacity: 0, y: 4, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                    style={{ background: C.card, border: `1px solid ${stage.color}40`, boxShadow: `0 8px 24px rgba(0,0,0,0.5)` }}>
                    <p className="text-[10px] font-semibold" style={{ color: stage.color }}>Output</p>
                    <p className="text-[10px] text-white mt-0.5">{stage.output}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <motion.div className="h-full rounded-full"
          animate={{ width: `${((active + 1) / STAGES.length) * 100}%` }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ background: "linear-gradient(90deg,#4F8CFF,#A855F7)" }} />
      </div>
      <p className="mt-2 text-[10px] font-mono" style={{ color: C.muted }}>
        Hover each module to see its output
      </p>
    </motion.div>
  );
}

// ── TRACEABILITY VISUAL ────────────────────────────────────────────────────
function TraceabilityVisual() {
  const rows = [
    { items: ["Requirement","Story","Code","Test","Validated"], status: "success" as const },
    { items: ["Requirement","Story","Code","Missing Test","Alert"], status: "error" as const },
  ];
  return (
    <motion.div className="rounded-2xl p-5 w-full mt-4"
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }}
      style={{ background: C.card, border: `1px solid ${C.border}` }}>
      <p className="text-xs font-bold uppercase tracking-[0.18em] mb-4" style={{ color: C.subtle, fontFamily: "var(--font-mono)" }}>
        Traceability Flow
      </p>
      {rows.map((row, ri) => (
        <div key={ri} className={`flex items-center gap-1.5 ${ri > 0 ? "mt-3" : ""}`}>
          {row.items.map((item, ii) => (
            <React.Fragment key={item}>
              <motion.div className="flex-1 min-w-0 rounded-lg px-2 py-1.5 text-center"
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + ii * 0.07 + ri * 0.2 }}
                style={{
                  background: ii === row.items.length - 1
                    ? row.status === "success" ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)"
                    : ii === row.items.length - 2 && row.status === "error"
                    ? "rgba(239,68,68,0.08)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${ii === row.items.length - 1
                    ? row.status === "success" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"
                    : C.border}`,
                }}>
                <span className="text-[9px] font-semibold leading-none"
                  style={{ color: ii === row.items.length - 1
                    ? row.status === "success" ? C.success : C.error
                    : ii === row.items.length - 2 && row.status === "error"
                    ? C.warn : C.subtle }}>
                  {item}
                </span>
              </motion.div>
              {ii < row.items.length - 1 && (
                <ArrowRight className="h-2.5 w-2.5 shrink-0" style={{ color: row.status === "error" && ii >= 2 ? C.error : C.muted }} />
              )}
            </React.Fragment>
          ))}
          <div className="ml-1 shrink-0">
            {row.status === "success"
              ? <CheckCircle2 className="h-4 w-4" style={{ color: C.success }} />
              : <XCircle className="h-4 w-4" style={{ color: C.error }} />}
          </div>
        </div>
      ))}
    </motion.div>
  );
}

// ── SECTION WRAPPER ────────────────────────────────────────────────────────
function Section({ id, children, className = "" }: { id?: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={`mx-auto max-w-7xl px-5 sm:px-8 py-24 ${className}`}>
      {children}
    </section>
  );
}

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] mb-5"
      style={{ background: "rgba(79,140,255,0.1)", color: C.primary, border: "1px solid rgba(79,140,255,0.2)", fontFamily: "var(--font-mono)" }}>
      {children}
    </span>
  );
}

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────
export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const reduceMotion = useReducedMotion();

  return (
    <div style={{ background: C.bg, color: C.text, minHeight: "100dvh" }}
         className="selection:bg-[#4F8CFF]/20 overflow-x-hidden">

      <Nav onGetStarted={onGetStarted} />

      {/* ── HERO ──────────────────────────────────────────────── */}
      <div className="relative min-h-dvh flex items-center pt-16 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full opacity-10"
               style={{ background: "radial-gradient(circle,#4F8CFF 0%,transparent 70%)", filter: "blur(80px)" }} />
          <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-8"
               style={{ background: "radial-gradient(circle,#A855F7 0%,transparent 70%)", filter: "blur(80px)" }} />
        </div>

        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-20 w-full">
          <div className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 items-start">
            {/* Left */}
            <div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold mb-6"
                  style={{ background: "rgba(79,140,255,0.1)", color: C.primary, border: "1px solid rgba(79,140,255,0.2)" }}>
                  <Sparkles className="h-3 w-3" /> AI-Powered Delivery Intelligence
                </span>
                <h1 className="text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-[4.25rem]">
                  <span className="text-white">Ship the right</span><br />
                  <span style={{ background: "linear-gradient(135deg,#4F8CFF,#A855F7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                    product.
                  </span>
                  <br />
                  <span className="text-white">Not just more code.</span>
                </h1>
                <p className="mt-6 max-w-xl text-lg leading-relaxed" style={{ color: C.subtle }}>
                  BuildCopilot connects <span className="text-white font-medium">idea → strategy → requirements → code → validation</span> so your team always knows what's built, what's missing, and what's ready to ship.
                </p>
              </motion.div>

              {/* CTAs */}
              <motion.div className="mt-9 flex flex-wrap items-center gap-3"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.12 }}>
                <button type="button" onClick={onGetStarted} data-testid="hero-launch-btn"
                  className="inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-base font-bold text-white transition-all hover:opacity-90 active:scale-95"
                  style={{ background: "linear-gradient(135deg,#4F8CFF,#3A70E3)", boxShadow: "0 8px 28px rgba(79,140,255,0.3)" }}>
                  Start building with BuildCopilot <ArrowRight className="h-4 w-4" />
                </button>
                <a href="#how-it-works" data-testid="hero-see-action-btn"
                  className="inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-base font-semibold transition-all hover:border-white/20"
                  style={{ color: C.subtle, border: `1px solid ${C.border}` }}
                  onMouseEnter={e => (e.currentTarget.style.color = "white")}
                  onMouseLeave={e => (e.currentTarget.style.color = C.subtle)}>
                  <Play className="h-4 w-4" /> See it in action
                </a>
              </motion.div>

              {/* Proof bar */}
              <motion.div className="mt-10 flex flex-wrap items-center gap-5"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.25 }}>
                {["Idea → PRD in minutes","Requirement → code traceability","Gaps detected automatically","Validation before release"].map(p => (
                  <div key={p} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" style={{ color: C.success }} />
                    <span style={{ color: C.subtle }}>{p}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right */}
            <div className="flex flex-col gap-4">
              <PipelineCard />
              <TraceabilityVisual />
            </div>
          </div>
        </div>
      </div>

      {/* ── PROBLEM ───────────────────────────────────────────── */}
      <div id="problem" style={{ background: C.surface, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <Section>
          <div className="grid gap-14 lg:grid-cols-2 lg:gap-20 items-center">
            <FadeUp>
              <SectionLabel>The Problem</SectionLabel>
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl text-white leading-[1.1]">
                Your product is<br />
                <span style={{ background: "linear-gradient(135deg,#EF4444,#F97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  scattered across tools.
                </span>
              </h2>
              <div className="mt-12 pt-8" style={{ borderTop: `1px solid ${C.border}` }}>
                <p className="text-base font-bold text-white leading-snug">
                  No one knows if what shipped matches what was planned.
                </p>
              </div>
            </FadeUp>

            <FadeUp delay={0.1}>
              <div className="space-y-3">
                {[
                  { icon: FileText, label: "Strategy lives in documents",   sub: "Lost in Confluence, Notion, Google Docs" },
                  { icon: FileText, label: "Requirements live in PRDs",     sub: "Disconnected from actual development" },
                  { icon: GitBranch,label: "Stories live in Jira",          sub: "No link back to original intent" },
                  { icon: Code2,    label: "Code lives in GitHub",          sub: "No trace to requirements" },
                  { icon: Shield,   label: "Tests live somewhere else",     sub: "Coverage is a mystery" },
                ].map(({ icon: Icon, label, sub }, i) => (
                  <motion.div key={label}
                    initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.4, delay: i * 0.07 }}
                    className="flex items-start gap-4 rounded-2xl p-4 group transition-all duration-200 cursor-default"
                    style={{ background: C.card, border: `1px solid ${C.border}` }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(239,68,68,0.25)"; (e.currentTarget as HTMLDivElement).style.background = "#1A1212"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = C.border; (e.currentTarget as HTMLDivElement).style.background = C.card; }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                      <Icon className="h-4 w-4" style={{ color: "#EF4444" }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{label}</p>
                      <p className="text-xs mt-0.5" style={{ color: C.muted }}>{sub}</p>
                    </div>
                    <XCircle className="h-4 w-4 ml-auto shrink-0 mt-1" style={{ color: "rgba(239,68,68,0.4)" }} />
                  </motion.div>
                ))}
              </div>
            </FadeUp>
          </div>
        </Section>
      </div>

      {/* ── SOLUTION ──────────────────────────────────────────── */}
      <Section id="solution">
        <FadeUp className="text-center mb-14">
          <SectionLabel>The Solution</SectionLabel>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl text-white">
            From idea to validated delivery —<br className="hidden sm:block" />
            <span style={{ background: "linear-gradient(135deg,#4F8CFF,#A855F7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}> in one system.</span>
          </h2>
        </FadeUp>

        <div className="grid gap-5 md:grid-cols-3">
          {[
            { icon: Zap, title: "Problem-to-Plan in Minutes", desc: "Convert raw ideas into structured product direction instantly. No more blank-page paralysis.", color: "#4F8CFF", bg: "rgba(79,140,255,0.08)" },
            { icon: GitBranch, title: "Requirements With Proof", desc: "Every requirement is linked to stories, code, and tests. Full lineage from intention to delivery.", color: "#A855F7", bg: "rgba(168,85,247,0.08)" },
            { icon: Shield, title: "Validation Before Release", desc: "Gaps are detected before your users do. Know exactly what's covered and what's at risk.", color: "#10B981", bg: "rgba(16,185,129,0.08)" },
          ].map(({ icon: Icon, title, desc, color, bg }, i) => (
            <FadeUp key={title} delay={i * 0.1}>
              <div className="h-full rounded-2xl p-7 transition-all duration-300 group cursor-default"
                style={{ background: C.card, border: `1px solid ${C.border}` }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = `${color}30`; el.style.background = C.cardHov; el.style.transform = "translateY(-2px)"; el.style.boxShadow = `0 12px 40px rgba(0,0,0,0.4)`; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = C.border; el.style.background = C.card; el.style.transform = "translateY(0)"; el.style.boxShadow = "none"; }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: bg, border: `1px solid ${color}25` }}>
                  <Icon className="h-6 w-6" style={{ color }} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: C.subtle }}>{desc}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </Section>

      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <div id="how-it-works" style={{ background: C.surface, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <Section>
          <FadeUp className="text-center mb-16">
            <SectionLabel>How It Works</SectionLabel>
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl text-white">
              One system. Seven steps.<br />
              <span style={{ background: "linear-gradient(135deg,#4F8CFF,#10B981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Full clarity.</span>
            </h2>
          </FadeUp>

          {/* Steps */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
            {STAGES.map((stage, i) => {
              const Icon = stage.icon;
              return (
                <FadeUp key={stage.id} delay={i * 0.07}>
                  <div className="flex flex-col items-center text-center gap-3">
                    {/* Step connector */}
                    <div className="relative flex items-center justify-center w-full">
                      {i > 0 && i < STAGES.length && (
                        <div className="absolute right-full top-1/2 -translate-y-1/2 w-full h-px hidden lg:block"
                             style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.08))", marginRight: 4 }} />
                      )}
                      <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center z-10 transition-all duration-200 cursor-default group"
                        style={{ background: `${stage.color}15`, border: `1px solid ${stage.color}30` }}
                        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = `${stage.color}25`; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 20px ${stage.color}30`; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = `${stage.color}15`; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}>
                        <Icon className="h-6 w-6" style={{ color: stage.color }} />
                        <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center"
                          style={{ background: stage.color, color: "white" }}>{i + 1}</span>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-white">{stage.label}</p>
                    <div className="rounded-lg px-2 py-1" style={{ background: `${stage.color}12`, border: `1px solid ${stage.color}25` }}>
                      <p className="text-[10px] font-semibold" style={{ color: stage.color }}>→ {stage.output}</p>
                    </div>
                  </div>
                </FadeUp>
              );
            })}
          </div>
        </Section>
      </div>

      {/* ── DIFFERENTIATOR ────────────────────────────────────── */}
      <Section>
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-20 items-start">
          <FadeUp>
            <SectionLabel>Why BuildCopilot</SectionLabel>
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl text-white leading-[1.1]">
              Most tools manage work.<br />
              <span style={{ background: "linear-gradient(135deg,#4F8CFF,#A855F7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                BuildCopilot proves it.
              </span>
            </h2>
            <p className="mt-5 text-base leading-relaxed" style={{ color: C.subtle }}>
              BuildCopilot creates an unbroken chain from idea to verified delivery. Every artifact is linked. Every gap is visible.
            </p>
            <div className="mt-8 space-y-3">
              {["Every requirement has a story","Every story has code","Every code has a test","Every feature is validated"].map((item, i) => (
                <motion.div key={item} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }}>
                    <CheckCircle2 className="h-3.5 w-3.5" style={{ color: C.success }} />
                  </div>
                  <span className="text-sm font-semibold text-white">{item}</span>
                </motion.div>
              ))}
            </div>
          </FadeUp>

          {/* Traceability Table */}
          <FadeUp delay={0.1}>
            <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
              <div className="px-5 py-4" style={{ background: C.surface, borderBottom: `1px solid ${C.border}` }}>
                <p className="text-sm font-bold text-white">Traceability Matrix</p>
                <p className="text-xs mt-0.5" style={{ color: C.muted }}>Real-time requirement → delivery proof</p>
              </div>
              <table className="w-full text-left text-xs" style={{ background: C.card }}>
                <thead style={{ background: C.surface }}>
                  <tr>
                    {["Requirement","Story","Code","Test","Status"].map(h => (
                      <th key={h} className="px-4 py-3 font-bold uppercase tracking-[0.14em]" style={{ color: C.muted, fontFamily: "var(--font-mono)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { req: "User Login",  story: "US-1", code: "auth.js",   test: "test_auth.ts", ok: true  },
                    { req: "Onboarding",  story: "US-2", code: "setup.js",  test: "test_setup.ts",ok: true  },
                    { req: "Payment",     story: "US-3", code: "pay.js",    test: "—",            ok: false },
                    { req: "Dashboard",   story: "US-4", code: "dash.tsx",  test: "—",            ok: false },
                    { req: "Export",      story: "US-5", code: "export.ts", test: "test_exp.ts",  ok: true  },
                  ].map((row, i) => (
                    <tr key={row.req} style={{ borderTop: `1px solid ${C.border}` }}
                      onMouseEnter={e => (e.currentTarget.style.background = row.ok ? "rgba(16,185,129,0.03)" : "rgba(239,68,68,0.05)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                      <td className="px-4 py-3 font-semibold" style={{ color: C.text }}>{row.req}</td>
                      <td className="px-4 py-3 font-mono" style={{ color: C.primary }}>{row.story}</td>
                      <td className="px-4 py-3 font-mono" style={{ color: C.subtle }}>{row.code}</td>
                      <td className="px-4 py-3 font-mono" style={{ color: row.test === "—" ? C.error : C.subtle }}>
                        {row.test === "—" ? <span className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" style={{ color: C.error }}/> Missing</span> : row.test}
                      </td>
                      <td className="px-4 py-3">
                        {row.ok
                          ? <span className="inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-bold" style={{ background: "rgba(16,185,129,0.12)", color: C.success, border: "1px solid rgba(16,185,129,0.25)" }}>
                              <CheckCircle2 className="h-3 w-3" /> Validated
                            </span>
                          : <span className="inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-bold" style={{ background: "rgba(239,68,68,0.12)", color: C.error, border: "1px solid rgba(239,68,68,0.25)" }}>
                              <XCircle className="h-3 w-3" /> Gap
                            </span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeUp>
        </div>
      </Section>

      {/* ── METRICS ───────────────────────────────────────────── */}
      <div style={{ background: C.surface, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <Section>
          <FadeUp className="text-center mb-14">
            <SectionLabel>Outcomes</SectionLabel>
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Real results from day one.
            </h2>
            <p className="mt-4 text-xl font-bold" style={{ background: "linear-gradient(135deg,#4F8CFF,#10B981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              0% blind spots in delivery.
            </p>
          </FadeUp>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Idea → PRD in",  value: "<10",  unit: "min",  sub: "Not hours. Minutes.",        color: C.primary },
              { label: "Requirement",    value: "100",  unit: "%",    sub: "Full traceability coverage",  color: "#A855F7" },
              { label: "Gaps detected",  value: "100",  unit: "%",    sub: "Before users find them",      color: C.success },
              { label: "Visibility",     value: "24/7", unit: "",     sub: "Real-time delivery insight",  color: "#F59E0B" },
            ].map(({ label, value, unit, sub, color }, i) => (
              <FadeUp key={label} delay={i * 0.08}>
                <div className="rounded-2xl p-6 h-full transition-all duration-300 group cursor-default"
                  style={{ background: C.card, border: `1px solid ${C.border}` }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = `${color}30`; el.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = C.border; el.style.transform = "translateY(0)"; }}>
                  <p className="text-4xl font-bold font-mono" style={{ background: `linear-gradient(135deg,${color},${color}99)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                    {value}<span className="text-2xl">{unit}</span>
                  </p>
                  <p className="mt-2 text-sm font-bold text-white">{label}</p>
                  <p className="mt-1 text-xs" style={{ color: C.muted }}>{sub}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </Section>
      </div>

      {/* ── AI SECTION ────────────────────────────────────────── */}
      <Section id="ai">
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-20 items-center">
          <FadeUp>
            <SectionLabel>AI Copilot</SectionLabel>
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl text-white leading-[1.1]">
              Your AI copilot for<br />
              <span style={{ background: "linear-gradient(135deg,#4F8CFF,#A855F7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                product delivery.
              </span>
            </h2>
            <div className="mt-8 space-y-3">
              {[
                { icon: FileText,   text: "Generate PRDs from rough ideas in seconds"  },
                { icon: GitBranch,  text: "Create user stories with acceptance criteria"},
                { icon: AlertCircle,text: "Detect missing links in your delivery chain" },
                { icon: AlertTriangle,text:"Highlight risks before they become blockers"},
                { icon: BarChart3,  text: "Summarise delivery status for stakeholders"  },
              ].map(({ icon: Icon, text }, i) => (
                <motion.div key={text} initial={{ opacity: 0, x: -14 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.07 }}
                  className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(79,140,255,0.1)", border: "1px solid rgba(79,140,255,0.2)" }}>
                    <Icon className="h-4 w-4" style={{ color: C.primary }} />
                  </div>
                  <span className="text-sm" style={{ color: C.subtle }}>{text}</span>
                </motion.div>
              ))}
            </div>
          </FadeUp>

          {/* AI UI Mockup */}
          <FadeUp delay={0.12}>
            <div className="rounded-2xl overflow-hidden" style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: "0 24px 80px rgba(0,0,0,0.4)" }}>
              {/* Titlebar */}
              <div className="flex items-center gap-2 px-4 py-3" style={{ background: C.surface, borderBottom: `1px solid ${C.border}` }}>
                <div className="flex gap-1.5">
                  {["#EF4444","#F59E0B","#10B981"].map(c => <div key={c} className="w-3 h-3 rounded-full" style={{ background: c }} />)}
                </div>
                <span className="ml-2 text-xs font-semibold" style={{ color: C.muted }}>BuildCopilot AI Assistant</span>
                <span className="ml-auto flex items-center gap-1.5 text-[10px]" style={{ color: C.success }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
                </span>
              </div>
              <div className="p-5 space-y-3">
                {/* AI alerts */}
                {[
                  { type: "warn",  text: "Story US-3 has no test case",                    sub: "Payment flow untested → high risk" },
                  { type: "warn",  text: "Requirement REQ-12 not linked to code",          sub: "Dashboard export may not be implemented" },
                  { type: "error", text: "3 requirements have no linked stories",           sub: "Breakdown incomplete for current sprint" },
                  { type: "ok",    text: "Authentication flow fully traced",                sub: "REQ-1 → US-1 → auth.js → test_auth.ts ✓" },
                  { type: "ok",    text: "Onboarding requirements 100% covered",           sub: "All stories, code, and tests linked" },
                ].map(({ type, text, sub }, i) => (
                  <motion.div key={text} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ duration: 0.3, delay: 0.2 + i * 0.07 }}
                    className="flex items-start gap-3 rounded-xl px-4 py-3"
                    style={{
                      background: type === "ok" ? "rgba(16,185,129,0.06)" : type === "error" ? "rgba(239,68,68,0.06)" : "rgba(245,158,11,0.06)",
                      border: `1px solid ${type === "ok" ? "rgba(16,185,129,0.2)" : type === "error" ? "rgba(239,68,68,0.2)" : "rgba(245,158,11,0.2)"}`,
                    }}>
                    {type === "ok"
                      ? <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" style={{ color: C.success }} />
                      : type === "error"
                      ? <XCircle className="h-4 w-4 mt-0.5 shrink-0" style={{ color: C.error }} />
                      : <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" style={{ color: C.warn }} />}
                    <div>
                      <p className="text-xs font-semibold" style={{ color: type === "ok" ? C.success : type === "error" ? C.error : C.warn }}>{text}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: C.muted }}>{sub}</p>
                    </div>
                  </motion.div>
                ))}
                {/* Input bar */}
                <div className="flex items-center gap-3 rounded-xl px-4 py-3 mt-2" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                  <Sparkles className="h-4 w-4 shrink-0" style={{ color: C.primary }} />
                  <span className="text-sm" style={{ color: C.muted }}>Ask AI about your delivery status…</span>
                  <ArrowRight className="h-4 w-4 ml-auto shrink-0" style={{ color: C.muted }} />
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </Section>

      {/* ── TRUST ─────────────────────────────────────────────── */}
      <div style={{ background: C.surface, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <Section>
          <FadeUp className="text-center mb-14">
            <SectionLabel>Built For</SectionLabel>
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Built for teams that ship.
            </h2>
          </FadeUp>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Target,    label: "Product Managers",   desc: "Turn ideas into traceable PRDs instantly. No more blank-page syndrome or disconnected documents.",  color: "#4F8CFF" },
              { icon: Code2,     label: "Engineering Leads",  desc: "See exactly which requirements map to code. Know what's covered, what's missing, what ships next.", color: "#A855F7" },
              { icon: Zap,       label: "Founders",           desc: "Ship with confidence. Know your team is building the right thing and it's proven before release.",    color: "#F59E0B" },
              { icon: BarChart3, label: "Delivery Teams",     desc: "Real-time visibility across the entire delivery chain. No more status meetings about status.",        color: "#10B981" },
            ].map(({ icon: Icon, label, desc, color }, i) => (
              <FadeUp key={label} delay={i * 0.08}>
                <div className="h-full rounded-2xl p-6 transition-all duration-300 cursor-default"
                  style={{ background: C.card, border: `1px solid ${C.border}` }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = `${color}35`; el.style.transform = "translateY(-2px)"; el.style.boxShadow = `0 12px 40px rgba(0,0,0,0.4)`; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = C.border; el.style.transform = "translateY(0)"; el.style.boxShadow = "none"; }}>
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-5" style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
                    <Icon className="h-5 w-5" style={{ color }} />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{label}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: C.subtle }}>{desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </Section>
      </div>

      {/* ── FINAL CTA ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ borderTop: `1px solid ${C.border}` }}>
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,rgba(79,140,255,0.08) 0%,rgba(168,85,247,0.05) 50%,transparent 100%)" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full opacity-10"
               style={{ background: "radial-gradient(ellipse,#4F8CFF 0%,transparent 70%)", filter: "blur(60px)" }} />
        </div>
        <div className="mx-auto max-w-3xl px-5 py-28 sm:px-8 text-center relative z-10">
          <FadeUp>
            <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold mb-8"
              style={{ background: "rgba(79,140,255,0.1)", color: C.primary, border: "1px solid rgba(79,140,255,0.2)" }}>
              <Rocket className="h-3 w-3" /> Start today
            </span>
            <h2 className="text-5xl font-bold tracking-tight text-white sm:text-6xl leading-[1.05]">
              Start building with<br />
              <span style={{ background: "linear-gradient(135deg,#4F8CFF,#A855F7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                clarity and proof.
              </span>
            </h2>
            <p className="mt-5 text-lg" style={{ color: C.subtle }}>Eliminate delivery blind spots from day one.</p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button type="button" onClick={onGetStarted} data-testid="cta-start-btn"
                className="inline-flex items-center gap-2 rounded-xl px-8 py-4 text-base font-bold text-white transition-all hover:opacity-90 active:scale-95 w-full sm:w-auto justify-center"
                style={{ background: "linear-gradient(135deg,#4F8CFF,#3A70E3)", boxShadow: "0 8px 32px rgba(79,140,255,0.3)" }}>
                Start your workspace <ArrowRight className="h-4 w-4" />
              </button>
              <button type="button" data-testid="cta-demo-btn"
                className="inline-flex items-center gap-2 rounded-xl px-8 py-4 text-base font-semibold transition-all hover:border-white/20 w-full sm:w-auto justify-center"
                style={{ color: C.subtle, border: `1px solid ${C.border}` }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "white"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.15)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = C.subtle; (e.currentTarget as HTMLButtonElement).style.borderColor = C.border; }}>
                Book a demo
              </button>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer style={{ borderTop: `1px solid ${C.border}`, background: C.surface }}>
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#4F8CFF,#A855F7)" }}>
              <svg width="10" height="10" viewBox="0 0 14 14" fill="none"><path d="M2 7L5.5 10.5L12 3.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span className="text-sm font-bold text-white">BuildCopilot</span>
          </div>
          <p className="text-sm" style={{ color: C.muted }}>From idea to validated delivery. One continuous loop.</p>
        </div>
      </footer>
    </div>
  );
};

// missing import
function Rocket({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>;
}
