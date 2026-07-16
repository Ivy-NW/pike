"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api, ApiError } from "@/lib/api";

export default function QuestDetailPage() {
  const { questId } = useParams<{ questId: string }>();
  const [quest, setQuest] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!questId) return;
    Promise.all([api.getQuest(questId), api.getQuestStats(questId)])
      .then(([q, s]) => {
        setQuest(q);
        setStats(s);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Could not load quest"));
  }, [questId]);

  if (error) return <p style={{ padding: 32, color: "var(--danger)" }}>{error}</p>;
  if (!quest) return <div style={{ padding: 32 }}>Loading...</div>;

  const marker = quest.markers?.[0];

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: 32 }}>
      <h1>{quest.name}</h1>
      <span className={`badge ${quest.status === "live" ? "badge-verified" : "badge-unverified"}`}>{quest.status}</span>

      <div className="card" style={{ marginTop: 20 }}>
        <h3 style={{ marginTop: 0 }}>Reward</h3>
        <p>{quest.rewardDescription} ({quest.rewardTier === "high_value" ? "app-only claim" : "unauthenticated web claim OK"})</p>
      </div>

      {stats && (
        <div className="card" style={{ marginTop: 16 }}>
          <h3 style={{ marginTop: 0 }}>Redemptions</h3>
          <p>Today: {stats.redeemedToday} / {stats.capToday} (remaining: {stats.capRemainingToday})</p>
          <p>All-time: {stats.totalRedemptions} total — {stats.claimed} claimed, {stats.flagged} flagged, {stats.rejected} rejected</p>
        </div>
      )}

      {marker && (
        <div className="card" style={{ marginTop: 16 }}>
          <h3 style={{ marginTop: 0 }}>Marker</h3>
          <p>Status: {marker.status}</p>
          {marker.qrFallbackUrl && (
            <>
              <p style={{ fontSize: 14, color: "#64748b" }}>Fallback QR (encodes the quest URL):</p>
              <img src={marker.qrFallbackUrl} alt="Quest QR code" width={160} height={160} />
            </>
          )}
          {marker.printAssetUrl && <p style={{ fontSize: 13, color: "#94a3b8" }}>Print asset: {marker.printAssetUrl}</p>}
        </div>
      )}
    </div>
  );
}
