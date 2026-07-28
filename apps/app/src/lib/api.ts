import type {
  ConsumerAuthResponse,
  FavoriteVenueItem,
  LeaderboardResponse,
  MacroQuestProgress,
  SigninConsumerRequest,
  SignupConsumerRequest,
  UserProfile,
  UserQuestListItem,
  UserWalletItem,
} from "@pike/shared-types";
import { getIdentityToken } from "./auth";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getIdentityToken();
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
    throw new Error(body.message ?? "Request failed");
  }
  // 204 No Content (e.g. account deletion) has no body to parse.
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  me: () => request<UserProfile>("/users/me"),
  wallet: () => request<UserWalletItem[]>("/users/me/wallet"),
  quests: () => request<UserQuestListItem[]>("/users/me/quests"),
  signupConsumer: (body: SignupConsumerRequest) =>
    request<ConsumerAuthResponse>("/auth/consumer/signup", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  signinConsumer: (body: SigninConsumerRequest) =>
    request<ConsumerAuthResponse>("/auth/consumer/signin", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  // Store-compliance account deletion (PRD §13). Returns 204; the caller then clears the token.
  deleteAccount: () => request<void>("/users/me", { method: "DELETE" }),
  // Phase 3 — FR-7: reputational leaderboards.
  leaderboardGlobal: () => request<LeaderboardResponse>("/leaderboard/global"),
  leaderboardVenue: (venueId: string) => request<LeaderboardResponse>(`/leaderboard/venue/${venueId}`),
  // Phase 3 — FR-5: the live macro-quest + this user's progress (null if none live).
  macroQuest: () => request<MacroQuestProgress | null>("/users/me/macro-quest"),
  // Phase 3 — FR-6: favorited venues.
  favorites: () => request<FavoriteVenueItem[]>("/users/me/favorites"),
  addFavorite: (venueId: string) => request<void>(`/users/me/favorites/${venueId}`, { method: "PUT" }),
  removeFavorite: (venueId: string) => request<void>(`/users/me/favorites/${venueId}`, { method: "DELETE" }),
};
