import { Reveal } from "@/components/Reveal";
import { CountUp } from "@/components/CountUp";
import { faqs, landingContent } from "@/content/landing";
import { CameraIcon, FlagIcon, ShieldIcon } from "@/components/icons";
import styles from "./Landing.module.css";

const formatKes = (value: number) => `KES ${value.toLocaleString("en-KE")}`;

export function WhyVenues() {
  return <section className={styles.section} aria-labelledby="why-venues-heading"><div className="container"><div className={styles.splitHeading}>
    <Reveal variant="left"><div><p className={styles.eyebrow}>Why a quest beats an ad</p><h2 id="why-venues-heading">A discount code gets forgotten. A quest gets finished.</h2></div></Reveal>
    <Reveal variant="right" delay={100}><p>Run a normal promo and you're praying somebody noticed it, kept it, and remembered the code. Turn the same offer into a five-second quest on the table, and people finish it because finishing feels good — then the camera hands you proof they were actually there. You're not spending on a campaign and hoping it landed. You're watching it land, one verified visit at a time. You already have a counter, a table, a door. This just gives what's on it a reason to be picked up — and a memory of who did.</p></Reveal>
  </div></div></section>;
}

export function HowItWorks() {
  const steps = [
    { icon: <FlagIcon size={22} />, title: "Print the marker", copy: "Put the supplied poster, table card, or sticker inside your venue." },
    { icon: <CameraIcon size={22} />, title: "Your customer scans it", copy: "Their browser opens the experience. They don’t need to install an app first." },
    { icon: <ShieldIcon size={22} />, title: "You get verified footfall", copy: "PIKE records a completion only when the camera recognises your specific marker." },
  ];
  return <section id="how-it-works" className={styles.section} aria-labelledby="how-heading"><div className="container">
    <Reveal variant="up"><div className={styles.splitHeading}><h2 id="how-heading">Print it. They scan it. You see the visit.</h2><p>Nothing about a normal shift changes. Your staff just need to notice the reward on someone’s phone and honour it.</p></div></Reveal>
    <Reveal variant="none" className={`${styles.stepReveal} stagger-children`}><ol className={styles.stepPath}>{steps.map((step, index) => <li key={step.title} className={styles.stepCard}><span className={styles.stepIcon}>{step.icon}</span><span className={styles.stepNumber}>{index + 1}</span><h3>{step.title}</h3><p>{step.copy}</p></li>)}</ol></Reveal>
  </div></section>;
}

export function AntiCheatProof() {
  return <section id="verification" className={`${styles.section} ${styles.verification}`} aria-labelledby="verification-heading"><div className="container">
    <div className={styles.verificationIntro}>
      <Reveal variant="left"><div><p className={styles.eyebrow}>Proof of presence</p><h2 id="verification-heading" className={styles.sectionTitle}>This is what proof of presence looks like.</h2></div></Reveal>
      <Reveal variant="right" delay={90}><p className={styles.verificationLead}>A static QR code can be photographed and shared from anywhere. A GPS check-in can be spoofed from a couch. Proof of presence means the camera itself has to recognise your specific printed marker before a completion counts — a screenshot of the link isn't enough, and neither is a lucky pin drop.</p></Reveal>
    </div>
    <Reveal variant="none" className={styles.tableReveal}><div className={styles.pricingScroll} tabIndex={0} role="region" aria-label="Visit evidence comparison, scroll horizontally to see all columns"><table className={styles.comparison}><caption className="sr-only">Comparison of visit evidence methods</caption><thead><tr><th>Method</th><th>What a customer presents</th><th>Evidence recorded</th></tr></thead><tbody><tr><td>Static QR code</td><td>A link that can be shared</td><td>Link opened</td></tr><tr><td>GPS check-in</td><td>An approximate phone location</td><td>Device near a pin</td></tr><tr><td>PIKE marker</td><td>Your specific printed image</td><td>Marker seen by camera</td></tr></tbody></table></div></Reveal>
    <Reveal variant="up" delay={140}><div className={styles.capNote}><strong>Server-enforced caps</strong><p>Set a daily redemption limit before the promotion starts. PIKE stops redemptions at that limit. Marker recognition verifies the marker being seen; it does not verify a person’s identity or purchase value.</p></div></Reveal>
  </div></section>;
}

