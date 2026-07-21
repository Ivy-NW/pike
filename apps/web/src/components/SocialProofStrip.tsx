import { Reveal } from "./Reveal";
import styles from "./SocialProofStrip.module.css";

/**
 * The mockup this translates (docs/ui designs/marketing_landing_page) shows a row of named
 * venue logos under "Powering high-performance venues globally" -- but PIKE is pre-launch
 * with no live venues yet (see README "what's real vs. stubbed"), so naming customers here
 * would be fabricated social proof. Category tags keep the same visual rhythm honestly.
 */
const categories = ["Cafés", "Gyms", "Museums", "Retail", "Attractions", "Campuses"];

export function SocialProofStrip() {
  return (
    <section className={styles.strip}>
      <div className="container">
        <p className={styles.eyebrow}>Built for venues like yours</p>
        <Reveal variant="none" className={`stagger-children ${styles.row}`}>
          {categories.map((category) => (
            <span key={category} className="pill">
              {category}
            </span>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
