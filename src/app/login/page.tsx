"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Check } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email, password, name, mode, redirect: false,
      });
      if (result?.error) {
        setError(
          mode === "register"
            ? "That email is already registered. Try signing in."
            : "Incorrect email or password.",
        );
      } else {
        router.push("/");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  const deliverySteps = [
    { label: "Idea → Strategy",         sub: "Structured analysis in seconds" },
    { label: "Strategy → Requirements", sub: "PRD · BRD · FRD by AI" },
    { label: "Requirements → Backlog",  sub: "Epics & stories, fully traceable" },
    { label: "Backlog → Insight",       sub: "Full delivery loop, closed" },
  ];

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#F4F7FE" }}>

      {/* Left — Brand Panel */}
      <div
        className="hidden lg:flex w-[480px] xl:w-[520px] shrink-0 flex-col justify-between px-12 py-12 relative overflow-hidden"
        style={{ background: "linear-gradient(150deg, #3D76F4 0%, #54AEF5 55%, #CACEFA 100%)" }}
      >
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20"
             style={{ background: "radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)", transform: "translate(30%, -30%);" }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-15"
             style={{ background: "radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)", transform: "translate(-30%, 30%)" }} />

        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-lg">
              <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
                <path d="M2 7L5.5 10.5L12 3.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">BuildCopilot</span>
          </div>

          <h2 className="text-3xl font-bold text-white leading-snug tracking-tight mb-3">
            Your AI-powered<br />delivery intelligence<br />platform.
          </h2>
          <p className="text-white/70 text-sm leading-relaxed mb-10">
            From raw idea to validated delivery — one continuous, traceable loop.
          </p>

          <div className="space-y-4">
            {deliverySteps.map((item, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-3.5"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.09, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="w-7 h-7 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
                  <Check className="h-3.5 w-3.5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                  <p className="text-xs text-white/60 mt-0.5">{item.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="relative z-10">
          <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.2)" }}>
            <p className="text-white/90 text-sm leading-relaxed italic">
              &ldquo;BuildCopilot eliminated the gap between what we planned and what we shipped.&rdquo;
            </p>
            <p className="mt-3 text-white/50 text-xs">— Product Director, Series B SaaS</p>
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          className="w-full max-w-[400px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center shadow-[0_4px_12px_rgba(61,118,244,0.3)]">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M2 7L5.5 10.5L12 3.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-bold text-sm" style={{ color: "#0F1433" }}>BuildCopilot</span>
          </div>

          <div className="card-lg p-8 sm:p-10">
            <div className="mb-8">
              <h1 className="text-2xl font-bold tracking-tight mb-1.5" style={{ color: "#0F1433" }}>
                {mode === "login" ? "Welcome back" : "Create your account"}
              </h1>
              <p className="text-sm" style={{ color: "#64748B" }}>
                {mode === "login"
                  ? "Sign in to continue to your workspace."
                  : "Start building delivery intelligence today."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" data-testid="auth-form">
              {mode === "register" && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.14em] mb-1.5" style={{ color: "#64748B" }}>
                    Your name
                  </label>
                  <input
                    data-testid="input-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Smith"
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                    style={{ color: "#0F1433", background: "#F4F7FE", border: "1px solid rgba(202,206,250,0.6)" }}
                    onFocus={e => { e.target.style.borderColor = "#3D76F4"; e.target.style.boxShadow = "0 0 0 3px rgba(61,118,244,0.12)"; }}
                    onBlur={e => { e.target.style.borderColor = "rgba(202,206,250,0.6)"; e.target.style.boxShadow = "none"; }}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.14em] mb-1.5" style={{ color: "#64748B" }}>
                  Email address
                </label>
                <input
                  data-testid="input-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                  style={{ color: "#0F1433", background: "#F4F7FE", border: "1px solid rgba(202,206,250,0.6)" }}
                  onFocus={e => { e.target.style.borderColor = "#3D76F4"; e.target.style.boxShadow = "0 0 0 3px rgba(61,118,244,0.12)"; }}
                  onBlur={e => { e.target.style.borderColor = "rgba(202,206,250,0.6)"; e.target.style.boxShadow = "none"; }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.14em] mb-1.5" style={{ color: "#64748B" }}>
                  Password
                </label>
                <input
                  data-testid="input-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                  style={{ color: "#0F1433", background: "#F4F7FE", border: "1px solid rgba(202,206,250,0.6)" }}
                  onFocus={e => { e.target.style.borderColor = "#3D76F4"; e.target.style.boxShadow = "0 0 0 3px rgba(61,118,244,0.12)"; }}
                  onBlur={e => { e.target.style.borderColor = "rgba(202,206,250,0.6)"; e.target.style.boxShadow = "none"; }}
                />
                {mode === "register" && (
                  <p className="mt-1.5 text-xs" style={{ color: "#94A3B8" }}>Minimum 8 characters</p>
                )}
              </div>

              {error && (
                <div
                  data-testid="auth-error"
                  className="rounded-xl px-4 py-3 text-sm"
                  style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626" }}
                >
                  {error}
                </div>
              )}

              <button
                data-testid="auth-submit-btn"
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-3.5 text-base mt-2"
              >
                {loading
                  ? (mode === "login" ? "Signing in…" : "Creating account…")
                  : (mode === "login" ? "Sign in" : "Create account")}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>

            <p className="mt-6 text-center text-sm" style={{ color: "#64748B" }}>
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                data-testid="auth-mode-toggle"
                onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
                className="font-semibold transition-colors hover:opacity-80"
                style={{ color: "#3D76F4" }}
              >
                {mode === "login" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
