"use client";
import { useState } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { AuthSplitPanel } from "@/components/AuthSplitPanel";

/** Self-registration — the primary path into the dashboard (PRD section 12). No payment required here. */
export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
          <input type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <button className="primary" style={{ marginTop: 8 }} disabled={loading}>
          {loading ? "Creating..." : "Create account"}
        </button>
        {error && <p style={{ color: "var(--error)" }}>{error}</p>}
      </form>
      <p style={{ marginTop: 24, fontSize: 14, color: "var(--on-surface-variant)" }}>
        Already have an account? <Link href="/login" style={{ color: "var(--primary)", fontWeight: 600 }}>Log in</Link>
      </p>
    </AuthSplitPanel>
  );
}
