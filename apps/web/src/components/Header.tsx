import Link from "next/link";
import { Wordmark } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "http://localhost:3001";

/** No Admin link here or in the footer nav -- the gate is intentionally not advertised. */
export function Header() {
  return (
    <header
      style={{
        borderBottom: "1px solid var(--border-subtle)",
        position: "sticky",
        top: 0,
        background: "color-mix(in srgb, var(--surface) 80%, transparent)",
        backdropFilter: "blur(12px)",
        zIndex: 20,
      }}
    >
      <div
        className="container"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 72 }}
      >
        <Link href="/" aria-label="PIKE home">
          <Wordmark />
        </Link>
        <nav style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <a href="#how-it-works" className="btn-text" style={{ fontSize: 14, padding: 0 }}>
            How it works
          </a>
          <a href="#for-businesses" className="btn-text" style={{ fontSize: 14, padding: 0 }}>
            For businesses
          </a>
          <a href={`${DASHBOARD_URL}/login`} className="btn-text" style={{ fontSize: 14, padding: 0 }}>
            Log in
          </a>
          <a href="#download" className="btn btn-primary">
            Download the app
          </a>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
