"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Filter = "" | "true" | "false";

export default function GateAttemptsPage() {
  const [attempts, setAttempts] = useState<any[] | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filter, setFilter] = useState<Filter>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setAttempts(null);
    setNextCursor(null);
    api
      .listAdminGateAttempts(filter || undefined)
      .then((page) => {
        setAttempts(page.items);
        setNextCursor(page.nextCursor);
      })
      .catch((e) => setError(e.message));
  }, [filter]);

  const loadMore = async () => {
    if (!nextCursor) return;
    setLoadingMore(true);
    try {
      const page = await api.listAdminGateAttempts(filter || undefined, { cursor: nextCursor });
      setAttempts((prev) => [...(prev ?? []), ...page.items]);
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
          <span className="page-eyebrow">Security</span>
          <h1>Gate log</h1>
          <p>Attempts against the marketing site&apos;s admin-gate code — repeated failures are worth reviewing.</p>
        </div>
        <div className="tab-bar">
          {([
            { value: "" as const, label: "all" },
            { value: "true" as const, label: "success" },
            { value: "false" as const, label: "failed" },
          ]).map(({ value, label }) => (
            <button key={label} className={filter === value ? "active" : ""} onClick={() => setFilter(value)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="state-alert" role="alert"><strong>Gate log could not be loaded.</strong><span>{error}</span></div>}

      <div className="card table-wrap responsive-table" aria-busy={attempts === null}>
        {attempts === null ? (
          <SkeletonRows />
        ) : attempts.length === 0 ? (
          <div className="empty-state">No {filter === "true" ? "successful" : filter === "false" ? "failed" : ""} attempts.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Result</th>
                <th>IP hash</th>
                <th>User agent</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((a) => (
                <tr key={a.id}>
                  <td>
                    <span className={`badge ${a.success ? "badge-verified" : "badge-flagged"}`}>{a.success ? "success" : "failed"}</span>
                  </td>
                  <td style={{ fontSize: 12, color: "var(--outline)" }}>{a.ipHash}</td>
                  <td style={{ maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.userAgent}</td>
                  <td>{new Date(a.createdAt).toLocaleString()}</td>
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
