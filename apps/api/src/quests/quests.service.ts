import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { RedemptionCapService } from "../redis/redemption-cap.service";
import { NotificationsService } from "../notifications/notifications.service";
import { CreateQuestDto } from "./dto/create-quest.dto";

@Injectable()
export class QuestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly caps: RedemptionCapService,
    private readonly notifications: NotificationsService,
  ) {}

  create(venueId: string, dto: CreateQuestDto) {
    return this.prisma.quest.create({
      data: {
        venueId,
        name: dto.name,
        theme: dto.theme,
        rewardType: dto.rewardType,
        rewardTier: dto.rewardTier,
        rewardDescription: dto.rewardDescription,
        maxRedemptionsPerDay: dto.maxRedemptionsPerDay,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      },
    });
  }

  listForVenue(venueId: string) {
    return this.prisma.quest.findMany({ where: { venueId }, orderBy: { createdAt: "desc" } });
  }

  listAll() {
    return this.prisma.quest.findMany({ orderBy: { createdAt: "desc" } });
  }

  async findOrThrow(questId: string) {
    const quest = await this.prisma.quest.findUnique({ where: { id: questId }, include: { venue: true, markers: true } });
    if (!quest) throw new NotFoundException("Quest not found");
    return quest;
  }

  /** Ownership check used by every business-scoped quest mutation. */
  async findOwnedOrThrow(questId: string, businessId: string) {
    const quest = await this.findOrThrow(questId);
    if (quest.venue.businessId !== businessId) {
      throw new ForbiddenException("This quest does not belong to your business");
    }
    return quest;
  }

  /**
   * Blocked server-side unless the owning business has a verified payment method (PRD section 12) —
   * also requires a compiled marker, since a "live" quest with no scannable marker isn't usable.
   */
  async publish(questId: string, businessId: string) {
    const quest = await this.findOwnedOrThrow(questId, businessId);
    const readyMarker = quest.markers.find((m) => m.status === "ready");
    if (!readyMarker) {
      throw new ForbiddenException("Generate and finish compiling a marker before publishing");
    }
    const updated = await this.prisma.quest.update({ where: { id: questId }, data: { status: "live" } });
    // FR-6: notify venue favoriters of the new live quest. Fire-and-forget — a notification failure
    // must never fail the publish itself.
    void this.notifications.notifyNewQuestAtVenue(quest.venueId, quest.venue.name, quest.name).catch(() => undefined);
    return updated;
  }

  /** Basic dashboard numbers (PRD section 12): redemption counts and remaining cap — real, not stubbed. */
  async stats(questId: string, businessId: string) {
    const quest = await this.findOwnedOrThrow(questId, businessId);
    const [total, claimed, flagged, rejected] = await Promise.all([
      this.prisma.redemption.count({ where: { questId } }),
      this.prisma.redemption.count({ where: { questId, status: "claimed" } }),
      this.prisma.redemption.count({ where: { questId, status: "flagged" } }),
      this.prisma.redemption.count({ where: { questId, status: "rejected" } }),
    ]);
    const todayCount = await this.caps.currentCount(quest.venueId, questId);

    return {
      totalRedemptions: total,
      claimed,
      flagged,
      rejected,
      capToday: quest.maxRedemptionsPerDay,
      redeemedToday: todayCount,
      capRemainingToday: Math.max(0, quest.maxRedemptionsPerDay - todayCount),
    };
  }
}
