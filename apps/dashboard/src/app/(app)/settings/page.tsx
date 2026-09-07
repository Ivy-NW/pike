"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Business } from "@pike/shared-types";
import { api, ApiError } from "@/lib/api";
import { clearToken } from "@/lib/auth";
import { useToast } from "@/components/Toast";
import { BankIcon, CardIcon, DotsIcon, PhoneIcon } from "@/components/icons";

type Method = "card" | "mpesa" | "bank" | "other";

const MPESA_PATTERN = /^(?:\+254|0)7\d{8}$/;

function formatCardNumber(value: string): string {
  return value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

export default function SettingsPage() {
  const { showToast } = useToast();
  const [business, setBusiness] = useState<Business | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    api.me().then((b) => {
      setBusiness(b);
      setName(b.name ?? "");
      setPhone(b.phone ?? "");
      setAddress(b.address ?? "");
    }).catch(() => {});
  }, []);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileError(null);
    try {
      const updated = await api.updateBusinessProfile({ name, phone, address });
      setBusiness(updated);
      showToast("Profile saved");
    } catch (err) {
      setProfileError(err instanceof ApiError ? err.message : "Could not save your profile");
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <span className="eyebrow">Workspace</span>
          <h1>Settings</h1>
          <p>Manage your business profile, payment method, and account.</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 640 }}>
        <section className="card">
          <div className="card-title">Business profile</div>
          <p className="card-subtext">This is shown on receipts and support communication. Your login email can&apos;t be changed here — contact support@pike.app.</p>
          <form onSubmit={saveProfile} className="form-stack">
            <label className="field-label">Business name<input value={name} onChange={(e) => setName(e.target.value)} required /></label>
            <label className="field-label">Email<input value={business?.email ?? ""} disabled style={{ opacity: 0.6 }} /></label>
            <label className="field-label">Phone <span>Optional</span><input placeholder="07XX XXX XXX" value={phone} onChange={(e) => setPhone(e.target.value)} /></label>
            <label className="field-label">Address <span>Optional</span><input placeholder="Street, neighborhood, or landmark" value={address} onChange={(e) => setAddress(e.target.value)} /></label>
            {/* Secondary, not primary — the payment-method save below is this page's one primary action (it gates quest publishing). */}
            <button className="secondary form-submit" disabled={savingProfile}>
              {savingProfile ? "Saving…" : "Save changes"}
            </button>
            {profileError && <div className="notice notice-error" role="alert"><strong>Not saved</strong><span>{profileError}</span></div>}
          </form>
        </section>

        <PaymentCard business={business} onUpdated={(b) => setBusiness(b)} />

        <AccountCard />
      </div>
    </>
  );
}

