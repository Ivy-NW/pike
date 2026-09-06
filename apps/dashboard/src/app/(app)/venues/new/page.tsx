"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import Link from "next/link";

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
          <span className="eyebrow">Venue setup</span>
          <h1>Add a venue</h1>
          <p>Create the location that will host and report on your quests.</p>
        </div>
        <Link href="/home" className="secondary">Cancel</Link>
      </div>
      <div className="card" style={{ maxWidth: 480 }}>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label className="field-label">Venue name<input placeholder="e.g. Westlands flagship" value={name} onChange={(e) => setName(e.target.value)} required /></label>
          <label className="field-label">Venue type<select value={venueType} onChange={(e) => setVenueType(e.target.value)}>
            <option value="restaurant">Restaurant</option>
            <option value="live_event">Live event</option>
            <option value="entertainment">Entertainment venue</option>
          </select></label>
          <label className="field-label">Address <span>Optional</span><input placeholder="Street, neighborhood, or landmark" value={address} onChange={(e) => setAddress(e.target.value)} /></label>
          <button className="primary" disabled={loading}>{loading ? "Creating…" : "Create venue"}</button>
          {error && <div className="notice notice-error" role="alert"><strong>Venue was not created</strong><span>{error}</span></div>}
        </form>
      </div>
    </>
  );
}
