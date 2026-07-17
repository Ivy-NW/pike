"use client";
import { useRef, useState } from "react";
import { AppleIcon, PlayIcon } from "./icons";
import { api } from "@/lib/api";

/**
 * The app isn't published yet, so the store badges don't link out to a live listing --
 * they focus this waitlist form instead of shipping a dead App Store / Play Store link.
 */
export function AppDownload() {
  const emailRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const focusForm = () => emailRef.current?.focus();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      await api.joinWaitlist(email, "consumer");
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section id="download" className="section" style={{ background: "var(--light-gray)" }}>
      <div className="container" style={{ maxWidth: 620, textAlign: "center" }}>
        <span className="section-eyebrow" style={{ display: "block" }}>
          Get the app
        </span>
        <h2 className="section-heading" style={{ margin: "0 auto" }}>
          PIKE is launching soon on iOS and Android.
        </h2>
        <p className="section-subheading" style={{ margin: "14px auto 0" }}>
          Leave your email and we&apos;ll notify you the moment it&apos;s live — no spam, just a
          launch-day ping.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 28, flexWrap: "wrap" }}>
          <button onClick={focusForm} className="btn btn-outline" style={{ gap: 10 }}>
            <AppleIcon size={18} /> Notify me — iOS
          </button>
          <button onClick={focusForm} className="btn btn-outline" style={{ gap: 10 }}>
            <PlayIcon size={16} /> Notify me — Android
          </button>
        </div>

        {status === "done" ? (
          <p style={{ marginTop: 28, color: "var(--success)", fontWeight: 600 }}>
            You&apos;re on the list — we&apos;ll email you at launch.
          </p>
        ) : (
          <form
            onSubmit={submit}
            style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 28, flexWrap: "wrap" }}
          >
            <input
              ref={emailRef}
              type="email"
              required
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                padding: "13px 18px",
                borderRadius: "var(--radius)",
                border: "1px solid #cbd5e1",
                fontSize: 15,
                minWidth: 260,
              }}
            />
            <button className="btn btn-primary" disabled={status === "loading"}>
              {status === "loading" ? "Joining..." : "Join the waitlist"}
            </button>
          </form>
        )}
        {status === "error" && (
          <p style={{ marginTop: 14, color: "var(--danger)", fontSize: 14 }}>
            Something went wrong — try again in a moment.
          </p>
        )}
      </div>
    </section>
  );
}
