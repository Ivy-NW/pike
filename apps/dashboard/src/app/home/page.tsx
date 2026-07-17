"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { NavHeader } from "@/components/NavHeader";

export default function HomePage() {
  const router = useRouter();
  const [business, setBusiness] = useState<any>(null);
  const [venues, setVenues] = useState<any[]>([]);
  const [questsByVenue, setQuestsByVenue] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    Promise.all([api.me(), api.listVenues()])
      .then(async ([me, venueList]) => {
        setBusiness(me);
        setVenues(venueList);
        const entries = await Promise.all(
          venueList.map(async (v: any) => [v.id, await api.listQuestsForVenue(v.id)] as const),
        );
        setQuestsByVenue(Object.fromEntries(entries));
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;

  return (
    <>
      <NavHeader businessName={business?.name} />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: 0, fontFamily: "var(--font-heading)" }}>{business?.name}</h1>
            <span className={`badge ${business?.paymentStatus === "verified" ? "badge-verified" : "badge-unverified"}`}>
              {business?.paymentStatus === "verified" ? "Payment verified" : "Payment method needed to publish"}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h2 style={{ fontFamily: "var(--font-heading)" }}>Your venues</h2>
          <Link href="/venues/new" className="secondary" style={{ padding: "8px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--primary)" }}>
            + Add venue
          </Link>
        </div>

        {venues.length === 0 && <p>No venues yet — add one to start creating quests.</p>}

        {venues.map((venue) => (
        <div key={venue.id} className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ margin: 0 }}>{venue.name}</h3>
              <p style={{ margin: "4px 0", color: "var(--on-surface-variant)", fontSize: 14 }}>{venue.venueType}</p>
            </div>
            <Link href={`/quests/new?venueId=${venue.id}`} className="primary" style={{ textDecoration: "none", padding: "8px 14px", borderRadius: 8, background: "var(--primary-container)", color: "var(--on-primary-container)" }}>
              + New quest
            </Link>
          </div>

          <div style={{ marginTop: 12 }}>
            {(questsByVenue[venue.id] ?? []).map((quest) => (
              <Link
                key={quest.id}
                href={`/quests/${quest.id}`}
                style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderTop: "1px solid var(--border-subtle)", textDecoration: "none", color: "inherit" }}
              >
                <span>{quest.name}</span>
                <span className={`badge ${quest.status === "live" ? "badge-verified" : "badge-unverified"}`}>{quest.status}</span>
              </Link>
            ))}
            {(questsByVenue[venue.id] ?? []).length === 0 && <p style={{ color: "var(--outline)", fontSize: 14 }}>No quests yet.</p>}
          </div>
        </div>
      ))}
      </div>
    </>
  );
}
