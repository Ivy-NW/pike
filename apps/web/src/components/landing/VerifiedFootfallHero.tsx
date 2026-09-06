import { DemoDialog } from "@/components/DemoDialog";
import { landingContent } from "@/content/landing";
import { VisitProofVisual } from "./VisitProofVisual";
import styles from "./Landing.module.css";

const facts = [
  `${landingContent.freeVisits} free visits every month`,
  "Top up with M-Pesa",
  "No contract",
  "Proof of presence, not promises",
];

export function VerifiedFootfallHero() {
  return <section className={styles.hero} aria-labelledby="hero-heading">
    <div className={`container ${styles.heroGrid}`}>
      <div className={styles.heroCopy}>
        <h1 id="hero-heading">Every visit becomes <mark className={styles.highlight}>proof</mark> — and a reason to come back.</h1>
        <p className={styles.lede}>Posters and paid ads ask you to trust that something worked. PIKE turns a walk-in into a quest: your customer&apos;s camera proves they were standing in your venue, and the reward gives them a reason to return. A game beats a guess — and you pay only after the camera verifies it, a few shillings at a time.</p>
        <div className={styles.actions}><a className={styles.primary} href="#free-marker">Start a quest</a><DemoDialog className={styles.secondary} /></div>
      </div>
      <div className={styles.mediaFrame}>
        <p className={styles.mediaCaption}>Live visit proof / three steps</p>
        <VisitProofVisual />
      </div>
    </div>
    <ul className={styles.factStrip} aria-label="Quick facts">
      {facts.map(fact => <li key={fact}>{fact}</li>)}
    </ul>
  </section>;
}
