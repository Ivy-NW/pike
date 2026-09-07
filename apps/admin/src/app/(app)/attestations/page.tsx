"use client";
import { useEffect, useState } from "react";
import { api, ApiError, type AttestationConfig, type VerificationResult } from "@/lib/api";
import { getAdminRole } from "@/lib/auth";
import { useToast } from "@/components/Toast";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export default function AttestationsPage() {
  const { showToast } = useToast();
  const isSuperAdmin = getAdminRole() === "super_admin";

  const [redemptionId, setRedemptionId] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const [config, setConfig] = useState<AttestationConfig | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const [draft, setDraft] = useState<AttestationConfig | null>(null);
  const [confirmingSave, setConfirmingSave] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .getAttestationConfig()
      .then((c) => {
        setConfig(c);
        setDraft(c);
      })
      .catch((e) => setConfigError(e.message));
  }, []);

  const runVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setVerifyError(null);
    setResult(null);
    try {
      const res = await api.verifyAttestation(redemptionId.trim());
      setResult(res);
    } catch (err) {
      setVerifyError(err instanceof ApiError ? err.message : "Could not verify this redemption");
    } finally {
      setVerifying(false);
    }
  };

  const saveConfig = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      const updated = await api.updateAttestationConfig(draft);
      setConfig(updated);
      setDraft(updated);
      showToast("Batch config updated.");
      setConfirmingSave(false);
    } catch (e) {
      showToast(e instanceof ApiError ? e.message : "Could not update batch config", "error");
    } finally {
      setSaving(false);
    }
  };

  const configDirty = config && draft && (config.batchWindowMs !== draft.batchWindowMs || config.batchCountThreshold !== draft.batchCountThreshold || config.maxRetries !== draft.maxRetries);

  return (
    <>
      <div className="page-header">
        <div>
          <span className="page-eyebrow">On-chain trust</span>
          <h1>Attestations</h1>
          <p>Verify a redemption against the chain, and tune how completions get batched.</p>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Verify a redemption</div>
        <p className="card-subtext">
          Pastes a redemption id and checks the stored completion hash, Merkle proof, and on-chain root — a pass/fail
          check instead of trusting the database alone.
        </p>
        <form onSubmit={runVerify} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            placeholder="Redemption id"
            value={redemptionId}
            onChange={(e) => setRedemptionId(e.target.value)}
            style={{ minWidth: 280 }}
            required
          />
          <button className="primary" disabled={verifying}>{verifying ? "Verifying…" : "Verify"}</button>
        </form>

        {verifyError && <div className="state-alert" role="alert" style={{ marginTop: 16 }}><strong>Verification failed.</strong><span>{verifyError}</span></div>}

        {result && (
          <div className="stat-grid" style={{ marginTop: 20, marginBottom: 0 }}>
            <div className="stat-card">
              <div className="stat-label">Status</div>
              <div className="stat-value" style={{ fontSize: 18 }}>
                <span className={`badge ${result.status === "confirmed" ? "badge-verified" : "badge-neutral"}`}>{result.status}</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Overall match</div>
              <div className="stat-value" style={{ fontSize: 18 }}>
                {result.match === null ? (
                  <span className="badge badge-neutral">not yet confirmed</span>
                ) : (
                  <span className={`badge ${result.match ? "badge-verified" : "badge-flagged"}`}>{result.match ? "pass" : "fail"}</span>
                )}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Hash match</div>
              <div style={{ fontSize: 13, wordBreak: "break-all", marginTop: 6 }}>{result.recomputedHash ?? "—"}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">On-chain root</div>
              <div style={{ fontSize: 13, wordBreak: "break-all", marginTop: 6 }}>{result.onChainRoot ?? "—"}</div>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-title">Batch config</div>
        <p className="card-subtext">FR-A3: the runtime batch window/threshold — editable without a deploy.</p>
        {configError && <div className="state-alert" role="alert"><strong>Config could not be loaded.</strong><span>{configError}</span></div>}
        {draft && (
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span className="field-label" style={{ marginBottom: 0 }}>Batch window (ms)</span>
              <input
                type="number"
                min={1000}
                value={draft.batchWindowMs}
                disabled={!isSuperAdmin}
                onChange={(e) => setDraft({ ...draft, batchWindowMs: Number(e.target.value) })}
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span className="field-label" style={{ marginBottom: 0 }}>Batch count threshold</span>
              <input
                type="number"
                min={1}
                value={draft.batchCountThreshold}
                disabled={!isSuperAdmin}
                onChange={(e) => setDraft({ ...draft, batchCountThreshold: Number(e.target.value) })}
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span className="field-label" style={{ marginBottom: 0 }}>Max retries</span>
              <input
                type="number"
                min={1}
                value={draft.maxRetries}
                disabled={!isSuperAdmin}
                onChange={(e) => setDraft({ ...draft, maxRetries: Number(e.target.value) })}
              />
            </label>
          </div>
        )}
        <div style={{ marginTop: 18 }}>
          <button
            className="primary"
            disabled={!isSuperAdmin || !configDirty}
            title={isSuperAdmin ? undefined : "Only super admins can edit batch config"}
            onClick={() => setConfirmingSave(true)}
          >
            Save changes
          </button>
        </div>
      </div>

      {confirmingSave && (
        <ConfirmDialog
          title="Update batch config?"
          body="This changes production attestation batch timing immediately — every redemption queued after this point uses the new window/threshold."
          confirmLabel="Save changes"
          busy={saving}
          onConfirm={saveConfig}
          onCancel={() => setConfirmingSave(false)}
        />
      )}
    </>
  );
}
