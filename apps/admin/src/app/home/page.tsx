"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { clearToken, getToken } from "@/lib/auth";

type Tab = "businesses" | "venues" | "quests" | "redemptions";

export default function AdminHomePage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("businesses");
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [venues, setVenues] = useState<any[]>([]);
  const [quests, setQuests] = useState<any[]>([]);
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [redemptionFilter, setRedemptionFilter] = useState<"" | "flagged" | "rejected" | "claimed">("");
  const [error, setError] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newComp, setNewComp] = useState(true);

  useEffect(() => {
    if (!getToken()) router.replace("/login");
  }, [router]);

  const refreshBusinesses = () => api.listBusinesses().then(setBusinesses).catch((e) => setError(e.message));

  useEffect(() => {
    if (tab === "businesses") refreshBusinesses();
    if (tab === "venues") api.listVenues().then(setVenues).catch((e) => setError(e.message));
    if (tab === "quests") api.listQuests().then(setQuests).catch((e) => setError(e.message));
    if (tab === "redemptions")
      api.listRedemptions(redemptionFilter || undefined).then(setRedemptions).catch((e) => setError(e.message));
  }, [tab, redemptionFilter]);

  const createBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createBusiness(newName, newEmail, newComp);
      setNewName("");
      setNewEmail("");
      refreshBusinesses();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create business");
    }
  };

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>PIKE Admin</h1>
        <button
          className="danger"
          onClick={() => {
            clearToken();
            router.push("/login");
          }}
        >
          Log out
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {(["businesses", "venues", "quests", "redemptions"] as Tab[]).map((t) => (
          <button
            key={t}
            className={tab === t ? "primary" : "danger"}
            style={tab === t ? {} : { color: "var(--deep-slate)", borderColor: "#cbd5e1" }}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {error && <p style={{ color: "var(--danger)" }}>{error}</p>}

      {tab === "businesses" && (
        <>
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Sales-assisted onboarding</h3>
            <p style={{ fontSize: 13, color: "#64748b" }}>
              Secondary path alongside self-registration — comp a partner account directly.
            </p>
            <form onSubmit={createBusiness} style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input placeholder="Business name" value={newName} onChange={(e) => setNewName(e.target.value)} required />
              <input placeholder="Email" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required />
              <label style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 4 }}>
                <input type="checkbox" checked={newComp} onChange={(e) => setNewComp(e.target.checked)} />
                Comp (verified, no card)
              </label>
              <button className="primary">Create</button>
            </form>
          </div>

          <div className="card">
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
                {businesses.map((b) => (
                  <tr key={b.id}>
                    <td>{b.name}</td>
                    <td>{b.email}</td>
                    <td>
                      <span className={`badge ${b.paymentStatus === "verified" ? "badge-verified" : "badge-unverified"}`}>
                        {b.paymentStatus}
                      </span>
                    </td>
                    <td>{b.createdByAdmin ? "Admin-created" : "Self-registered"}</td>
                    <td>{b.suspended ? <span className="badge badge-flagged">Suspended</span> : "Active"}</td>
                    <td style={{ display: "flex", gap: 6 }}>
                      {b.paymentStatus !== "verified" && (
                        <button
                          className="primary"
                          onClick={() => api.verifyBusiness(b.id).then(refreshBusinesses)}
                        >
                          Mark verified
                        </button>
                      )}
                      <button
                        className="danger"
                        onClick={() => api.suspendBusiness(b.id, !b.suspended).then(refreshBusinesses)}
                      >
                        {b.suspended ? "Unsuspend" : "Suspend"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === "venues" && (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Business ID</th>
              </tr>
            </thead>
            <tbody>
              {venues.map((v) => (
                <tr key={v.id}>
                  <td>{v.name}</td>
                  <td>{v.venueType}</td>
                  <td style={{ fontSize: 12, color: "#94a3b8" }}>{v.businessId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "quests" && (
        <div className="card">
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
              {quests.map((q) => (
                <tr key={q.id}>
                  <td>{q.name}</td>
                  <td>{q.rewardDescription}</td>
                  <td>{q.rewardTier}</td>
                  <td>{q.status}</td>
                  <td>{q.maxRedemptionsPerDay}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "redemptions" && (
        <>
          <div style={{ marginBottom: 12 }}>
            {(["", "claimed", "flagged", "rejected"] as const).map((s) => (
              <button
                key={s || "all"}
                className={redemptionFilter === s ? "primary" : "danger"}
                style={{ marginRight: 6 }}
                onClick={() => setRedemptionFilter(s)}
              >
                {s || "all"}
              </button>
            ))}
          </div>
          <div className="card">
            <p style={{ fontSize: 13, color: "#64748b" }}>
              Flagged completions surface FR-13's anti-gaming signal (e.g. repeat scans from the same session) for manual review.
            </p>
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
          </div>
        </>
      )}
    </div>
  );
}
