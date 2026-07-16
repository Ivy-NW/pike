import Link from "next/link";
import { Wordmark } from "./Logo";

/** No Admin link here or in the footer nav -- the gate is intentionally not advertised. */
export function Header() {
  return (
    <header style={{ borderBottom: "1px solid #eef2f7", position: "sticky", top: 0, background: "#fff", zIndex: 20 }}>
      <div
        className="container"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 76 }}
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
          <a href="#download" className="btn-outline btn" style={{ padding: "10px 18px", fontSize: 14 }}>
            Download the app
          </a>
        </nav>
      </div>
    </header>
  );
}
