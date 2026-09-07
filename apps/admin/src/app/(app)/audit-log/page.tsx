"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function AuditLogPage() {
  const [entries, setEntries] = useState<any[] | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listAuditLog()
      .then((page) => {
        setEntries(page.items);
        setNextCursor(page.nextCursor);
      })
      .catch((e) => setError(e.message));
  }, []);

  const loadMore = async () => {
    if (!nextCursor) return;
    setLoadingMore(true);
    try {
      const page = await api.listAuditLog({ cursor: nextCursor });
      setEntries((prev) => [...(prev ?? []), ...page.items]);
      setNextCursor(page.nextCursor);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <span className="page-eyebrow">Accountability</span>
          <h1>Audit log</h1>
          <p>Who verified, suspended, comped, or reconfigured what — and when.</p>
        </div>
      </div>

      {error && <div className="state-alert" role="alert"><strong>Audit log could not be loaded.</strong><span>{error}</span></div>}

      <div className="card table-wrap responsive-table" aria-busy={entries === null}>
        {entries === null ? (
          <SkeletonRows />
        ) : entries.length === 0 ? (
          <div className="empty-state">No admin actions recorded yet.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>When</th>
                <th>Admin</th>
                <th>Action</th>
                <th>Target</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td>{new Date(entry.createdAt).toLocaleString()}</td>
                  <td>{entry.admin?.email ?? "—"}</td>
                  <td>{entry.action}</td>
                  <td style={{ fontSize: 12, color: "var(--outline)" }}>
                    {entry.targetType ? `${entry.targetType}${entry.targetId ? ` · ${entry.targetId}` : ""}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {nextCursor && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: -8, marginBottom: 20 }}>
          <button className="secondary" onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
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
