"use client";
import { useEffect, useMemo, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { SearchIcon } from "@/components/icons";

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<any[] | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newComp, setNewComp] = useState(true);
  const [creating, setCreating] = useState(false);

  const refresh = () => api.listBusinesses().then(setBusinesses).catch((e) => setError(e.message));

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    if (!businesses) return null;
    const q = query.trim().toLowerCase();
    if (!q) return businesses;
    return businesses.filter((b) => b.name?.toLowerCase().includes(q) || b.email?.toLowerCase().includes(q));
  }, [businesses, query]);

  const createBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      await api.createBusiness(newName, newEmail, newComp);
      setNewName("");
      setNewEmail("");
      refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create business");
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <span className="page-eyebrow">Partner operations</span>
          <h1>Businesses</h1>
          <p>Every venue-owning account on the platform.</p>
          <div className="page-meta"><span>{businesses === null ? "Loading accounts" : `${businesses.length} total accounts`}</span><span>{businesses?.filter((b) => b.paymentStatus !== "verified").length ?? "—"} awaiting verification</span></div>
        </div>
        <div className="search-field">
          <SearchIcon size={16} />
          <input placeholder="Search businesses…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      {error && <div className="state-alert" role="alert"><strong>Businesses could not be loaded.</strong><span>{error}</span></div>}

      <div className="card">
        <div className="card-title">Sales-assisted onboarding</div>
        <p className="card-subtext">Secondary path alongside self-registration — comp a partner account directly.</p>
        <form onSubmit={createBusiness} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <input placeholder="Business name" value={newName} onChange={(e) => setNewName(e.target.value)} required />
          <input placeholder="Email" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required />
          <label style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}>
            <input type="checkbox" checked={newComp} onChange={(e) => setNewComp(e.target.checked)} style={{ width: "auto" }} />
            Comp (verified, no card)
          </label>
          <button className="primary" disabled={creating}>{creating ? "Creating…" : "Create"}</button>
        </form>
      </div>

      <div className="card table-wrap responsive-table" aria-busy={filtered === null}>
        {filtered === null ? (
          <SkeletonRows />
        ) : filtered.length === 0 ? (
          <div className="empty-state">{businesses?.length ? "No businesses match that search." : "No businesses yet."}</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Payment</th>
                <th>Source</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id}>
                  <td>{b.name}</td>
                  <td>{b.email}</td>
                  <td>
                    <span className={`badge ${b.paymentStatus === "verified" ? "badge-verified" : "badge-unverified"}`}>{b.paymentStatus}</span>
                  </td>
                  <td>{b.createdByAdmin ? "Admin-created" : "Self-registered"}</td>
                  <td>{b.suspended ? <span className="badge badge-flagged">Suspended</span> : "Active"}</td>
                  <td style={{ display: "flex", gap: 6 }}>
                    {b.paymentStatus !== "verified" && (
                      <button className="primary" onClick={() => api.verifyBusiness(b.id).then(refresh)}>
                        Mark verified
                      </button>
                    )}
                    <button className="danger" onClick={() => api.suspendBusiness(b.id, !b.suspended).then(refresh)}>
                      {b.suspended ? "Unsuspend" : "Suspend"}
                    </button>
                  </td>
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
