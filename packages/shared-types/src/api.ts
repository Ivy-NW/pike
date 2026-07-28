import type {
  Business,
  Marker,
  PaymentStatus,
  Quest,
  Redemption,
  RewardTier,
  RewardType,
  User,
  Venue,
} from "./entities";

/** GET /markers/:markerId — the lookup at the heart of FR-11: one marker -> one venue + one quest. */
export interface ResolveMarkerResponse {
  marker: Pick<Marker, "id" | "status" | "compiledTargetUrl" | "imageTargetData">;
  venue: Pick<Venue, "id" | "name" | "venueType">;
  quest: Pick<
    Quest,
    "id" | "name" | "theme" | "rewardType" | "rewardTier" | "rewardDescription" | "status"
  >;
}

/** POST /redemptions — recognition already happened client-side; this call proves+records it server-side. */
export interface CreateRedemptionRequest {
  markerId: string;
  sessionId: string;
}

export interface CreateRedemptionResponse {
  redemption: Pick<Redemption, "id" | "status" | "createdAt">;
  capRemaining: number;
  scanCountThisSession: number;
}

/** POST /redemptions/:id/claim — requires a signed-in PIKE account (Authorization: Bearer <consumer token>). */
export interface ClaimRewardRequest {
  /** FR-12: high_value reward tiers can only be claimed via "app", never the unauthenticated "webar" flow. */
  channel: "webar" | "app";
}

export interface ClaimRewardResponse {
  redemption: Redemption;
  user: User;
  /** Phase 2 — FR-2: XP/badges awarded by this specific claim. Repeat claims return 0 XP. */
  award: {
    xpAwarded: number;
    newBadges: { key: string; name: string; description: string }[];
  };
}

/** A reward claimed by completing a single WebAR quest (FR-3). */
export interface QuestRewardWalletItem {
  kind: "quest";
  redemptionId: string;
  venue: Pick<Venue, "id" | "name">;
  quest: Pick<Quest, "id" | "name" | "rewardType" | "rewardDescription">;
  expiresAt: string | null;
  isExpired: boolean;
  claimedAt: string;
}

/** Phase 3 — FR-5: the top-tier reward unlocked by completing a multi-venue macro-quest. */
export interface MacroQuestRewardWalletItem {
  kind: "macro-quest";
  macroQuestId: string;
  name: string;
  rewardType: RewardType;
  rewardDescription: string;
  rewardTier: RewardTier;
  /** Macro-quest rewards carry no expiry today, so this is always null / not expired. */
  expiresAt: string | null;
  isExpired: boolean;
  claimedAt: string;
}

/** FR-3 reward wallet, now spanning both single-quest and macro-quest rewards. */
export type UserWalletItem = QuestRewardWalletItem | MacroQuestRewardWalletItem;

export interface UserQuestListItem {
  id: string;
  name: string;
  theme: string;
  venueId: string;
  venueName: string;
  rewardDescription: string;
  completed: boolean;
  markerId: string | null;
}

/** Phase 3 — FR-6: a venue the user has favorited (GET /users/me/favorites). */
export interface FavoriteVenueItem {
  /** Venue id. */
  id: string;
  name: string;
  venueType: string;
  favoritedAt: string;
}

/** Phase 3 — FR-7: reputational leaderboards (no monetary value, no shared currency). */
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  /** The ranking metric: total XP on the global board, completion count on a venue board. */
  score: number;
  level: number;
  /** True for the requesting user's own row, so clients can highlight it. */
  isMe: boolean;
}

/** GET /leaderboard/global and /leaderboard/venue/:venueId */
export interface LeaderboardResponse {
  scope: "global" | "venue";
  venueId: string | null;
  entries: LeaderboardEntry[];
  /** The requesting user's own standing, included even when they fall outside the top-N. */
  me: LeaderboardEntry | null;
}

/** Phase 3 — FR-5: one participating venue's state within a macro-quest, for the requesting user. */
export interface MacroQuestVenueProgress {
  /** Venue id. */
  id: string;
  name: string;
  /** True if the user has a non-rejected completion at this venue within the macro-quest window. */
  visited: boolean;
}

/** GET /users/me/macro-quest — the live macro-quest and this user's derived progress, or null if none. */
export interface MacroQuestProgress {
  id: string;
  name: string;
  description: string;
  requiredVenues: number;
  visitedCount: number;
  completed: boolean;
  completedAt: string | null;
  startsAt: string;
  endsAt: string;
  reward: { type: RewardType; description: string; tier: RewardTier };
  venues: MacroQuestVenueProgress[];
}

/** POST /auth/consumer/signup */
export interface SignupConsumerRequest {
  phone: string;
  username: string;
  name: string;
  email: string;
  password: string;
}

/** POST /auth/consumer/signin */
export interface SigninConsumerRequest {
  /** Username or email. */
  identifier: string;
  password: string;
}

export interface ConsumerAuthResponse {
  user: User;
  token: string;
}

/** POST /businesses (self-registration) */
export interface RegisterBusinessRequest {
  name: string;
  email: string;
  password: string;
}

export interface RegisterBusinessResponse {
  business: Business;
}

/** POST /admin/businesses (sales-assisted / comped onboarding) */
export interface AdminCreateBusinessRequest {
  name: string;
  email: string;
  comp: boolean;
}

/** POST /businesses/:id/payment-method */
export interface AttachPaymentMethodRequest {
  stripePaymentMethodId: string;
}

export interface AttachPaymentMethodResponse {
  paymentStatus: PaymentStatus;
}

/** POST /venues/:venueId/quests */
export interface CreateQuestRequest {
  name: string;
  theme: string;
  rewardType: RewardType;
  rewardTier: RewardTier;
  rewardDescription: string;
  maxRedemptionsPerDay: number;
  expiresAt: string | null;
}

/** POST /quests/:questId/markers — uploads source image, kicks off 8th Wall compile job. */
export interface CreateMarkerRequest {
  sourceImageBase64: string;
}

/** POST /quests/:questId/publish — blocked server-side unless business.paymentStatus === "verified". */
export interface PublishQuestResponse {
  quest: Quest;
}

export interface ApiErrorBody {
  statusCode: number;
  message: string;
  /** e.g. "payment_required_to_publish" — lets clients branch on known error kinds. */
  code?: string;
}
