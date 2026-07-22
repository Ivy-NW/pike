import Image from "next/image";
import { Reveal } from "./Reveal";
import styles from "./LandingSections.module.css";

const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "http://localhost:3001";
const themes = [
  { name: "The hidden table", place: "Café treasure hunt", image: "/images/landing/theme-cafe.png", className: styles.cafe },
  { name: "A doorway through time", place: "Museum time portal", image: "/images/landing/theme-museum.png", className: styles.museum },
  { name: "Hit the impossible shot", place: "Sports skill challenge", image: "/images/landing/theme-sport.png", className: styles.sport },
];

export function VisitStory() {
  return <section className={styles.visitStory} aria-labelledby="two-wins-heading"><div className={`container ${styles.storyGrid}`}><Reveal variant="up" className={styles.storyIntro}><p className="section-eyebrow">One visit, two wins</p><h2 id="two-wins-heading">Good for the moment.<br />Better for what comes next.</h2></Reveal><Reveal variant="left" className={styles.playerStory}><span className={styles.storyNumber}>01</span><p className={styles.storyLabel}>For players</p><h3>Find something unexpected.</h3><p>Spot a marker, step into a quick challenge and leave with a real reason to smile.</p></Reveal><Reveal variant="right" delay={120} className={styles.venueStory}><span className={styles.storyNumber}>02</span><p className={styles.storyLabel}>For venues</p><h3>Turn a visit into a memory.</h3><p>Create an experience that feels like your place—and makes the next visit an easy yes.</p></Reveal></div></section>;
}

export function PlayerJourney() {
  const steps = [
    ["Spot it", "A small marker turns an ordinary corner into an invitation."],
    ["Scan it", "Open the experience in your browser and point your camera."],
    ["Play", "Follow one quick prompt made for the place you’re standing in."],
    ["Unlock", "Leave with a real reward—and a reason to return."],
  ];
  return (
    <section id="how-it-works" className={styles.journey} aria-labelledby="journey-heading">
      <div className={`container ${styles.journeyGrid}`}>
        <Reveal variant="up" className={styles.journeyNarrative}>
          <p className={`section-eyebrow ${styles.lightEyebrow}`}>The player experience</p>
          <h2 id="journey-heading">From “what’s that?” to “look what I unlocked.”</h2>
          <p className={styles.journeyIntro}>One quick journey, right inside the venue.</p>
          <ol className={styles.sequenceLabels}>{steps.map(([title, body], index) => <li key={title}><b>0{index + 1}</b><div><span>{title}</span><p>{body}</p></div></li>)}</ol>
        </Reveal>
        <Reveal variant="scale" delay={150} className={styles.journeyVisual}>
          <div className={styles.phoneSequence} aria-label="A quest marker is scanned, the challenge completes, and a reward appears">
            <div className={styles.phoneTop}><span>9:41</span><span>● ● ●</span></div>
            <div className={styles.questScene}><span className={styles.questHint}>Find the mark</span><div className={styles.reticle}><i /><i /><i /><i /><b /></div><div className={styles.progress}><span /></div><p className={styles.progressText}>Quest in progress</p><div className={styles.reveal}><span>Reward</span><small>Reward unlocked</small><strong>Your next visit<br />just got better.</strong><em>Save reward</em></div></div>
          </div>
          <div className={styles.sequenceNote}><span>00:18</span><p>That’s all it takes to turn curiosity into a reason to come back.</p></div>
        </Reveal>
      </div>
    </section>
  );
}

export function ExperienceThemes() {
  return <section id="for-players" className={styles.themes} aria-labelledby="themes-heading"><Reveal variant="up" className={`container ${styles.themesHeading}`}><div><p className="section-eyebrow">Experience themes</p><h2 id="themes-heading">Your place.<br /><em>Your story.</em></h2></div><p>PIKE gives every venue a recognizable way to play, while the world around it can feel completely your own.</p></Reveal><Reveal variant="none" className={`container stagger-children ${styles.themeRail}`}>{themes.map((theme,index)=><article key={theme.name} className={`${styles.theme} ${theme.className}`}><Image src={theme.image} alt="" fill sizes="(max-width: 760px) 88vw, 33vw" className={styles.themeImage}/><div className={styles.themeShade}/><span className={styles.themeIndex}>0{index+1}</span><div className={styles.themeCopy}><p>{theme.place}</p><h3>{theme.name}</h3><span>Start quest →</span></div></article>)}</Reveal><p className={`container ${styles.themeFootnote}`}>One simple PIKE flow. A different feeling in every place.</p></section>;
}

