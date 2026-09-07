"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";
import { api, ApiError, type AnalyticsTrends } from "@/lib/api";
import { ChevronRightIcon } from "@/components/icons";
import Link from "next/link";

export default function QuestDetailPage() {
  const { questId } = useParams<{ questId: string }>();
  const [quest, setQuest] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [trends, setTrends] = useState<AnalyticsTrends | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    if (!questId) return;
    let cancelled = false;
    setError(null);
    setStatsError(null);

    api
      .getQuest(questId)
      .then((q) => { if (!cancelled) setQuest(q); })
      .catch((err) => { if (!cancelled) setError(err instanceof ApiError ? err.message : "Could not load quest"); });

    api
      .getQuestStats(questId)
      .then((s) => { if (!cancelled) setStats(s); })
      .catch((err) => { if (!cancelled) setStatsError(err instanceof ApiError ? err.message : "Could not load redemption stats"); });

    api.getAnalyticsTrends(30, questId).then((t) => { if (!cancelled) setTrends(t); }).catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [questId]);

  if (error) return <div className="state-page"><span className="eyebrow">Quest detail</span><h1>Quest unavailable</h1><div className="notice notice-error" role="alert"><strong>We could not load this quest</strong><span>{error}</span></div><Link href="/quests" className="secondary">Back to quests</Link></div>;
  if (!quest) return <div className="state-page" aria-label="Loading quest"><span className="eyebrow">Quest detail</span><div className="skeleton-row skeleton-title" /><div className="card loading-stack"><div className="skeleton-row" /><div className="skeleton-row" /><div className="skeleton-row" /></div></div>;

  const marker = quest.markers?.[0];
  const capPct = stats && stats.capToday > 0 ? Math.min(100, Math.round((stats.redeemedToday / stats.capToday) * 100)) : 0;

  return (
    <>
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/quests">Quests</Link>
        <ChevronRightIcon size={12} />
        <span>{quest.name}</span>
      </nav>
      <div className="page-header">
        <div>
          <span className="eyebrow">Quest detail</span>
          <h1>{quest.name}</h1>
          <p><span className={`badge ${quest.status === "live" ? "badge-verified" : "badge-unverified"}`}>{quest.status}</span> <span className="header-meta">Daily cap {quest.maxRedemptionsPerDay}</span></p>
        </div>
        <Link href="/quests" className="secondary">All quests</Link>
      </div>

      <div className="card" style={{ maxWidth: 640, marginBottom: 16 }}>
        <div className="card-title">Reward</div>
        <p>{quest.rewardDescription} ({quest.rewardTier === "high_value" ? "app-only claim" : "unauthenticated web claim OK"})</p>
      </div>

      {statsError && !stats && (
        <div className="card" style={{ maxWidth: 640, marginBottom: 16 }}>
          <div className="card-title">Redemptions</div>
          <p className="card-subtext" style={{ color: "var(--error)" }}>{statsError}</p>
        </div>
      )}

      {stats && (
        <div className="card" style={{ maxWidth: 640, marginBottom: 16 }}>
          <div className="card-title">Redemptions</div>
          <div className="row-between" style={{ marginBottom: 8 }}>
            <span style={{ fontFamily: "var(--font-heading)", fontSize: 24, fontWeight: 700 }}>
              {stats.redeemedToday} <span style={{ fontSize: 15, fontWeight: 400, color: "var(--on-surface-variant)" }}>/ {stats.capToday} today</span>
            </span>
            <span style={{ fontSize: 13, color: "var(--on-surface-variant)" }}>{stats.capRemainingToday} remaining</span>
          </div>
          <div className="progress-bar" style={{ marginBottom: 20 }}>
            <span style={{ width: `${capPct}%` }} />
          </div>

          {trends && trends.days.length > 1 && (
            <div style={{ width: "100%", height: 60, marginBottom: 20 }}>
              <ResponsiveContainer>
                <AreaChart data={trends.days} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="questSparkFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--action)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--action)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    contentStyle={{ background: "var(--surface-container-lowest)", border: "1px solid var(--border-subtle)", borderRadius: 8, fontSize: 11 }}
                    labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  />
                  <Area type="monotone" dataKey="total" stroke="var(--action)" fill="url(#questSparkFill)" strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="stat-grid" style={{ marginBottom: 0 }}>
            <div className="stat-card">
              <div className="stat-label">Total redemptions</div>
              <div className="stat-value">{stats.totalRedemptions}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Claimed</div>
              <div className="stat-value">{stats.claimed}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Flagged</div>
              <div className="stat-value">{stats.flagged}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Rejected</div>
              <div className="stat-value">{stats.rejected}</div>
            </div>
          </div>
        </div>
      )}

      {marker && (
        <div className="card" style={{ maxWidth: 640 }}>
          <div className="card-title">Marker</div>
          <p>Status: {marker.status}</p>
          {marker.qrFallbackUrl && (
            <>
              <p className="card-subtext" style={{ marginBottom: 8 }}>Fallback QR (encodes the quest URL):</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={marker.qrFallbackUrl} alt="Quest QR code" width={160} height={160} />
            </>
          )}
          {marker.printAssetUrl && <p style={{ fontSize: 13, color: "var(--outline)", marginTop: 8 }}>Print asset: {marker.printAssetUrl}</p>}
        </div>
      )}
    </>
  );
}
