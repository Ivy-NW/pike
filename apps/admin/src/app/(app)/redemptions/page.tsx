"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type StatusFilter = "" | "claimed" | "flagged" | "rejected";

export default function RedemptionsPage() {
  const [redemptions, setRedemptions] = useState<any[] | null>(null);
  const [filter, setFilter] = useState<StatusFilter>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setRedemptions(null);
    api.listRedemptions(filter || undefined).then(setRedemptions).catch((e) => setError(e.message));
  }, [filter]);

  return (
    <>
      <div className="page-header">
        <div>
          <span className="page-eyebrow">Trust &amp; safety</span>
          <h1>Redemptions</h1>
          <p>Flagged completions surface FR-13&apos;s anti-gaming signal for manual review.</p>
          <div className="page-meta"><span>{redemptions === null ? "Loading review queue" : `${redemptions.length} ${filter || "total"}`}</span><span>{filter === "flagged" ? "Manual review queue" : "Redemption ledger"}</span></div>
        </div>
        <div className="tab-bar">
          {(["", "claimed", "flagged", "rejected"] as const).map((s) => (
            <button key={s || "all"} className={filter === s ? "active" : ""} onClick={() => setFilter(s)}>
              {s || "all"}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="state-alert" role="alert"><strong>Redemptions could not be loaded.</strong><span>{error}</span></div>}

      <div className="card table-wrap responsive-table risk-table" aria-busy={redemptions === null}>
        {redemptions === null ? (
          <SkeletonRows />
        ) : redemptions.length === 0 ? (
          <div className="empty-state">No {filter || ""} redemptions.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Venue</th>
                <th>Quest</th>
                <th>Status</th>
                <th>Flag reason</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {redemptions.map((r) => (
                <tr key={r.id}>
                  <td>{r.marker?.venue?.name}</td>
                  <td>{r.quest?.name}</td>
                  <td>
                    <span className={`badge ${r.status === "claimed" ? "badge-verified" : "badge-flagged"}`}>{r.status}</span>
                  </td>
                  <td>{r.flagReason ?? "—"}</td>
                  <td>{new Date(r.createdAt).toLocaleString()}</td>
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
