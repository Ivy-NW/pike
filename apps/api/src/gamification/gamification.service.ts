import { Injectable } from "@nestjs/common";
import type { Prisma, User } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { BADGE_DEFINITIONS } from "./badges";

/** Flat XP per claimed redemption (any channel/tier) — simplest model for v1 of Phase 2. */
const QUEST_XP_REWARD = 50;
/** XP required per level, constant across levels — easy to make progressive later. */
const XP_PER_LEVEL = 100;
type GamificationDb = PrismaService | Prisma.TransactionClient;

export interface LevelInfo {
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
}

export interface AwardResult {
  xpAwarded: number;
  newBadges: { key: string; name: string; description: string }[];
  /** Post-award user row (no passwordHash) — always use this over any pre-award snapshot held by the caller. */
  user: Omit<User, "passwordHash">;
}

@Injectable()
export class GamificationService {
  constructor(private readonly prisma: PrismaService) {}

  levelInfo(xp: number): LevelInfo {
    return {
      level: Math.floor(xp / XP_PER_LEVEL) + 1,
      xpIntoLevel: xp % XP_PER_LEVEL,
      xpForNextLevel: XP_PER_LEVEL,
    };
  }

  private utcDateOnly(d: Date): string {
    return d.toISOString().slice(0, 10);
  }

  /**
   * Called once a redemption is successfully claimed (FR-2's XP/streak/badges — Phase 2).
   * Streak increments at most once per UTC calendar day; XP is awarded on every claim.
   */
  async awardForClaim(userId: string, db: GamificationDb = this.prisma): Promise<AwardResult> {
    const user = await db.user.findUniqueOrThrow({ where: { id: userId } });

    const today = this.utcDateOnly(new Date());
    const lastDay = user.lastQuestCompletedAt ? this.utcDateOnly(user.lastQuestCompletedAt) : null;
    const yesterday = this.utcDateOnly(new Date(Date.now() - 24 * 60 * 60 * 1000));

    let currentStreak = user.currentStreak;
    if (lastDay === today) {
      // already completed a quest today — streak doesn't move twice in one day
    } else if (lastDay === yesterday) {
      currentStreak += 1;
    } else {
      currentStreak = 1;
    }
    const longestStreak = Math.max(user.longestStreak, currentStreak);

    const updated = await db.user.update({
      where: { id: userId },
      data: {
        xp: { increment: QUEST_XP_REWARD },
        currentStreak,
        longestStreak,
        lastQuestCompletedAt: new Date(),
      },
    });

    const totalCompleted = await db.redemption.count({
      where: { userId, status: { not: "rejected" } },
    });

    const already = await db.userBadge.findMany({ where: { userId }, select: { badgeKey: true } });
    const earnedKeys = new Set(already.map((b) => b.badgeKey));
    const stats = { totalCompleted, currentStreak: updated.currentStreak };
    const toAward = BADGE_DEFINITIONS.filter((b) => !earnedKeys.has(b.key) && b.check(stats));

    if (toAward.length > 0) {
      await db.userBadge.createMany({
        data: toAward.map((b) => ({ userId, badgeKey: b.key })),
        skipDuplicates: true,
      });
    }

    const { passwordHash: _passwordHash, ...safeUser } = updated;

    return {
      xpAwarded: QUEST_XP_REWARD,
      newBadges: toAward.map(({ key, name, description }) => ({ key, name, description })),
      user: safeUser,
    };
  }

  /** Full badge grid for the profile screen — earned ones carry earnedAt, locked ones don't. */
  async badgeGrid(userId: string) {
    const earned = await this.prisma.userBadge.findMany({ where: { userId } });
    const earnedByKey = new Map(earned.map((b) => [b.badgeKey, b.earnedAt]));
    return BADGE_DEFINITIONS.map((b) => ({
      key: b.key,
      name: b.name,
      description: b.description,
      earnedAt: earnedByKey.get(b.key)?.toISOString() ?? null,
    }));
  }
}
