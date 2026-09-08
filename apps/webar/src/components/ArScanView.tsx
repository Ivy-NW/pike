import { useEffect, useRef, useState } from "react";
import type { PlanarImageTargetData } from "@pike/shared-types";

interface Props {
  questName: string;
  imageTargetData: PlanarImageTargetData | null;
  onRecognized: () => void;
}

const ENGINE_SCRIPT_URL = "https://cdn.jsdelivr.net/npm/@8thwall/engine-binary@1/dist/xr.js";

declare global {
  interface Window {
    XR8?: any;
  }
}

function loadEngineScript(): Promise<void> {
  const ready = window.XR8
    ? Promise.resolve()
    : new Promise<void>((resolve, reject) => {
        window.addEventListener("xrloaded", () => resolve(), { once: true });
        if (document.getElementById("eighthwall-engine-script")) return;
        const script = document.createElement("script");
        script.id = "eighthwall-engine-script";
        script.src = ENGINE_SCRIPT_URL;
        script.async = true;
        script.crossOrigin = "anonymous";
        script.setAttribute("data-preload-chunks", "slam");
        script.onerror = () => reject(new Error("Failed to load the 8th Wall engine script"));
        document.head.appendChild(script);
      });

  return ready.then(() => {
    if (window.XR8?.XrController) return;
    return window.XR8?.loadChunk?.("slam");
  });
}

type ThemeMode = "light" | "dark";

function readTheme(): ThemeMode {
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

function SunIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4.3" />
      <path d="M12 2.8v2.6M12 18.6v2.6M21.2 12h-2.6M5.4 12H2.8M18 6l-1.9 1.9M7.9 16.1 6 18M18 18l-1.9-1.9M7.9 7.9 6 6" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.5 14.7A8.6 8.6 0 1 1 9.3 3.5a7 7 0 0 0 11.2 11.2Z" />
    </svg>
  );
}

export function ArScanView({ questName, imageTargetData, onRecognized }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [engineError, setEngineError] = useState<string | null>(null);
  const [recognizing, setRecognizing] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>(() => (typeof document !== "undefined" ? readTheme() : "dark"));
  const recognizedRef = useRef(false);

  // Detect whether we are embedded inside the React Native App
  const isEmbeddedApp =
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("channel") === "app";

  const fireRecognized = () => {
    if (recognizedRef.current) return;
    recognizedRef.current = true;
    setRecognizing(true);
    setTimeout(onRecognized, 400);
  };

  const toggleTheme = () => {
    const next: ThemeMode = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("pike-theme", next);
    } catch {
      // private browsing / storage disabled — theme just won't persist
    }
  };

  useEffect(() => {
    let cancelled = false;
    let resizeCanvas = () => {};

    loadEngineScript()
      .then(() => {
        if (cancelled || !window.XR8 || !canvasRef.current) return;
        const XR8 = window.XR8;
        const canvas = canvasRef.current;

        // 8th Wall sizes its WebGL render target from the canvas's pixel-buffer
        // dimensions at XR8.run() time and never revisits them on its own. Left at
        // the browser's default (or a stale size from before layout/orientation
        // settled), the camera texture gets drawn into a quad with the wrong aspect
        // ratio — a warped/stretched feed that CSS object-fit can't correct, since
        // the distortion happens inside the WebGL draw, not at the CSS layer. Keep
        // the buffer's pixel size tracking the canvas's actual on-screen size.
        resizeCanvas = () => {
          const dpr = window.devicePixelRatio || 1;
          const width = Math.round(canvas.clientWidth * dpr);
          const height = Math.round(canvas.clientHeight * dpr);
          if (width > 0 && height > 0 && (canvas.width !== width || canvas.height !== height)) {
            canvas.width = width;
            canvas.height = height;
          }
        };

        if (imageTargetData) {
          XR8.XrController.configure({
            disableWorldTracking: true,
            imageTargetData: [imageTargetData],
          });
        }

        XR8.addCameraPipelineModules([
          XR8.GlTextureRenderer.pipelineModule(),
          XR8.XrController.pipelineModule(),
          {
            name: "pike-image-target-listener",
            listeners: [{ event: "reality.imagefound", process: fireRecognized }],
          },
        ]);

        const start = () => {
          if (cancelled) return;
          resizeCanvas();
          if (canvas.width === 0 || canvas.height === 0) {
            // Layout hasn't settled yet (e.g. first paint, or a webfont swap still
            // pending) — wait a frame rather than handing 8th Wall a 0x0 buffer.
            requestAnimationFrame(start);
            return;
          }
          XR8.run({ canvas, allowedDevices: XR8.XrConfig?.device?.().ANY });
          window.addEventListener("resize", resizeCanvas);
          window.addEventListener("orientationchange", resizeCanvas);
        };
        start();
      })
      .catch((err: Error) => !cancelled && setEngineError(err.message));

    return () => {
      cancelled = true;
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("orientationchange", resizeCanvas);
      try {
        window.XR8?.stop?.();
      } catch {
        // cleanup
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageTargetData]);

  return (
    <div className="scan-hud" style={isEmbeddedApp ? { padding: 0 } : undefined}>
      <canvas ref={canvasRef} className="scan-canvas" />
      <div aria-hidden="true" className="scan-flash" style={{ opacity: recognizing ? 1 : 0 }} />

      {/* Standalone-only chrome: hidden when embedded in the app, since the native
          screen already has its own header and decorative reticle covering the
          same ground (see apps/app/app/scan/[markerId].tsx). */}
      {!isEmbeddedApp && (
        <>
          <div className="scan-brand">PIKE</div>

          <button type="button" className="scan-toggle" onClick={toggleTheme} aria-label="Switch to the other color theme">
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>

          <p className="scan-status" data-state={recognizing ? "recognized" : "scanning"}>
            {recognizing ? "Marker recognized" : `Scanning for ${questName}`}
          </p>

          <div className="scan-frame" data-state={recognizing ? "recognized" : "scanning"}>
            <span className="scan-frame-dot" />
          </div>
        </>
      )}

      {/* The manual fallback is the essential recovery path when the camera can't
          start (no camera permission, insecure origin, or automatic marker
          recognition never fires) -- this must stay visible in BOTH standalone
          and embedded-in-app contexts, since there is no other way to proceed. */}
      <div className="scan-panel">
        <p className="scan-instruction">
          {engineError
            ? "We couldn't start the camera. You can still verify your visit manually below."
            : `Point your camera at the ${questName} marker.`}
        </p>

        <button type="button" className="scan-action" onClick={fireRecognized} disabled={recognizing}>
          {recognizing ? "Marker verified" : "Verify & claim reward"}
        </button>
      </div>
    </div>
  );
}
