import { createHash } from "node:crypto";
import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { RedemptionCapService } from "../redis/redemption-cap.service";
import { MarkersService } from "../markers/markers.service";
import { GamificationService } from "../gamification/gamification.service";

const REPEAT_SCAN_WINDOW_MS = 5 * 60 * 1000;

@Injectable()
export class RedemptionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly caps: RedemptionCapService,
    private readonly markers: MarkersService,
    private readonly gamification: GamificationService,
  ) {}

  private hashIp(ip: string): string {
    return createHash("sha256").update(ip).digest("hex");
  }

  /**
   * Recognition already happened client-side (the AR engine confirmed the trained marker).
   * This call is what actually proves + records it — nothing here trusts the client beyond
   * "which marker did you scan," matching FR-11/8.5's server-side-only enforcement rule.
   */
  async create(markerId: string, sessionId: string, userAgent: string, ip: string) {
    const marker = await this.markers.resolve(markerId);
    const quest = marker.quest;
    const venue = marker.venue;

    if (marker.status !== "ready") throw new NotFoundException("Marker is not active");
    if (quest.status !== "live") throw new ForbiddenException("This quest is not currently live");

    const deviceSignal = {
      sessionId,
      userAgent,
      ipHash: this.hashIp(ip),
    };

    // FR-13: log the completion signal regardless of outcome, so rejected/flagged attempts
    // are still visible to anti-gaming review — this is what feeds the admin oversight view.
    const recentSameSession = await this.prisma.redemption.count({
      where: {
        markerId,
        sessionId,
        createdAt: { gte: new Date(Date.now() - REPEAT_SCAN_WINDOW_MS) },
      },
    });
    const scanCountThisSession = recentSameSession + 1;

    if (quest.expiresAt && quest.expiresAt < new Date()) {
      return this.prisma.redemption.create({
        data: {
          markerId,
          questId: quest.id,
          venueId: venue.id,
          status: "rejected",
          flagReason: "quest_expired",
          ...deviceSignal,
        },
      });
    }

    const count = await this.caps.incrementAndGet(venue.id, quest.id);
    if (count > quest.maxRedemptionsPerDay) {
      await this.caps.decrement(venue.id, quest.id);
      return this.prisma.redemption.create({
        data: {
          markerId,
          questId: quest.id,
          venueId: venue.id,
          status: "rejected",
          flagReason: "redemption_cap_reached",
          ...deviceSignal,
        },
      });
    }

    const isRepeatScan = recentSameSession > 0;
    const redemption = await this.prisma.redemption.create({
      data: {
        markerId,
        questId: quest.id,
        venueId: venue.id,
        status: isRepeatScan ? "flagged" : "claimed",
        flagReason: isRepeatScan ? "repeat_scan_same_session" : null,
        ...deviceSignal,
      },
    });

    return { ...redemption, capRemaining: Math.max(0, quest.maxRedemptionsPerDay - count), scanCountThisSession };
  }

  async findOrThrow(redemptionId: string) {
    const redemption = await this.prisma.redemption.findUnique({
      where: { id: redemptionId },
      include: { quest: true, marker: { include: { venue: true } } },
    });
    if (!redemption) throw new NotFoundException("Redemption not found");
    return redemption;
  }

  async claim(redemptionId: string, userId: string, channel: "webar" | "app") {
    const redemption = await this.prisma.redemption.findUnique({
      where: { id: redemptionId },
      include: { quest: true },
    });
    if (!redemption) throw new NotFoundException("Redemption not found");
    if (redemption.status === "rejected") {
      throw new ForbiddenException("This completion was not accepted and cannot be claimed");
    }

    // FR-12: high-value rewards require the authenticated in-app flow, never the guest web claim.
    if (redemption.quest.rewardTier === "high_value" && channel === "webar") {
      throw new ForbiddenException("This reward requires the PIKE app to claim");
    }

    const updated = await this.prisma.redemption.update({
      where: { id: redemptionId },
      data: { userId, claimMethod: channel },
    });

    // Phase 2 — FR-2: XP/streak/badges awarded the moment a real account claims a completion.
    // award.user is the post-award row — always more current than what we already have.
    const { user: awardedUser, ...award } = await this.gamification.awardForClaim(userId);

    return { redemption: updated, user: awardedUser, award };
  }
}
