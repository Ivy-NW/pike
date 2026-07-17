"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { setToken } from "@/lib/auth";
import { AuthSplitPanel } from "@/components/AuthSplitPanel";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { token } = await api.loginBusiness(email, password);
      setToken(token);
      router.push("/home");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthSplitPanel>
      <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 26, marginBottom: 6 }}>Welcome back</h2>
      <p style={{ color: "var(--on-surface-variant)", marginBottom: 32 }}>Log in to your venue dashboard.</p>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--on-surface-variant)" }}>
            Email
          </span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--on-surface-variant)" }}>
              Password
            </span>
            <Link href="/forgot-password" style={{ fontSize: 12, color: "var(--primary)" }}>
              Forgot?
            </Link>
          </div>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <button className="primary" style={{ marginTop: 8 }} disabled={loading}>
          {loading ? "Logging in..." : "Log in"}
        </button>
        {error && <p style={{ color: "var(--error)" }}>{error}</p>}
      </form>
      <p style={{ marginTop: 24, fontSize: 14, color: "var(--on-surface-variant)" }}>
        New to PIKE? <Link href="/register" style={{ color: "var(--primary)", fontWeight: 600 }}>Create a business account</Link>
      </p>
    </AuthSplitPanel>
  );
}
