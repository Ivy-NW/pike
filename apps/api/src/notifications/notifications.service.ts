import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../prisma/prisma.service";

export interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

/**
 * Phase 3 — FR-6 push notifications: streak-expiry warnings and new-quest-at-a-favorited-venue.
 *
 * The trigger logic (who gets notified, and when) is real and tested. Delivery is credential-gated:
 * TODO(credentials) — real Expo/FCM dispatch needs a provider (expo-server-sdk / firebase-admin) plus
 * FCM_SERVER_KEY. Until then send() resolves recipients and logs, so the triggers are exercisable
 * end-to-end, matching the Stripe/8th-Wall no-op stubs.
 */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly deliveryEnabled: boolean;

  constructor(
    private readonly prisma: PrismaService,
    config: ConfigService,
  ) {
    this.deliveryEnabled = !!config.get<string>("FCM_SERVER_KEY");
    if (!this.deliveryEnabled) {
      this.logger.warn("Push delivery not configured (FCM_SERVER_KEY missing) — notifications are logged, not sent.");
    }
  }

  /** A device (re)registers its push token on launch; the unique token reassigns owner on upsert. */
  async registerToken(userId: string, token: string): Promise<void> {
    await this.prisma.pushToken.upsert({
      where: { token },
      update: { userId },
      create: { userId, token },
    });
  }

  /** Resolve a user's device tokens and deliver (stubbed to a log when unconfigured). */
  async send(userId: string, payload: PushPayload): Promise<void> {
    const tokens = await this.prisma.pushToken.findMany({ where: { userId }, select: { token: true } });
    if (tokens.length === 0) return;
    if (!this.deliveryEnabled) {
      this.logger.log(`[stub push] ${tokens.length} device(s) of ${userId}: ${payload.title} — ${payload.body}`);
      return;
    }
    // TODO(credentials): dispatch payload to Expo/FCM for each token here.
  }

  /** FR-6: notify everyone who favorited a venue when it publishes a new quest. */
  async notifyNewQuestAtVenue(venueId: string, venueName: string, questName: string): Promise<void> {
    const favoriters = await this.prisma.favoriteVenue.findMany({ where: { venueId }, select: { userId: true } });
    await Promise.all(
      favoriters.map((f) =>
        this.send(f.userId, {
          title: `New quest at ${venueName}`,
          body: questName,
          data: { type: "new_quest", venueId },
        }),
      ),
    );
  }

  /**
   * Users whose streak lapses tonight: streak > 0 AND their last completion was YESTERDAY (UTC) — so
   * they have not completed today and the streak breaks at UTC midnight unless they act. Streaks are
   * server-owned UTC days (ADR 0005), so this uses UTC day boundaries.
   */
  findUsersWithStreakAtRisk(now: Date) {
    const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
    return this.prisma.user.findMany({
      where: {
        currentStreak: { gt: 0 },
        lastQuestCompletedAt: { gte: startOfYesterday, lt: startOfToday },
      },
      select: { id: true, currentStreak: true },
    });
  }

  /** FR-6: once a day, warn users whose streak will lapse if they don't complete a quest today. */
  @Cron(CronExpression.EVERY_DAY_AT_6PM)
  async sweepStreakExpiryWarnings(): Promise<void> {
    const atRisk = await this.findUsersWithStreakAtRisk(new Date());
    await Promise.all(
      atRisk.map((u) =>
        this.send(u.id, {
          title: "Your streak is about to break",
          body: `Complete a quest today to keep your ${u.currentStreak}-day streak alive.`,
          data: { type: "streak_expiry" },
        }),
      ),
    );
  }
}
