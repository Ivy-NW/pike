"use client";
import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "./icons";
import styles from "./ThemeToggle.module.css";

/** Persists to localStorage under the same key themeInitScript reads on next load. */
export function ThemeToggle() {
  const [mode, setMode] = useState<"light" | "dark">("light");

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    if (current === "dark" || current === "light") setMode(current);
  }, []);

  const toggle = () => {
    const next = mode === "dark" ? "light" : "dark";
    setMode(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("pike-theme", next);
  };

  return (
    <button onClick={toggle} aria-label="Toggle color theme" className={styles.toggle}>
      <span key={mode} className={styles.icon}>
        {mode === "dark" ? <SunIcon size={19} /> : <MoonIcon size={19} />}
      </span>
    </button>
  );
}
