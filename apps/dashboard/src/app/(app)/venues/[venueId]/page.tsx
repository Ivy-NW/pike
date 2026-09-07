"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { ChevronRightIcon, PlusIcon } from "@/components/icons";

export default function VenueDetailPage() {
  const { venueId } = useParams<{ venueId: string }>();
  const [venue, setVenue] = useState<any>(null);
  const [quests, setQuests] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!venueId) return;
    let cancelled = false;
    setError(null);

    // No single-venue GET endpoint exists yet — the business's venue list is small and
    // already fetched elsewhere in the app, so finding the match client-side avoids adding
    // a backend route for what's otherwise a pure read.
    api
      .listVenues()
      .then((venues) => {
        if (cancelled) return;
        const match = venues.find((v: any) => v.id === venueId);
        if (!match) {
          setError("Venue not found");
          return;
        }
        setVenue(match);
      })
      .catch((err) => { if (!cancelled) setError(err instanceof ApiError ? err.message : "Could not load this venue"); });

    api
      .listQuestsForVenue(venueId)
      .then((data) => { if (!cancelled) setQuests(data); })
      .catch((err) => { if (!cancelled) setError(err instanceof ApiError ? err.message : "Could not load quests for this venue"); });

    return () => { cancelled = true; };
  }, [venueId]);

  if (error && !venue) {
    return (
      <div className="state-page">
        <span className="eyebrow">Venue</span>
        <h1>Venue unavailable</h1>
        <div className="notice notice-error" role="alert"><strong>We could not load this venue</strong><span>{error}</span></div>
        <Link href="/home" className="secondary">Back to dashboard</Link>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="state-page" aria-label="Loading venue">
        <span className="eyebrow">Venue</span>
        <div className="skeleton-row skeleton-title" />
        <div className="card loading-stack"><div className="skeleton-row" /><div className="skeleton-row" /><div className="skeleton-row" /></div>
      </div>
    );
  }

  return (
    <>
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/home">Dashboard</Link>
        <ChevronRightIcon size={12} />
        <span>{venue.name}</span>
      </nav>
      <div className="page-header">
        <div>
          <span className="eyebrow">Venue</span>
          <h1>{venue.name}</h1>
          <p>{venue.venueType?.replaceAll("_", " ")}{venue.address ? ` · ${venue.address}` : ""}</p>
        </div>
        <Link href={`/quests/new?venueId=${venue.id}`} className="primary icon">
          <PlusIcon size={16} />
          Create quest
        </Link>
      </div>

      <div className="card table-wrap">
        {quests === null ? (
          <div className="loading-stack" aria-label="Loading quests"><div className="skeleton-row" /><div className="skeleton-row" /><div className="skeleton-row" /></div>
        ) : quests.length === 0 ? (
          <div className="empty-state empty-state-panel">
            <span className="badge badge-info">No quests yet</span>
            <h2>Create the first quest for {venue.name}</h2>
            <p>Build a campaign, choose its reward, and publish it to this venue.</p>
            <Link href={`/quests/new?venueId=${venue.id}`} className="primary">Create quest</Link>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Reward</th>
                <th>Status</th>
                <th>Cap/day</th>
              </tr>
            </thead>
            <tbody>
              {quests.map((q) => (
                <tr key={q.id}>
                  <td data-label="Quest">
                    <Link href={`/quests/${q.id}`} style={{ fontWeight: 600 }}>{q.name}</Link>
                  </td>
                  <td data-label="Reward">{q.rewardDescription}</td>
                  <td data-label="Status">
                    <span className={`badge ${q.status === "live" ? "badge-verified" : "badge-neutral"}`}>{q.status}</span>
                  </td>
                  <td data-label="Cap / day">{q.maxRedemptionsPerDay}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
