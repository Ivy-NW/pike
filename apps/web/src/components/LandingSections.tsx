import Image from "next/image";
import styles from "./LandingSections.module.css";

const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "http://localhost:3001";

const journey = [
  ["Spot", "A marker at the table, entrance, exhibit, or counter invites the guest in."],
  ["Scan", "The quest opens in the phone browser. No download before the first play."],
  ["Play", "A short, venue-themed prompt turns the space into part of the challenge."],
  ["Return", "The guest saves a venue-set reward for a future visit."],
];

export function PlayerJourney() {
  return (
    <section id="how-it-works" className={styles.journey} aria-labelledby="journey-heading">
      <div className={`container ${styles.journeyHead}`}>
        <div><p className={`section-eyebrow ${styles.blueEyebrow}`}>One visit, end to end</p><h2 id="journey-heading">One marker. One minute.<br />One more reason to come back.</h2></div>
        <p>Follow one example visit at The Hidden Table, a concept quest for a neighbourhood café.</p>
      </div>
      <div className={`container ${styles.trail}`}>
        <div className={styles.route} aria-hidden="true"><span /><span /><span /><span /></div>
        <ol>{journey.map(([title, body], index) => <li key={title}><b>0{index + 1}</b><h3>{title}</h3><p>{body}</p>{index === 3 && <span className={styles.reward}>Reward saved</span>}</li>)}</ol>
      </div>
      <div className={`container ${styles.fieldNote}`}><span>Field note · 14:33</span><p>The technology stays quiet. The place, prompt, and next-visit reward carry the story.</p></div>
    </section>
  );
}

export function VenueValue() {
  const values = [
    ["Create a return trigger", "The reward is saved for the next visit—not folded into another generic checkout discount."],
    ["Make the venue part of the game", "Marker recognition connects the prompt to a specific table, exhibit, entrance, or counter."],
    ["Stay in control", "Choose the reward, availability, expiry, and redemption cap before you publish."],
  ];
  return (
    <section id="for-venues" className={styles.value} aria-labelledby="value-heading">
      <div className={`container ${styles.valueGrid}`}>
        <div className={styles.valueIntro}><p className="section-eyebrow">Why venues use it</p><h2 id="value-heading">A loyalty mechanic guests can actually remember.</h2><p>PIKE adds a small, ownable moment to the visit—and gives that moment a practical next step.</p></div>
        <div className={styles.valueList}>{values.map(([title, body], index) => <article key={title}><span>0{index + 1}</span><div><h3>{title}</h3><p>{body}</p></div></article>)}</div>
      </div>
      <div className={`container ${styles.fit}`}><b>Good fit for</b><p>Cafés · Museums · Attractions · Campuses · Gyms · Live events</p></div>
    </section>
  );
}

const concepts = [
  { name: "The Hidden Table", type: "Café", prompt: "Find a detail in the room", reward: "Next-visit treat", image: "/images/landing/theme-cafe.png" },
  { name: "A Doorway Through Time", type: "Museum", prompt: "Reveal an artifact story", reward: "Return-pass perk", image: "/images/landing/theme-museum.png" },
  { name: "The Impossible Shot", type: "Sports venue", prompt: "Complete a skill prompt", reward: "Concession reward", image: "/images/landing/theme-sport.png" },
];

export function QuestExamples() {
  return (
    <section id="quest-examples" className={styles.examples} aria-labelledby="examples-heading">
      <div className={`container ${styles.examplesHead}`}><div><p className="section-eyebrow">Quest examples</p><h2 id="examples-heading">The PIKE flow stays familiar.<br />The story belongs to the venue.</h2></div><p>Three fictional directions show how the same mechanic can take on the character of a place.</p></div>
      <div className={`container ${styles.exampleGrid}`}>
        {concepts.map((concept, index) => <article key={concept.name} className={index === 0 ? styles.featured : styles.supporting}>
          <div className={styles.conceptImage}><Image src={concept.image} alt={`${concept.name}, a ${concept.type.toLowerCase()} concept quest`} fill sizes={index === 0 ? "(max-width: 760px) 100vw, 65vw" : "(max-width: 760px) 100vw, 32vw"} /></div>
          <div className={styles.conceptCopy}><span>Concept quest · {concept.type}</span><h3>{concept.name}</h3><dl><div><dt>Prompt</dt><dd>{concept.prompt}</dd></div><div><dt>Return reward</dt><dd>{concept.reward}</dd></div></dl></div>
        </article>)}
      </div>
    </section>
  );
}

export function OperatorSetup() {
  return (
    <section className={styles.operator} aria-labelledby="operator-heading">
      <div className={`container ${styles.operatorGrid}`}>
        <div className={styles.dashboardWrap}><p className={styles.captureLabel}>Operator view · quest controls</p><DashboardPreview /><p className={styles.captureCaption}>A simplified representation of the current setup controls—not an analytics claim.</p></div>
        <div className={styles.operatorCopy}>
          <p className="section-eyebrow">Setup and trust</p><h2 id="operator-heading">Built to run from the venue, not from an agency.</h2>
          <ol><li><b>01</b><div><h3>Create the quest</h3><p>Choose a theme and write the short prompt.</p></div></li><li><b>02</b><div><h3>Place the marker</h3><p>Upload or select an image, then print it for the venue.</p></div></li><li><b>03</b><div><h3>Set the rules</h3><p>Choose the reward, cap, expiry, and publish.</p></div></li></ol>
          <div className={styles.trust}><p>Marker recognition checks the specific physical target.</p><p>Caps and expiry are enforced by the server.</p><p>The first quest works in a supported mobile browser.</p><p>No continuous location tracking is required for the scan flow.</p></div>
        </div>
      </div>
    </section>
  );
}

function DashboardPreview() {
  return <div className={styles.dashboard} aria-label="Simplified PIKE quest setup screen"><aside><strong>P</strong><span>Quest</span><span>Marker</span><span>Reward</span></aside><div className={styles.dashMain}><header><div><small>Quest editor</small><h3>The Hidden Table</h3></div><span className={styles.draft}>Draft</span></header><div className={styles.control}><small>Quest prompt</small><b>Find the small blue mark near the counter.</b></div><div className={styles.control}><small>Next-visit reward</small><b>A house treat with your next order</b></div><div className={styles.controlRow}><div className={styles.control}><small>Daily cap</small><b>50 rewards</b></div><div className={styles.control}><small>Expiry</small><b>14 days</b></div></div><button type="button" tabIndex={-1}>Publish quest</button></div></div>;
}

export function BusinessInvitation() {
  return (
    <section className={styles.invitation} aria-labelledby="invitation-heading">
      <div className={`container ${styles.invitationGrid}`}>
        <p className={styles.launchNote}>PIKE is opening its first venue partnerships.</p>
        <div><p className={`section-eyebrow ${styles.blueEyebrow}`}>For venue teams</p><h2 id="invitation-heading">Bring a quest to your venue.</h2><p>Create an account to build your first quest, or contact us if you want help planning a pilot.</p></div>
        <div className={styles.invitationActions}><a className="btn btn-primary" href={`${DASHBOARD_URL}/register`}>Create a business account</a><a className={styles.email} href="mailto:hello@pike.app">Email the PIKE team →</a></div>
      </div>
    </section>
  );
}
