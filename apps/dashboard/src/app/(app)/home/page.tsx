"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { BuildingIcon, PlusIcon } from "@/components/icons";

export default function HomePage() {
  const [business, setBusiness] = useState<any>(null);
  const [venues, setVenues] = useState<any[] | null>(null);
  const [questsByVenue, setQuestsByVenue] = useState<Record<string, any[]>>({});
  // A failed business-profile fetch is caught silently (nothing on this page depends on it
  // beyond a name label with an existing fallback) rather than sharing one `error` state
  // with venuesError below — matches the isolated-error pattern in quests/[questId]/page.tsx,
  // where a stats-fetch failure doesn't hide a successfully-loaded quest.
  const [venuesError, setVenuesError] = useState<string | null>(null);

  useEffect(() => {
    setVenuesError(null);
    api.me().then(setBusiness).catch(() => {});
    api
      .listVenues()
      .then(async (venueList) => {
        setVenues(venueList);
        const entries = await Promise.all(venueList.map(async (v: any) => [v.id, await api.listQuestsForVenue(v.id)] as const));
        setQuestsByVenue(Object.fromEntries(entries));
      })
      .catch((e) => setVenuesError(e.message));
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
              // Silent fallback on businessError too — nothing else on this page depends on
              // the profile fetch succeeding, so it doesn't deserve a blocking red banner.
              "Welcome back."
            )}
          </p>
        </div>
        <Link href="/venues/new" className="secondary icon">
          <PlusIcon size={16} />
          Add venue
        </Link>
      </div>

      {venuesError && <div className="notice notice-error" role="alert"><strong>Dashboard unavailable</strong><span>{venuesError}</span></div>}

      <dl className="metrics-ledger">
        <div className="metric-row">
          <dt className="metric-label">Active quests</dt>
          <dd className="metric-value">{venues ? activeQuests : <span className="skeleton-row" style={{ display: "inline-block", width: 50, height: 28 }} />}</dd>
        </div>
        <div className="metric-row">
          <dt className="metric-label">Venues</dt>
          <dd className="metric-value">{venues?.length ?? <span className="skeleton-row" style={{ display: "inline-block", width: 50, height: 28 }} />}</dd>
        </div>
        <div className="metric-row">
          <dt className="metric-label">Total quests</dt>
          <dd className="metric-value">{venues ? totalQuests : <span className="skeleton-row" style={{ display: "inline-block", width: 50, height: 28 }} />}</dd>
        </div>
      </dl>

      <div className="section-heading section-block">
        <div><span className="eyebrow">Locations</span><h2>Your venues</h2></div>
        {venues && <span className="section-meta">{venues.length} total</span>}
      </div>

      {venues === null ? (
        <div className="card loading-stack" aria-label="Loading venues"><div className="skeleton-row" /><div className="skeleton-row" /><div className="skeleton-row" /></div>
      ) : venues.length === 0 ? (
        <div className="card empty-state empty-state-panel"><span className="badge badge-info">First step</span><h2>Add your first venue</h2><p>Venues group quests and their redemption activity.</p><Link href="/venues/new" className="primary">Add venue</Link></div>
      ) : (
        <div className="venue-grid">
          {venues.map((venue) => {
            const quests = questsByVenue[venue.id] ?? [];
            const preview = quests.slice(0, 3);
            const remaining = quests.length - preview.length;
            return (
              <Link key={venue.id} href={`/venues/${venue.id}`} className="card venue-card">
                <span className="venue-card-badge"><BuildingIcon size={18} /></span>
                <div className="venue-card-header">
                  <div>
                    <h3 className="card-title">{venue.name}</h3>
                    <p className="card-subtext" style={{ marginBottom: 0 }}>{venue.venueType?.replaceAll("_", " ")}</p>
                  </div>
                </div>

                <div className="venue-quest-list">
                  {preview.map((quest) => (
                    <div key={quest.id} className="venue-quest-row">
                      <span>{quest.name}</span>
                      <span className={`badge ${quest.status === "live" ? "badge-verified" : "badge-unverified"}`}>{quest.status}</span>
                    </div>
                  ))}
                  {quests.length === 0 && <p className="inline-empty">No quests at this venue yet.</p>}
                  {remaining > 0 && <p className="venue-quest-more">+{remaining} more</p>}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
