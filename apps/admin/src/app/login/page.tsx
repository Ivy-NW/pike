"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { setToken, setAdmin } from "@/lib/auth";
import { AdminAuthPanel } from "@/components/AdminAuthPanel";
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon } from "@/components/icons";

/** Separate from consumer/business auth by design — no self-registration path exists for admins.
 * Reached only through the obscured secret-code gate on the marketing site (see
 * apps/web/src/components/AdminGateModal.tsx); this form is the real authentication boundary. */
export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { admin, token } = await api.loginAdmin(email, password);
      setToken(token);
      setAdmin(admin);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminAuthPanel>
      <span className="page-eyebrow">Restricted access</span>
      <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 26, margin: "18px 0 4px" }}>Welcome back</h2>
      <p style={{ color: "var(--on-surface-variant)", fontSize: 14, marginBottom: 26 }}>Sign in to the global admin portal.</p>

      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--on-surface-variant)" }}>Email</span>
          <span style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <MailIcon size={16} color="var(--outline)" />
            <input
              style={{ paddingLeft: 34, marginLeft: -28, width: "100%" }}
              placeholder="name@pike.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </span>
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--on-surface-variant)" }}>Password</span>
            <Link href="/forgot-password" style={{ fontSize: 12, color: "var(--action)" }}>
              Forgot?
            </Link>
          </div>
          <span style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <LockIcon size={16} color="var(--outline)" />
            <input
              style={{ paddingLeft: 34, marginLeft: -28, paddingRight: 34, width: "100%" }}
              placeholder="••••••••"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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
        <button className="primary icon" disabled={loading} style={{ justifyContent: "center", padding: "11px 14px", marginTop: 6 }}>
          {loading ? "Signing in…" : "Enter admin portal"}
        </button>
        {error && (
          <div className="state-alert" role="alert">
            <strong>Sign-in failed.</strong>
            <span>{error}</span>
          </div>
        )}
      </form>
    </AdminAuthPanel>
  );
}
