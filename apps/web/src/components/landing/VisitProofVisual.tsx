"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { CameraIcon, GiftIcon, ShieldIcon } from "@/components/icons";
import styles from "./Landing.module.css";

const storySteps = [
  { number: "01", label: "Scan", description: "Point your camera at the PIKE marker.", icon: CameraIcon },
  { number: "02", label: "Verify", description: "Presence verified at the venue.", icon: ShieldIcon },
  { number: "03", label: "Reward", description: "Return reward unlocked.", icon: GiftIcon },
] as const;

export function VisitProofVisual() {
  const [activeStep, setActiveStep] = useState(0);
  const [pointerInside, setPointerInside] = useState(false);
  const [focusInside, setFocusInside] = useState(false);
  const paused = pointerInside || focusInside;

  useEffect(() => {
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    if (paused || reducedMotion) return;
    const timer = window.setInterval(() => setActiveStep((current) => (current + 1) % storySteps.length), 3000);
    return () => window.clearInterval(timer);
  }, [paused]);

  return (
    <figure
      className={styles.visitProof}
      data-paused={paused}
      aria-label="A venue visit becomes verified proof and a return reward"
      onMouseEnter={() => setPointerInside(true)}
      onMouseLeave={() => setPointerInside(false)}
      onFocusCapture={() => setFocusInside(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocusInside(false);
      }}
    >
      <div className={styles.venueScene}>
        <Image className={styles.venuePhoto} src="/images/landing/hero-venue.png" alt="" aria-hidden="true" fill priority sizes="(max-width: 980px) 100vw, 44vw" />
        <div className={styles.venueShade} aria-hidden="true" />
        <div className={styles.markerAnnotation} aria-hidden="true">
          <span className={styles.markerKicker}>PIKE marker</span>
          <span className={styles.markerCode}><i /><i /><i /><i /><i /><i /><i /><i /><i /></span>
          <strong>SCAN HERE</strong>
        </div>
        <svg className={styles.verificationTrail} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path className={styles.trailGlow} d="M 2 98 C 42 82, 48 22, 98 2" pathLength="1" />
          <path className={styles.trailPulse} d="M 2 98 C 42 82, 48 22, 98 2" pathLength="1" />
          <circle cx="98" cy="2" r="2.8" />
        </svg>

        <div className={styles.phone} data-active={storySteps[activeStep].label.toLowerCase()} aria-live="polite">
          <div className={styles.phoneTop} aria-hidden="true"><span>9:41</span><i /><span>PIKE</span></div>
          <div className={styles.phoneIntro}><span>QUEST 014</span><strong>One visit.<br />One verified return.</strong></div>
          <ol className={styles.phoneSteps}>
            {storySteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <li key={step.label} className={index === activeStep ? styles.phoneStepActive : undefined} data-step={step.label.toLowerCase()}>
                  <span className={styles.phoneStepIcon}><Icon size={17} /></span>
                  <span><b>{step.label}</b><small>{step.description}</small></span>
                </li>
              );
            })}
          </ol>
          <div className={styles.phoneProof}>
            <span>VENUE PROOF</span>
            <strong>{activeStep === 0 ? "Camera ready" : activeStep === 1 ? "Verified in person" : "Reward earned"}</strong>
          </div>
        </div>
      </div>

      <div className={styles.storyControls} role="group" aria-label="Visit proof steps">
        {storySteps.map((step, index) => (
          <button key={step.label} type="button" className={index === activeStep ? styles.storyControlActive : undefined} aria-pressed={index === activeStep} onClick={() => setActiveStep(index)}>
            <span>{step.number}</span> {step.label}
          </button>
        ))}
      </div>
      <figcaption>From physical visit to verified return, in one camera flow.</figcaption>
    </figure>
  );
}
