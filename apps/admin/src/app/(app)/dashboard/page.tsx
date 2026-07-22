"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { BuildingIcon, CompassIcon, FlagIcon, ShieldIcon, UsersIcon } from "@/components/icons";

export default function DashboardOverviewPage() {
  const [businesses, setBusinesses] = useState<any[] | null>(null);
  const [venues, setVenues] = useState<any[] | null>(null);
  const [quests, setQuests] = useState<any[] | null>(null);
  const [flagged, setFlagged] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshBusinesses = () => api.listBusinesses().then(setBusinesses).catch((e) => setError(e.message));

  useEffect(() => {
    refreshBusinesses();
    api.listVenues().then(setVenues).catch((e) => setError(e.message));
    api.listQuests().then(setQuests).catch((e) => setError(e.message));
    api.listRedemptions("flagged").then(setFlagged).catch((e) => setError(e.message));
  }, []);

  const activeQuests = quests?.filter((q) => q.status === "live").length ?? null;
  const pendingBusinesses = businesses?.filter((b) => b.paymentStatus !== "verified" && !b.suspended) ?? [];

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Platform-wide status at a glance.</p>
        </div>
      </div>

      {error && <p style={{ color: "var(--error)" }}>{error}</p>}

      <div className="stat-grid">
        <StatCard icon={UsersIcon} label="Total businesses" value={businesses?.length} />
        <StatCard icon={BuildingIcon} label="Total venues" value={venues?.length} />
        <StatCard icon={CompassIcon} label="Active quests" value={activeQuests} />
        <StatCard icon={FlagIcon} label="Flagged redemptions" value={flagged?.length} tone={flagged && flagged.length > 0 ? "warning" : undefined} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 20, alignItems: "start" }}>
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
          {flagged && flagged.length > 8 && (
            <Link href="/redemptions" style={{ color: "var(--primary)", fontSize: 13, fontWeight: 600 }}>
              View all {flagged.length} →
            </Link>
          )}
        </div>

        <div className="card" style={{ margin: 0 }}>
          <div className="card-title">
            <ShieldIcon size={18} />
            Pending verification
          </div>
          <p className="card-subtext">Businesses awaiting payment verification.</p>
          {pendingBusinesses === null || businesses === null ? (
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
                  <button className="primary" onClick={() => api.verifyBusiness(b.id).then(refreshBusinesses)}>
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
        <span className="stat-icon" style={tone === "warning" ? { background: "color-mix(in srgb, var(--secondary-container) 25%, transparent)", color: "var(--secondary)" } : undefined}>
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
