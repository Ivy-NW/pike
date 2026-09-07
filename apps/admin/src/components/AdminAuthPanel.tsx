import type { ReactNode } from "react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { FlagIcon, ShieldIcon } from "./icons";

const features = [
  { icon: ShieldIcon, title: "Verify businesses", body: "Approve payment verification for new partner accounts." },
  { icon: FlagIcon, title: "Review flagged redemptions", body: "Manually resolve the anti-gaming signal before it ships." },
];

/**
 * Split-screen shell shared by the admin login/forgot/reset-password pages — same
 * structure as apps/dashboard's AuthSplitPanel (dot-grid + radial glow + scan-reticle
 * dark aside, form on the right), restyled with admin's own headline/features instead
 * of duplicating this ~100 lines of layout per page. The aside is a fixed dark panel
 * regardless of the theme toggle (same approach as apps/web's always-dark composition
 * sections) so the toggle only affects the form.
 */
export function AdminAuthPanel({ children }: { children: ReactNode }) {
  return (
    <div className="auth-shell">
      <aside className="auth-aside">
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,.09) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
            pointerEvents: "none",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            width: 380,
            height: 380,
            right: -140,
            top: -120,
            background: "radial-gradient(circle, var(--pike-blue-glow) 0%, transparent 70%)",
            opacity: 0.3,
            pointerEvents: "none",
          }}
        />
        <ScanReticle />

        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <Logo size={28} />
            <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 18 }}>PIKE</span>
          </div>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 20,
              padding: "6px 12px",
              borderRadius: "var(--radius-full)",
              background: "color-mix(in srgb, var(--action) 35%, transparent)",
              color: "#fff",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            <ShieldIcon size={14} />
            Secure environment
          </span>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(26px, 3.4vw, 38px)", lineHeight: 1.1 }}>
            Platform oversight,
            <br />
            precisely.
          </h1>
        </div>
        <div className="auth-aside-features" style={{ position: "relative" }}>
          {features.map((f) => (
            <div
              key={f.title}
              style={{
                display: "flex",
                gap: 14,
                padding: 16,
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "14px",
                background: "rgba(255,255,255,0.04)",
              }}
            >
              <f.icon size={20} />
              <div>
                <p style={{ fontWeight: 600, marginBottom: 4 }}>{f.title}</p>
                <p style={{ fontSize: 13, opacity: 0.75 }}>{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </aside>
      <main className="auth-main" style={{ position: "relative" }}>
        <div style={{ position: "absolute", top: 20, right: 24 }}>
          <ThemeToggle />
        </div>
        <div style={{ width: "100%", maxWidth: 380 }}>{children}</div>
      </main>
    </div>
  );
}

/** Decorative marker-scan reticle, echoing the product's core "scan a marker" mechanic. */
function ScanReticle() {
  return (
    <svg
      aria-hidden="true"
      width="150"
      height="150"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth="1"
      style={{ position: "absolute", right: 24, bottom: 24, opacity: 0.2 }}
    >
      <path d="M4 4h5M4 4v5M20 4h-5M20 4v5M4 20h5M4 20v-5M20 20h-5M20 20v-5" strokeLinecap="round" />
      <circle cx="12" cy="12" r="1.3" fill="#fff" stroke="none" />
    </svg>
  );
}
