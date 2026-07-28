import { Injectable } from "@nestjs/common";
import type { MacroQuestRewardWalletItem, QuestRewardWalletItem, UserWalletItem } from "@pike/shared-types";
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

  /**
   * FR-3 reward wallet: every reward this user has earned, spanning single WebAR quests and the
   * top-tier rewards unlocked by completing macro-quests (FR-5). Macro-quest completions materialize
   * their reward here directly from the recorded completion — no separate reward row to keep in sync.
   */
  async wallet(userId: string): Promise<UserWalletItem[]> {
    const now = new Date();

    const redemptions = await this.prisma.redemption.findMany({
      where: { userId, status: { not: "rejected" } },
      include: { quest: true, marker: { include: { venue: true } } },
      orderBy: { createdAt: "desc" },
    });
    const questRewards = redemptions.map(
      (r): QuestRewardWalletItem => ({
        kind: "quest",
        redemptionId: r.id,
        venue: { id: r.marker.venue.id, name: r.marker.venue.name },
        quest: { id: r.quest.id, name: r.quest.name, rewardType: r.quest.rewardType, rewardDescription: r.quest.rewardDescription },
        expiresAt: r.quest.expiresAt ? r.quest.expiresAt.toISOString() : null,
        isExpired: r.quest.expiresAt ? r.quest.expiresAt < now : false,
        claimedAt: r.createdAt.toISOString(),
      }),
    );

    const completions = await this.prisma.macroQuestCompletion.findMany({
      where: { userId },
      include: { macroQuest: true },
      orderBy: { completedAt: "desc" },
    });
    const macroRewards = completions.map(
      (cpl): MacroQuestRewardWalletItem => ({
        kind: "macro-quest",
        macroQuestId: cpl.macroQuestId,
        name: cpl.macroQuest.name,
        rewardType: cpl.macroQuest.rewardType,
        rewardDescription: cpl.macroQuest.rewardDescription,
        rewardTier: cpl.macroQuest.rewardTier,
        expiresAt: null,
        isExpired: false,
        claimedAt: cpl.completedAt.toISOString(),
      }),
    );

    // Newest first across both reward kinds (claimedAt is an ISO string, so lexical == chronological).
    return [...questRewards, ...macroRewards].sort((a, b) => (a.claimedAt < b.claimedAt ? 1 : -1));
  }

  /**
   * Store-compliance account deletion (PRD §13, UI §7.5): a real "delete my account" that removes
   * the person, not just their login. Deletes the user row — XP, streaks, and badges go with it
   * (badges cascade via UserBadge.onDelete: Cascade) — and de-identifies their completion records
   * by nulling userId rather than deleting them, so the FR-13 fraud/audit trail and the immutable
   * on-chain attestation hashes stay intact but no longer link back to a person. One transaction so
   * a partial failure can't leave a user deleted while their redemptions still name them.
   */
  async deleteAccount(userId: string) {
    await this.prisma.$transaction([
      this.prisma.redemption.updateMany({ where: { userId }, data: { userId: null } }),
      this.prisma.user.delete({ where: { id: userId } }),
    ]);
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
