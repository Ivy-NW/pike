import Image from "next/image";
import { DemoDialog } from "./DemoDialog";
import styles from "./Hero.module.css";

const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "http://localhost:3001";

export function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-heading">
      <div className={`container ${styles.grid}`}>
        <div className={styles.copy}>
          <p className="section-eyebrow">Browser-based quests for real-world venues</p>
          <h1 id="hero-heading">Turn a visit into a reason to return.</h1>
          <p className={styles.lede}>PIKE lets guests scan a marker, play a short quest, and unlock a reward you control—right inside your venue, with no app needed for the first play.</p>
          <div className={styles.actions}>
            <a href={`${DASHBOARD_URL}/register`} className="btn btn-primary">Create a venue quest</a>
            <DemoDialog />
          </div>
          <p className={styles.note}>Set up the quest <span>→</span> print the marker <span>→</span> choose the reward.</p>
        </div>
        <figure className={styles.visual}>
          <div className={styles.imageWrap}>
            <Image src="/images/landing/hero-venue.png" alt="A visitor using a phone beside a quest marker in a welcoming café" fill priority sizes="(max-width: 760px) 100vw, 56vw" className={styles.photo} />
            <div className={styles.markerNote} aria-hidden="true"><span>01</span><i />Physical quest marker</div>
          </div>
          <figcaption><span>The Hidden Table · concept quest</span><span>Café floor · 14:32</span></figcaption>
        </figure>
      </div>
    </section>
  );
}
