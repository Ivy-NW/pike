"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { AuthSplitPanel } from "@/components/AuthSplitPanel";
import { CheckCircleIcon, MailIcon } from "@/components/icons";

function VerifyEmailContent() {
  const token = useSearchParams().get("token");
  const [status, setStatus] = useState<"checking" | "done" | "error">("checking");
  const [error, setError] = useState<string | null>(null);
  const [resendEmail, setResendEmail] = useState("");
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent">("idle");
  // The token is single-use (verifying clears it server-side), so React StrictMode's dev-mode
  // double-invocation of effects must not send this request twice — the second call would
  // legitimately fail against an already-consumed token and clobber the real success state.
  const requested = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError("This link is missing a verification token.");
      return;
    }
    if (requested.current) return;
    requested.current = true;
    api
      .verifyBusinessEmail(token)
      .then(() => setStatus("done"))
      .catch((err) => {
        setStatus("error");
        setError(err instanceof ApiError ? err.message : "Could not verify this email link");
      });
  }, [token]);

  const resend = async () => {
    setResendState("sending");
    try {
      await api.resendVerification(resendEmail);
    } finally {
      setResendState("sent");
    }
  };

  if (status === "checking") {
    return (
      <AuthSplitPanel>
        <span className="eyebrow">Account verification</span>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 26, marginBottom: 6 }}>Verifying your email&hellip;</h2>
        <div className="skeleton-row" style={{ marginTop: 16 }} />
      </AuthSplitPanel>
    );
  }

  if (status === "done") {
    return (
      <AuthSplitPanel>
        <span className="stat-icon" style={{ background: "color-mix(in srgb, var(--success) 12%, transparent)", color: "var(--success)", marginBottom: 16 }}>
          <CheckCircleIcon size={18} />
        </span>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 26, marginBottom: 6 }}>Email verified</h2>
        <p style={{ color: "var(--on-surface-variant)", marginBottom: 24 }}>Your account is ready. You can log in now.</p>
        <Link href="/login" className="primary" style={{ display: "block", width: "100%", textAlign: "center", textDecoration: "none", boxSizing: "border-box" }}>
          Log in
        </Link>
      </AuthSplitPanel>
    );
  }

  return (
    <AuthSplitPanel>
      <span className="eyebrow">Account verification</span>
      <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 26, marginBottom: 6 }}>Link invalid or expired</h2>
      <div className="notice notice-error" role="alert" style={{ marginBottom: 20 }}>
        <strong>We couldn&apos;t verify that link</strong>
        <span>{error}</span>
      </div>

      {resendState === "sent" ? (
        <p style={{ color: "var(--on-surface-variant)" }}>
          If an unverified account exists for that email, a new verification link has been sent.
        </p>
      ) : (
        <>
          <p style={{ color: "var(--on-surface-variant)", marginBottom: 16 }}>Request a new verification link:</p>
          <label style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--on-surface-variant)" }}>
              Email
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <MailIcon size={16} color="var(--outline)" />
              <input type="email" value={resendEmail} onChange={(e) => setResendEmail(e.target.value)} required />
            </span>
          </label>
          <button className="primary" onClick={() => void resend()} disabled={!resendEmail || resendState === "sending"}>
            {resendState === "sending" ? "Sending…" : "Resend verification link"}
          </button>
        </>
      )}

      <p style={{ marginTop: 24, fontSize: 14, color: "var(--on-surface-variant)" }}>
        <Link href="/login" style={{ color: "var(--action)", fontWeight: 600 }}>Back to login</Link>
      </p>
    </AuthSplitPanel>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
