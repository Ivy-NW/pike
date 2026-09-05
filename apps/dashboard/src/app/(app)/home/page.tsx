"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { BuildingIcon, CompassIcon, PlusIcon } from "@/components/icons";

export default function HomePage() {
  const [business, setBusiness] = useState<any>(null);
  const [venues, setVenues] = useState<any[] | null>(null);
  const [questsByVenue, setQuestsByVenue] = useState<Record<string, any[]>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.me().then(setBusiness).catch((e) => setError(e.message));
    api
      .listVenues()
      .then(async (venueList) => {
        setVenues(venueList);
        const entries = await Promise.all(venueList.map(async (v: any) => [v.id, await api.listQuestsForVenue(v.id)] as const));
        setQuestsByVenue(Object.fromEntries(entries));
      })
      .catch((e) => setError(e.message));
  }, []);

  const totalQuests = Object.values(questsByVenue).reduce((sum, qs) => sum + qs.length, 0);
  const activeQuests = Object.values(questsByVenue).reduce((sum, qs) => sum + qs.filter((q) => q.status === "live").length, 0);

  return (
    <>
      <div className="page-header">
        <div>
          <span className="eyebrow">Overview</span>
          <h1>{business?.name ?? "Dashboard"}</h1>
          <p>
            {business ? (
              <span className={`badge ${business.paymentStatus === "verified" ? "badge-verified" : "badge-unverified"}`}>
                {business.paymentStatus === "verified" ? "Payment verified" : "Payment method needed to publish"}
              </span>
            ) : (
              "Welcome back."
            )}
          </p>
        </div>
        <Link href="/venues/new" className="secondary icon">
          <PlusIcon size={16} />
          Add venue
        </Link>
      </div>

      {error && <div className="notice notice-error" role="alert"><strong>Dashboard unavailable</strong><span>{error}</span></div>}

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-icon"><BuildingIcon size={16} /></span>
          </div>
          <div className="stat-label">Venues</div>
          <div className="stat-value">{venues?.length ?? <span className="skeleton-row" style={{ display: "inline-block", width: 50, height: 28 }} />}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-icon"><CompassIcon size={16} /></span>
          </div>
          <div className="stat-label">Active quests</div>
          <div className="stat-value">{venues ? activeQuests : <span className="skeleton-row" style={{ display: "inline-block", width: 50, height: 28 }} />}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-icon"><CompassIcon size={16} /></span>
          </div>
          <div className="stat-label">Total quests</div>
          <div className="stat-value">{venues ? totalQuests : <span className="skeleton-row" style={{ display: "inline-block", width: 50, height: 28 }} />}</div>
        </div>
      </div>

      <div className="section-heading" style={{ marginTop: 8 }}>
        <div><span className="eyebrow">Locations</span><h2>Your venues</h2></div>
        {venues && <span className="section-meta">{venues.length} total</span>}
      </div>

      {venues === null ? (
        <div className="card loading-stack" aria-label="Loading venues"><div className="skeleton-row" /><div className="skeleton-row" /><div className="skeleton-row" /></div>
      ) : venues.length === 0 ? (
        <div className="card empty-state empty-state-panel"><span className="badge badge-info">First step</span><h2>Add your first venue</h2><p>Venues group quests and their redemption activity.</p><Link href="/venues/new" className="primary">Add venue</Link></div>
      ) : (
        venues.map((venue) => (
          <div key={venue.id} className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ margin: 0, fontFamily: "var(--font-heading)" }}>{venue.name}</h3>
                <p style={{ margin: "4px 0", color: "var(--on-surface-variant)", fontSize: 14 }}>{venue.venueType?.replaceAll("_", " ")}</p>
              </div>
              <Link href={`/quests/new?venueId=${venue.id}`} className="primary icon">
                <PlusIcon size={14} />
                New quest
              </Link>
            </div>

            <div style={{ marginTop: 12 }}>
              {(questsByVenue[venue.id] ?? []).map((quest) => (
                <Link
                  key={quest.id}
                  href={`/quests/${quest.id}`}
                  style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderTop: "1px solid var(--border-subtle)", textDecoration: "none", color: "inherit" }}
                >
                  <span>{quest.name}</span>
                  <span className={`badge ${quest.status === "live" ? "badge-verified" : "badge-unverified"}`}>{quest.status}</span>
                </Link>
              ))}
              {(questsByVenue[venue.id] ?? []).length === 0 && <p className="inline-empty">No quests at this venue yet.</p>}
            </div>
          </div>
        ))
      )}
    </>
  );
}
