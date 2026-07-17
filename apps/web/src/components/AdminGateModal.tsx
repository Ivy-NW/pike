"use client";
import { useState } from "react";
import { api, ApiError } from "@/lib/api";

const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL ?? "http://localhost:3002";

/**
 * This code is an obscurity layer only -- it decides who ever sees the admin login form.
 * It never authenticates anyone itself; a correct code just redirects to the real
 * email/password login behind AdminAuthGuard in apps/api.
 */
export function AdminGateModal({ onClose }: { onClose: () => void }) {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "limited">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const { valid } = await api.verifyAdminGate(code);
      if (valid) {
        window.location.href = `${ADMIN_URL}/login`;
        return;
      }
      setStatus("error");
    } catch (err) {
      setStatus(err instanceof ApiError && err.statusCode === 429 ? "limited" : "error");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card"
        style={{ width: 320 }}
      >
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            autoFocus
            type="password"
            placeholder="Access code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            style={{
              padding: "12px 14px",
              borderRadius: "var(--radius)",
              border: "1px solid var(--border-strong)",
              background: "var(--surface-container-lowest)",
              color: "var(--on-surface)",
              fontSize: 15,
            }}
          />
          <button className="btn btn-primary" style={{ width: "100%" }} disabled={status === "loading"}>
            {status === "loading" ? "Checking..." : "Continue"}
          </button>
          {status === "error" && (
            <p style={{ color: "var(--error)", fontSize: 13, margin: 0 }}>Invalid code.</p>
          )}
          {status === "limited" && (
            <p style={{ color: "var(--error)", fontSize: 13, margin: 0 }}>
              Too many attempts. Try again later.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
