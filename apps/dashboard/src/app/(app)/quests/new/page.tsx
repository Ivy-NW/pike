"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, ApiError } from "@/lib/api";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1] ?? "");
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function NewQuestForm() {
  const router = useRouter();
  const venueIdParam = useSearchParams().get("venueId");

  const [venues, setVenues] = useState<any[] | null>(null);
  const [venueId, setVenueId] = useState<string | null>(venueIdParam);

  const [step, setStep] = useState<"template" | "upload" | "payment" | "done">("template");
  const [name, setName] = useState("");
  const [theme, setTheme] = useState("");
  const [rewardType, setRewardType] = useState("discount");
  const [rewardTier, setRewardTier] = useState<"low_stakes" | "high_value">("low_stakes");
  const [rewardDescription, setRewardDescription] = useState("");
  const [maxRedemptionsPerDay, setMaxRedemptionsPerDay] = useState(50);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [questId, setQuestId] = useState<string | null>(null);
  const [paymentMethodInput, setPaymentMethodInput] = useState("pm_card_visa");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!venueId) api.listVenues().then(setVenues).catch((e) => setError(e.message));
  }, [venueId]);

  if (!venueId) {
    return (
      <div className="card" style={{ maxWidth: 480, margin: "40px auto" }}>
        <div className="card-title">Which venue is this quest for?</div>
        {error && <p style={{ color: "var(--error)" }}>{error}</p>}
        {venues === null ? (
          <div className="skeleton-row" />
        ) : venues.length === 0 ? (
          <p className="card-subtext">No venues yet — add one first.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {venues.map((v) => (
              <button key={v.id} className="secondary" style={{ textAlign: "left" }} onClick={() => setVenueId(v.id)}>
                {v.name}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  const createQuestAndMarker = async () => {
    setLoading(true);
    setError(null);
    try {
      const quest: any = await api.createQuest(venueId, {
        name,
        theme,
        rewardType,
        rewardTier,
        rewardDescription,
        maxRedemptionsPerDay,
        expiresAt: null,
      });
      if (imageFile) {
        const base64 = await fileToBase64(imageFile);
        await api.createMarker(quest.id, base64);
      }
      setQuestId(quest.id);
      await attemptPublish(quest.id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create the quest");
    } finally {
      setLoading(false);
    }
  };

  const attemptPublish = async (id: string) => {
    try {
      await api.publishQuest(id);
      setStep("done");
    } catch (err) {
      if (err instanceof ApiError && err.code === "payment_required_to_publish") {
        setStep("payment"); // inline gate — the in-progress quest is never lost (PRD section 12)
      } else {
        setError(err instanceof ApiError ? err.message : "Could not publish the quest");
      }
    }
  };

  const submitPayment = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.attachPaymentMethod(paymentMethodInput);
      if (questId) await attemptPublish(questId);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not verify payment method");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 520, margin: "20px auto" }}>
      {step === "template" && (
        <>
          <div className="card-title">Create a quest</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input placeholder="Quest name" value={name} onChange={(e) => setName(e.target.value)} />
            <input placeholder="Theme (e.g. pirate, cyberpunk, safari)" value={theme} onChange={(e) => setTheme(e.target.value)} />
            <select value={rewardType} onChange={(e) => setRewardType(e.target.value)}>
              <option value="discount">Discount</option>
              <option value="merch">Merch</option>
              <option value="vip_pass">VIP pass</option>
              <option value="free_item">Free item</option>
            </select>
            <select value={rewardTier} onChange={(e) => setRewardTier(e.target.value as any)}>
              <option value="low_stakes">Low-stakes (unauthenticated web claim OK — FR-12)</option>
              <option value="high_value">High-value (app-only claim — FR-12)</option>
            </select>
            <input placeholder="Reward description (e.g. 15% off your bill)" value={rewardDescription} onChange={(e) => setRewardDescription(e.target.value)} />
            <label style={{ fontSize: 13, color: "var(--on-surface-variant)" }}>Max redemptions / day</label>
            <input type="number" min={1} value={maxRedemptionsPerDay} onChange={(e) => setMaxRedemptionsPerDay(Number(e.target.value))} />
            <button className="primary" onClick={() => setStep("upload")} disabled={!name || !theme || !rewardDescription}>
              Next: upload marker image
            </button>
          </div>
        </>
      )}

      {step === "upload" && (
        <>
          <div className="card-title">Upload a marker image</div>
          <p className="card-subtext">
            A photo or logo — this gets sent to the marker-compiling service and returns a print-ready marker plus fallback QR (FR-10).
          </p>
          <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
          <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
            <button className="secondary" onClick={() => setStep("template")}>Back</button>
            <button className="primary" onClick={createQuestAndMarker} disabled={loading}>
              {loading ? "Creating…" : "Create & publish"}
            </button>
          </div>
          {error && <p style={{ color: "var(--error)" }}>{error}</p>}
        </>
      )}

      {step === "payment" && (
        <>
          <div className="card-title">Add a payment method to activate this quest</div>
          <p className="card-subtext">Your quest is saved as a draft — nothing is lost. Add a payment method now to publish it immediately.</p>
          <input
            placeholder="Stripe payment method id (dev stub — e.g. pm_card_visa)"
            value={paymentMethodInput}
            onChange={(e) => setPaymentMethodInput(e.target.value)}
          />
          <button className="primary" style={{ marginTop: 12 }} onClick={submitPayment} disabled={loading}>
            {loading ? "Verifying…" : "Add payment method & publish"}
          </button>
          {error && <p style={{ color: "var(--error)" }}>{error}</p>}
        </>
      )}

      {step === "done" && (
        <>
          <div className="card-title" style={{ color: "var(--success)" }}>Quest is live!</div>
          <p className="card-subtext">Print the marker/QR from the quest detail page and place it at your venue.</p>
          <button className="primary" onClick={() => router.push(`/quests/${questId}`)}>View quest</button>
        </>
      )}
    </div>
  );
}

export default function NewQuestPage() {
  return (
    <>
      <div className="page-header">
        <div>
          <h1>New quest</h1>
        </div>
      </div>
      <Suspense fallback={<div className="skeleton-row" />}>
        <NewQuestForm />
      </Suspense>
    </>
  );
}
