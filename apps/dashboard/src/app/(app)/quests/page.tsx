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
          <h1>Quests</h1>
          <p>Every quest across all of your venues.</p>
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

      {error && <p style={{ color: "var(--error)" }}>{error}</p>}

      <div className="card table-wrap">
        {filtered === null ? (
          <div className="skeleton-row" />
        ) : filtered.length === 0 ? (
          <div className="empty-state">{quests?.length ? "No quests match that search." : "No quests yet — create your first one."}</div>
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
                  <td>
                    <Link href={`/quests/${q.id}`} style={{ fontWeight: 600 }}>{q.name}</Link>
                  </td>
                  <td>{q.venueName}</td>
                  <td>{q.rewardDescription}</td>
                  <td>
                    <span className={`badge ${q.status === "live" ? "badge-verified" : "badge-neutral"}`}>{q.status}</span>
                  </td>
                  <td>{q.maxRedemptionsPerDay}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
