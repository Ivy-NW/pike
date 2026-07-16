import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api, ApiError } from "../lib/api";
import { claimWithPhone, claimWithSocial } from "../lib/firebase";

interface RedemptionDetail {
  id: string;
  status: "claimed" | "flagged" | "rejected";
  quest: { name: string; rewardDescription: string; rewardType: string; expiresAt: string | null };
}

/**
 * UI doc 7.4 — the highest-contrast, most gold-forward screen in the product.
 * Always fetches from GET /redemptions/:id (joined with quest/venue) rather than trusting
 * the POST /redemptions response passed via navigation state, which is the flat row only.
 */
export function RewardRevealPage() {
  const { redemptionId } = useParams<{ redemptionId: string }>();
  const [redemption, setRedemption] = useState<RedemptionDetail | null>(null);
  const [claimed, setClaimed] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!redemptionId) return;
    api.getRedemption(redemptionId).then(setRedemption as any).catch(() => setError("Could not load your reward"));
  }, [redemptionId]);

  const handleClaim = async (method: "phone" | "social") => {
    if (!redemptionId) return;
    setClaiming(true);
    setError(null);
    try {
      const firebaseIdToken = method === "phone" ? await claimWithPhone(phone) : await claimWithSocial("google");
      await api.claimReward(redemptionId, { identity: { method, firebaseIdToken }, channel: "webar" });
      setClaimed(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not claim this reward");
    } finally {
      setClaiming(false);
    }
  };

  if (error && !redemption) {
    return <div style={{ padding: 24, textAlign: "center" }}>{error}</div>;
  }
  if (!redemption) {
    return <div style={{ padding: 24, textAlign: "center", color: "white", background: "#111827", height: "100vh" }}>Loading...</div>;
  }

  if (redemption.status === "rejected") {
    return (
      <div style={{ minHeight: "100vh", background: "#111827", color: "white", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
        <p>This scan couldn't be verified as a new redemption right now. Please ask venue staff for help.</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#111827", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div className="card" style={{ background: "#111827", border: "1px solid rgba(245,158,11,0.35)", maxWidth: 380, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🪙</div>
        <h2 className="reward-accent" style={{ fontSize: 24, marginBottom: 8 }}>
          {redemption.quest.rewardDescription}
        </h2>
        <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 24 }}>
          {redemption.quest.expiresAt
            ? `Expires ${new Date(redemption.quest.expiresAt).toLocaleDateString()}`
            : "No expiry"}
        </p>

        {claimed ? (
          <>
            <p style={{ color: "#10B981", fontWeight: 600, marginBottom: 16 }}>Reward claimed!</p>
            <p style={{ color: "#94a3b8", fontSize: 14 }}>Save your reward and start earning XP — get the PIKE app.</p>
            <button className="btn-text" style={{ color: "white" }}>Get the app →</button>
          </>
        ) : (
          <>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone number"
              style={{ width: "100%", padding: 14, borderRadius: 12, border: "1px solid #334155", marginBottom: 12, background: "#1E293B", color: "white" }}
            />
            <button className="btn-primary" disabled={claiming || !phone} onClick={() => handleClaim("phone")}>
              {claiming ? "Claiming..." : "Claim reward"}
            </button>
            <button className="btn-text" style={{ color: "white", marginTop: 8 }} disabled={claiming} onClick={() => handleClaim("social")}>
              or continue with Google
            </button>
            {error && <p style={{ color: "#EF4444", fontSize: 13, marginTop: 8 }}>{error}</p>}
            <p style={{ color: "#64748b", fontSize: 12, marginTop: 20 }}>
              Save your reward and start earning XP — get the PIKE app.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
