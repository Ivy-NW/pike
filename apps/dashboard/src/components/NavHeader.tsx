"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "./Logo";
import { clearToken } from "@/lib/auth";

/** Shared top bar for authenticated dashboard pages -- matches business_dashboard.html's header. */
export function NavHeader({ businessName }: { businessName?: string }) {
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
      <Link href="/home" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Logo size={26} />
        <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 17, color: "var(--primary)" }}>PIKE</span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "var(--outline)",
            marginLeft: 4,
          }}
        >
          Business Portal
        </span>
      </Link>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {businessName && <span style={{ fontSize: 14, color: "var(--on-surface-variant)" }}>{businessName}</span>}
        <button
          className="secondary"
          onClick={() => {
            clearToken();
            router.push("/login");
          }}
        >
          Log out
        </button>
      </div>
    </header>
  );
}
