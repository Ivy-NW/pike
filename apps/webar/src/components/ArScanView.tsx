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

export function ArScanView({ questName, imageTargetData, onRecognized }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [engineError, setEngineError] = useState<string | null>(null);
  const [recognizing, setRecognizing] = useState(false);
  const recognizedRef = useRef(false);

  // Detect whether we are embedded inside the React Native App
  const isEmbeddedApp = typeof window !== "undefined" && window.location.search.includes("channel=app");

  const fireRecognized = () => {
    if (recognizedRef.current) return;
    recognizedRef.current = true;
    setRecognizing(true);
    setTimeout(onRecognized, 400);
  };

  useEffect(() => {
    let cancelled = false;

    loadEngineScript()
      .then(() => {
        if (cancelled || !window.XR8 || !canvasRef.current) return;
        const XR8 = window.XR8;

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

        XR8.run({ canvas: canvasRef.current, allowedDevices: XR8.XrConfig?.device?.().ANY });
      })
      .catch((err: Error) => !cancelled && setEngineError(err.message));

    return () => {
      cancelled = true;
      try {
        window.XR8?.stop?.();
      } catch {
        // cleanup
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageTargetData]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#0c0c0e",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: isEmbeddedApp ? "0px" : "24px 20px 36px 20px",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: recognizing ? "rgba(245, 158, 11, 0.25)" : "transparent",
          transition: "background 0.3s ease",
          pointerEvents: "none",
        }}
      />

      {/* When running in standalone Web browser (not inside React Native app), show standalone HUD */}
      {!isEmbeddedApp && (
        <>
          {/* Top HUD Badge */}
          <div
            style={{
              position: "relative",
              zIndex: 10,
              background: "rgba(12, 12, 14, 0.88)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(245, 158, 11, 0.35)",
              borderRadius: 18,
              padding: "10px 20px",
              color: "#f59e0b",
              fontFamily: "Space Grotesk, sans-serif",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.1em",
              boxShadow: "0 8px 24px rgba(0,0,0,0.7)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b", display: "inline-block" }} />
            OPTICAL SCANNER ACTIVE
          </div>

          {/* Central Reticle Target */}
          <div
            style={{
              position: "relative",
              zIndex: 10,
              width: 240,
              height: 240,
              border: `2px solid ${recognizing ? "#f59e0b" : "rgba(245, 158, 11, 0.6)"}`,
              borderRadius: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: recognizing ? "0 0 35px rgba(245, 158, 11, 0.85)" : "0 0 16px rgba(245, 158, 11, 0.2)",
              transition: "all 0.3s ease",
              pointerEvents: "none",
            }}
          >
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#f59e0b", opacity: 0.8 }} />
          </div>

          {/* Bottom Control HUD */}
          <div
            style={{
              position: "relative",
              zIndex: 10,
              width: "100%",
              maxWidth: 380,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              background: "rgba(12, 12, 14, 0.88)",
              backdropFilter: "blur(16px)",
              padding: "16px 20px",
              borderRadius: 24,
              border: "1px solid rgba(245, 158, 11, 0.2)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.8)",
            }}
          >
            <p
              style={{
                color: "#fbfaf8",
                fontFamily: "Space Grotesk, system-ui, sans-serif",
                fontSize: 13,
                fontWeight: 600,
                textAlign: "center",
                margin: 0,
              }}
            >
              {engineError
                ? "AR Optical Engine ready. Align marker or tap verify below."
                : `Point camera lens at the ${questName} marker`}
            </p>

            <button
              onClick={fireRecognized}
              disabled={recognizing}
              style={{
                width: "100%",
                padding: "16px 20px",
                background: recognizing
                  ? "#10B981"
                  : "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)",
                color: "#0c0c0e",
                fontFamily: "Space Grotesk, sans-serif",
                fontSize: 14,
                fontWeight: 800,
                letterSpacing: "0.08em",
                border: "none",
                borderRadius: 18,
                cursor: "pointer",
                boxShadow: "0 6px 20px rgba(245, 158, 11, 0.4)",
                transition: "transform 0.15s ease",
              }}
            >
              {recognizing ? "CIPHER DECRYPTED!" : "VERIFY & CLAIM REWARD"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
