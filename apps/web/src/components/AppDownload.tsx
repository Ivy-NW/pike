"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import styles from "./AppDownload.module.css";

export function AppDownload() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const submit = async (event: React.FormEvent) => { event.preventDefault(); setStatus("loading"); try { await api.joinWaitlist(email, "consumer"); setStatus("done"); } catch { setStatus("error"); } };
  return (
    <section id="player-waitlist" className={styles.section} aria-labelledby="waitlist-heading">
      <div className={`container ${styles.grid}`}>
        <div className={styles.intro}><p className="section-eyebrow">For players</p><h2 id="waitlist-heading">Want to be first to play?</h2><p>Join the player list and we’ll tell you when new quests open.</p></div>
        <div className={styles.formWrap}>
          {status === "done" ? <div className={styles.success} role="status" aria-live="polite"><span aria-hidden="true">✓</span><div><b>You’re on the list.</b><p>We’ll email you when player access opens.</p></div></div> :
            <form onSubmit={submit} className={styles.form}><label htmlFor="player-email">Your email address</label><div className={styles.inputRow}><input id="player-email" name="email" type="email" required autoComplete="email" placeholder="you@email.com" value={email} onChange={(event) => setEmail(event.target.value)} /><button className="btn btn-primary" disabled={status === "loading"}>{status === "loading" ? "Joining…" : "Join the player waitlist"}</button></div><p className={styles.privacy}>One useful launch email. No inbox clutter.</p></form>}
          <div aria-live="polite">{status === "error" && <p className={styles.error}>Something went wrong. Please try again in a moment.</p>}</div>
        </div>
      </div>
    </section>
  );
}
