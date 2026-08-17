import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Cron, CronExpression } from "@nestjs/schedule";
import * as webpush from "web-push";
import { PrismaService } from "../prisma/prisma.service";

export interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

interface WebPushSubscription {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

/**
 * Phase 3 — FR-6 push notifications: streak-expiry warnings and new-quest-at-a-favorited-venue.
 *
 * The trigger logic (who gets notified, and when) is real and tested. Delivery supports two
 * token kinds, distinguished by shape: web-push subscriptions (stored as JSON) and the
 * legacy Expo/FCM path, which stays a TODO(credentials) stub until a provider is configured.
 * Web Push is live once VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY/VAPID_SUBJECT are set — the keys are
 * generated with `npx web-push generate-vapid-keys --json` and the public key is exposed to the
 * PWA via GET /push/vapid-public-key.
 */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly deliveryEnabled: boolean;
  private readonly webPushEnabled: boolean;
  private readonly vapidPublicKey: string | null;

  constructor(
    private readonly prisma: PrismaService,
    config: ConfigService,
  ) {
    this.deliveryEnabled = !!config.get<string>("FCM_SERVER_KEY");

    this.vapidPublicKey = config.get<string>("VAPID_PUBLIC_KEY") ?? null;
    const vapidPrivateKey = config.get<string>("VAPID_PRIVATE_KEY");
    const vapidSubject = config.get<string>("VAPID_SUBJECT");
    this.webPushEnabled = Boolean(this.vapidPublicKey && vapidPrivateKey && vapidSubject);
    if (this.webPushEnabled) {
      webpush.setVapidDetails(vapidSubject!, this.vapidPublicKey!, vapidPrivateKey!);
    } else {
      this.logger.warn("Web Push not configured (VAPID_* keys missing) — PWA push will not be delivered.");
    }
    if (!this.deliveryEnabled) {
      this.logger.warn("FCM push delivery not configured (FCM_SERVER_KEY missing) — Expo/FCM notifications are logged, not sent.");
    }
  }

  /** The public VAPID key the PWA needs to subscribe (GET /push/vapid-public-key). */
  getVapidPublicKey(): string | null {
    return this.vapidPublicKey;
  }

  /** A device (re)registers its push token on launch; the unique token reassigns owner on upsert. */
  async registerToken(userId: string, token: string): Promise<void> {
    await this.prisma.pushToken.upsert({
      where: { token },
      update: { userId },
      create: { userId, token },
    });
  }

  private isWebSubscription(token: string): boolean {
    return token.trimStart().startsWith("{");
  }

  /** Resolve a user's device tokens and deliver (stubbed to a log when unconfigured). */
  async send(userId: string, payload: PushPayload): Promise<void> {
    const tokens = await this.prisma.pushToken.findMany({ where: { userId }, select: { token: true } });
    if (tokens.length === 0) return;

    await Promise.all(
      tokens.map(({ token }) => {
        if (this.isWebSubscription(token)) {
          return this.sendWebPush(token, payload);
        }
        if (!this.deliveryEnabled) {
          this.logger.log(`[stub push] device ${userId}: ${payload.title} — ${payload.body}`);
          return Promise.resolve();
        }
        // TODO(credentials): dispatch payload to Expo/FCM for each native token here.
        return Promise.resolve();
      }),
    );
  }

  /** Deliver to a browser web-push subscription; failures are logged, never thrown. */
  private async sendWebPush(token: string, payload: PushPayload): Promise<void> {
    if (!this.webPushEnabled) {
      this.logger.log(`[stub web push] ${payload.title} — ${payload.body}`);
      return;
    }
    try {
      const subscription: WebPushSubscription = JSON.parse(token);
      await webpush.sendNotification(subscription, JSON.stringify(payload), { TTL: 60 * 60 * 24 });
    } catch (err: any) {
      // 404/410 = subscription gone; treat as benign and drop it so future sends don't retry a dead endpoint.
      if (err?.statusCode === 404 || err?.statusCode === 410) {
        await this.prisma.pushToken.deleteMany({ where: { token } }).catch(() => undefined);
      }
      this.logger.warn(`Web push failed for ${payload.title}: ${err?.message ?? err}`);
    }
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
