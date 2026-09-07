"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { BuildingIcon, CompassIcon, FlagIcon, ShieldIcon, UsersIcon } from "@/components/icons";
import { useToast } from "@/components/Toast";

export default function DashboardOverviewPage() {
  const { showToast } = useToast();
  const [stats, setStats] = useState<{ businesses: number; venues: number; activeQuests: number; flaggedRedemptions: number } | null>(null);
  const [pendingBusinesses, setPendingBusinesses] = useState<any[] | null>(null);
  const [flagged, setFlagged] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshPending = () =>
    api
      .listBusinesses({ limit: 50 })
      .then((page) => setPendingBusinesses(page.items.filter((b) => b.paymentStatus !== "verified" && !b.suspended)))
      .catch((e) => setError(e.message));

  useEffect(() => {
    api.getStats().then(setStats).catch((e) => setError(e.message));
    refreshPending();
    api
      .listRedemptions("flagged", { limit: 20 })
      .then((page) => setFlagged(page.items))
      .catch((e) => setError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="page-header">
        <div>
          <span className="page-eyebrow">Operations overview</span>
          <h1>Dashboard</h1>
          <p>Platform-wide status at a glance.</p>
          <div className="page-meta"><span>Live operational view</span><span>{stats === null ? "Checking risk queue" : `${stats.flaggedRedemptions} flagged for review`}</span></div>
        </div>
      </div>

      {error && <div className="state-alert" role="alert"><strong>Some operational data is unavailable.</strong><span>{error}</span></div>}

      <div className="stat-grid">
        <StatCard icon={UsersIcon} label="Total businesses" value={stats?.businesses} />
        <StatCard icon={BuildingIcon} label="Total venues" value={stats?.venues} />
        <StatCard icon={CompassIcon} label="Active quests" value={stats?.activeQuests} />
        <StatCard icon={FlagIcon} label="Flagged redemptions" value={stats?.flaggedRedemptions} tone={stats && stats.flaggedRedemptions > 0 ? "warning" : undefined} />
      </div>

      <div className="operational-grid">
        <div className="card" style={{ margin: 0 }}>
          <div className="card-title">
            <FlagIcon size={18} />
            Flagged for review
          </div>
          <p className="card-subtext">Redemptions held by the anti-gaming signal (FR-13), pending manual review.</p>
          <div className="table-wrap">
            {flagged === null ? (
              <SkeletonRows />
            ) : flagged.length === 0 ? (
              <div className="empty-state">Nothing flagged right now.</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Venue</th>
                    <th>Quest</th>
                    <th>Flag reason</th>
                    <th>When</th>
                  </tr>
                </thead>
                <tbody>
                  {flagged.slice(0, 8).map((r) => (
                    <tr key={r.id}>
                      <td>{r.marker?.venue?.name ?? "—"}</td>
                      <td>{r.quest?.name ?? "—"}</td>
                      <td>{r.flagReason ?? "—"}</td>
                      <td>{new Date(r.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {stats && stats.flaggedRedemptions > 8 && (
            <Link href="/redemptions" style={{ color: "var(--action)", fontSize: 13, fontWeight: 600 }}>
              View all {stats.flaggedRedemptions} →
            </Link>
          )}
        </div>

        <div className="card" style={{ margin: 0 }}>
          <div className="card-title">
            <ShieldIcon size={18} />
            Pending verification
          </div>
          <p className="card-subtext">Businesses awaiting payment verification.</p>
          {pendingBusinesses === null ? (
            <SkeletonRows />
          ) : pendingBusinesses.length === 0 ? (
            <div className="empty-state">Nothing pending.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {pendingBusinesses.slice(0, 6).map((b) => (
                <div key={b.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, paddingBottom: 10, borderBottom: "1px solid var(--border-subtle)" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{b.name}</div>
                    <div style={{ fontSize: 12, color: "var(--on-surface-variant)" }}>{b.email}</div>
                  </div>
                  <button
                    className="secondary"
                    onClick={() =>
                      api
                        .verifyBusiness(b.id)
                        .then(() => {
                          showToast(`${b.name} marked verified.`);
                          refreshPending();
                        })
                        .catch(() => showToast("Could not verify business", "error"))
                    }
                  >
                    Approve
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function StatCard({ icon: Icon, label, value, tone }: { icon: typeof UsersIcon; label: string; value: number | null | undefined; tone?: "warning" }) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <span className="stat-icon" style={tone === "warning" ? { background: "color-mix(in srgb, var(--error) 16%, transparent)", color: "var(--error)" } : undefined}>
          <Icon size={16} />
        </span>
      </div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value ?? <span className="skeleton-row" style={{ display: "inline-block", width: 60, height: 28 }} />}</div>
    </div>
  );
}

function SkeletonRows() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {[0, 1, 2].map((i) => (
        <div key={i} className="skeleton-row" />
      ))}
    </div>
  );
}
