import { Injectable, Logger } from "@nestjs/common";
import { RedisService } from "../redis/redis.service";

/**
 * Phase C — Redis-backed queue for token mint/burn intents.
 *
 * Reuses the exact pattern from AttestationQueueService: each intent is a JSON-encoded
 * object with an operation type (mintAchievement, mintVoucher, burnVoucher) and the
 * necessary identifiers (userId, achievementId, rewardId, redemptionId). The batch service
 * drains the queue on a fixed cadence and submits batched contract calls.
 *
 * Like attestation, this is fully asynchronous and off the critical path — badge awards,
 * reward claims, and redemptions all complete immediately in Postgres; the on-chain mirror
 * happens afterward (FR-T5).
 */
@Injectable()
export class TokenQueueService {
  private readonly logger = new Logger(TokenQueueService.name);
  private readonly queueKey = "tokens:mint-burn-queue";

  constructor(private readonly redis: RedisService) {}

  /** Enqueue a badge/level/macro-quest achievement mint. */
  async enqueueMintAchievement(userId: string, achievementId: number): Promise<void> {
    const intent = JSON.stringify({ op: "mintAchievement", userId, achievementId });
    await this.redis.client.rpush(this.queueKey, intent);
  }

  /** Enqueue a reward voucher mint (when redemption reaches `claimed`). */
  async enqueueMintVoucher(userId: string, rewardId: number, redemptionId: string): Promise<void> {
    const intent = JSON.stringify({ op: "mintVoucher", userId, rewardId, redemptionId });
    await this.redis.client.rpush(this.queueKey, intent);
  }

  /** Enqueue a reward voucher burn (when redemption is marked redeemed at venue). */
  async enqueueBurnVoucher(userId: string, rewardId: number, redemptionId: string): Promise<void> {
    const intent = JSON.stringify({ op: "burnVoucher", userId, rewardId, redemptionId });
    await this.redis.client.rpush(this.queueKey, intent);
  }

  /**
   * Drain up to `limit` intents from the queue. Returns parsed objects ready for the batch
   * service to group and submit.
   */
  async drain(limit: number): Promise<TokenIntent[]> {
    const raw = await this.redis.client.lpop(this.queueKey, limit);
    if (!raw || raw.length === 0) return [];

    const intents: TokenIntent[] = [];
    for (const json of raw) {
      try {
        const parsed = JSON.parse(json);
        intents.push(parsed);
      } catch (err: any) {
        this.logger.warn(`Failed to parse token intent: ${json} — ${err?.message ?? err}`);
      }
    }
    return intents;
  }

  /** Current queue depth (for monitoring/alerting). */
  async depth(): Promise<number> {
    return this.redis.client.llen(this.queueKey);
  }
}

export type TokenIntent =
  | { op: "mintAchievement"; userId: string; achievementId: number }
  | { op: "mintVoucher"; userId: string; rewardId: number; redemptionId: string }
  | { op: "burnVoucher"; userId: string; rewardId: number; redemptionId: string };
