"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";

export default function NewVenuePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [venueType, setVenueType] = useState("restaurant");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.createVenue(name, venueType, address || undefined);
      router.push("/home");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create venue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Add a venue</h1>
        </div>
      </div>
      <div className="card" style={{ maxWidth: 480 }}>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input placeholder="Venue name" value={name} onChange={(e) => setName(e.target.value)} required />
          <select value={venueType} onChange={(e) => setVenueType(e.target.value)}>
            <option value="restaurant">Restaurant</option>
            <option value="live_event">Live event</option>
            <option value="entertainment">Entertainment venue</option>
          </select>
          <input placeholder="Address (optional)" value={address} onChange={(e) => setAddress(e.target.value)} />
          <button className="primary" disabled={loading}>{loading ? "Creating…" : "Create venue"}</button>
          {error && <p style={{ color: "var(--error)" }}>{error}</p>}
        </form>
      </div>
    </>
  );
}