export function Pricing() {
  return <section id="pricing" className={styles.section} aria-labelledby="pricing-heading"><div className="container">
    <p className={styles.eyebrow}>Prepaid verified visits</p><h2 id="pricing-heading" className={styles.sectionTitle}>Start free. Buy visits when you need more.</h2>
    <div className={styles.freeTier}><strong>Free forever</strong><ul><li>One quest</li><li>One marker</li><li>{landingContent.freeVisits} verified completions each calendar month</li><li>No card required</li></ul></div>
    <div className={styles.pricingScroll}><table className={styles.pricingTable}><caption className="sr-only">PIKE prepaid visit packs</caption><thead><tr><th>Pack</th><th>Prepaid price</th><th>Verified visits</th><th>Price per visit</th></tr></thead><tbody>{landingContent.packs.map(pack => <tr key={pack.name} className={pack.name === "Growth" ? styles.reference : undefined}><td>{pack.name}{pack.name === "Growth" && " · reference"}</td><td>{formatKes(pack.priceKes)}</td><td>{pack.visits.toLocaleString("en-KE")}</td><td>{formatKes(pack.pricePerVisit)}</td></tr>)}</tbody></table></div>
    <div className={styles.terms}><span>Pay with M-Pesa</span><span>Credits expire after 12 months</span><span>Prices exclude 16% VAT</span><span>eTIMS invoice with every purchase</span><span>No subscription or contract</span></div>
    <p className={styles.breakeven}>On the Growth pack, 100 verified visits cost KES 700. If one of those visits would not otherwise have happened, it needs to contribute at least KES 700 in gross profit—not simply revenue—for the campaign to break even.</p>
    <div className={styles.actions}><a className={styles.primary} href="/#free-marker">Start a quest</a></div>
  </div></section>;
}

export function Attribution() {
  const metrics: [string, number][] = [["Marker scans", 37], ["Verified completions", 29], ["Reward redemptions", 22], ["Cross-venue visitors", 6]];
  return <section id="measurement" className={styles.section} aria-labelledby="measurement-heading"><div className={`container ${styles.report}`}>
    <Reveal variant="left"><div><p className={styles.eyebrow}>Footfall and reward activity</p><h2 id="measurement-heading" className={styles.sectionTitle}>Know what happened after the poster went up.</h2><p className={styles.reportQuote}>“37 people scanned your marker last week. 29 completed. 22 redeemed. 6 had also scanned at another participating venue nearby.”</p></div></Reveal>
    <Reveal variant="right" delay={80} className={styles.ledgerReveal}><div className={styles.ledger} aria-label="Example weekly report"><div className={styles.ledgerHeader}><strong>Example weekly report</strong><span>Westlands venue · 24–30 Aug</span></div><dl>{metrics.map(([label, value]) => <div className={styles.metric} key={label}><dt>{label}</dt><dd><CountUp value={value} /></dd></div>)}</dl><p className={styles.reportNote}>This report describes marker and reward activity. It does not attribute till revenue or customer spend.</p></div></Reveal>
  </div></section>;
}

export function Objections() {
  return <section className={styles.section} aria-labelledby="questions-heading"><div className="container">
    <Reveal variant="up"><p className={styles.eyebrow}>Practical answers</p><h2 id="questions-heading" className={styles.sectionTitle}>Questions venue owners ask first.</h2></Reveal>
    <Reveal variant="none" className={`${styles.faqReveal} stagger-children`}><div className={styles.faqList}>{faqs.map((faq, index) => <details key={faq.question} open={index === 0}><summary>{faq.question}</summary><p>{faq.answer}{index === 4 && <> <a href="/privacy">Read our privacy policy.</a></>}</p></details>)}</div></Reveal>
  </div></section>;
}

export function AudienceRoutes() {
  return <section id="events" className={styles.events} aria-labelledby="events-heading"><Reveal variant="none" className={styles.eventReveal}><div className={`container ${styles.eventInner}`}><div><p className={styles.eyebrow}>For organisers</p><h2 id="events-heading">Running an event instead?</h2></div><p>Track verified completions by zone without asking attendees to install an app. Event packages start from {formatKes(landingContent.eventPriceKes)}.</p><a className={styles.secondary} href="/events">View event packages</a></div></Reveal></section>;
}

export function WhyPlay() {
  return <section className={styles.section} aria-labelledby="why-play-heading"><div className="container">
    <Reveal variant="up"><div className={styles.splitHeading}><div><p className={styles.eyebrow}>Why players scan</p><h2 id="why-play-heading">Make every visit worth coming back for.</h2></div><p>You're already at the table. That marker isn't decoration — point your phone at it and a quest opens: a quick prompt, then a reward you didn't see coming. Scan another marker somewhere else, and it starts to feel less like a discount and more like a streak worth keeping. No app to install, no account before you can see what you get. Just scan it, claim it, keep the surprise.</p></div></Reveal>
    <Reveal variant="up" delay={130}><p className={styles.breakeven}><strong>Fair on both sides —</strong> you get a reason to look up from your phone for a second and something to show for it; the venue gets proof their marker got someone through the door, and a reason to see you again. Nobody loses. <a className={styles.textLink} href="/play">Go to player guide →</a></p></Reveal>
  </div></section>;
}
