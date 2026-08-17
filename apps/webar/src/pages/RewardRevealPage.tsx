import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { api, ApiError } from "../lib/api";
import { clearConsumerToken, getConsumerToken, setConsumerToken } from "../lib/auth";
import type { ClaimRewardResponse } from "@pike/shared-types";

interface RedemptionDetail {
  id: string;
  status: "claimed" | "flagged" | "rejected";
  quest: { name: string; rewardDescription: string; rewardType: string; expiresAt: string | null };
  marker: { venue: { name: string } };
}

interface AwardInfo {
  xpAwarded: number;
  newBadges: { key: string; name: string; description: string }[];
}

type Mode = "signin" | "signup";

/**
 * UI doc 7.4 — the highest-contrast, most gold-forward screen in the product
 * (docs/ui designs/reward_unlock(_light)).
 *
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
  // PWA hand-off (channel=app on web): after claiming, "Back to your wallet" returns to the
  // app origin instead of leaving the user stranded on the webar flow.
  const returnUrl = searchParams.get("returnUrl");

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
    api
      .getRedemption(redemptionId)
      .then(setRedemption as any)
      .catch((err) => {
        const detail = err instanceof ApiError ? `${err.statusCode} ${err.message}` : err instanceof Error ? err.message : String(err);
        setError(`Could not load your reward — ${detail}`);
      });
  }, [redemptionId]);

  const claimNow = async () => {
    if (!redemptionId) return;
    setClaiming(true);
    setError(null);
    try {
      const result: ClaimRewardResponse = await api.claimReward(redemptionId, { channel });
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
    return <div style={pageStyle}>Loading...</div>;
  }

  if (redemption.status === "rejected") {
    return (
      <div style={{ ...pageStyle, justifyContent: "center", padding: 24, textAlign: "center" }}>
        <p>This scan couldn&apos;t be verified as a new redemption right now. Please ask venue staff for help.</p>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <header style={headerStyle}>
        <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 18, color: "var(--primary)" }}>PIKE</span>
      </header>

      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: 28 }}>
          <div style={iconCircleStyle}>
            <span className="material-symbols-outlined reward-accent" style={{ fontSize: 56 }}>
              inventory_2
            </span>
          </div>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--on-surface-variant)", marginTop: 20 }}>
            Quest Complete · You Unlocked
          </p>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: 26, fontWeight: 700, color: "var(--on-surface)", marginTop: 6 }}>
            {redemption.quest.rewardDescription}
          </h1>
        </div>

        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <span className="material-symbols-outlined" style={{ color: "var(--primary)" }}>
              storefront
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--on-surface-variant)" }}>
              {redemption.marker.venue.name}
            </span>
          </div>
          <div style={{ height: 1, background: "var(--border-subtle)", margin: "0 0 16px" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
            <span style={{ color: "var(--on-surface-variant)" }}>Voucher ID</span>
            <span style={{ fontFamily: "var(--font-mono)", color: "var(--on-surface)" }}>{redemption.id.slice(0, 10).toUpperCase()}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginTop: 8 }}>
            <span style={{ color: "var(--on-surface-variant)" }}>Expires</span>
            <span style={{ color: "var(--on-surface)" }}>
              {redemption.quest.expiresAt ? new Date(redemption.quest.expiresAt).toLocaleDateString() : "No expiry"}
            </span>
          </div>
        </div>

        {claimed ? (
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "var(--success)", fontWeight: 600, marginBottom: 8 }}>Reward claimed!</p>
            {award && award.xpAwarded > 0 && (
              <p className="reward-accent" style={{ fontWeight: 600, marginBottom: 8 }}>+{award.xpAwarded} XP</p>
            )}
            {award && award.newBadges.length > 0 && (
              <p style={{ color: "var(--tertiary)", fontSize: 13, marginBottom: 8 }}>
                New badge{award.newBadges.length > 1 ? "s" : ""}: {award.newBadges.map((b) => b.name).join(", ")}
              </p>
            )}
            {channel === "app" && returnUrl ? (
              <a className="btn-primary" href={returnUrl} style={{ textDecoration: "none", display: "inline-block" }}>
                Back to your wallet
              </a>
            ) : (
              <button className="btn-primary">Add to Wallet</button>
            )}
            {channel === "webar" && (
              <>
                <p style={{ color: "var(--on-surface-variant)", fontSize: 14, marginTop: 16 }}>
                  Save your reward and start earning XP — get the PIKE app.
                </p>
                <button className="btn-text">Get the app →</button>
              </>
            )}
          </div>
        ) : channel === "app" || getConsumerToken() ? (
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "var(--on-surface-variant)" }}>{claiming ? "Claiming your reward..." : "Preparing your claim..."}</p>
            {error && <p style={{ color: "var(--error)", fontSize: 13, marginTop: 8 }}>{error}</p>}
          </div>
        ) : mode === "signin" ? (
          <div>
            <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="Username or email" />
            <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />
            <button className="btn-primary" disabled={claiming || !identifier || !password} onClick={handleSignin}>
              {claiming ? "Signing in..." : "Sign in & claim"}
            </button>
            <button className="btn-text" style={{ marginTop: 8, width: "100%" }} disabled={claiming} onClick={() => { setMode("signup"); setError(null); }}>
              New here? Create an account
            </button>
            {error && <p style={{ color: "var(--error)", fontSize: 13, marginTop: 8 }}>{error}</p>}
          </div>
        ) : (
          <div>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number (e.g. +15551234567)" />
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" />
            <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (min 8 characters)" type="password" />
            <button
              className="btn-primary"
              disabled={claiming || !phone || !username || !name || !email || password.length < 8}
              onClick={handleSignup}
            >
              {claiming ? "Creating account..." : "Create account & claim"}
            </button>
            <button className="btn-text" style={{ marginTop: 8, width: "100%" }} disabled={claiming} onClick={() => { setMode("signin"); setError(null); }}>
              Already have an account? Sign in
            </button>
            {error && <p style={{ color: "var(--error)", fontSize: 13, marginTop: 8 }}>{error}</p>}
            <p style={{ color: "var(--on-surface-variant)", fontSize: 12, marginTop: 20, textAlign: "center" }}>
              Save your reward and start earning XP — get the PIKE app.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "var(--surface)",
  color: "var(--on-surface)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "88px 24px 40px",
};

const headerStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: 64,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "color-mix(in srgb, var(--surface) 85%, transparent)",
  backdropFilter: "blur(12px)",
  borderBottom: "1px solid var(--border-subtle)",
};

const iconCircleStyle: React.CSSProperties = {
  width: 112,
  height: 112,
  borderRadius: "50%",
  background: "var(--surface-container-lowest)",
  border: "1px solid var(--border-subtle)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 0 40px color-mix(in srgb, var(--secondary-container) 30%, transparent)",
};
