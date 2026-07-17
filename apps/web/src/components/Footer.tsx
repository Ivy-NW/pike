import Link from "next/link";
import { Wordmark } from "./Logo";
import { AdminGateTrigger } from "./AdminGateTrigger";

export function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--border-subtle)", padding: "48px 0", background: "var(--surface-container-lowest)" }}>
      <div
        className="container"
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24 }}
      >
        <Wordmark size={18} />

        <nav style={{ display: "flex", gap: 24 }}>
          <Link href="/privacy" className="btn-text" style={{ fontSize: 13, padding: 0, color: "var(--on-surface-variant)" }}>
            Privacy
          </Link>
          <Link href="/terms" className="btn-text" style={{ fontSize: 13, padding: 0, color: "var(--on-surface-variant)" }}>
            Terms
          </Link>
          <a href="mailto:hello@pike.app" className="btn-text" style={{ fontSize: 13, padding: 0, color: "var(--on-surface-variant)" }}>
            Contact
          </a>
        </nav>

        {/* The "©" is an ordinary-looking copyright line -- and also a disguised admin-gate
            click target (see AdminGateTrigger). Ctrl+Alt+A does the same thing. */}
        <AdminGateTrigger>
          <span style={{ fontSize: 13, color: "var(--outline)" }}>© {new Date().getFullYear()} PIKE</span>
        </AdminGateTrigger>
      </div>
    </footer>
  );
}
