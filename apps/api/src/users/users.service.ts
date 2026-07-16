import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type { DecodedConsumerToken } from "../auth/firebase-admin.service";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * FR-1: identity persists across the WebAR claim and the app install — same phone/social
   * credential maps to the same firebaseUid on both surfaces, so this is a straight upsert,
   * never a fresh row per surface.
   */
  async findOrCreateByFirebase(decoded: DecodedConsumerToken) {
    const existing = await this.prisma.user.findUnique({ where: { firebaseUid: decoded.firebaseUid } });
    if (existing) return existing;

    return this.prisma.user.create({
      data: {
        firebaseUid: decoded.firebaseUid,
        phone: decoded.phone,
        email: decoded.email,
        displayName: decoded.displayName,
      },
    });
  }

  findByFirebaseUid(firebaseUid: string) {
    return this.prisma.user.findUnique({ where: { firebaseUid } });
  }

  /** FR-3: every claimed reward across every WebAR quest this user has participated in. */
  async wallet(userId: string) {
    const redemptions = await this.prisma.redemption.findMany({
      where: { userId, status: { not: "rejected" } },
      include: { quest: true, marker: { include: { venue: true } } },
      orderBy: { createdAt: "desc" },
    });

    const now = new Date();
    return redemptions.map((r) => ({
      redemptionId: r.id,
      venue: { id: r.marker.venue.id, name: r.marker.venue.name },
      quest: { id: r.quest.id, name: r.quest.name, rewardType: r.quest.rewardType, rewardDescription: r.quest.rewardDescription },
      expiresAt: r.quest.expiresAt,
      isExpired: r.quest.expiresAt ? r.quest.expiresAt < now : false,
      claimedAt: r.createdAt,
    }));
  }

  /** Available quests platform-wide, flagged with whether this user already completed them. */
  async questList(userId: string) {
    const [liveQuests, myRedemptions] = await Promise.all([
      this.prisma.quest.findMany({ where: { status: "live" }, include: { venue: true } }),
      this.prisma.redemption.findMany({ where: { userId }, select: { questId: true } }),
    ]);
    const completedQuestIds = new Set(myRedemptions.map((r) => r.questId));

    return liveQuests.map((q) => ({
      id: q.id,
      name: q.name,
      theme: q.theme,
      venueName: q.venue.name,
      rewardDescription: q.rewardDescription,
      completed: completedQuestIds.has(q.id),
    }));
  }
}
