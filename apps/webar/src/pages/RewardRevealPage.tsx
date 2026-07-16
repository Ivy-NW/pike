import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { api, ApiError } from "../lib/api";
import { clearConsumerToken, getConsumerToken, setConsumerToken } from "../lib/auth";

interface RedemptionDetail {
  id: string;
  status: "claimed" | "flagged" | "rejected";
  quest: { name: string; rewardDescription: string; rewardType: string; expiresAt: string | null };
}

interface AwardInfo {
  xpAwarded: number;
  newBadges: { key: string; name: string; description: string }[];
}

type Mode = "signin" | "signup";

/**
 * UI doc 7.4 — the highest-contrast, most gold-forward screen in the product.
 * Always fetches from GET /redemptions/:id (joined with quest/venue) rather than trusting
 * the POST /redemptions response passed via navigation state, which is the flat row only.
 *
 * Phase 2 — FR-4: when opened from the app's authenticated in-app scan (via WebView with
 * ?channel=app&appToken=...), this auto-claims with the app's own identity instead of asking
 * to sign in again — the user is already signed in.
 *
 * PIKE's own auth (username/email + password) — no third-party identity provider. A returning
 * guest on the same browser is auto-claimed with their stored token instead of signing in again.
 */
export function RewardRevealPage() {
  const { redemptionId } = useParams<{ redemptionId: string }>();
  const [searchParams] = useSearchParams();
  const channel = searchParams.get("channel") === "app" ? "app" : "webar";
  const appToken = searchParams.get("appToken");

  const [redemption, setRedemption] = useState<RedemptionDetail | null>(null);
  const [claimed, setClaimed] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [mode, setMode] = useState<Mode>("signin");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [award, setAward] = useState<AwardInfo | null>(null);

  useEffect(() => {
    if (!redemptionId) return;
    api.getRedemption(redemptionId).then(setRedemption as any).catch(() => setError("Could not load your reward"));
  }, [redemptionId]);

  const claimNow = async () => {
    if (!redemptionId) return;
    setClaiming(true);
    setError(null);
    try {
      const result: any = await api.claimReward(redemptionId, { channel });
      setAward(result.award ?? null);
      setClaimed(true);
    } catch (err) {
      // A stored token that no longer works (expired/invalid) shouldn't wedge a returning
      // guest on the "preparing your claim" screen forever — clear it and fall back to the form.
      if (err instanceof ApiError && err.statusCode === 401 && channel === "webar") {
        clearConsumerToken();
      }
      setError(err instanceof ApiError ? err.message : "Could not claim this reward");
    } finally {
      setClaiming(false);
    }
  };

  // Authenticated in-app scan: store the app's token and claim automatically.
  useEffect(() => {
    if (channel === "app" && appToken && redemption && redemption.status !== "rejected" && !claimed && !claiming) {
      setConsumerToken(appToken);
      claimNow();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel, appToken, redemption]);

  // Returning guest on this browser: skip the form, claim with the stored token.
  useEffect(() => {
    if (channel === "webar" && getConsumerToken() && redemption && redemption.status !== "rejected" && !claimed && !claiming) {
      claimNow();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel, redemption]);

  const handleSignup = async () => {
    setClaiming(true);
    setError(null);
    try {
      const { token } = await api.signupConsumer({ phone, username, name, email, password });
      setConsumerToken(token);
      await claimNow();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create your account");
      setClaiming(false);
    }
  };

  const handleSignin = async () => {
    setClaiming(true);
    setError(null);
    try {
      const { token } = await api.signinConsumer({ identifier, password });
      setConsumerToken(token);
      await claimNow();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Invalid username/email or password");
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

  const inputStyle = {
    width: "100%",
    padding: 14,
    borderRadius: 12,
    border: "1px solid #334155",
    marginBottom: 12,
    background: "#1E293B",
    color: "white",
  } as const;

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
            <p style={{ color: "#10B981", fontWeight: 600, marginBottom: 8 }}>Reward claimed!</p>
            {award && award.xpAwarded > 0 && (
              <p className="reward-accent" style={{ fontWeight: 600, marginBottom: 8 }}>+{award.xpAwarded} XP</p>
            )}
            {award && award.newBadges.length > 0 && (
              <p style={{ color: "#7C3AED", fontSize: 13, marginBottom: 8 }}>
                New badge{award.newBadges.length > 1 ? "s" : ""}: {award.newBadges.map((b) => b.name).join(", ")}
              </p>
            )}
            {channel === "webar" && (
              <>
                <p style={{ color: "#94a3b8", fontSize: 14, marginTop: 8 }}>Save your reward and start earning XP — get the PIKE app.</p>
                <button className="btn-text" style={{ color: "white" }}>Get the app →</button>
              </>
            )}
          </>
        ) : channel === "app" || getConsumerToken() ? (
          <>
            <p style={{ color: "#94a3b8" }}>{claiming ? "Claiming your reward..." : "Preparing your claim..."}</p>
            {error && <p style={{ color: "#EF4444", fontSize: 13, marginTop: 8 }}>{error}</p>}
          </>
        ) : mode === "signin" ? (
          <>
            <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="Username or email" style={inputStyle} />
            <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" style={inputStyle} />
            <button className="btn-primary" disabled={claiming || !identifier || !password} onClick={handleSignin}>
              {claiming ? "Signing in..." : "Sign in & claim"}
            </button>
            <button className="btn-text" style={{ color: "white", marginTop: 8 }} disabled={claiming} onClick={() => { setMode("signup"); setError(null); }}>
              New here? Create an account
            </button>
            {error && <p style={{ color: "#EF4444", fontSize: 13, marginTop: 8 }}>{error}</p>}
          </>
        ) : (
          <>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number (e.g. +15551234567)" style={inputStyle} />
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" style={inputStyle} />
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" style={inputStyle} />
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" style={inputStyle} />
            <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (min 8 characters)" type="password" style={inputStyle} />
            <button
              className="btn-primary"
              disabled={claiming || !phone || !username || !name || !email || password.length < 8}
              onClick={handleSignup}
            >
              {claiming ? "Creating account..." : "Create account & claim"}
            </button>
            <button className="btn-text" style={{ color: "white", marginTop: 8 }} disabled={claiming} onClick={() => { setMode("signin"); setError(null); }}>
              Already have an account? Sign in
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
