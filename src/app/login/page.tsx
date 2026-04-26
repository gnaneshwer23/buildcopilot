"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

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

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* Left — form */}
      <div className="flex flex-col justify-center w-full max-w-md px-10 py-16">
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M2 7L5.5 10.5L12 3.5"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-white font-semibold text-sm tracking-wide">BuildCopilot</span>
          </div>

          <h1 className="text-2xl font-bold text-white mb-1">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-slate-400 text-sm">
            {mode === "login"
              ? "Sign in to continue to your workspace."
              : "Start building delivery intelligence today."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Your name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Jane Smith"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition"
            />
            {mode === "register" && (
              <p className="mt-1 text-xs text-slate-500">Minimum 8 characters</p>
            )}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm rounded-lg px-4 py-2.5 transition-all duration-150 mt-2"
          >
            {loading
              ? mode === "login"
                ? "Signing in…"
                : "Creating account…"
              : mode === "login"
                ? "Sign in"
                : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError("");
            }}
            className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
          >
            {mode === "login" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>

      {/* Right — brand panel (hidden on mobile) */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-violet-950/40 via-indigo-950/30 to-[#0a0a0f] border-l border-white/5 items-center justify-center px-16">
        <div className="max-w-sm">
          <div className="space-y-5">
            {[
              { label: "Idea → Strategy", sub: "Structured analysis in seconds" },
              { label: "Strategy → Requirements", sub: "PRD · BRD · FRD generated by AI" },
              { label: "Requirements → Backlog", sub: "Epics & user stories, traceable to source" },
              { label: "Backlog → Insight", sub: "Full delivery loop, closed" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path
                      d="M2 5L4 7L8 3"
                      stroke="#a78bfa"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 pt-8 border-t border-white/5">
            <p className="text-xs text-slate-500 leading-relaxed">
              "BuildCopilot eliminated the gap between what we planned and what we shipped.
              Every story traces back to the original problem statement."
            </p>
            <p className="mt-3 text-xs text-slate-600">— Product Director, Series B SaaS</p>
          </div>
        </div>
      </div>
    </div>
  );
}
