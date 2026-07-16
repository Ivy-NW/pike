import { CameraIcon } from "./icons";

const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "http://localhost:3001";

export function Hero() {
  return (
    <section className="section" style={{ paddingTop: 64 }}>
      <div className="container" style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 56, alignItems: "center" }}>
        <div>
          <span className="pill">No app required to start</span>
          <h1 className="section-heading" style={{ maxWidth: 560, marginTop: 20, fontSize: "clamp(34px, 4.6vw, 54px)" }}>
            A visit to your favorite spot, turned into a quest.
          </h1>
          <p className="section-subheading" style={{ maxWidth: 480 }}>
            Point your camera at a marker, complete the quest, and walk away with a reward —
            right from your phone&apos;s browser, no download needed to try it.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 34, flexWrap: "wrap" }}>
            <a href="#download" className="btn btn-primary">
              Download the app
            </a>
            <a href={`${DASHBOARD_URL}/register`} className="btn-text" style={{ fontWeight: 600 }}>
              Own a business? Create a quest →
            </a>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <div
            style={{
              width: 280,
              borderRadius: 40,
              border: "10px solid var(--deep-slate)",
              background: "var(--deep-slate)",
              boxShadow: "0 30px 60px -20px rgba(17,24,39,0.35)",
            }}
          >
            <div
              style={{
                borderRadius: 30,
                overflow: "hidden",
                background: "linear-gradient(160deg,#1e293b,#0f172a)",
                aspectRatio: "9 / 18",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 150,
                  height: 150,
                  borderRadius: 24,
                  border: "2.5px solid var(--pike-blue)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 0 8px rgba(37,99,235,0.12)",
                }}
              >
                <CameraIcon size={40} color="var(--pike-blue)" />
              </div>
              <span
                style={{
                  position: "absolute",
                  bottom: 26,
                  color: "#cbd5e1",
                  fontSize: 12,
                  letterSpacing: "0.02em",
                }}
              >
                Point your camera at the marker
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
