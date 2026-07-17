const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "http://localhost:3001";

const points = [
  "Pick a venue type and reward, upload a photo or logo",
  "We generate a print-ready marker, plus a QR fallback",
  "Print it, place it — your quest is live immediately",
];

export function ForBusinesses() {
  return (
    <section id="for-businesses" className="section">
      <div className="container" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "center" }}>
        <div>
          <span className="section-eyebrow">For businesses</span>
          <h2 className="section-heading">Create a quest. Print a marker. No developer needed.</h2>
          <p className="section-subheading">
            The PIKE Business Dashboard turns a venue visit into an engagement tool without any
            code, VPS setup, or engineering time on your side — set your reward and redemption
            caps, and go live the moment the marker is printed.
          </p>

          <div style={{ display: "flex", gap: 16, marginTop: 32, flexWrap: "wrap" }}>
            {/* Equally-sized CTAs (don't bury signup behind login) -- only one is a Pike Blue
                fill, matching the one-primary-button rule; "Log in" is same size, outline only. */}
            <a href={`${DASHBOARD_URL}/register`} className="btn btn-primary">
              Create a business account
            </a>
            <a href={`${DASHBOARD_URL}/login`} className="btn btn-outline">
              Log in
            </a>
          </div>
        </div>

        <div className="card" style={{ background: "var(--light-gray)", border: "none" }}>
          <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 20 }}>
            {points.map((point, i) => (
              <li key={point} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <span
                  style={{
                    flexShrink: 0,
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: "#fff",
                    border: "1px solid #dbe3ee",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--pike-blue)",
                  }}
                >
                  {i + 1}
                </span>
                <p style={{ fontSize: 15, marginTop: 4 }}>{point}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
