/**
 * TODO(credentials): wire the real Firebase SDK (phone auth + social sign-in) once a Firebase
 * project exists — see apps/webar/src/lib/firebase.ts for the matching client-side contract.
 * Until then this produces the same base64-JSON dev token the backend's dev-mode
 * FirebaseAdminService fallback accepts, so account creation is testable end-to-end.
 */
function devToken(payload: Record<string, unknown>): string {
  return btoa(JSON.stringify(payload));
}

export async function signInWithPhone(phone: string): Promise<string> {
  return devToken({ firebaseUid: `phone:${phone}`, phone, email: null, displayName: null });
}

export async function signInWithGoogle(): Promise<string> {
  const fakeEmail = "demo.google.user@example.com";
  return devToken({ firebaseUid: `social:google:${fakeEmail}`, phone: null, email: fakeEmail, displayName: "Demo User" });
}
