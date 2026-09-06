"use client";

import { useRef, useState } from "react";
import { PlayIcon } from "@/components/icons";
import styles from "./Landing.module.css";

export function DeferredVideo() {
  const [loaded, setLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const play = () => {
    setLoaded(true);
    requestAnimationFrame(() => videoRef.current?.play());
  };

  return <div className={styles.media}>
    <div className={styles.mediaTop}><span>Product evidence · 00:40</span><span className={styles.videoStatus}>Recorded flow</span></div>
    <div className={styles.videoStage}>
      {loaded ? <video ref={videoRef} className={styles.video} controls playsInline preload="metadata" poster="/images/landing/scan-poster.webp"><source src="/pike-webar-demo-1min.mp4" type="video/mp4" />Your browser cannot play this video. The flow shows a marker-linked reward being configured and claimed.</video> : <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={styles.poster} src="/images/landing/scan-poster.webp" width="720" height="540" alt="PIKE reward claim screen shown in the recorded product flow" />
        <div className={styles.playPrompt}>
          <span className={styles.pingRing} aria-hidden="true" />
          <span className={styles.pingRing} aria-hidden="true" />
          <span className={styles.pingRing} aria-hidden="true" />
          <button className={styles.play} type="button" onClick={play}>
            <PlayIcon size={20} color="var(--landing-action-ink)" />
            <span>Watch the 40-second scan</span>
          </button>
        </div>
      </>}
    </div>
    <div className={styles.mediaFoot}><span>Marker-linked reward flow</span><span>Tap to load video</span></div>
  </div>;
}
