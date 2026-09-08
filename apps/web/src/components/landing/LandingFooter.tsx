import { AdminGateTrigger } from "@/components/AdminGateTrigger";
import { landingContent } from "@/content/landing";
import styles from "./Landing.module.css";

export function LandingFooter() {
  const year = new Date().getFullYear();
  return <footer className={styles.footer}>
    <div className={`container ${styles.footerTop}`}>
      <a className={styles.footerWordmark} href="/" aria-label="PIKE home">PIKE</a>
      <p className={styles.footerTagline}>A marker on the table. Proof in your hand. That's the whole pitch.</p>
    </div>
    <div className={`container ${styles.footerLinks}`}>
      <nav className={styles.footerNav} aria-label="Footer navigation">
        <a href="/pricing">Pricing</a>
        <a href="/events">Events</a>
        <a href="/play">Player guide</a>
        <a href="/privacy">Privacy</a>
        <a href="/terms">Terms</a>
        <a href="/cookies">Cookies</a>
        <a href="/acceptable-use">Acceptable Use</a>
        <a href="/security">Security</a>
        <a href="/accessibility">Accessibility</a>
        <a href="/contact">Contact</a>
        <a href="/devices">Supported devices</a>
        <a href="/complaints">Report a problem</a>
        {landingContent.whatsApp.href && <a href={landingContent.whatsApp.href} rel="noreferrer">WhatsApp</a>}
      </nav>
    </div>
    <div className={`container ${styles.footerMeta}`}>
      <AdminGateTrigger><span className={styles.footerStamp}>Nairobi, Kenya · © {year} PIKE</span></AdminGateTrigger>
      <a className={styles.backToTop} href="#main-content">Back to top ↑</a>
    </div>
  </footer>;
}
