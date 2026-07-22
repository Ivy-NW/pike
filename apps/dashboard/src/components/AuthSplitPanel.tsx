import type { ReactNode } from "react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { ChartIcon, GiftIcon } from "./icons";

const features = [
  { icon: ChartIcon, title: "Live redemption stats", body: "Every quest's stats update in real time from actual scans." },
  { icon: GiftIcon, title: "Automated rewards", body: "Redemption caps and payouts run themselves once a quest is live." },
];

/**
 * Split-screen shell shared by login/register/forgot-password
 * (docs/ui designs/business_login, business_signup) -- brand panel on the
 * left, real form on the right. No fake social-login/2FA chrome: those
 * mockup elements don't correspond to anything the API implements yet.
 * The aside stays visible (compressed) below 900px instead of vanishing,
 * so mobile signups still get brand/feature context. The aside is a fixed
 * dark panel regardless of the theme toggle (same approach as apps/web's
 * always-dark composition sections) so the toggle only affects the form.
 */
export function AuthSplitPanel({ children }: { children: ReactNode }) {
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
            width: 340,
            height: 340,
            right: -120,
            top: -100,
            background: "radial-gradient(circle, var(--pike-blue-glow) 0%, transparent 70%)",
            opacity: 0.3,
            pointerEvents: "none",
          }}
        />
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

        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <Logo size={28} />
            <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 18 }}>PIKE</span>
          </div>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 600, lineHeight: 1.2, maxWidth: 360 }}>
            System-level precision for venue ops.
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
                borderRadius: "var(--radius-md)",
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
        <div style={{ width: "100%", maxWidth: 420 }}>{children}</div>
      </main>
    </div>
  );
}
