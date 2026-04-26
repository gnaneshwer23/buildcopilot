"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

function Logo({ size = 26 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-md"
      style={{ width: size, height: size, background: "var(--primary)" }}
    >
      <svg width={size * 0.42} height={size * 0.42} viewBox="0 0 14 14" fill="none">
        <path d="M2 7L5.5 10.5L12 3.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

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

  const valueProps = [
    { label: "Idea → PRD",          sub: "Structured analysis in seconds" },
    { label: "PRD → Backlog",       sub: "Stories with acceptance criteria" },
    { label: "Backlog → Build",     sub: "Tracked execution with traceability" },
    { label: "Build → Validation",  sub: "Coverage proven before release" },
  ];

  return (
    <div className="min-h-dvh flex" style={{ background: "var(--bg)" }}>
      {/* Side panel */}
      <div
        className="hidden lg:flex w-[440px] xl:w-[480px] shrink-0 flex-col px-10 py-12 justify-between"
        style={{ background: "var(--surface)", borderRight: "1px solid var(--border)" }}
      >
        <div>
          <Link href="/" className="flex items-center gap-2.5 mb-14">
            <Logo size={26} />
            <span className="font-semibold text-sm tracking-tight" style={{ color: "var(--text)" }}>BuildCopilot</span>
          </Link>
          <h2 className="text-2xl font-semibold tracking-tight leading-[1.15] mb-3" style={{ color: "var(--text)" }}>
            From idea to validated delivery — one continuous loop.
          </h2>
          <p className="text-sm leading-relaxed mb-10" style={{ color: "var(--text-muted)" }}>
            BuildCopilot connects strategy, requirements, code and validation so your team always knows
            what shipped matches what was planned.
          </p>
          <ul className="space-y-4">
            {valueProps.map((item) => (
              <li key={item.label} className="flex items-start gap-3">
                <span
                  className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-md shrink-0"
                  style={{ background: "var(--primary-soft)" }}
                >
                  <Check className="h-3 w-3" style={{ color: "var(--primary)" }} />
                </span>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{item.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-subtle)" }}>{item.sub}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs" style={{ color: "var(--text-subtle)" }}>
          &ldquo;BuildCopilot eliminated the gap between what we planned and what we shipped.&rdquo;
          <span className="block mt-1.5">— Product Director, Series B SaaS</span>
        </p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 lg:px-10 lg:py-6">
          <Link href="/" className="lg:hidden flex items-center gap-2">
            <Logo size={22} />
            <span className="font-semibold text-sm" style={{ color: "var(--text)" }}>BuildCopilot</span>
          </Link>
          <div className="ml-auto"><ThemeToggle /></div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 pb-12">
          <div className="w-full max-w-[400px]">
            <h1 className="text-2xl font-semibold tracking-tight mb-2" style={{ color: "var(--text)" }}>
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
              {mode === "login"
                ? "Sign in to continue to your workspace."
                : "Start building delivery intelligence today."}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4" data-testid="auth-form">
              {mode === "register" && (
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text)" }}>
                    Name
                  </label>
                  <input
                    data-testid="input-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Smith"
                    className="input"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text)" }}>
                  Email
                </label>
                <input
                  data-testid="input-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="input"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text)" }}>
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
                  className="input"
                />
                {mode === "register" && (
                  <p className="mt-1.5 text-xs" style={{ color: "var(--text-subtle)" }}>Minimum 8 characters</p>
                )}
              </div>

              {error && (
                <div
                  data-testid="auth-error"
                  className="rounded-lg px-4 py-3 text-sm"
                  style={{ background: "var(--error-soft)", border: "1px solid var(--error-soft)", color: "var(--error)" }}
                >
                  {error}
                </div>
              )}

              <button
                data-testid="auth-submit-btn"
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center"
                style={{ padding: "0.75rem 1rem", fontSize: "0.9375rem" }}
              >
                {loading
                  ? (mode === "login" ? "Signing in…" : "Creating account…")
                  : (mode === "login" ? "Sign in" : "Create account")}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>

            <p className="mt-6 text-center text-sm" style={{ color: "var(--text-muted)" }}>
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                data-testid="auth-mode-toggle"
                onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
                className="font-semibold transition-colors"
                style={{ color: "var(--primary)" }}
              >
                {mode === "login" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
