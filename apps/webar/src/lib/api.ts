const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.message ?? "Request failed", body.code);
  }
  return res.json();
}

export const api = {
  resolveMarker: (markerId: string) => request(`/markers/${markerId}/resolve`),
  createRedemption: (markerId: string, sessionId: string) =>
    request(`/redemptions`, { method: "POST", body: JSON.stringify({ markerId, sessionId }) }),
  getRedemption: (redemptionId: string) => request(`/redemptions/${redemptionId}`),
  claimReward: (
    redemptionId: string,
    body: { identity: { method: "phone" | "social"; firebaseIdToken: string }; channel: "webar" },
  ) => request(`/redemptions/${redemptionId}/claim`, { method: "POST", body: JSON.stringify(body) }),
};
