"use client";
import { useState } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { AuthSplitPanel } from "@/components/AuthSplitPanel";
import { EyeIcon, EyeOffIcon } from "@/components/icons";

/** Self-registration — the primary path into the dashboard (PRD section 12). No payment required here. */
export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.registerBusiness(name, email, password);
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <AuthSplitPanel>
        <span className="eyebrow">Account created</span>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 26 }}>Check your email</h2>
        <p style={{ color: "var(--on-surface-variant)", marginTop: 12 }}>
          We sent a verification link (logged server-side in dev — no email provider configured yet). Verify, then{" "}
          <Link href="/login" style={{ color: "var(--primary)", fontWeight: 600 }}>log in</Link>.
        </p>
      </AuthSplitPanel>
    );
  }

  return (
    <AuthSplitPanel>
      <span className="eyebrow">Get started</span>
      <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 26, marginBottom: 6 }}>Create your PIKE business account</h2>
      <p style={{ color: "var(--on-surface-variant)", marginBottom: 32 }}>Set up the venue that will host your first quest.</p>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--on-surface-variant)" }}>
            Business name
          </span>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--on-surface-variant)" }}>
            Email
          </span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--on-surface-variant)" }}>
            Password
          </span>
          <span style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <input
              type={showPassword ? "text" : "password"}
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ paddingRight: 40 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              style={{ position: "absolute", right: 8, background: "none", border: 0, padding: 4, cursor: "pointer", color: "var(--outline)", display: "flex" }}
            >
              {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
            </button>
          </span>
        </label>
        <button className="primary" style={{ marginTop: 8 }} disabled={loading}>
          {loading ? "Creating..." : "Create account"}
        </button>
        {error && <div className="notice notice-error" role="alert"><strong>Account was not created</strong><span>{error}</span></div>}
      </form>
      <p style={{ marginTop: 24, fontSize: 14, color: "var(--on-surface-variant)" }}>
        Already have an account? <Link href="/login" style={{ color: "var(--primary)", fontWeight: 600 }}>Log in</Link>
      </p>
    </AuthSplitPanel>
  );
}
