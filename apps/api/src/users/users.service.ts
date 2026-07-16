import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { GamificationService } from "../gamification/gamification.service";

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gamification: GamificationService,
  ) {}

  /** Profile screen: identity + FR-2's XP/level/streak/badges (Phase 2). */
  async profile(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const { level, xpIntoLevel, xpForNextLevel } = this.gamification.levelInfo(user.xp);
    const badges = await this.gamification.badgeGrid(userId);

    return {
      id: user.id,
      username: user.username,
      phone: user.phone,
      email: user.email,
      name: user.name,
      xp: user.xp,
      level,
      xpIntoLevel,
      xpForNextLevel,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      badges,
    };
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
      this.prisma.quest.findMany({
        where: { status: "live" },
        include: { venue: true, markers: { where: { status: "ready" }, take: 1 } },
      }),
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
      // Phase 2 — FR-4: lets the app open the authenticated in-app scan (WebAR via WebView).
      markerId: q.markers[0]?.id ?? null,
    }));
  }
}
