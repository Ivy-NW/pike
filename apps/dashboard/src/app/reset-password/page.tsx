"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { AuthSplitPanel } from "@/components/AuthSplitPanel";
import { EyeIcon, EyeOffIcon } from "@/components/icons";

function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const mismatch = confirm.length > 0 && password !== confirm;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("This link is missing a reset token.");
      return;
    }
    if (mismatch) return;
    setLoading(true);
    setError(null);
    try {
      await api.resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not reset your password");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <AuthSplitPanel>
        <span className="eyebrow">Account recovery</span>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 26, marginBottom: 6 }}>Password updated</h2>
        <p style={{ color: "var(--on-surface-variant)", marginBottom: 24 }}>You can now log in with your new password.</p>
        <button className="primary" style={{ width: "100%" }} onClick={() => router.push("/login")}>
          Log in
        </button>
      </AuthSplitPanel>
    );
  }

  return (
    <AuthSplitPanel>
      <span className="eyebrow">Account recovery</span>
      <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 26, marginBottom: 6 }}>Choose a new password</h2>
      <p style={{ color: "var(--on-surface-variant)", marginBottom: 32 }}>Must be at least 8 characters.</p>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--on-surface-variant)" }}>
            New password
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
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--on-surface-variant)" }}>
            Confirm password
          </span>
          <input type={showPassword ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          {mismatch && <span style={{ fontSize: 12, color: "var(--error)" }}>Passwords don&apos;t match.</span>}
        </label>
        <button className="primary" style={{ marginTop: 8 }} disabled={loading || mismatch || !password}>
          {loading ? "Saving…" : "Save new password"}
        </button>
        {error && <div className="notice notice-error" role="alert"><strong>Reset failed</strong><span>{error}</span></div>}
      </form>
      <p style={{ marginTop: 24, fontSize: 14, color: "var(--on-surface-variant)" }}>
        <Link href="/login" style={{ color: "var(--action)", fontWeight: 600 }}>Back to login</Link>
      </p>
    </AuthSplitPanel>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
