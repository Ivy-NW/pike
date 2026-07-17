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

  useEffect(() => {
    if (!markerId) return;
    api
      .resolveMarker(markerId)
      .then((data: any) => setResolved({ marker: data, venue: data.venue, quest: data.quest }))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load this quest"));
  }, [markerId]);

  const handleRecognized = async () => {
    if (!markerId) return;
    try {
      const redemption = await api.createRedemption(markerId, sessionId());
      // Carry ?channel=app&appToken=... through so the reward screen knows this is the
      // authenticated in-app scan (Phase 2 — FR-4) and can auto-claim instead of asking again.
      navigate(`/reward/${(redemption as any).id}${location.search}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong recording your visit");
    }
  };

  if (error) {
    return (
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
        <p>{error}</p>
      </div>
    );
  }

  if (!resolved) {
    return (
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", color: "var(--on-surface)" }}>
        Loading quest...
      </div>
    );
  }

  if (resolved.quest.status !== "live") {
    return (
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
        <p>This quest isn't currently active. Check back soon!</p>
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
