"use client";

import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import styles from "./Landing.module.css";

export function LandingHeader() {
  const [floating, setFloating] = useState(false);

  useEffect(() => {
    const onScroll = () => setFloating(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return <header className={`${styles.header} ${floating ? styles.headerFloating : ""}`}>
    <div className={styles.headerBar}><div className={`container ${styles.headerInner}`}>
      <a className={styles.brand} href="/" aria-label="PIKE home"><Logo size={30} /><span>PIKE</span></a>
      <div className={styles.headerActions}>
        <a className={styles.navLink} href="/pricing">Pricing</a>
        <ThemeToggle />
        <a className={styles.primary} href="/#free-marker">Start a quest</a>
      </div>
    </div></div>
  </header>;
}
