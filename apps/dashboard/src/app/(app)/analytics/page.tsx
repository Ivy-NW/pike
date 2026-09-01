"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChartIcon, CompassIcon, FlagIcon } from "@/components/icons";
import { api } from "@/lib/api";

type QuestMetric = {
  id: string;
  name: string;
  venue: string;
  status: string;
  total: number | null;
  today: number | null;
  cap: number | null;
  flagged: number | null;
};

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<QuestMetric[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    api.listVenues()
      .then(async (venues) => {
        const groups = await Promise.all(venues.map(async (venue: any) => ({
          venue,
          quests: await api.listQuestsForVenue(venue.id),
        })));
        const quests = groups.flatMap(({ venue, quests }) => quests.map((quest: any) => ({ quest, venue })));
        const stats = await Promise.allSettled(quests.map(({ quest }) => api.getQuestStats(quest.id)));
        if (cancelled) return;
        setMetrics(quests.map(({ quest, venue }, index) => {
          const result = stats[index];
          const value = result.status === "fulfilled" ? result.value : null;
          return {
            id: quest.id,
            name: quest.name,
            venue: venue.name,
            status: quest.status,
            total: value?.totalRedemptions ?? null,
            today: value?.redeemedToday ?? null,
            cap: value?.capToday ?? quest.dailyCap ?? null,
            flagged: value?.flagged ?? null,
          };
        }));
      })
      .catch((reason) => { if (!cancelled) setError(reason.message ?? "Could not load analytics"); });

    return () => { cancelled = true; };
  }, []);

  const totals = useMemo(() => (metrics ?? []).reduce((sum, item) => ({
    redemptions: sum.redemptions + (item.total ?? 0),
    today: sum.today + (item.today ?? 0),
    flagged: sum.flagged + (item.flagged ?? 0),
  }), { redemptions: 0, today: 0, flagged: 0 }), [metrics]);
  const maxTotal = Math.max(1, ...(metrics ?? []).map((item) => item.total ?? 0));

  return (
    <>
      <div className="page-header">
        <div>
          <span className="eyebrow">Performance</span>
          <h1>Analytics</h1>
          <p>Live redemption performance from your published quests.</p>
        </div>
        <Link href="/quests" className="secondary">View all quests</Link>
      </div>

      {error && <div className="notice notice-error" role="alert"><strong>Analytics unavailable</strong><span>{error}</span></div>}

      <div className="stat-grid">
        <Metric icon={ChartIcon} label="Total redemptions" value={metrics ? totals.redemptions : null} />
        <Metric icon={CompassIcon} label="Redeemed today" value={metrics ? totals.today : null} />
        <Metric icon={FlagIcon} label="Flagged" value={metrics ? totals.flagged : null} warning={totals.flagged > 0} />
      </div>

      <section className="card" aria-labelledby="campaign-performance-title">
        <div className="card-title" id="campaign-performance-title">Campaign performance</div>
        <p className="card-subtext">Relative redemption volume by quest. Values are fetched from the existing quest statistics endpoint.</p>
        {metrics === null ? (
          <div className="analytics-skeleton" aria-label="Loading analytics">
            {[0, 1, 2].map((item) => <div className="skeleton-row" key={item} />)}
          </div>
        ) : metrics.length === 0 ? (
          <div className="empty-state empty-state-panel">
            <span className="badge badge-info">Awaiting data</span>
            <h2>Publish a quest to start measuring</h2>
            <p>No redemption activity has been recorded yet.</p>
            <Link href="/quests/new" className="primary">Create quest</Link>
          </div>
        ) : (
          <div className="analytics-list">
            {metrics.map((item) => (
              <Link href={`/quests/${item.id}`} className="analytics-row" key={item.id}>
                <div className="analytics-row-copy">
                  <strong>{item.name}</strong>
                  <span>{item.venue}</span>
                </div>
                <div className="analytics-track" aria-hidden="true">
                  <span style={{ width: `${Math.max(item.total ? 4 : 0, ((item.total ?? 0) / maxTotal) * 100)}%` }} />
                </div>
                <div className="analytics-number">{item.total ?? "—"}</div>
                <span className={`badge ${item.status === "live" ? "badge-verified" : "badge-neutral"}`}>{item.status}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function Metric({ icon: Icon, label, value, warning = false }: { icon: typeof ChartIcon; label: string; value: number | null; warning?: boolean }) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <span className="stat-icon" style={warning ? { color: "var(--error)", background: "color-mix(in srgb, var(--error) 10%, transparent)" } : undefined}>
          <Icon size={16} />
        </span>
      </div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value ?? <span className="skeleton-row" style={{ display: "inline-block", width: 52, height: 28 }} />}</div>
    </div>
  );
}
