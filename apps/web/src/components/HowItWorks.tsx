import { CameraIcon, CoinIcon, FlagIcon } from "./icons";

const steps = [
  {
    icon: CameraIcon,
    title: "Scan the marker",
    body: "Open the link at the venue and point your camera at the printed marker — your browser's camera, no app install.",
  },
  {
    icon: FlagIcon,
    title: "Complete the quest",
    body: "Recognition is proof you're there. The quest step completes instantly, no location or account needed yet.",
  },
  {
    icon: null,
    title: "Claim your reward",
    body: "Your reward reveals immediately. Save it with just a phone number or social login.",
  },
];

/**
 * The one place gold appears on this page (UI doc §7.4 / §2) -- confined to this illustrative
 * mockup card, never leaking into page chrome, buttons, or nav elsewhere.
 */
function RewardRevealMockup() {
  return (
    <div
      style={{
        marginTop: 20,
        borderRadius: "var(--radius)",
        background: "var(--deep-slate)",
        padding: "22px 22px 20px",
        color: "#fff",
      }}
      aria-hidden="true"
    >
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "rgba(245,158,11,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CoinIcon size={28} color="var(--pike-gold)" />
        </div>
      </div>
      <p style={{ textAlign: "center", fontSize: 12, color: "#94a3b8", letterSpacing: "0.04em", textTransform: "uppercase" }}>
        Reward unlocked
      </p>
      <p style={{ textAlign: "center", fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 18, color: "var(--pike-gold)", marginTop: 4 }}>
        15% off your next visit
      </p>
      <p style={{ textAlign: "center", fontSize: 11, color: "#64748b", marginTop: 4 }}>Expires in 14 days</p>
      <div
        className="btn btn-primary"
        style={{ marginTop: 16, width: "100%", fontSize: 13, padding: "10px 0", pointerEvents: "none" }}
      >
        Claim reward
      </div>
    </div>
  );
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="section" style={{ background: "var(--light-gray)" }}>
      <div className="container">
        <span className="section-eyebrow">How it works</span>
        <h2 className="section-heading">Three steps, under two minutes.</h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28, marginTop: 48 }}>
          {steps.map((step, i) => (
            <div key={step.title} className="card">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div className="icon-badge">{step.icon ? <step.icon size={22} /> : <CoinIcon size={22} />}</div>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8" }}>STEP {i + 1}</span>
              </div>
              <h3 style={{ fontSize: 19, fontWeight: 600, marginTop: 16 }}>{step.title}</h3>
              <p style={{ fontSize: 14.5, color: "#475569", marginTop: 8 }}>{step.body}</p>
              {i === 2 && <RewardRevealMockup />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
