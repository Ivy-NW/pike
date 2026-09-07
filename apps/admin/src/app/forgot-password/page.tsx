"use client";
import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { AdminAuthPanel } from "@/components/AdminAuthPanel";
import { MailIcon } from "@/components/icons";

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.forgotAdminPassword(email);
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  if (sent) {
    return (
      <AdminAuthPanel>
        <span className="page-eyebrow">Account recovery</span>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 26, margin: "18px 0 6px" }}>Check your email</h2>
        <p style={{ color: "var(--on-surface-variant)", marginTop: 12 }}>
          If an admin account exists for <strong>{email}</strong>, we&apos;ve sent a link to reset the password (logged
          server-side in dev — no email provider configured yet). The link expires in an hour.
        </p>
        <p style={{ marginTop: 24, fontSize: 14, color: "var(--on-surface-variant)" }}>
          <Link href="/login" style={{ color: "var(--action)", fontWeight: 600 }}>Back to login</Link>
        </p>
      </AdminAuthPanel>
    );
  }

  return (
    <AdminAuthPanel>
      <span className="page-eyebrow">Account recovery</span>
      <h2 style={{ fontFamily: "var(--font-heading)", fontSize: 26, margin: "18px 0 6px" }}>Reset your password</h2>
      <p style={{ color: "var(--on-surface-variant)", marginBottom: 26 }}>
        Enter your admin account email and we&apos;ll send you a reset link.
      </p>
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--on-surface-variant)" }}>
            Email
          </span>
          <span style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <MailIcon size={16} color="var(--outline)" />
            <input
              style={{ paddingLeft: 34, marginLeft: -28, width: "100%" }}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </span>
        </label>
        <button className="primary" style={{ marginTop: 6 }} disabled={loading}>
          {loading ? "Sending…" : "Send reset link"}
        </button>
      </form>
      <p style={{ marginTop: 24, fontSize: 14, color: "var(--on-surface-variant)" }}>
        <Link href="/login" style={{ color: "var(--action)", fontWeight: 600 }}>Back to login</Link>
      </p>
    </AdminAuthPanel>
  );
}
