import { getToken } from "./auth";

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
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.message ?? "Request failed");
  }
  return res.json();
}

/** No self-registration here — admins are seeded via apps/api/scripts/seed-admin.ts. */
export const api = {
  loginAdmin: (email: string, password: string) =>
    request<{ admin: any; token: string }>("/auth/admin/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  listBusinesses: () => request<any[]>("/admin/businesses"),
  createBusiness: (name: string, email: string, comp: boolean) =>
    request("/admin/businesses", { method: "POST", body: JSON.stringify({ name, email, comp }) }),
  verifyBusiness: (id: string) => request(`/admin/businesses/${id}/verify`, { method: "POST" }),
  suspendBusiness: (id: string, suspended: boolean) =>
    request(`/admin/businesses/${id}/suspend`, { method: "POST", body: JSON.stringify({ suspended }) }),
  listVenues: () => request<any[]>("/admin/venues"),
  listQuests: () => request<any[]>("/admin/quests"),
  listRedemptions: (status?: "claimed" | "flagged" | "rejected") =>
    request<any[]>(`/admin/redemptions${status ? `?status=${status}` : ""}`),
};
