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

export interface Page<T> {
  items: T[];
  nextCursor: string | null;
}

export interface PageParams {
  cursor?: string;
  limit?: number;
}

function pageQuery(params?: PageParams): string {
  const search = new URLSearchParams();
  if (params?.cursor) search.set("cursor", params.cursor);
  if (params?.limit) search.set("limit", String(params.limit));
  const qs = search.toString();
  return qs ? `?${qs}` : "";
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

export interface VerificationResult {
  redemptionId: string;
  status: string;
  storedHash: string | null;
  recomputedHash: string | null;
  merkleProof: unknown | null;
  storedRoot: string | null;
  onChainRoot: string | null;
  txHash: string | null;
  match: boolean | null;
  checkedAt: string;
}

export interface AttestationConfig {
  batchWindowMs: number;
  batchCountThreshold: number;
  maxRetries: number;
}

/** No self-registration here — admins are seeded via apps/api/scripts/seed-admin.ts. */
export const api = {
  loginAdmin: (email: string, password: string) =>
    request<{ admin: any; token: string }>("/auth/admin/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  forgotAdminPassword: (email: string) =>
    request<{ ok: true }>("/auth/admin/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),
  resetAdminPassword: (token: string, password: string) =>
    request<{ ok: true }>("/auth/admin/reset-password", { method: "POST", body: JSON.stringify({ token, password }) }),

  getStats: () => request<{ businesses: number; venues: number; activeQuests: number; flaggedRedemptions: number }>("/admin/stats"),

  listBusinesses: (params?: PageParams) => request<Page<any>>(`/admin/businesses${pageQuery(params)}`),
  createBusiness: (name: string, email: string, comp: boolean) =>
    request("/admin/businesses", { method: "POST", body: JSON.stringify({ name, email, comp }) }),
  verifyBusiness: (id: string) => request(`/admin/businesses/${id}/verify`, { method: "POST" }),
  suspendBusiness: (id: string, suspended: boolean) =>
    request(`/admin/businesses/${id}/suspend`, { method: "POST", body: JSON.stringify({ suspended }) }),

  listVenues: (params?: PageParams) => request<Page<any>>(`/admin/venues${pageQuery(params)}`),
  listQuests: (params?: PageParams) => request<Page<any>>(`/admin/quests${pageQuery(params)}`),

  listRedemptions: (status?: "claimed" | "flagged" | "rejected", params?: PageParams) => {
    const search = new URLSearchParams();
    if (status) search.set("status", status);
    if (params?.cursor) search.set("cursor", params.cursor);
    if (params?.limit) search.set("limit", String(params.limit));
    const qs = search.toString();
    return request<Page<any>>(`/admin/redemptions${qs ? `?${qs}` : ""}`);
  },

  listFreeMarkerLeads: () => request<any[]>("/admin/free-marker-leads"),

  listAdminGateAttempts: (success?: "true" | "false", params?: PageParams) => {
    const search = new URLSearchParams();
    if (success) search.set("success", success);
    if (params?.cursor) search.set("cursor", params.cursor);
    if (params?.limit) search.set("limit", String(params.limit));
    const qs = search.toString();
    return request<Page<any>>(`/admin/admin-gate-attempts${qs ? `?${qs}` : ""}`);
  },

  listAuditLog: (params?: PageParams) => request<Page<any>>(`/admin/audit-log${pageQuery(params)}`),

  verifyAttestation: (redemptionId: string) => request<VerificationResult>(`/admin/attestations/${redemptionId}/verify`),
  getAttestationConfig: () => request<AttestationConfig>("/admin/attestations/config"),
  updateAttestationConfig: (patch: Partial<AttestationConfig>) =>
    request<AttestationConfig>("/admin/attestations/config", { method: "PATCH", body: JSON.stringify(patch) }),
};
