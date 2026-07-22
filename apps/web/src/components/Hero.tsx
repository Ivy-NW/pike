import Image from "next/image";
import styles from "./Hero.module.css";

const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "http://localhost:3001";

export function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-heading">
      <div className={`container ${styles.grid}`}>
        <div className={styles.copy}>
          <h1 id="hero-heading">Make every visit worth <em>coming back for.</em></h1>
          <p className={styles.lede}>Create playful, rewarding moments inside your venue. Players scan, play and unlock something worth returning for—straight from their phone.</p>
          <div className={styles.actions}>
            <a href={`${DASHBOARD_URL}/register`} className="btn btn-primary">Create your first quest</a>
            <a href="#how-it-works" className="btn btn-link">See the player experience <span aria-hidden="true">↓</span></a>
          </div>
          <p className={styles.note}><span aria-hidden="true">●</span> No app needed for the first play.</p>
        </div>
        <div className={styles.visual}>
          <Image src="/images/landing/hero-venue.png" alt="A visitor discovering a quest marker at a welcoming café" fill priority sizes="(max-width: 760px) 100vw, 58vw" className={styles.photo} />
          <div className={styles.scanCard} aria-hidden="true">
            <div className={styles.scanTop}><span>PIKE quest</span><b>Live</b></div>
            <div className={styles.marker}><span /><span /><span /><span /><i /></div>
            <p>Point your camera<br />at the marker</p>
          </div>
          <div className={styles.rewardCard} aria-hidden="true">
            <span className={styles.spark}>Reward</span>
            <div><small>Reward unlocked</small><strong>A treat for next time</strong></div>
          </div>
          <span className={styles.caption}>A small moment.<br />A reason to return.</span>
        </div>
      </div>
    </section>
  );
}
