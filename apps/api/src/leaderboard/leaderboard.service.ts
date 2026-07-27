import { Injectable } from "@nestjs/common";
import type { LeaderboardEntry, LeaderboardResponse } from "@pike/shared-types";
import { PrismaService } from "../prisma/prisma.service";
import { GamificationService } from "../gamification/gamification.service";

const DEFAULT_LIMIT = 50;

@Injectable()
export class LeaderboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gamification: GamificationService,
  ) {}

  /**
   * Phase 3 — FR-7: reputational global board ranked by XP, the identity currency. This stands in
   * for the PRD's "city" board until venues carry structured city data; ranking logic is identical,
   * only the population differs, so a city board later is a WHERE clause, not a rewrite.
   */
  async global(userId: string, limit = DEFAULT_LIMIT): Promise<LeaderboardResponse> {
    const top = await this.prisma.user.findMany({
      orderBy: [{ xp: "desc" }, { createdAt: "asc" }],
      take: limit,
      select: { id: true, username: true, xp: true },
    });
    const entries = top.map((u, i) => this.entry(i + 1, u.id, u.username, u.xp, u.xp, userId));

    // Always surface the requester's standing, even if they're below the returned top-N.
    let me = entries.find((e) => e.isMe) ?? null;
    if (!me) {
      const self = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { username: true, xp: true },
      });
      if (self) {
        // Standard competition ranking: rank = (# strictly ahead) + 1.
        const ahead = await this.prisma.user.count({ where: { xp: { gt: self.xp } } });
        me = this.entry(ahead + 1, userId, self.username, self.xp, self.xp, userId);
      }
    }
    return { scope: "global", venueId: null, entries, me };
  }

  /**
   * FR-7: venue-level board ranked by how many quests a user has completed at that venue —
   * the reputational signal that "ties naturally to the map context" (UI §7.3). Rejected
   * completions and anonymized (account-deleted) redemptions are excluded.
   */
  async venue(userId: string, venueId: string, limit = DEFAULT_LIMIT): Promise<LeaderboardResponse> {
    const grouped = await this.prisma.redemption.groupBy({
      by: ["userId"],
      where: { venueId, status: { not: "rejected" }, userId: { not: null } },
      _count: { _all: true },
    });
    // groupBy can't order by _count reliably across providers, so rank in memory.
    grouped.sort((a, b) => b._count._all - a._count._all);

    const userIds = grouped.map((g) => g.userId).filter((id): id is string => id !== null);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, username: true, xp: true },
    });
    const byId = new Map(users.map((u) => [u.id, u]));

    const ranked = grouped
      .filter((g) => g.userId !== null)
      .map((g, i) => {
        const u = byId.get(g.userId as string);
        return this.entry(i + 1, g.userId as string, u?.username ?? "unknown", g._count._all, u?.xp ?? 0, userId);
      });

    return {
      scope: "venue",
      venueId,
      entries: ranked.slice(0, limit),
      me: ranked.find((e) => e.isMe) ?? null,
    };
  }

  private entry(
    rank: number,
    id: string,
    username: string,
    score: number,
    xp: number,
    meId: string,
  ): LeaderboardEntry {
    return {
      rank,
      userId: id,
      username,
      score,
      level: this.gamification.levelInfo(xp).level,
      isMe: id === meId,
    };
  }
}
