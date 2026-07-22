import type { Metadata } from "next";
import Link from "next/link";
import { Wordmark } from "@/components/Logo";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Coming soon — PIKE", description: "This PIKE page is still being prepared." };

export default function ComingSoonPage({ searchParams }: { searchParams?: { topic?: string } }) {
  const topic = typeof searchParams?.topic === "string" ? searchParams.topic : "This page";
  return <main className={styles.main}><Link href="/" aria-label="PIKE home" className={styles.brand}><Wordmark /></Link><section className={styles.panel} aria-labelledby="coming-heading"><p className="section-eyebrow">Work in progress</p><h1 id="coming-heading">{topic}<br/><em>is coming soon.</em></h1><p>We’re still preparing this part of PIKE. We’d rather be clear about that than fill the page with placeholder promises.</p><Link href="/" className="btn btn-primary">Back to the PIKE home page</Link></section><span className={styles.mark} aria-hidden="true">P</span></main>;
}
