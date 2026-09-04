import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { RedemptionCapService } from "../redis/redemption-cap.service";

/** One row of the business's reward inventory: the reward, plus how it is actually performing. */
export interface RewardInventoryRow {
  questId: string;
  questName: string;
  questStatus: string;
  venueId: string;
  venueName: string;
  rewardType: string;
  rewardTier: string;
  rewardDescription: string;
  maxRedemptionsPerDay: number;
  expiresAt: string | null;
  expired: boolean;
  /** null when Redis is unreachable — the cap counters live there, not in Postgres. */
  redeemedToday: number | null;
  capRemainingToday: number | null;
  totalRedemptions: number;
  claimed: number;
  flagged: number;
  rejected: number;
}

@Injectable()
export class RewardsService {
  private readonly logger = new Logger(RewardsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly caps: RedemptionCapService,
  ) {}

  /**
   * The whole rewards page in one call, replacing the dashboard's old N+1 walk
   * (list venues → list quests per venue → stats per quest). Costs two SQL queries
   * regardless of how many quests a business has, plus one Redis GET per quest for
   * today's counter — the same counter GET /quests/:id/stats reads, so the two views
   * can never disagree about today's number.
   */
  async listForBusiness(businessId: string) {
    const quests = await this.prisma.quest.findMany({
      where: { venue: { businessId } },
      include: { venue: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });

    if (quests.length === 0) {
      return {
        summary: { totalRewards: 0, liveRewards: 0, redeemedToday: 0, capToday: 0, totalClaimed: 0 },
        rewards: [] as RewardInventoryRow[],
      };
    }

    // One grouped count for every quest × status pair, rather than four counts per quest.
    const grouped = await this.prisma.redemption.groupBy({
      by: ["questId", "status"],
      where: { questId: { in: quests.map((q) => q.id) } },
      _count: { _all: true },
    });

    const counts = new Map<string, Record<string, number>>();
    for (const row of grouped) {
      const forQuest = counts.get(row.questId) ?? {};
      forQuest[row.status] = row._count._all;
      counts.set(row.questId, forQuest);
    }

    // Redis holds the cap counters and may be down (see progress.md "Confirm Redis
    // connectivity"). A dead counter degrades that one column to null rather than
    // failing the whole inventory view, which is still useful without today's number.
    const todayCounts = await Promise.all(
      quests.map((quest) =>
        this.caps.currentCount(quest.venueId, quest.id).catch((err) => {
          this.logger.warn(`Cap counter unavailable for quest ${quest.id}: ${err?.message ?? err}`);
          return null;
        }),
      ),
    );

    const now = new Date();
    const rewards: RewardInventoryRow[] = quests.map((quest, i) => {
      const byStatus = counts.get(quest.id) ?? {};
      const claimed = byStatus.claimed ?? 0;
      const flagged = byStatus.flagged ?? 0;
      const rejected = byStatus.rejected ?? 0;
      // noUncheckedIndexedAccess: the index is always in range (same map source), but the
      // compiler cannot know that — normalize the phantom undefined to the real 'no counter' value.
      const redeemedToday = todayCounts[i] ?? null;

      return {
        questId: quest.id,
        questName: quest.name,
        questStatus: quest.status,
        venueId: quest.venue.id,
        venueName: quest.venue.name,
        rewardType: quest.rewardType,
        rewardTier: quest.rewardTier,
        rewardDescription: quest.rewardDescription,
        maxRedemptionsPerDay: quest.maxRedemptionsPerDay,
        expiresAt: quest.expiresAt ? quest.expiresAt.toISOString() : null,
        expired: quest.expiresAt ? quest.expiresAt < now : false,
        redeemedToday,
        capRemainingToday:
          redeemedToday === null ? null : Math.max(0, quest.maxRedemptionsPerDay - redeemedToday),
        totalRedemptions: claimed + flagged + rejected,
        claimed,
        flagged,
        rejected,
      };
    });

    const live = rewards.filter((r) => r.questStatus === "live");

    return {
      summary: {
        totalRewards: rewards.length,
        liveRewards: live.length,
        // Summed across every quest: a reward paused at noon still consumed cap this morning.
        redeemedToday: todayCounts.some((c) => c === null)
          ? null
          : todayCounts.reduce((sum: number, c) => sum + (c ?? 0), 0),
        // Only live quests contribute headroom — a paused reward's cap is not in play today.
        capToday: live.reduce((sum, r) => sum + r.maxRedemptionsPerDay, 0),
        totalClaimed: rewards.reduce((sum, r) => sum + r.claimed, 0),
      },
      rewards,
    };
  }
}
