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
}

export type ClaimIdentity =
  | { method: "phone"; firebaseIdToken: string }
  | { method: "social"; firebaseIdToken: string };

/** POST /redemptions/:id/claim */
export interface ClaimRewardRequest {
  identity: ClaimIdentity;
  /** FR-12: high_value reward tiers can only be claimed via "app", never the unauthenticated "webar" flow. */
  channel: "webar" | "app";
}

export interface ClaimRewardResponse {
  redemption: Redemption;
  user: User;
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
