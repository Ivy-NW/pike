import type { ReactNode } from "react";
import { Logo } from "./Logo";

const features = [
  { icon: "monitoring", title: "Live telemetry", body: "Real-time redemption stats and quest performance." },
  { icon: "account_balance_wallet", title: "Automated rewards", body: "Redemption caps and payouts run themselves once a quest is live." },
];

/**
 * Split-screen shell shared by login/register/forgot-password
 * (docs/ui designs/business_login, business_signup) -- brand panel on the
 * left, real form on the right. No fake social-login/2FA chrome: those
 * mockup elements don't correspond to anything the API implements yet.
 */
export function AuthSplitPanel({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>
      <aside
        style={{
          display: "none",
          flex: "0 0 42%",
          background: "var(--inverse-surface)",
          color: "var(--inverse-on-surface)",
          padding: 56,
          flexDirection: "column",
          justifyContent: "space-between",
        }}
        className="auth-aside"
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40 }}>
            <Logo size={28} />
            <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 18 }}>PIKE</span>
          </div>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 30, fontWeight: 600, lineHeight: 1.2, maxWidth: 360 }}>
            System-level precision for venue ops.
          </h1>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
              <span className="material-symbols-outlined" style={{ opacity: 0.85 }}>
                {f.icon}
              </span>
              <div>
                <p style={{ fontWeight: 600, marginBottom: 4 }}>{f.title}</p>
                <p style={{ fontSize: 13, opacity: 0.75 }}>{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </aside>
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
        <div style={{ width: "100%", maxWidth: 420 }}>{children}</div>
      </main>
      <style>{`@media (min-width: 900px) { .auth-aside { display: flex !important; } }`}</style>
    </div>
  );
}
