import { landingContent } from "@/content/landing";
import { Reveal } from "@/components/Reveal";
import { FreeMarkerForm } from "./FreeMarkerForm";
import styles from "./Landing.module.css";

export function FinalCta() {
  return <section id="free-marker" className={styles.final} aria-labelledby="final-heading">
    <div className={`container ${styles.finalGrid}`}>
      <Reveal variant="left"><div>
        <p className={styles.eyebrow}>Free venue start</p>
        <h2 id="final-heading">Put your first marker to work.</h2>
        <p className={styles.finalCopy}>Your first marker and first {landingContent.freeVisits} verified visits each month are free. Tell us where to reach you and we’ll help set up the first quest. No sales call, no contract to sign — just a WhatsApp chat and a printed card.</p>
        <ul className={styles.trustChips}>
          <li className="pill">First marker, free</li>
          <li className="pill">{landingContent.freeVisits} visits a month, free</li>
        </ul>
        <div className={styles.actions}>{landingContent.whatsApp.href ? <a className={styles.textLink} href={landingContent.whatsApp.href} rel="noreferrer">{landingContent.whatsApp.label}</a> : <span className={styles.disabled}>{landingContent.whatsApp.label} — use the form for now.</span>}</div>
      </div></Reveal>
      <Reveal variant="right" delay={90}><div className={styles.formCard}>
        <div className={styles.formCardHeader}><span className={styles.formCardBadge} aria-hidden="true">✎</span><div><strong>Request your marker</strong><span>We’ll reach out on WhatsApp to confirm the details.</span></div></div>
        <FreeMarkerForm />
      </div></Reveal>
    </div>
  </section>;
}
