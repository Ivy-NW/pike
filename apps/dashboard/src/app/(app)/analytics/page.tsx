"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartIcon, CompassIcon, DownloadIcon, FlagIcon } from "@/components/icons";
import { api, type AnalyticsTrends } from "@/lib/api";

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

function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<QuestMetric[] | null>(null);
  const [trends, setTrends] = useState<AnalyticsTrends | null>(null);
  const [range, setRange] = useState<7 | 30>(7);
  const [error, setError] = useState<string | null>(null);
  const [trendsError, setTrendsError] = useState<string | null>(null);

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

  useEffect(() => {
    let cancelled = false;
    setTrends(null);
    setTrendsError(null);
    api.getAnalyticsTrends(range)
      .then((data) => { if (!cancelled) setTrends(data); })
      .catch((err) => { if (!cancelled) setTrendsError(err.message ?? "Could not load the redemption trend"); });
    return () => { cancelled = true; };
  }, [range]);

  const totals = useMemo(() => (metrics ?? []).reduce((sum, item) => ({
    redemptions: sum.redemptions + (item.total ?? 0),
    today: sum.today + (item.today ?? 0),
    flagged: sum.flagged + (item.flagged ?? 0),
  }), { redemptions: 0, today: 0, flagged: 0 }), [metrics]);
  const maxTotal = Math.max(1, ...(metrics ?? []).map((item) => item.total ?? 0));
  const maxVenueTotal = Math.max(1, ...(trends?.byVenue ?? []).map((v) => v.total));

  const chartData = useMemo(
    () => (trends?.days ?? []).map((d) => ({ ...d, label: formatDay(d.date) })),
    [trends],
  );

  const exportCsv = () => {
    if (!trends || !metrics) return;
    downloadCsv(`pike-analytics-${range}d.csv`, [
      ["date", "total", "claimed", "flagged", "rejected"],
      ...trends.days.map((d) => [d.date, d.total, d.claimed, d.flagged, d.rejected]),
      [],
      ["quest", "venue", "status", "total_redemptions"],
      ...metrics.map((m) => [m.name, m.venue, m.status, m.total ?? 0]),
    ]);
  };

  return (
    <>
      <div className="page-header">
        <div>
          <span className="eyebrow">Performance</span>
          <h1>Analytics</h1>
          <p>Live redemption performance from your published quests.</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div className="range-toggle" role="group" aria-label="Date range">
            <button type="button" className={range === 7 ? "active" : ""} onClick={() => setRange(7)}>7d</button>
            <button type="button" className={range === 30 ? "active" : ""} onClick={() => setRange(30)}>30d</button>
          </div>
          <button className="secondary icon" onClick={exportCsv} disabled={!trends || !metrics}>
            <DownloadIcon size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {error && <div className="notice notice-error" role="alert"><strong>Analytics unavailable</strong><span>{error}</span></div>}

      <div className="stat-grid">
        <Metric icon={ChartIcon} label="Total redemptions" value={metrics ? totals.redemptions : null} />
        <Metric icon={CompassIcon} label="Redeemed today" value={metrics ? totals.today : null} />
        <Metric icon={FlagIcon} label="Flagged" value={metrics ? totals.flagged : null} warning={totals.flagged > 0} />
      </div>

      <section className="card" aria-labelledby="redemption-trend-title" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div className="card-title" id="redemption-trend-title">Redemption trend</div>
            <p className="card-subtext">Daily redemptions across every venue, split by outcome.</p>
          </div>
          <div className="chart-legend">
            <span className="chart-legend-item"><span className="chart-legend-dot" style={{ background: "var(--success)" }} />Claimed</span>
            <span className="chart-legend-item"><span className="chart-legend-dot" style={{ background: "var(--error)" }} />Flagged</span>
          </div>
        </div>

        {trendsError ? (
          <p className="card-subtext" style={{ color: "var(--error)" }}>{trendsError}</p>
        ) : trends === null ? (
          <div className="loading-stack"><div className="skeleton-row" style={{ height: 220 }} /></div>
        ) : chartData.length === 0 ? (
          <div className="empty-state">No redemption activity in the last {range} days.</div>
        ) : (
          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer>
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="claimedFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--success)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--success)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="flaggedFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--error)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--error)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "var(--on-surface-variant)", fontSize: 11 }} axisLine={{ stroke: "var(--border-subtle)" }} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: "var(--on-surface-variant)", fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
                <Tooltip
                  contentStyle={{ background: "var(--surface-container-lowest)", border: "1px solid var(--border-subtle)", borderRadius: 10, fontSize: 12 }}
                  labelStyle={{ color: "var(--on-surface)", fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="claimed" stroke="var(--success)" fill="url(#claimedFill)" strokeWidth={2} />
                <Area type="monotone" dataKey="flagged" stroke="var(--error)" fill="url(#flaggedFill)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <div className="analytics-grid">
        <section className="card" aria-labelledby="campaign-performance-title">
          <div className="card-title" id="campaign-performance-title">Campaign performance</div>
          <p className="card-subtext">Relative redemption volume by quest.</p>
          {metrics === null ? (
            <div className="loading-stack">
              {[0, 1, 2].map((item) => <div className="skeleton-row" key={item} />)}
            </div>
          ) : metrics.length === 0 ? (
            <div className="empty-state-panel">
              <span className="badge badge-info">Awaiting data</span>
              <h2>Publish a quest to start measuring</h2>
              <p>No redemption activity has been recorded yet.</p>
              <Link href="/quests/new" className="primary">Create quest</Link>
            </div>
          ) : (
            <div className="rank-list">
              {metrics.map((item) => (
                <Link href={`/quests/${item.id}`} className="rank-row" key={item.id}>
                  <div className="rank-row-copy">
                    <strong>{item.name}</strong>
                    <span>{item.venue}</span>
                  </div>
                  <div className="rank-track" aria-hidden="true">
                    <span style={{ width: `${Math.max(item.total ? 4 : 0, ((item.total ?? 0) / maxTotal) * 100)}%` }} />
                  </div>
                  <div className="rank-number">{item.total ?? "—"}</div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="card" aria-labelledby="by-venue-title">
          <div className="card-title" id="by-venue-title">By venue</div>
          <p className="card-subtext">Redemptions in the last {range} days.</p>
          {trends === null ? (
            <div className="loading-stack">
              {[0, 1].map((item) => <div className="skeleton-row" key={item} />)}
            </div>
          ) : trends.byVenue.length === 0 ? (
            <div className="empty-state">No venue activity yet.</div>
          ) : (
            <div className="rank-list">
              {trends.byVenue.map((v) => (
                <div className="rank-row" key={v.venueId}>
                  <div className="rank-row-copy"><strong>{v.venueName}</strong></div>
                  <div className="rank-track" aria-hidden="true">
                    <span style={{ width: `${Math.max(4, (v.total / maxVenueTotal) * 100)}%` }} />
                  </div>
                  <div className="rank-number">{v.total}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
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
