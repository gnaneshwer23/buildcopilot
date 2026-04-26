"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

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
        email,
        password,
        name,
        mode,
        redirect: false,
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

  const steps = [
    { label: "Idea → Strategy", sub: "Structured analysis in seconds" },
    { label: "Strategy → Requirements", sub: "PRD · BRD · FRD by AI" },
    { label: "Requirements → Backlog", sub: "Epics & stories, fully traceable" },
    { label: "Backlog → Insight", sub: "Full delivery loop, closed" },
  ];

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left — form */}
      <div className="flex flex-col justify-center w-full max-w-md px-10 py-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-10">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7L5.5 10.5L12 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-slate-900 font-bold text-base tracking-tight">BuildCopilot</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-slate-500 text-sm">
              {mode === "login"
                ? "Sign in to continue to your workspace."
                : "Start building delivery intelligence today."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" data-testid="auth-form">
            {mode === "register" && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Your name
                </label>
                <input
                  data-testid="input-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Smith"
                  className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                Email address
              </label>
              <input
                data-testid="input-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
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
                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
              />
              {mode === "register" && (
                <p className="mt-1.5 text-xs text-slate-400">Minimum 8 characters</p>
              )}
            </div>

            {error && (
              <div data-testid="auth-error" className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              data-testid="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg px-4 py-2.5 transition-all duration-200 mt-1 shadow-sm active:scale-95"
            >
              {loading
                ? mode === "login" ? "Signing in…" : "Creating account…"
                : mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              data-testid="auth-mode-toggle"
              onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
              className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </motion.div>
      </div>

      {/* Right — brand panel */}
      <div className="hidden lg:flex flex-1 bg-slate-900 border-l border-slate-200 items-center justify-center px-16 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "url(https://images.unsplash.com/photo-1550482789-8eb546d12203?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-slate-900/95 to-slate-900" />
        <motion.div
          className="relative z-10 max-w-sm"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-xs font-mono font-semibold uppercase tracking-[0.2em] text-blue-300 mb-8">
            Full delivery loop
          </p>
          <div className="space-y-5">
            {steps.map((item, i) => (
              <motion.div
                key={i}
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-400/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5L4 7L8 3" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{item.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-white/10">
            <p className="text-sm text-slate-300 leading-relaxed italic">
              &ldquo;BuildCopilot eliminated the gap between what we planned and what we shipped.&rdquo;
            </p>
            <p className="mt-3 text-xs text-slate-500">— Product Director, Series B SaaS</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
