"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { PlusIcon, SearchIcon } from "@/components/icons";

export default function QuestsPage() {
  const [quests, setQuests] = useState<any[] | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listVenues()
      .then(async (venues) => {
        const entries = await Promise.all(
          venues.map(async (v: any) => (await api.listQuestsForVenue(v.id)).map((q: any) => ({ ...q, venueName: v.name }))),
        );
        setQuests(entries.flat());
      })
      .catch((e) => setError(e.message));
  }, []);

  const filtered = useMemo(() => {
    if (!quests) return null;
    const q = query.trim().toLowerCase();
    if (!q) return quests;
    return quests.filter((quest) => quest.name?.toLowerCase().includes(q) || quest.venueName?.toLowerCase().includes(q));
  }, [quests, query]);

  return (
    <>
      <div className="page-header">
        <div>
          <span className="eyebrow">Campaigns</span>
          <h1>Quests</h1>
          <p>Manage every live, draft, and completed quest across your venues.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div className="search-field">
            <SearchIcon size={16} />
            <input placeholder="Search quests…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <Link href="/quests/new" className="primary icon">
            <PlusIcon size={16} />
            Create quest
          </Link>
        </div>
      </div>

      {error && <div className="notice notice-error" role="alert"><strong>Quests could not be loaded</strong><span>{error}</span></div>}

      <div className="card table-wrap">
        {filtered === null ? (
          <div className="loading-stack" aria-label="Loading quests"><div className="skeleton-row" /><div className="skeleton-row" /><div className="skeleton-row" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state empty-state-panel">
            <span className="badge badge-neutral">{quests?.length ? "No results" : "No quests"}</span>
            <h2>{quests?.length ? "Try a different search" : "Create your first quest"}</h2>
            <p>{quests?.length ? "Search by quest or venue name." : "Build a campaign, choose its reward, and publish it to a venue."}</p>
            {!quests?.length && <Link href="/quests/new" className="primary">Create quest</Link>}
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Venue</th>
                <th>Reward</th>
                <th>Status</th>
                <th>Cap/day</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((q) => (
                <tr key={q.id}>
                  <td data-label="Quest">
                    <Link href={`/quests/${q.id}`} style={{ fontWeight: 600 }}>{q.name}</Link>
                  </td>
                  <td data-label="Venue">{q.venueName}</td>
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
