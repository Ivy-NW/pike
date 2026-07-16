/**
 * Core entity shapes shared across api, webar, dashboard, admin, and app.
 * These mirror the Prisma schema (apps/api/prisma/schema.prisma) but stay
 * framework-free so every surface can import them without pulling in Prisma.
 */

export type PaymentStatus = "unverified" | "verified";

export type QuestStatus = "draft" | "live" | "paused";

/** FR-12: low_stakes redeemable unauthenticated, high_value requires the authenticated app flow. */
export type RewardTier = "low_stakes" | "high_value";

export type RewardType = "discount" | "merch" | "vip_pass" | "free_item";

/** FR-12: which surface the reward was claimed from. */
export type ClaimMethod = "webar" | "app";

export type RedemptionStatus = "claimed" | "flagged" | "rejected";

export type MarkerStatus = "pending_compile" | "ready" | "failed";

export interface Business {
  id: string;
  name: string;
  email: string;
  paymentStatus: PaymentStatus;
  stripeCustomerId: string | null;
  stripePaymentMethodId: string | null;
  createdByAdmin: boolean;
  emailVerified: boolean;
  suspended: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Venue {
  id: string;
  businessId: string;
  name: string;
  venueType: string;
  address: string | null;
  createdAt: string;
}

export interface Quest {
  id: string;
  venueId: string;
  name: string;
  theme: string;
  rewardType: RewardType;
  rewardTier: RewardTier;
  rewardDescription: string;
  maxRedemptionsPerDay: number;
  expiresAt: string | null;
  status: QuestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Marker {
  id: string;
  questId: string;
  venueId: string;
  sourceImageUrl: string;
  compiledTargetUrl: string | null;
  imageTargetData: PlanarImageTargetData | null;
  printAssetUrl: string | null;
  qrFallbackUrl: string;
  status: MarkerStatus;
  createdAt: string;
}

/**
 * The shape XR8.XrController.configure({ imageTargetData: [...] }) expects per target
 * (see https://8thwall.org/docs/api/engine/xrcontroller/configure — "Image Target Data").
 * Only PLANAR is modeled since PIKE markers are always a flat uploaded photo/logo, never
 * the cylinder/cone geometries 8th Wall also supports for wrapped/product targets.
 */
export interface PlanarImageTargetData {
  /** URL the WebAR engine fetches the tracking image from. */
  imagePath: string;
  type: "PLANAR";
  properties: {
    top: number;
    left: number;
    width: number;
    height: number;
    originalWidth: number;
    originalHeight: number;
  };
  metadata?: { markerId: string };
}

export interface Redemption {
  id: string;
  markerId: string;
  questId: string;
  venueId: string;
  userId: string | null;
  claimMethod: ClaimMethod | null;
  status: RedemptionStatus;
  deviceSignal: DeviceSignal;
  createdAt: string;
}

/** FR-13: enough signal to distinguish repeat/automated abuse from genuine visits, without requiring an account at scan time. */
export interface DeviceSignal {
  sessionId: string;
  userAgent: string;
  ipHash: string;
  scanCountThisSession: number;
}

export interface User {
  id: string;
  username: string;
  name: string;
  phone: string;
  email: string;
  /** Phase 2 — FR-2: XP, level (derived from xp), streak counter. */
  xp: number;
  currentStreak: number;
  longestStreak: number;
  createdAt: string;
}

/** Phase 2 — FR-2 profile view: identity + derived level/streak/badge grid. */
export interface UserProfile {
  id: string;
  username: string;
  name: string;
  phone: string;
  email: string;
  xp: number;
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  currentStreak: number;
  longestStreak: number;
  badges: Badge[];
}

/** A badge is always present in the grid; `earnedAt` is null until the user unlocks it. */
export interface Badge {
  key: string;
  name: string;
  description: string;
  earnedAt: string | null;
}

export interface Admin {
  id: string;
  email: string;
  createdAt: string;
}
