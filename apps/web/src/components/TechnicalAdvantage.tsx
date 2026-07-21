import { AnalyticsIcon, BoltIcon, LockIcon, ShieldIcon } from "./icons";
import { Reveal } from "./Reveal";
import styles from "./TechnicalAdvantage.module.css";

const barHeights = [40, 60, 50, 90, 70];

export function TechnicalAdvantage() {
  return (
    <section className="section">
      <div className="container">
        <Reveal variant="up" className={styles.intro}>
          <span className="section-eyebrow">The technical advantage</span>
          <h2 className="section-heading" style={{ margin: "0 auto" }}>
            Presence you can prove, not just claim.
          </h2>
        </Reveal>

        <Reveal variant="none" className={`stagger-children ${styles.grid}`}>
          <div className={`${styles.tile} ${styles.tileWide}`}>
            <div className={styles.tileBody}>
              <div className="icon-badge">
                <ShieldIcon size={22} />
              </div>
              <h3 className={styles.tileTitle}>Marker-based verification</h3>
              <p className={styles.tileText}>
                Forget GPS spoofing. PIKE uses a physical marker at your location to verify
                presence before a reward ever unlocks.
              </p>
            </div>
            <div className={styles.visual} aria-hidden="true">
              <div className={styles.scanFrame}>
                <ShieldIcon size={28} color="var(--landing-accent)" />
              </div>
              <span className={styles.scanLabel}>Marker verified</span>
            </div>
          </div>

          <div className={styles.tile}>
            <div className="icon-badge">
              <AnalyticsIcon size={22} />
            </div>
            <h3 className={styles.tileTitle}>Venue analytics</h3>
            <p className={styles.tileText}>
              Real-time scan and conversion data — see exactly how quests drive foot traffic.
            </p>
            <div className={styles.barChart} aria-hidden="true">
              {barHeights.map((height, i) => (
                <div key={i} className={styles.bar} style={{ height: `${height}%` }} />
              ))}
            </div>
          </div>

          <div className={styles.tile}>
            <div className="icon-badge">
              <BoltIcon size={22} />
            </div>
            <h3 className={styles.tileTitle}>Zero-install WebAR</h3>
            <p className={styles.tileText}>
              No app store friction. Visitors scan a marker or QR code and land straight in the
              quest — right from their phone&apos;s browser.
            </p>
          </div>

          <div className={`${styles.tile} ${styles.tileWide} ${styles.reverse}`}>
            <div className={styles.tileBody}>
              <div className="icon-badge">
                <LockIcon size={22} />
              </div>
              <h3 className={styles.tileTitle}>Immutable proof of presence</h3>
              <p className={styles.tileText}>
                Every recognition event is a verifiable record, giving your loyalty program a
                security layer that self-reported check-ins can&apos;t match.
              </p>
            </div>
            <div className={`${styles.visual} ${styles.lockVisual}`} aria-hidden="true">
              <LockIcon size={40} color="currentColor" />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
