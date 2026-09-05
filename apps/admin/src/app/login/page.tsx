"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { setToken } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { EyeIcon, EyeOffIcon, FlagIcon, LockIcon, MailIcon, ShieldIcon } from "@/components/icons";

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
      const { token } = await api.loginAdmin(email, password);
      setToken(token);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", background: "var(--surface)", color: "var(--on-surface)" }}
      className="admin-auth-grid"
    >
      {/* Fixed dark aside regardless of theme toggle — a stable brand-editorial panel,
          same approach as apps/web's always-dark composition sections. */}
      <aside
        style={{
          position: "relative",
          overflow: "hidden",
          background: "var(--slate-gray)",
          color: "#fff",
          padding: "48px 44px",
          display: "flex",
          flexDirection: "column",
        }}
      >
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

        <span
          style={{
            position: "relative",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            alignSelf: "flex-start",
            padding: "6px 12px",
            borderRadius: "var(--radius-full)",
            background: "color-mix(in srgb, var(--primary) 35%, transparent)",
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
        <h1 style={{ position: "relative", fontFamily: "var(--font-heading)", fontSize: "clamp(32px, 4vw, 44px)", lineHeight: 1.05, marginTop: 28 }}>
          Platform oversight,
          <br />
          precisely.
        </h1>
        <div style={{ position: "relative", marginTop: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
          <FeatureRow icon={ShieldIcon} title="Verify businesses" body="Approve payment verification for new partner accounts." />
          <FeatureRow icon={FlagIcon} title="Review flagged redemptions" body="Manually resolve the anti-gaming signal before it ships." />
        </div>
      </aside>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 32, position: "relative" }}>
        <div style={{ position: "absolute", top: 20, right: 24 }}>
          <ThemeToggle />
        </div>
        <div style={{ width: "100%", maxWidth: 380 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <Logo size={26} />
            <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 18 }}>PIKE</span>
          </div>
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
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--on-surface-variant)" }}>Password</span>
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
            {error && <div className="state-alert" role="alert"><strong>Sign-in failed.</strong><span>{error}</span></div>}
          </form>
        </div>
      </div>
    </div>
  );
}

function FeatureRow({ icon: Icon, title, body }: { icon: typeof ShieldIcon; title: string; body: string }) {
  return (
    <div style={{ display: "flex", gap: 12, padding: 14, borderRadius: "var(--radius-md)", background: "rgba(255,255,255,0.06)" }}>
      <Icon size={18} />
      <div>
        <div style={{ fontWeight: 700, fontSize: 14 }}>{title}</div>
        <div style={{ fontSize: 13, opacity: 0.75, marginTop: 2 }}>{body}</div>
      </div>
    </div>
  );
}

/** Decorative marker-scan reticle, echoing the product's core "scan a marker" mechanic
 * (see apps/web Hero's scanCard) rather than a generic corporate split panel. */
function ScanReticle() {
  return (
    <svg
      aria-hidden="true"
      width="180"
      height="180"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth="1"
      style={{ position: "absolute", right: 28, bottom: 28, opacity: 0.22 }}
    >
      <path d="M4 4h5M4 4v5M20 4h-5M20 4v5M4 20h5M4 20v-5M20 20h-5M20 20v-5" strokeLinecap="round" />
      <circle cx="12" cy="12" r="1.3" fill="#fff" stroke="none" />
    </svg>
  );
}
