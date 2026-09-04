"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api, ApiError, type QuestPatch, type RewardInventory, type RewardRow } from "@/lib/api";
import { GiftIcon, ClockIcon, SearchIcon } from "@/components/icons";

const REWARD_TYPE_LABELS: Record<string, string> = {
  discount: "Discount",
  merch: "Merch",
  vip_pass: "VIP pass",
  free_item: "Free item",
};

/** `datetime-local` speaks local wall-clock time; the API speaks UTC ISO. Convert on both edges. */
function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatExpiry(row: RewardRow): string {
  if (!row.expiresAt) return "No expiry";
  const when = new Date(row.expiresAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  return row.expired ? `Expired ${when}` : `Expires ${when}`;
}

export default function RewardsPage() {
  const [data, setData] = useState<RewardInventory | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busyQuestId, setBusyQuestId] = useState<string | null>(null);
  const [editing, setEditing] = useState<RewardRow | null>(null);

  const load = useCallback(async () => {
    try {
      setData(await api.listRewards());
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not load your rewards");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!data) return null;
    const q = query.trim().toLowerCase();
    if (!q) return data.rewards;
    return data.rewards.filter(
      (r) =>
        r.rewardDescription.toLowerCase().includes(q) ||
        r.questName.toLowerCase().includes(q) ||
        r.venueName.toLowerCase().includes(q),
    );
  }, [data, query]);

  /** Pause/resume change today's counters, so re-read the whole inventory rather than patching a row. */
  const toggleStatus = async (row: RewardRow) => {
    setBusyQuestId(row.questId);
    setError(null);
    try {
      if (row.questStatus === "live") await api.pauseQuest(row.questId);
      else await api.resumeQuest(row.questId);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not change that reward's status");
    } finally {
      setBusyQuestId(null);
    }
  };

  const saveEdit = async (questId: string, patch: QuestPatch) => {
    setBusyQuestId(questId);
    setError(null);
    try {
      await api.updateQuest(questId, patch);
      setEditing(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save those changes");
      throw err;
    } finally {
      setBusyQuestId(null);
    }
  };

  const summary = data?.summary;
  const capPct =
    summary && summary.capToday > 0 && summary.redeemedToday !== null
      ? Math.min(100, Math.round((summary.redeemedToday / summary.capToday) * 100))
      : 0;

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Rewards</h1>
          <p>Every reward across your venues — what it is, how much of today&apos;s cap is left, and whether it&apos;s in circulation.</p>
        </div>
        <div className="search-field">
          <SearchIcon size={16} />
          <input placeholder="Search rewards…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      {error && <p style={{ color: "var(--error)" }}>{error}</p>}

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-icon"><GiftIcon size={16} /></span>
          </div>
          <div className="stat-label">Rewards in circulation</div>
          <div className="stat-value">
            {summary ? summary.liveRewards : <span className="skeleton-row" style={{ display: "inline-block", width: 50, height: 28 }} />}
          </div>
          {summary && summary.totalRewards > summary.liveRewards && (
            <p className="card-subtext">{summary.totalRewards - summary.liveRewards} paused or unpublished</p>
          )}
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-icon"><ClockIcon size={16} /></span>
          </div>
          <div className="stat-label">Redeemed today</div>
          <div className="stat-value">
            {!summary ? (
              <span className="skeleton-row" style={{ display: "inline-block", width: 50, height: 28 }} />
            ) : summary.redeemedToday === null ? (
              "—"
            ) : (
              <>
                {summary.redeemedToday}
                <span style={{ fontSize: 15, fontWeight: 400, color: "var(--on-surface-variant)" }}> / {summary.capToday}</span>
              </>
            )}
          </div>
          {summary?.redeemedToday === null ? (
            <p className="card-subtext">Daily counters are temporarily unavailable.</p>
          ) : (
            summary && <div className="progress-bar" style={{ marginTop: 8 }}><span style={{ width: `${capPct}%` }} /></div>
          )}
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-icon"><GiftIcon size={16} /></span>
          </div>
          <div className="stat-label">Claimed all time</div>
          <div className="stat-value">
            {summary ? summary.totalClaimed : <span className="skeleton-row" style={{ display: "inline-block", width: 50, height: 28 }} />}
          </div>
        </div>
      </div>

      <div className="card table-wrap">
        {filtered === null ? (
          <div className="skeleton-row" />
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            {data?.rewards.length
              ? "No rewards match that search."
              : "No rewards yet — a reward is created together with its quest."}
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Reward</th>
                <th>Venue</th>
                <th>Tier</th>
                <th>Today</th>
                <th>Claimed</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const pct =
                  row.redeemedToday === null || row.maxRedemptionsPerDay === 0
                    ? 0
                    : Math.min(100, Math.round((row.redeemedToday / row.maxRedemptionsPerDay) * 100));
                const busy = busyQuestId === row.questId;

                return (
                  <tr key={row.questId}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{row.rewardDescription}</div>
                      <div style={{ fontSize: 12, color: "var(--on-surface-variant)" }}>
                        {REWARD_TYPE_LABELS[row.rewardType] ?? row.rewardType} ·{" "}
                        <Link href={`/quests/${row.questId}`}>{row.questName}</Link>
                      </div>
                    </td>
                    <td>{row.venueName}</td>
                    <td>
                      <span className={`badge ${row.rewardTier === "high_value" ? "badge-warning" : "badge-neutral"}`}>
                        {row.rewardTier === "high_value" ? "High-value" : "Low-stakes"}
                      </span>
                    </td>
                    <td style={{ minWidth: 130 }}>
                      {row.redeemedToday === null ? (
                        <span title="The daily cap counter is temporarily unavailable">—</span>
                      ) : (
                        <>
                          <div style={{ fontSize: 13, marginBottom: 4 }}>
                            {row.redeemedToday} / {row.maxRedemptionsPerDay}
                          </div>
                          <div className="progress-bar"><span style={{ width: `${pct}%` }} /></div>
                        </>
                      )}
                    </td>
                    <td>{row.claimed}</td>
                    <td>
                      <span
                        className={`badge ${
                          row.questStatus === "live" ? "badge-verified" : row.questStatus === "paused" ? "badge-warning" : "badge-neutral"
                        }`}
                      >
                        {row.questStatus}
                      </span>
                      <div style={{ fontSize: 12, color: row.expired ? "var(--error)" : "var(--on-surface-variant)", marginTop: 4 }}>
                        {formatExpiry(row)}
                      </div>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button className="secondary" onClick={() => setEditing(row)} disabled={busy}>
                          Edit
                        </button>
                        {/* A draft has never been published, so there is nothing to pause or resume yet. */}
                        {row.questStatus !== "draft" && (
                          <button
                            className={row.questStatus === "live" ? "danger" : "secondary"}
                            onClick={() => void toggleStatus(row)}
                            disabled={busy}
                          >
                            {busy ? "…" : row.questStatus === "live" ? "Pause" : "Resume"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {editing && (
        <EditRewardDialog
          row={editing}
          saving={busyQuestId === editing.questId}
          onCancel={() => setEditing(null)}
          onSave={saveEdit}
        />
      )}
    </>
  );
}

function EditRewardDialog({
  row,
  saving,
  onCancel,
  onSave,
}: {
  row: RewardRow;
  saving: boolean;
  onCancel: () => void;
  onSave: (questId: string, patch: QuestPatch) => Promise<void>;
}) {
  const [rewardDescription, setRewardDescription] = useState(row.rewardDescription);
  const [rewardType, setRewardType] = useState(row.rewardType);
  const [rewardTier, setRewardTier] = useState(row.rewardTier);
  const [maxRedemptionsPerDay, setMaxRedemptionsPerDay] = useState(String(row.maxRedemptionsPerDay));
  const [expiresAt, setExpiresAt] = useState(toLocalInput(row.expiresAt));

  const cap = Number(maxRedemptionsPerDay);
  const capValid = Number.isInteger(cap) && cap >= 1;

  const submit = async () => {
    // Send only what actually changed, so one editor never clobbers a field another just set.
    const patch: QuestPatch = {};
    if (rewardDescription !== row.rewardDescription) patch.rewardDescription = rewardDescription;
    if (rewardType !== row.rewardType) patch.rewardType = rewardType;
    if (rewardTier !== row.rewardTier) patch.rewardTier = rewardTier;
    if (cap !== row.maxRedemptionsPerDay) patch.maxRedemptionsPerDay = cap;

    const nextExpiry = expiresAt ? new Date(expiresAt).toISOString() : null;
    if (nextExpiry !== row.expiresAt) patch.expiresAt = nextExpiry;

    if (Object.keys(patch).length === 0) {
      onCancel();
      return;
    }
    await onSave(row.questId, patch).catch(() => undefined);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="card-title">Edit reward</div>
        <p className="card-subtext" style={{ marginBottom: 16 }}>
          {row.questName} · {row.venueName}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label className="field-label">Reward description</label>
            <input value={rewardDescription} onChange={(e) => setRewardDescription(e.target.value)} />
          </div>

          <div>
            <label className="field-label">Reward type</label>
            <select value={rewardType} onChange={(e) => setRewardType(e.target.value)}>
              <option value="discount">Discount</option>
              <option value="merch">Merch</option>
              <option value="vip_pass">VIP pass</option>
              <option value="free_item">Free item</option>
            </select>
          </div>

          <div>
            <label className="field-label">Tier</label>
            <select value={rewardTier} onChange={(e) => setRewardTier(e.target.value as RewardRow["rewardTier"])}>
              <option value="low_stakes">Low-stakes (unauthenticated web claim OK — FR-12)</option>
              <option value="high_value">High-value (app-only claim — FR-12)</option>
            </select>
          </div>

          <div>
            <label className="field-label">Max redemptions / day</label>
            <input
              type="number"
              min={1}
              value={maxRedemptionsPerDay}
              onChange={(e) => setMaxRedemptionsPerDay(e.target.value)}
            />
            {row.redeemedToday !== null && capValid && cap < row.redeemedToday && (
              <p className="card-subtext" style={{ color: "var(--error)", marginTop: 6 }}>
                {row.redeemedToday} have already been redeemed today — a cap of {cap} takes effect
                immediately, so no more will be accepted until tomorrow.
              </p>
            )}
          </div>

          <div>
            <label className="field-label">Expires</label>
            <input type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
            {expiresAt && (
              <button
                className="secondary"
                style={{ marginTop: 8, padding: "6px 12px", fontSize: 13 }}
                onClick={() => setExpiresAt("")}
              >
                Clear expiry
              </button>
            )}
          </div>
        </div>

        <div className="modal-actions">
          <button className="secondary" onClick={onCancel} disabled={saving}>
            Cancel
          </button>
          <button className="primary" onClick={() => void submit()} disabled={saving || !rewardDescription.trim() || !capValid}>
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
