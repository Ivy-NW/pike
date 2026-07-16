/**
 * Client-side identity for the reward claim (FR-12: phone number or social login only).
 *
 * TODO(credentials): set VITE_FIREBASE_* to initialize the real Firebase SDK and call
 * signInWithPhoneNumber (with reCAPTCHA) / signInWithPopup(GoogleAuthProvider) here.
 * Until then this produces a dev-only token in the exact shape the backend's
 * FirebaseAdminService dev fallback expects (base64 JSON), so the claim round trip
 * is fully testable without a live Firebase project.
 */
const firebaseConfigured = Boolean(import.meta.env.VITE_FIREBASE_API_KEY);

function devToken(payload: Record<string, unknown>): string {
  return btoa(JSON.stringify(payload));
}

export async function claimWithPhone(phone: string): Promise<string> {
  if (firebaseConfigured) {
    throw new Error("Real Firebase phone auth not yet wired — TODO(credentials)");
  }
  return devToken({ firebaseUid: `phone:${phone}`, phone, email: null, displayName: null });
}

export async function claimWithSocial(provider: "google"): Promise<string> {
  if (firebaseConfigured) {
    throw new Error("Real Firebase social auth not yet wired — TODO(credentials)");
  }
  const fakeEmail = `demo.${provider}.user@example.com`;
  return devToken({ firebaseUid: `social:${provider}:${fakeEmail}`, phone: null, email: fakeEmail, displayName: "Demo User" });
}

export function sessionId(): string {
  const key = "pike_session_id";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
  }
  return id;
}