function PaymentCard({ business, onUpdated }: { business: Business | null; onUpdated: (b: Business) => void }) {
  const { showToast } = useToast();
  const [method, setMethod] = useState<Method>("card");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  const [mpesaPhone, setMpesaPhone] = useState("");

  const [otherNote, setOtherNote] = useState("");

  const complete = async (syntheticId: string) => {
    setBusy(true);
    setError(null);
    try {
      const result = await api.attachPaymentMethod(syntheticId);
      if (business) onUpdated({ ...business, paymentStatus: result.paymentStatus });
      showToast("Payment method added");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not verify that payment method");
    } finally {
      setBusy(false);
      setPending(null);
    }
  };

  const submitCard = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = cardNumber.replace(/\D/g, "");
    void complete(`mock_card_${digits.slice(-4) || "0000"}`);
  };

  const submitMpesa = (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setPending("STK push sent — enter your M-Pesa PIN on your phone…");
    setTimeout(() => void complete(`mock_mpesa_${mpesaPhone}`), 1600);
  };

  const submitBank = () => {
    void complete(`mock_bank_${business?.id?.slice(0, 8) ?? "ref"}`);
  };

  const submitOther = (e: React.FormEvent) => {
    e.preventDefault();
    void complete(`mock_other_${otherNote.slice(0, 40) || "arrangement"}`);
  };

  const verified = business?.paymentStatus === "verified";

  return (
    <section className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div className="card-title">
            Payment method
            <span className="mock-badge">Mock</span>
          </div>
          <p className="card-subtext">Required to publish quests. No real charge is made — this is a demo integration.</p>
        </div>
        <span className={`badge ${verified ? "badge-verified" : "badge-unverified"}`}>
          {verified ? "Verified" : "Not verified"}
        </span>
      </div>

      <div className="method-tabs" role="tablist">
        <button type="button" role="tab" className={`method-tab${method === "card" ? " active" : ""}`} onClick={() => setMethod("card")}>
          <CardIcon size={15} /> Card
        </button>
        <button type="button" role="tab" className={`method-tab${method === "mpesa" ? " active" : ""}`} onClick={() => setMethod("mpesa")}>
          <PhoneIcon size={15} /> M-Pesa
        </button>
        <button type="button" role="tab" className={`method-tab${method === "bank" ? " active" : ""}`} onClick={() => setMethod("bank")}>
          <BankIcon size={15} /> Bank transfer
        </button>
        <button type="button" role="tab" className={`method-tab${method === "other" ? " active" : ""}`} onClick={() => setMethod("other")}>
          <DotsIcon size={15} /> Other
        </button>
      </div>

      {method === "card" && (
        <form onSubmit={submitCard} className="form-stack">
          <label className="field-label">
            Card number
            <input
              className="card-number-input"
              placeholder="4242 4242 4242 4242"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              required
            />
          </label>
          <div style={{ display: "flex", gap: 12 }}>
            <label className="field-label" style={{ flex: 1 }}>
              Expiry
              <input placeholder="MM/YY" value={expiry} onChange={(e) => setExpiry(formatExpiry(e.target.value))} maxLength={5} required />
            </label>
            <label className="field-label" style={{ flex: 1 }}>
              CVC
              <input placeholder="123" value={cvc} onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))} required />
            </label>
          </div>
          <button className="primary form-submit" disabled={busy || cardNumber.replace(/\D/g, "").length < 12 || expiry.length < 5 || cvc.length < 3}>
            {busy ? "Verifying…" : "Save card"}
          </button>
        </form>
      )}

      {method === "mpesa" && (
        <form onSubmit={submitMpesa} className="form-stack">
          <label className="field-label">
            M-Pesa phone number
            <input placeholder="07XX XXX XXX" value={mpesaPhone} onChange={(e) => setMpesaPhone(e.target.value)} required />
          </label>
          {pending && (
            <div className="notice" style={{ background: "var(--surface-container-high)", color: "var(--on-surface)" }}>
              {pending}
            </div>
          )}
          <button className="primary form-submit" disabled={busy || !MPESA_PATTERN.test(mpesaPhone)}>
            {busy ? "Waiting for confirmation…" : "Send STK push"}
          </button>
        </form>
      )}

      {method === "bank" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div className="card-subtext" style={{ marginBottom: 0, display: "grid", gridTemplateColumns: "auto 1fr", gap: "4px 16px" }}>
            <span>Bank</span><strong style={{ color: "var(--on-surface)" }}>PIKE Business Bank (demo)</strong>
            <span>Account name</span><strong style={{ color: "var(--on-surface)" }}>PIKE Ltd</strong>
            <span>Account number</span><strong style={{ color: "var(--on-surface)" }}>1100 2200 3300</strong>
            <span>Reference</span><strong style={{ color: "var(--on-surface)" }}>{business?.id?.slice(0, 8) ?? "—"}</strong>
          </div>
          <button className="primary form-submit" onClick={submitBank} disabled={busy}>
            {busy ? "Confirming…" : "I've made the transfer"}
          </button>
        </div>
      )}

      {method === "other" && (
        <form onSubmit={submitOther} className="form-stack">
          <label className="field-label">
            Describe the arrangement
            <textarea
              rows={3}
              placeholder="e.g. Invoiced monthly via our sales contact"
              value={otherNote}
              onChange={(e) => setOtherNote(e.target.value)}
              required
            />
          </label>
          <button className="primary form-submit" disabled={busy || !otherNote.trim()}>
            {busy ? "Saving…" : "Submit arrangement"}
          </button>
        </form>
      )}

      {error && <div className="notice notice-error" role="alert" style={{ marginTop: 12 }}><strong>Not verified</strong><span>{error}</span></div>}
    </section>
  );
}

function AccountCard() {
  const router = useRouter();
  return (
    <section className="card">
      <div className="card-title">Account</div>
      <p className="card-subtext">Session and password management.</p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <a href="/forgot-password" className="secondary">Reset password</a>
        <button
          className="secondary"
          onClick={() => {
            clearToken();
            router.push("/login");
          }}
        >
          Log out
        </button>
      </div>
    </section>
  );
}
