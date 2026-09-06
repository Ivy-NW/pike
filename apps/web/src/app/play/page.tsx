import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { AppDownload } from "@/components/AppDownload";
import styles from "@/components/landing/Landing.module.css";

export const metadata = { title: "PIKE player guide", description: "A short guide for people who found PIKE at a participating venue." };
export default function PlayPage() { return <><LandingHeader /><main className={styles.stub}><article className="container"><p className={styles.eyebrow}>Player guide</p><h1>Your quest starts at the marker.</h1><p>Scan a PIKE marker at a participating venue to open the quest in your browser. Complete the prompt, claim the reward, and follow the on-screen instructions. A fuller guide to quests, rewards, XP, streaks, and the app is coming soon.</p><div className={styles.actions}><a className={styles.primary} href="/">Back to PIKE</a></div></article></main><AppDownload /><LandingFooter /></>; }
