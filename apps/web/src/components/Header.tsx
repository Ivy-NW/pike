"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Wordmark } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import styles from "./Header.module.css";

const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "http://localhost:3001";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sectionsOpen, setSectionsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const closeOnOutside = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
        setSectionsOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setSectionsOpen(false);
      }
    };
    document.addEventListener("pointerdown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  useEffect(() => {
    let ticking = false;
    const updateScrolled = () => {
      const { scrollY, innerHeight } = window;
      const scrollable = document.documentElement.scrollHeight - innerHeight;
      setScrolled(scrollY > 18);
      setProgress(scrollable > 0 ? Math.min(1, scrollY / scrollable) : 0);
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateScrolled);
      }
    };
    updateScrolled();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeAll = () => { setMenuOpen(false); setSectionsOpen(false); };

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`} ref={headerRef}>
      <div className={styles.capsule}>
        <Link href="/" aria-label="PIKE home" className={styles.brand}><Wordmark size={26} /></Link>
        <button className={styles.menuButton} type="button" aria-expanded={menuOpen} aria-controls="site-navigation" onClick={() => setMenuOpen((value) => !value)}>
          <span>Menu</span><span className={`${styles.menuIcon} ${menuOpen ? styles.menuIconOpen : ""}`} aria-hidden="true"><i /><i /></span>
        </button>
        <nav id="site-navigation" aria-label="Main navigation" className={`${styles.nav} ${menuOpen ? styles.navOpen : ""}`}>
          <div className={styles.sectionMenu}>
            <button type="button" className={styles.sectionTrigger} aria-expanded={sectionsOpen} aria-controls="section-links" onClick={() => setSectionsOpen((value) => !value)}>
              How it works <span aria-hidden="true">⌄</span>
            </button>
            <div id="section-links" className={`${styles.dropdown} ${sectionsOpen ? styles.dropdownOpen : ""}`}>
              <a href="#how-it-works" onClick={closeAll}><b>Player journey</b><span>See a quest unfold</span></a>
              <a href="#for-players" onClick={closeAll}><b>For players</b><span>Discover themed experiences</span></a>
              <a href="#for-venues" onClick={closeAll}><b>For venues</b><span>Bring people back</span></a>
            </div>
          </div>
          <div className={styles.theme}><ThemeToggle /></div>
          <a href={`${DASHBOARD_URL}/register`} className={`btn btn-primary ${styles.primary}`}>Create your first quest</a>
        </nav>
      </div>
      <div className={styles.progressTrack} aria-hidden="true">
        <div className={styles.progressBar} style={{ transform: `scaleX(${progress})` }} />
      </div>
    </header>
  );
}
