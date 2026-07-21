"use client";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { SearchIcon } from "@/components/icons";

export default function VenuesPage() {
  const [venues, setVenues] = useState<any[] | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.listVenues().then(setVenues).catch((e) => setError(e.message));
  }, []);

  const filtered = useMemo(() => {
    if (!venues) return null;
    const q = query.trim().toLowerCase();
    if (!q) return venues;
    return venues.filter((v) => v.name?.toLowerCase().includes(q) || v.venueType?.toLowerCase().includes(q));
  }, [venues, query]);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Venues</h1>
          <p>Physical locations registered across every business.</p>
        </div>
        <div className="search-field">
          <SearchIcon size={16} />
          <input placeholder="Search venues…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      {error && <p style={{ color: "var(--error)" }}>{error}</p>}

      <div className="card table-wrap">
        {filtered === null ? (
          <SkeletonRows />
        ) : filtered.length === 0 ? (
          <div className="empty-state">{venues?.length ? "No venues match that search." : "No venues yet."}</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Business ID</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr key={v.id}>
                  <td>{v.name}</td>
                  <td>{v.venueType}</td>
                  <td style={{ fontSize: 12, color: "var(--outline)" }}>{v.businessId}</td>
                </tr>
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
