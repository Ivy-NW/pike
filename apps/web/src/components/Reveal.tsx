"use client";

import { useEffect, useRef, useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";

type RevealVariant = "up" | "scale" | "left" | "right" | "none";

type RevealProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  /** Direction/style of the entrance effect — lets each section feel distinct. */
  variant?: RevealVariant;
  /** Extra transition-delay in ms, for staggering a run of Reveals. */
  delay?: number;
};

type RevealCallback = (visible: boolean) => void;

let sharedObserver: IntersectionObserver | null = null;
const revealCallbacks = new Map<Element, RevealCallback>();

// Toggles visibility both ways (not just once) so a section replays its entrance
// every time it crosses into or out of the viewport, not only on first scroll.
function observeReveal(node: Element, callback: RevealCallback) {
  if (typeof IntersectionObserver === "undefined") {
    callback(true);
    return () => undefined;
  }
  try {
    if (!sharedObserver) {
      sharedObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          revealCallbacks.get(entry.target)?.(entry.isIntersecting);
        });
      }, { threshold: 0.08, rootMargin: "0px 0px -5% 0px" });
    }
    revealCallbacks.set(node, callback);
    sharedObserver.observe(node);
  } catch {
    callback(true);
  }
  return () => {
    revealCallbacks.delete(node);
    sharedObserver?.unobserve(node);
    if (revealCallbacks.size === 0) {
      sharedObserver?.disconnect();
      sharedObserver = null;
    }
  };
}

export function Reveal({ children, className = "", variant = "up", delay = 0, style, onFocusCapture, ...rest }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      setVisible(true);
      return;
    }
    return observeReveal(node, setVisible);
  }, []);

  return (
    <div
      ref={ref}
      className={`scroll-reveal scroll-reveal--${variant}${visible ? " is-visible" : ""}${className ? ` ${className}` : ""}`}
      style={delay ? { ...style, transitionDelay: `${delay}ms` } : style}
      onFocusCapture={event => {
        setVisible(true);
        onFocusCapture?.(event);
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
