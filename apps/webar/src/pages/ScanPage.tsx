import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { PlanarImageTargetData } from "@pike/shared-types";
import { api, ApiError } from "../lib/api";
import { sessionId } from "../lib/session";
import { ArScanView } from "../components/ArScanView";

interface ResolvedMarker {
  marker: { id: string; status: string; imageTargetData: PlanarImageTargetData | null };
  venue: { id: string; name: string; venueType: string };
  quest: { id: string; name: string; theme: string; status: string };
}

export function ScanPage() {
  const { markerId } = useParams<{ markerId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [resolved, setResolved] = useState<ResolvedMarker | null>(null);
  const [error, setError] = useState<string | null>(null);
  const demoState = import.meta.env.DEV ? new URLSearchParams(location.search).get("demo") : null;

  useEffect(() => {
    if (!markerId) return;
    if (demoState === "error") { setError("We couldn’t connect to this quest. Check your signal and try again."); return; }
    if (demoState === "unavailable") { setResolved({ marker: { id: "demo", status: "active", imageTargetData: null }, venue: { id: "demo", name: "PIKE Demo Café", venueType: "cafe" }, quest: { id: "demo", name: "The Hidden Table", theme: "default", status: "paused" } }); return; }
    if (demoState === "scan") { setResolved({ marker: { id: "demo", status: "active", imageTargetData: null }, venue: { id: "demo", name: "PIKE Demo Café", venueType: "cafe" }, quest: { id: "demo", name: "The Hidden Table", theme: "default", status: "live" } }); return; }
    api
      .resolveMarker(markerId)
      .then((data: any) => setResolved({ marker: data, venue: data.venue, quest: data.quest }))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load this quest"));
  }, [markerId, demoState]);

  const handleRecognized = async () => {
    if (!markerId) return;
    try {
      const result = await api.createRedemption(markerId, sessionId());
      // Carry ?channel=app&appToken=... through so the reward screen knows this is the
      // authenticated in-app scan (Phase 2 — FR-4) and can auto-claim instead of asking again.
      navigate(`/reward/${result.redemption.id}${location.search}`);
    } catch (err) {
      const detail = err instanceof ApiError ? `${err.statusCode} ${err.message}` : err instanceof Error ? err.message : String(err);
      setError(`Something went wrong recording your visit — ${detail}`);
    }
  };

  if (error) {
    return (
      <div className="state-page">
        <div className="state-panel" role="alert">
          <p className="state-kicker">Scan interrupted</p>
          <h1 className="state-title">We couldn’t start the camera quest.</h1>
          <p className="state-copy">{error}</p>
          <div className="state-actions"><button className="btn-primary" onClick={() => window.location.reload()}>Try again</button><button className="btn-outline" onClick={() => navigate("/")}>Exit scan</button></div>
          <p className="state-help">If the problem continues, ask venue staff to check the marker.</p>
        </div>
      </div>
    );
  }

  if (!resolved) {
    return (
      <div className="state-page" aria-live="polite">
        <div className="state-panel">
          <span className="state-loader" aria-hidden="true" /><p className="state-kicker">PIKE · Secure scan</p>
          <h1 className="state-title">Preparing your quest…</h1><p className="state-copy">Checking the marker and camera experience.</p>
        </div>
      </div>
    );
  }

  if (resolved.quest.status !== "live") {
    return (
      <div className="state-page">
        <div className="state-panel">
          <p className="state-kicker">Quest unavailable</p>
          <h1 className="state-title">This quest is taking a break.</h1><p className="state-copy">It isn&apos;t active right now. Check with venue staff or come back soon.</p><div className="state-actions"><button className="btn-outline" onClick={() => window.location.reload()}>Check again</button></div>
        </div>
      </div>
    );
  }

  return (
    <ArScanView
      questName={resolved.quest.name}
      imageTargetData={resolved.marker.imageTargetData}
      onRecognized={handleRecognized}
    />
  );
}
