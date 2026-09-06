"use client";

import { FormEvent, useState } from "react";
import styles from "./Landing.module.css";

type Fields = "name" | "venueName" | "whatsapp";

export function FreeMarkerForm() {
  const [errors, setErrors] = useState<Partial<Record<Fields, string>>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const element = event.currentTarget;
    const form = new FormData(element);
    const values = { name: String(form.get("name") ?? "").trim(), venueName: String(form.get("venueName") ?? "").trim(), whatsapp: String(form.get("whatsapp") ?? "").trim(), neighbourhood: String(form.get("neighbourhood") ?? "").trim() };
    const next: Partial<Record<Fields, string>> = {};
    if (values.name.length < 2) next.name = "Enter your name.";
    if (values.venueName.length < 2) next.venueName = "Enter your venue name.";
    if (!/^\+?[0-9\s-]{9,18}$/.test(values.whatsapp)) next.whatsapp = "Enter a valid WhatsApp number.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setStatus("sending");
    try {
      const response = await fetch("/api/free-marker", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      setStatus(response.ok ? "success" : "error");
      if (response.ok) element.reset();
    } catch { setStatus("error"); }
  }

  return <form className={styles.form} onSubmit={submit} noValidate>
    <div className={styles.field}><label htmlFor="lead-name">Your name</label><input id="lead-name" name="name" autoComplete="name" aria-invalid={!!errors.name} aria-describedby="name-error" /><span id="name-error" className={styles.error}>{errors.name}</span></div>
    <div className={styles.field}><label htmlFor="lead-venue">Venue name</label><input id="lead-venue" name="venueName" autoComplete="organization" aria-invalid={!!errors.venueName} aria-describedby="venue-error" /><span id="venue-error" className={styles.error}>{errors.venueName}</span></div>
    <div className={styles.field}><label htmlFor="lead-whatsapp">WhatsApp number</label><input id="lead-whatsapp" name="whatsapp" type="tel" inputMode="tel" autoComplete="tel" placeholder="e.g. +254 7…" aria-invalid={!!errors.whatsapp} aria-describedby="whatsapp-error" /><span id="whatsapp-error" className={styles.error}>{errors.whatsapp}</span></div>
    <div className={styles.field}><label htmlFor="lead-neighbourhood">Neighbourhood <span aria-hidden="true">(optional)</span></label><input id="lead-neighbourhood" name="neighbourhood" autoComplete="address-level2" /></div>
    <div className={styles.formActions}><button className={styles.primary} disabled={status === "sending"} type="submit">{status === "sending" ? "Sending…" : "Request my free marker"}</button></div>
    <p className={styles.formResult} aria-live="polite">{status === "success" ? "Thanks. We’ll contact you to confirm the venue and next step." : status === "error" ? "We couldn’t send that request. Please try again." : ""}</p>
  </form>;
}
