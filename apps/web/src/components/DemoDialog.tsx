"use client";

import { useEffect, useRef, useState } from "react";
import { PlayIcon } from "@/components/icons";
import styles from "./DemoDialog.module.css";

type DemoDialogProps = { className?: string };

export function DemoDialog({ className = "btn btn-secondary" }: DemoDialogProps) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
    }
    if (!open && dialog.open) {
      if (typeof dialog.close === "function") dialog.close();
      else dialog.removeAttribute("open");
    }
  }, [open]);

  const close = () => {
    const video = dialogRef.current?.querySelector("video");
    video?.pause();
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  return (
    <>
      <button ref={triggerRef} type="button" className={className} onClick={() => setOpen(true)}>
        <span className={styles.play} aria-hidden="true"><PlayIcon size={10} /></span> Watch the 1-minute demo
      </button>
      <dialog ref={dialogRef} className={styles.dialog} aria-labelledby="demo-title" onCancel={(event) => { event.preventDefault(); close(); }} onClose={() => setOpen(false)} onClick={(event) => { if (event.target === event.currentTarget) close(); }}>
        <div className={styles.frame}>
          <div className={styles.topline}>
            <div><span>Product demo · 01:00</span><h2 id="demo-title">See a PIKE quest in motion</h2></div>
            <button type="button" className={styles.close} aria-label="Close demo" onClick={close}>×</button>
          </div>
          {open ? <video controls autoPlay preload="metadata" poster="/images/landing/hero-venue.png">
            <source src="/pike-webar-demo-1min.mp4" type="video/mp4" />
            Your browser does not support embedded video. <a href="/pike-webar-demo-1min.mp4">Open the demo video.</a>
          </video> : null}
        </div>
      </dialog>
    </>
  );
}
