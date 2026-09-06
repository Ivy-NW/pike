"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Wordmark } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import styles from "./Header.module.css";

const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "http://localhost:3001";

export function Header() {
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const closeOutside = (event: PointerEvent) => { if (!headerRef.current?.contains(event.target as Node)) setOpen(false); };
    const closeEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeEscape);
    return () => { document.removeEventListener("pointerdown", closeOutside); document.removeEventListener("keydown", closeEscape); };
  }, []);
  return (
    <header className={styles.header} ref={headerRef}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" aria-label="PIKE home" className={styles.brand}><Wordmark size={25} /></Link>
        <button type="button" className={styles.menu} aria-expanded={open} aria-controls="site-navigation" onClick={() => setOpen((value) => !value)}>Menu <span aria-hidden="true">{open ? "×" : "＋"}</span></button>
        <nav id="site-navigation" aria-label="Main navigation" className={`${styles.nav} ${open ? styles.open : ""}`}>
          <div className={styles.links}>
            <a href="#how-it-works" onClick={() => setOpen(false)}>How it works</a>
            <a href="#for-venues" onClick={() => setOpen(false)}>For venues</a>
            <a href="#quest-examples" onClick={() => setOpen(false)}>Quest examples</a>
          </div>
          <div className={styles.utility}>
            <ThemeToggle />
            <a href={`${DASHBOARD_URL}/login`} className={styles.login}>Business login</a>
            <a href={`${DASHBOARD_URL}/register`} className="btn btn-primary">Create a venue quest</a>
          </div>
        </nav>
      </div>
    </header>
  );
}
