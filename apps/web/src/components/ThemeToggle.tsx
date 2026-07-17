"use client";
import { useEffect, useState } from "react";

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
    <button
      onClick={toggle}
      aria-label="Toggle color theme"
      className="btn-text"
      style={{ padding: 8, fontSize: 18, lineHeight: 1 }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
        {mode === "dark" ? "light_mode" : "dark_mode"}
      </span>
    </button>
  );
}
