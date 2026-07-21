import Link from "next/link";
import { Wordmark } from "./Logo";
import { AdminGateTrigger } from "./AdminGateTrigger";
import styles from "./Footer.module.css";

const soon = (topic: string) => `/coming-soon?topic=${encodeURIComponent(topic)}`;

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.top}`}>
        <div className={styles.brand}><Wordmark size={20} /><p>Turning everyday venue visits into rewarding experiences worth coming back for.</p><span>Make the next visit happen.</span></div>
        <FooterGroup title="Product" links={[["How it works","/#how-it-works"],["For players","/#for-players"],["For venues","/#for-venues"],["Player waitlist","/#player-waitlist"]]} />
        <FooterGroup title="Company" links={[["About",soon("About")],["Contact","mailto:hello@pike.app"],["Careers",soon("Careers")],["Press",soon("Press")]]} />
        <FooterGroup title="Legal & safety" links={[["Privacy Policy","/privacy"],["Terms of Service","/terms"],["Cookie Policy",soon("Cookie Policy")],["Acceptable Use",soon("Acceptable Use")],["Accessibility",soon("Accessibility")],["Data Requests",soon("Data Requests")]]} />
      </div>
      <div className={`container ${styles.bottom}`}>
        <AdminGateTrigger><span className={styles.copyright}>© {new Date().getFullYear()} PIKE</span></AdminGateTrigger>
        <p><span aria-hidden="true">●</span> Player access is coming soon</p>
        <a href="#main-content">Back to top ↑</a>
      </div>
    </footer>
  );
}

function FooterGroup({ title, links }: { title: string; links: string[][] }) {
  return <nav className={styles.group} aria-label={title}><h2>{title}</h2><ul>{links.map(([label,href])=><li key={label}>{href.startsWith("mailto:") ? <a href={href}>{label}</a> : <Link href={href}>{label}</Link>}</li>)}</ul></nav>;
}
