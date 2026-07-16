import { useEffect, useRef, useState } from "react";
import type { PlanarImageTargetData } from "@pike/shared-types";

interface Props {
  questName: string;
  imageTargetData: PlanarImageTargetData | null;
  onRecognized: () => void;
}

/**
 * 8th Wall went open source in Feb 2026 (https://8thwall.org) — no account or app key is
 * required any more, so this loads the engine binary straight from its public CDN.
 * See apps/api/src/markers/marker-compile.service.ts for how imageTargetData is produced.
 */
const ENGINE_SCRIPT_URL = "https://cdn.jsdelivr.net/npm/@8thwall/engine-binary@1/dist/xr.js";

declare global {
  interface Window {
    XR8?: any;
  }
}

/**
 * The base xr.js script only bootstraps a chunk loader — XR8.XrController (and every other
 * feature module) stays `null` until its bundle chunk is fetched. Image-target tracking
 * lives in the "slam" chunk (xr-slam.js) even with disableWorldTracking:true, since that's
 * a runtime behavior flag, not a bundling boundary — confirmed by inspecting XR8.loadChunk's
 * source, which maps chunk name "slam" -> populates XR8.XrController. `data-preload-chunks`
 * kicks this off as early as possible; the explicit loadChunk() call below is a defensive
 * fallback in case the script tag already existed (e.g. React StrictMode double-invoke).
 */
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
    if (window.XR8.XrController) return;
    return window.XR8.loadChunk("slam");
  });
}

/**
 * The marker-recognition moment (UI doc 7.2: full-bleed camera viewport, minimal HUD,
 * no nav chrome). Real image-target recognition via 8th Wall's engine — the "recognizing"
 * purple-glow beat fires from the engine's own `reality.imagefound` event, not a timer.
 *
 * The manual "Simulate marker recognition" button stays as a dev/fallback path: it's the
 * only way to exercise this screen without a physical printed marker and a device camera
 * (true image-target recognition can't be exercised in an automated/headless browser).
 */
export function ArScanView({ questName, imageTargetData, onRecognized }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [engineError, setEngineError] = useState<string | null>(null);
  const [recognizing, setRecognizing] = useState(false);
  const recognizedRef = useRef(false);

  const fireRecognized = () => {
    if (recognizedRef.current) return;
    recognizedRef.current = true;
    setRecognizing(true);
    setTimeout(onRecognized, 600); // brief purple-glow beat before the reward reveal (UI doc 7.2)
  };

  useEffect(() => {
    if (!imageTargetData) return;
    let cancelled = false;

    loadEngineScript()
      .then(() => {
        if (cancelled || !window.XR8 || !canvasRef.current) return;
        const XR8 = window.XR8;

        // Image-target-only tracking: world tracking (SLAM) is unnecessary overhead here
        // and must be disabled before pipelineModule()/run() per XR8.XrController.configure() docs.
        XR8.XrController.configure({
          disableWorldTracking: true,
          imageTargetData: [imageTargetData],
        });

        XR8.addCameraPipelineModules([
          XR8.GlTextureRenderer.pipelineModule(),
          XR8.XrController.pipelineModule(),
          {
            name: "pike-image-target-listener",
            listeners: [{ event: "reality.imagefound", process: fireRecognized }],
          },
        ]);

        XR8.run({ canvas: canvasRef.current, allowedDevices: XR8.XrConfig?.device?.().ANY });
      })
      .catch((err: Error) => !cancelled && setEngineError(err.message));

    return () => {
      cancelled = true;
      try {
        window.XR8?.stop?.();
      } catch {
        // engine may not have finished initializing — nothing to clean up in that case
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageTargetData]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: recognizing ? "rgba(124,58,237,0.35)" : "transparent",
          transition: "background 0.4s ease",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "relative",
          width: 220,
          height: 220,
          border: `2px solid ${recognizing ? "#7C3AED" : "rgba(255,255,255,0.7)"}`,
          borderRadius: 20,
          transition: "border-color 0.4s ease",
          pointerEvents: "none",
        }}
      />
      <p
        style={{
          position: "relative",
          color: "white",
          fontFamily: "Inter, sans-serif",
          marginTop: 24,
          textAlign: "center",
          padding: "0 24px",
        }}
      >
        {engineError
          ? "AR engine unavailable — use the button below to continue."
          : !imageTargetData
            ? "This marker is still being prepared."
            : `Point your camera at the ${questName} marker`}
      </p>
      <button
        onClick={fireRecognized}
        disabled={recognizing}
        className="btn-primary"
        style={{ position: "absolute", bottom: 48, width: "80%", maxWidth: 320 }}
      >
        {recognizing ? "Recognizing..." : "Simulate marker recognition (dev)"}
      </button>
    </div>
  );
}
