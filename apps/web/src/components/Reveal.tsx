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

export function Reveal({ children, className = "", variant = "up", delay = 0, style, ...rest }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`scroll-reveal scroll-reveal--${variant}${visible ? " is-visible" : ""}${className ? ` ${className}` : ""}`}
      style={delay ? { ...style, transitionDelay: `${delay}ms` } : style}
      {...rest}
    >
      {children}
    </div>
  );
}