export function VenueValue() {
  const benefits = [
    ["Bring the next visit closer", "Pair a memorable challenge with a reward for next time."],
    ["Launch it yourself", "Create the quest, print its marker and place it in your venue."],
    ["Control every reward", "Set availability and redemption limits that work for you."],
    ["See what happened", "Review scans and redemptions without a wall of analytics."],
  ];
  return (
    <section id="for-venues" className={styles.venues} aria-labelledby="venues-heading">
      <div className={`container ${styles.venueGrid}`}>
        <Reveal variant="left" className={styles.venueCopy}>
          <p className="section-eyebrow">Built for venues</p><h2 id="venues-heading">Make “see you again” part of the experience.</h2>
          <p className={styles.venueLede}>Turn a few minutes of play into a clear next step—without adding technical work to your day.</p>
          <ol className={styles.benefits}>{benefits.map(([title,body],index)=><li key={title}><span>0{index+1}</span><div><b>{title}</b><p>{body}</p></div></li>)}</ol>
          <div className={styles.venueActions}><a className="btn btn-primary" href={`${DASHBOARD_URL}/register`}>Create a business account</a><a className="btn btn-link" href={`${DASHBOARD_URL}/login`}>Business login →</a></div>
        </Reveal>
        <Reveal variant="right" delay={150} className={styles.dashboardFrame}>
          <DashboardPreview />
          <aside className={styles.outcomePanel}><span aria-hidden="true">↗</span><div><b>A reward saved today</b><p>can become tomorrow’s reason to walk back in.</p></div></aside>
        </Reveal>
      </div>
    </section>
  );
}

function DashboardPreview() {
  return <div className={styles.dashboard} aria-label="Example of the PIKE venue dashboard"><div className={styles.dashRail}><b>P</b><span>⌂</span><span>◇</span><span>◎</span></div><div className={styles.dashBody}><div className={styles.dashTop}><div><small>Good afternoon</small><strong>Your venue</strong></div><i>JD</i></div><div className={styles.questPanel}><span className={styles.live}>● Live</span><small>Current quest</small><h3>The hidden table</h3><p>Café treasure hunt</p><div className={styles.questStats}><span><b>42</b>Scans</span><span><b>18</b>Rewards saved</span><span><b>7</b>Redeemed</span></div></div><div className={styles.rewardControl}><div><small>Reward control</small><strong>A treat for your next visit</strong></div><span>18 / 50 available</span><div className={styles.controlBar}><i /></div></div><button type="button" tabIndex={-1}>Edit quest</button></div><div className={styles.dashSticker}>Quest live<br/><span>No code needed</span></div></div>;
}

export function TrustLayer() {
  const trust = [["At your venue","Rewards unlock where the experience happens."],["In the browser","Players can start without installing an app."],["In your control","You choose the reward and how many are available."]];
  return <section className={styles.trust} aria-labelledby="trust-heading"><div className="container"><Reveal variant="up"><p className="section-eyebrow">Simple by design</p><h2 id="trust-heading">The clever part stays<br/>out of the way.</h2></Reveal><Reveal variant="none" delay={100} className={`stagger-children ${styles.trustList}`}>{trust.map(([label,body],i)=><article key={label}><span>0{i+1}</span><h3>{label}</h3><p>{body}</p></article>)}</Reveal></div></section>;
}

export function BusinessCta() {
  return <section className={styles.businessCta} aria-labelledby="business-cta-heading"><Reveal variant="scale" className={`container ${styles.businessCtaInner}`}><p>For venues</p><h2 id="business-cta-heading">Ready to make the next visit happen?</h2><a href={`${DASHBOARD_URL}/register`} className="btn btn-primary">Create a business account</a></Reveal></section>;
}
