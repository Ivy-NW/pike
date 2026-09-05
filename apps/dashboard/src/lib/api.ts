import { getToken } from "./auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

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
    throw new ApiError(res.status, body.message ?? "Request failed", body.code);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export interface RewardRow {
  questId: string;
  questName: string;
  questStatus: "draft" | "live" | "paused";
  venueId: string;
  venueName: string;
  rewardType: string;
  rewardTier: "low_stakes" | "high_value";
  rewardDescription: string;
  maxRedemptionsPerDay: number;
  expiresAt: string | null;
  expired: boolean;
  /** null when the API could not reach Redis, which owns the daily cap counters. */
  redeemedToday: number | null;
  capRemainingToday: number | null;
  totalRedemptions: number;
  claimed: number;
  flagged: number;
  rejected: number;
}

export interface RewardInventory {
  summary: {
    totalRewards: number;
    liveRewards: number;
    redeemedToday: number | null;
    capToday: number;
    totalClaimed: number;
  };
  rewards: RewardRow[];
}

export interface QuestPatch {
  rewardType?: string;
  rewardTier?: "low_stakes" | "high_value";
  rewardDescription?: string;
  maxRedemptionsPerDay?: number;
  /** null clears the expiry. */
  expiresAt?: string | null;
}

export const api = {
  registerBusiness: (name: string, email: string, password: string) =>
    request("/auth/business/register", { method: "POST", body: JSON.stringify({ name, email, password }) }),
  loginBusiness: (email: string, password: string) =>
    request<{ business: any; token: string }>("/auth/business/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<any>("/businesses/me"),
  attachPaymentMethod: (stripePaymentMethodId: string) =>
    request<{ paymentStatus: string }>("/businesses/me/payment-method", {
      method: "POST",
      body: JSON.stringify({ stripePaymentMethodId }),
    }),
  listVenues: () => request<any[]>("/venues/me"),
  createVenue: (name: string, venueType: string, address?: string) =>
    request("/venues", { method: "POST", body: JSON.stringify({ name, venueType, address }) }),
  listQuestsForVenue: (venueId: string) => request<any[]>(`/venues/${venueId}/quests`),
  createQuest: (venueId: string, body: Record<string, unknown>) =>
    request(`/venues/${venueId}/quests`, { method: "POST", body: JSON.stringify(body) }),
  getQuest: (questId: string) => request<any>(`/quests/${questId}`),
  getQuestStats: (questId: string) => request<any>(`/quests/${questId}/stats`),
  createMarker: (questId: string, sourceImageBase64: string) =>
    request(`/quests/${questId}/markers`, { method: "POST", body: JSON.stringify({ sourceImageBase64 }) }),
  publishQuest: (questId: string) => request(`/quests/${questId}/publish`, { method: "POST" }),
  listRewards: () => request<RewardInventory>("/businesses/me/rewards"),
  updateQuest: (questId: string, patch: QuestPatch) =>
    request<any>(`/quests/${questId}`, { method: "PATCH", body: JSON.stringify(patch) }),
  pauseQuest: (questId: string) => request<any>(`/quests/${questId}/pause`, { method: "POST" }),
  resumeQuest: (questId: string) => request<any>(`/quests/${questId}/resume`, { method: "POST" }),
};
