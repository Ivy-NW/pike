"use client";
import { Fragment, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { SearchIcon } from "@/components/icons";

export default function QuestsPage() {
  const [quests, setQuests] = useState<any[] | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    api.listQuests().then(setQuests).catch((e) => setError(e.message));
  }, []);

  const filtered = useMemo(() => {
    if (!quests) return null;
    const q = query.trim().toLowerCase();
    if (!q) return quests;
    return quests.filter((quest) => quest.name?.toLowerCase().includes(q));
  }, [quests, query]);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Quests</h1>
          <p>Every quest created across the platform.</p>
        </div>
        <div className="search-field">
          <SearchIcon size={16} />
          <input placeholder="Search quests…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      {error && <p style={{ color: "var(--error)" }}>{error}</p>}

      <div className="card table-wrap">
        {filtered === null ? (
          <SkeletonRows />
        ) : filtered.length === 0 ? (
          <div className="empty-state">{quests?.length ? "No quests match that search." : "No quests yet."}</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Reward</th>
                <th>Tier</th>
                <th>Status</th>
                <th>Cap/day</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((q) => (
                <Fragment key={q.id}>
                  <tr
                    onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                    style={{ cursor: "pointer" }}
                    aria-expanded={expandedId === q.id}
                  >
                    <td>{q.name}</td>
                    <td>{q.rewardDescription}</td>
                    <td>{q.rewardTier}</td>
                    <td>
                      <span className={`badge ${q.status === "live" ? "badge-verified" : "badge-neutral"}`}>{q.status}</span>
                    </td>
                    <td>{q.maxRedemptionsPerDay}</td>
                  </tr>
                  {expandedId === q.id && (
                    <tr>
                      <td colSpan={5} style={{ background: "var(--surface-container-lowest)" }}>
                        <div className="stat-grid" style={{ margin: "8px 0" }}>
                          <div className="stat-card">
                            <div className="card-subtext" style={{ margin: 0 }}>Quest ID</div>
                            <div>{q.id}</div>
                          </div>
                          <div className="stat-card">
                            <div className="card-subtext" style={{ margin: 0 }}>Venue ID</div>
                            <div>{q.venueId}</div>
                          </div>
                          <div className="stat-card">
                            <div className="card-subtext" style={{ margin: 0 }}>Theme</div>
                            <div>{q.theme}</div>
                          </div>
                          <div className="stat-card">
                            <div className="card-subtext" style={{ margin: 0 }}>Reward type</div>
                            <div>{q.rewardType}</div>
                          </div>
                          <div className="stat-card">
                            <div className="card-subtext" style={{ margin: 0 }}>Expires</div>
                            <div>{q.expiresAt ? new Date(q.expiresAt).toLocaleString() : "Never"}</div>
                          </div>
                          <div className="stat-card">
                            <div className="card-subtext" style={{ margin: 0 }}>Created</div>
                            <div>{new Date(q.createdAt).toLocaleString()}</div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

function SkeletonRows() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: 4 }}>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="skeleton-row" />
      ))}
    </div>
  );
}
