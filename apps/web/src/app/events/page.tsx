import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { landingContent } from "@/content/landing";
import styles from "@/components/landing/Landing.module.css";

export const metadata = { title: "PIKE for events", description: "Verified completion records by event zone, without an attendee app download." };
export default function EventsPage() { return <><LandingHeader /><main className={styles.stub}><article className="container"><p className={styles.eyebrow}>PIKE for events</p><h1>See which event zones people completed.</h1><p>Use marker-linked experiences to record completions by zone without asking attendees to install an app. Packages start from KES {landingContent.eventPriceKes.toLocaleString("en-KE")}. The full event offer is being prepared.</p><div className={styles.actions}><a className={styles.primary} href="/#free-marker">Enquire about an event</a><a className={styles.secondary} href="/">Back to venues</a></div></article></main><LandingFooter /></>; }
