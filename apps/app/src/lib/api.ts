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

// Mock Fallback Data (Nairobi)
const MOCK_PROFILE: UserProfile = {
  id: "user-demo-1",
  username: "demoexplorer",
  name: "Alex Vance",
  phone: "+254700000000",
  email: "demo@pike.app",
  xp: 1240,
  level: 4,
  xpIntoLevel: 680,
  xpForNextLevel: 1000,
  currentStreak: 5,
  longestStreak: 12,
  badges: [],
};

const MOCK_QUESTS: UserQuestListItem[] = [
  {
    id: "q-nbo-1",
    venueId: "v-kicc",
    venueName: "KICC Sky Deck Lounge",
    name: "KICC Sky Deck Challenge",
    theme: "landmark",
    rewardDescription: "20% off at KICC Sky Deck",
    completed: false,
    markerId: "m-kicc-1",
  },
  {
    id: "q-nbo-2",
    venueId: "v-sarit",
    venueName: "Sarit Tech Hub & Cafe",
    name: "Sarit Tech Hub Tour",
    theme: "cafe",
    rewardDescription: "Free VR Simulator Pass",
    completed: true,
    markerId: "m-sarit-1",
  },
  {
    id: "q-nbo-3",
    venueId: "v-museum",
    venueName: "Nairobi National Museum",
    name: "National Museum Heritage Walk",
    theme: "museum",
    rewardDescription: "Free Guided AR Tour & Entry Discount",
    completed: false,
    markerId: "m-museum-1",
  },
  {
    id: "q-nbo-4",
    venueId: "v-upperhill",
    venueName: "Upper Hill Cyber Hub",
    name: "Upper Hill Skyline Challenge",
    theme: "landmark",
    rewardDescription: "+500 Explorer Points",
    completed: false,
    markerId: "m-upperhill-1",
  },
  {
    id: "q-nbo-5",
    venueId: "v-kilimani",
    venueName: "Kilimani Node Terminal",
    name: "Kilimani Roastery Challenge",
    theme: "cafe",
    rewardDescription: "15% off at Terminal Roastery",
    completed: false,
    markerId: "m-kilimani-1",
  },
];

const MOCK_WALLET: UserWalletItem[] = [
  {
    kind: "quest",
    redemptionId: "red-mock-1",
    claimedAt: new Date().toISOString(),
    expiresAt: null,
    isExpired: false,
    venue: { id: "v-sarit", name: "Sarit Tech Hub & Cafe" },
    quest: {
      id: "q-nbo-2",
      name: "Sarit Tech Hub Tour",
      rewardDescription: "Free VR Simulator Pass",
      rewardType: "free_item",
    },
  },
];

const MOCK_MACRO: MacroQuestProgress = {
  id: "macro-nbo-1",
  name: "Nairobi Explorer Circuit",
  description: "Visit 3 anchor venues in Nairobi to unlock VIP status.",
  requiredVenues: 3,
  visitedCount: 2,
  completed: false,
  completedAt: null,
  startsAt: new Date().toISOString(),
  endsAt: new Date(Date.now() + 86400000 * 7).toISOString(),
  reward: {
    type: "vip_pass",
    tier: "high_value",
    description: "VIP Pass & +2,500 XP",
  },
  venues: [
    { id: "v-kicc", name: "KICC Sky Deck", visited: true },
    { id: "v-sarit", name: "Sarit Tech Hub", visited: true },
    { id: "v-museum", name: "National Museum", visited: false },
  ],
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getIdentityToken();

  // A real HTTP response (even an error one) means the server was reached — that's
  // never a candidate for the mock fallback below. Only the fetch() call itself
  // throwing (no response received at all, e.g. offline/DNS/connection-refused)
  // is a genuine network-level failure.
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init?.headers,
      },
    });
  } catch (err) {
    // Genuine network-level failure (no response at all). Never silently substitute
    // mock data in production — only in local dev, and only for the handful of
    // paths we have placeholder content for, is this a convenience rather than a
    // reliability bug. Everything else — including __DEV__ with an unlisted path —
    // rethrows.
    if (__DEV__) {
      if (path === "/users/me") return MOCK_PROFILE as unknown as T;
      if (path === "/users/me/quests") return MOCK_QUESTS as unknown as T;
      if (path === "/users/me/wallet") return MOCK_WALLET as unknown as T;
      if (path === "/users/me/macro-quest") return MOCK_MACRO as unknown as T;
      if (path === "/users/me/favorites") return [] as unknown as T;
    }
    throw err;
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? "Request failed");
  }
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
  deleteAccount: () => request<void>("/users/me", { method: "DELETE" }),
  leaderboardGlobal: () => request<LeaderboardResponse>("/leaderboard/global"),
  leaderboardVenue: (venueId: string) => request<LeaderboardResponse>(`/leaderboard/venue/${venueId}`),
  macroQuest: () => request<MacroQuestProgress | null>("/users/me/macro-quest"),
  favorites: () => request<FavoriteVenueItem[]>("/users/me/favorites"),
  addFavorite: (venueId: string) => request<void>(`/users/me/favorites/${venueId}`, { method: "PUT" }),
  removeFavorite: (venueId: string) => request<void>(`/users/me/favorites/${venueId}`, { method: "DELETE" }),
  registerPushToken: (token: string) => request<void>("/users/me/push-token", { method: "POST", body: JSON.stringify({ token }) }),
  resolveMarker: (markerId: string) => request<any>(`/markers/${markerId}`),
  createRedemption: (markerId: string, sessionId: string) =>
    request<any>(`/markers/${markerId}/redemptions`, {
      method: "POST",
      body: JSON.stringify({ sessionId }),
    }),
  claimReward: (redemptionId: string, body?: any) =>
    request<any>(`/redemptions/${redemptionId}/claim`, {
      method: "POST",
      body: JSON.stringify(body ?? {}),
    }),
};
