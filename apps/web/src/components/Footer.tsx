import Link from "next/link";
import { Wordmark } from "./Logo";
import { AdminGateTrigger } from "./AdminGateTrigger";
import styles from "./Footer.module.css";

const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "http://localhost:3001";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.top}`}>
        <div className={styles.brand}><Wordmark size={20} /><p>Browser-based quests that turn a venue visit into a reason to return.</p></div>
        <nav className={styles.links} aria-label="Footer navigation"><a href="/#how-it-works">How it works</a><a href="/#for-venues">For venues</a><a href="/#quest-examples">Quest examples</a><a href={`${DASHBOARD_URL}/login`}>Business login</a></nav>
        <nav className={styles.legal} aria-label="Legal & safety"><Link href="/privacy">Privacy Policy</Link><Link href="/terms">Terms of Service</Link><Link href="/cookies">Cookies</Link><Link href="/acceptable-use">Acceptable Use</Link><Link href="/security">Security</Link><Link href="/accessibility">Accessibility</Link><Link href="/contact">Contact</Link><Link href="/devices">Supported devices</Link><Link href="/complaints">Report a problem</Link></nav>
      </div>
      <div className={`container ${styles.bottom}`}>
        <AdminGateTrigger><span className={styles.copyright}>© {new Date().getFullYear()} PIKE</span></AdminGateTrigger>
        <p><span aria-hidden="true">●</span> Player access is coming soon</p>
        <a href="#main-content">Back to top ↑</a>
      </div>
    </footer>
  );
}
