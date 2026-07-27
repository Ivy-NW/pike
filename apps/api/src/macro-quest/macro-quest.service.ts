import { Injectable } from "@nestjs/common";
import type { MacroQuestProgress } from "@pike/shared-types";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class MacroQuestService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Phase 3 — FR-5: the live macro-quest and this user's progress toward it, or null if none is live.
   *
   * Progress is DERIVED (not stored): a venue counts as "visited" once the user has a non-rejected
   * redemption there within [startsAt, endsAt]. When they reach `requiredVenues` distinct venues we
   * record the terminal completion once — the unique (macroQuestId, userId) makes the unlock
   * idempotent, so re-checking never double-awards (ADR 0005). Completion is terminal: once earned it
   * stays earned even if a later re-check somehow counts fewer venues.
   */
  async progressForUser(userId: string): Promise<MacroQuestProgress | null> {
    const mq = await this.prisma.macroQuest.findFirst({
      where: { status: "live" },
      orderBy: { createdAt: "desc" },
      include: { venues: { include: { venue: { select: { id: true, name: true } } } } },
    });
    if (!mq) return null;

    const participatingVenueIds = mq.venues.map((v) => v.venueId);
    const visited = await this.prisma.redemption.findMany({
      where: {
        userId,
        venueId: { in: participatingVenueIds },
        status: { not: "rejected" },
        createdAt: { gte: mq.startsAt, lte: mq.endsAt },
      },
      select: { venueId: true },
      distinct: ["venueId"],
    });
    const visitedIds = new Set(visited.map((v) => v.venueId));

    const existing = await this.prisma.macroQuestCompletion.findUnique({
      where: { macroQuestId_userId: { macroQuestId: mq.id, userId } },
    });
    let completion = existing;
    if (!existing && visitedIds.size >= mq.requiredVenues) {
      // upsert (not create) so two concurrent checks can't both insert.
      completion = await this.prisma.macroQuestCompletion.upsert({
        where: { macroQuestId_userId: { macroQuestId: mq.id, userId } },
        update: {},
        create: { macroQuestId: mq.id, userId },
      });
    }

    return {
      id: mq.id,
      name: mq.name,
      description: mq.description,
      requiredVenues: mq.requiredVenues,
      visitedCount: visitedIds.size,
      completed: !!completion,
      completedAt: completion?.completedAt.toISOString() ?? null,
      startsAt: mq.startsAt.toISOString(),
      endsAt: mq.endsAt.toISOString(),
      reward: { type: mq.rewardType, description: mq.rewardDescription, tier: mq.rewardTier },
      venues: mq.venues.map((mv) => ({ id: mv.venue.id, name: mv.venue.name, visited: visitedIds.has(mv.venueId) })),
    };
  }
}
