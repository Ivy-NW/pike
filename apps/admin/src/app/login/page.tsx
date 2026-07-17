"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { setToken } from "@/lib/auth";
import { Logo } from "@/components/Logo";

/** Separate from consumer/business auth by design — no self-registration path exists for admins.
 * Reached only through the obscured secret-code gate on the marketing site (see
 * apps/web/src/components/AdminGateModal.tsx); this form is the real authentication boundary. */
export default function AdminLoginPage() {
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
      const { token } = await api.loginAdmin(email, password);
      setToken(token);
      router.push("/home");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--inverse-surface)" }}>
      <div className="card" style={{ width: 360, background: "var(--surface-container-lowest)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <Logo size={26} />
          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 18 }}>PIKE</span>
        </div>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "var(--outline)",
            marginBottom: 24,
          }}
        >
          Global Admin Portal
        </p>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button className="primary" disabled={loading}>{loading ? "Logging in..." : "Log in"}</button>
          {error && <p style={{ color: "var(--error)" }}>{error}</p>}
        </form>
      </div>
    </div>
  );
}
