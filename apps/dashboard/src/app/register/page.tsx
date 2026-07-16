"use client";
import { useState } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";

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
      <div style={{ maxWidth: 420, margin: "80px auto" }} className="card">
        <h2>Check your email</h2>
        <p>We sent a verification link (logged server-side in dev — no email provider configured yet). Verify, then <Link href="/login">log in</Link>.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 420, margin: "80px auto" }} className="card">
      <h2 style={{ marginTop: 0 }}>Create your PIKE business account</h2>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input placeholder="Business name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input placeholder="Password" type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button className="primary" disabled={loading}>{loading ? "Creating..." : "Create account"}</button>
        {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
      </form>
      <p style={{ marginTop: 16, fontSize: 14 }}>
        Already have an account? <Link href="/login">Log in</Link>
      </p>
    </div>
  );
}
