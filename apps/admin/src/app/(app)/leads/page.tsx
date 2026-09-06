"use client";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { SearchIcon } from "@/components/icons";

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[] | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.listFreeMarkerLeads().then(setLeads).catch((e) => setError(e.message));
  }, []);

  const filtered = useMemo(() => {
    if (!leads) return null;
    const q = query.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter((l) => l.name?.toLowerCase().includes(q) || l.venueName?.toLowerCase().includes(q) || l.neighbourhood?.toLowerCase().includes(q));
  }, [leads, query]);

  const thisWeek = useMemo(() => {
    if (!leads) return null;
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return leads.filter((l) => new Date(l.createdAt).getTime() >= weekAgo).length;
  }, [leads]);

  return (
    <>
      <div className="page-header">
        <div>
          <span className="page-eyebrow">Venue pipeline</span>
          <h1>Free marker leads</h1>
          <p>Requests from the landing page&apos;s &quot;Start a quest&quot; form, newest first.</p>
          <div className="page-meta"><span>{leads === null ? "Loading requests" : `${leads.length} total requests`}</span><span>{thisWeek === null ? "—" : `${thisWeek} in the last 7 days`}</span></div>
        </div>
        <div className="search-field">
          <SearchIcon size={16} />
          <input placeholder="Search name, venue, or area…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      {error && <div className="state-alert" role="alert"><strong>Leads could not be loaded.</strong><span>{error}</span></div>}

      <div className="card table-wrap responsive-table" aria-busy={filtered === null}>
        {filtered === null ? (
          <SkeletonRows />
        ) : filtered.length === 0 ? (
          <div className="empty-state">{leads?.length ? "No leads match that search." : "No free-marker requests yet."}</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Venue</th>
                <th>WhatsApp</th>
                <th>Area</th>
                <th>Requested</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.id}>
                  <td>{l.name}</td>
                  <td>{l.venueName}</td>
                  <td><a href={`https://wa.me/${l.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">{l.whatsapp}</a></td>
                  <td>{l.neighbourhood || "—"}</td>
                  <td>{new Date(l.createdAt).toLocaleString()}</td>
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
