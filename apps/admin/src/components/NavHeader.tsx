"use client";
import { useRouter } from "next/navigation";
import { Logo } from "./Logo";
import { clearToken } from "@/lib/auth";

/** Shared top bar, matching admin_dashboard.html's header (sidebar collapsed to a top bar
 * here since the real app is tab-based rather than multi-route). */
export function NavHeader() {
  const router = useRouter();
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        background: "color-mix(in srgb, var(--surface) 85%, transparent)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Logo size={26} />
        <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 17, color: "var(--primary)" }}>PIKE</span>
        <div style={{ width: 1, height: 16, background: "var(--border-strong)" }} />
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "var(--outline)",
          }}
        >
          Global Admin Portal
        </span>
      </div>
      <button
        className="danger"
        onClick={() => {
          clearToken();
          router.push("/login");
        }}
      >
        Sign out
      </button>
    </header>
  );
}
