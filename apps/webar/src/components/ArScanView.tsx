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

  const fireRecognized = () => {
    if (recognizedRef.current) return;
    recognizedRef.current = true;
    setRecognizing(true);
    setTimeout(onRecognized, 500);
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
        background: "#0e0e0e",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "24px 20px 40px 20px",
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
          background: recognizing ? "rgba(0, 240, 255, 0.25)" : "transparent",
          transition: "background 0.3s ease",
          pointerEvents: "none",
        }}
      />

      {/* Top HUD Badge */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          background: "rgba(20, 19, 20, 0.85)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(0, 240, 255, 0.3)",
          borderRadius: 16,
          padding: "8px 16px",
          color: "#00f0ff",
          fontFamily: "Space Grotesk, sans-serif",
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "0.08em",
          boxShadow: "0 4px 16px rgba(0,0,0,0.6)",
        }}
      >
        OPTICAL SCANNER ACTIVE
      </div>

      {/* Central Reticle Target */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: 240,
          height: 240,
          border: `2px solid ${recognizing ? "#00f0ff" : "rgba(0, 240, 255, 0.6)"}`,
          borderRadius: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: recognizing ? "0 0 30px rgba(0, 240, 255, 0.8)" : "0 0 15px rgba(0, 240, 255, 0.2)",
          transition: "all 0.3s ease",
          pointerEvents: "none",
        }}
      >
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#00f0ff", opacity: 0.6 }} />
      </div>

      {/* Bottom Control & Simulation HUD */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: 360,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
        }}
      >
        <p
          style={{
            color: "#f8fafc",
            fontFamily: "Space Grotesk, system-ui, sans-serif",
            fontSize: 13,
            textAlign: "center",
            margin: 0,
            textShadow: "0 2px 4px rgba(0,0,0,0.8)",
          }}
        >
          {engineError
            ? "AR Optical Engine ready. Align marker or verify below."
            : `Point optical lens at the ${questName} physical marker`}
        </p>

        <button
          onClick={fireRecognized}
          disabled={recognizing}
          style={{
            width: "100%",
            padding: "16px 20px",
            background: recognizing
              ? "#10B981"
              : "linear-gradient(135deg, #1e3a8a 0%, #00f0ff 100%)",
            color: "#ffffff",
            fontFamily: "Space Grotesk, sans-serif",
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: "0.08em",
            border: "none",
            borderRadius: 20,
            cursor: "pointer",
            boxShadow: "0 8px 24px rgba(0, 240, 255, 0.4)",
            transition: "transform 0.15s ease",
          }}
        >
          {recognizing ? "VERIFYING CIPHER..." : "VERIFY & CLAIM REWARD"}
        </button>
      </div>
    </div>
  );
}
