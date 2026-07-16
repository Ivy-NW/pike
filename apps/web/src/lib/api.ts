const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
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
    throw new ApiError(res.status, body.message ?? "Request failed");
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  /** The gate is obscurity only -- a correct code just reveals the real Admin login. */
  verifyAdminGate: (code: string) =>
    request<{ valid: boolean }>("/admin-gate/verify", { method: "POST", body: JSON.stringify({ code }) }),
  joinWaitlist: (email: string, audience: "consumer" | "business") =>
    request<{ ok: true }>("/waitlist", { method: "POST", body: JSON.stringify({ email, audience }) }),
};
