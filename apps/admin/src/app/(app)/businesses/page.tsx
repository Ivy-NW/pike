"use client";
import { useEffect, useMemo, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { getAdminRole } from "@/lib/auth";
import { SearchIcon } from "@/components/icons";
import { useToast } from "@/components/Toast";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export default function BusinessesPage() {
  const { showToast } = useToast();
  const isSuperAdmin = getAdminRole() === "super_admin";

  const [businesses, setBusinesses] = useState<any[] | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newComp, setNewComp] = useState(true);
  const [creating, setCreating] = useState(false);

  const [suspendTarget, setSuspendTarget] = useState<{ id: string; name: string; suspended: boolean } | null>(null);
  const [suspending, setSuspending] = useState(false);

  const refresh = () =>
    api
      .listBusinesses()
      .then((page) => {
        setBusinesses(page.items);
        setNextCursor(page.nextCursor);
      })
      .catch((e) => setError(e.message));

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMore = async () => {
    if (!nextCursor) return;
    setLoadingMore(true);
    try {
      const page = await api.listBusinesses({ cursor: nextCursor });
      setBusinesses((prev) => [...(prev ?? []), ...page.items]);
      setNextCursor(page.nextCursor);
    } catch (e) {
      showToast(e instanceof ApiError ? e.message : "Could not load more businesses", "error");
    } finally {
      setLoadingMore(false);
    }
  };

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
      showToast(`${newName} was added as a business.`);
      refresh();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Could not create business";
      setError(message);
      showToast(message, "error");
    } finally {
      setCreating(false);
    }
  };

  const verify = async (id: string, name: string) => {
    try {
      await api.verifyBusiness(id);
      showToast(`${name} marked verified.`);
      refresh();
    } catch (e) {
      showToast(e instanceof ApiError ? e.message : "Could not verify business", "error");
    }
  };

  const confirmSuspend = async () => {
    if (!suspendTarget) return;
    setSuspending(true);
    try {
      await api.suspendBusiness(suspendTarget.id, !suspendTarget.suspended);
      showToast(`${suspendTarget.name} ${suspendTarget.suspended ? "unsuspended" : "suspended"}.`);
      setSuspendTarget(null);
      refresh();
    } catch (e) {
      showToast(e instanceof ApiError ? e.message : "Could not update suspension", "error");
    } finally {
      setSuspending(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <span className="page-eyebrow">Partner operations</span>
          <h1>Businesses</h1>
          <p>Every venue-owning account on the platform.</p>
          <div className="page-meta"><span>{businesses === null ? "Loading accounts" : `${businesses.length} loaded`}</span><span>{businesses?.filter((b) => b.paymentStatus !== "verified").length ?? "—"} awaiting verification</span></div>
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
                      <button className="secondary" onClick={() => verify(b.id, b.name)}>
                        Mark verified
                      </button>
                    )}
                    <button
                      className="danger"
                      disabled={!isSuperAdmin}
                      title={isSuperAdmin ? undefined : "Only super admins can suspend a business"}
                      onClick={() => setSuspendTarget({ id: b.id, name: b.name, suspended: b.suspended })}
                    >
                      {b.suspended ? "Unsuspend" : "Suspend"}
                    </button>
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

      {suspendTarget && (
        <ConfirmDialog
          title={suspendTarget.suspended ? "Unsuspend business?" : "Suspend business?"}
          body={
            suspendTarget.suspended
              ? `${suspendTarget.name} will regain access immediately.`
              : `${suspendTarget.name} will immediately lose access to the dashboard and all quests will stop accepting redemptions.`
          }
          confirmLabel={suspendTarget.suspended ? "Unsuspend" : "Suspend"}
          danger={!suspendTarget.suspended}
          busy={suspending}
          onConfirm={confirmSuspend}
          onCancel={() => setSuspendTarget(null)}
        />
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
