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

// Mock Fallback Data (Nairobi Vanguard)
const MOCK_PROFILE: UserProfile = {
  id: "user-vanguard-1",
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
    name: "Decipher the KICC Anomaly",
    theme: "urban-cybernetics",
    rewardDescription: "20% off at KICC Sky Deck",
    completed: false,
    markerId: "m-kicc-1",
  },
  {
    id: "q-nbo-2",
    venueId: "v-sarit",
    venueName: "Sarit Tech Hub & Cafe",
    name: "Sarit Tech Expo Protocol",
    theme: "tech-matrix",
    rewardDescription: "Free VR Simulator Pass",
    completed: true,
    markerId: "m-sarit-1",
  },
  {
    id: "q-nbo-3",
    venueId: "v-museum",
    venueName: "Nairobi National Museum",
    name: "Cradle of Humanity Matrix",
    theme: "historical-crypto",
    rewardDescription: "Free Guided AR Tour & Entry Discount",
    completed: false,
    markerId: "m-museum-1",
  },
  {
    id: "q-nbo-4",
    venueId: "v-upperhill",
    venueName: "Upper Hill Cyber Hub",
    name: "Synchronize Skyline Node",
    theme: "telemetry-sync",
    rewardDescription: "+500 Explorer Points",
    completed: false,
    markerId: "m-upperhill-1",
  },
  {
    id: "q-nbo-5",
    venueId: "v-kilimani",
    venueName: "Kilimani Node Terminal",
    name: "Optical Grid Calibration",
    theme: "sensor-grid",
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
      name: "Sarit Tech Expo Protocol",
      rewardDescription: "Free VR Simulator Pass",
      rewardType: "free_item",
    },
  },
];

const MOCK_MACRO: MacroQuestProgress = {
  id: "macro-nbo-1",
  name: "Nairobi Cyber Circuit",
  description: "Visit 3 anchor sector nodes in Nairobi to unlock Vanguard Sovereign status.",
  requiredVenues: 3,
  visitedCount: 2,
  completed: false,
  completedAt: null,
  startsAt: new Date().toISOString(),
  endsAt: new Date(Date.now() + 86400000 * 7).toISOString(),
  reward: {
    type: "vip_pass",
    tier: "high_value",
    description: "VIP Vanguard Sovereign Pass & +2,500 XP",
  },
  venues: [
    { id: "v-kicc", name: "KICC Sky Deck", visited: true },
    { id: "v-sarit", name: "Sarit Tech Hub", visited: true },
    { id: "v-museum", name: "National Museum", visited: false },
  ],
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getIdentityToken();
  try {
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
    if (res.status === 204) return undefined as T;
    return res.json();
  } catch (err) {
    // Graceful offline mock fallbacks
    if (path === "/users/me") return MOCK_PROFILE as unknown as T;
    if (path === "/users/me/quests") return MOCK_QUESTS as unknown as T;
    if (path === "/users/me/wallet") return MOCK_WALLET as unknown as T;
    if (path === "/users/me/macro-quest") return MOCK_MACRO as unknown as T;
    if (path === "/users/me/favorites") return [] as unknown as T;
    throw err;
  }
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
