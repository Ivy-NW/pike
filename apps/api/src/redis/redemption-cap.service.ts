import { Injectable } from "@nestjs/common";
import { RedisService } from "./redis.service";

/**
 * Server-side redemption-cap enforcement (FR-11: caps/expiry are never trusted from a client).
 * Keys are scoped venue+quest+day so caps for one venue/quest can never leak into another's count,
 * even if two venues reuse the same marker template.
 */
@Injectable()
export class RedemptionCapService {
  constructor(private readonly redis: RedisService) {}

  private key(venueId: string, questId: string, day: string) {
    return `cap:${venueId}:${questId}:${day}`;
  }

  private today() {
    return new Date().toISOString().slice(0, 10);
  }

  private secondsUntilMidnightUtc() {
    const now = new Date();
    const midnight = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0),
    );
    return Math.max(1, Math.floor((midnight.getTime() - now.getTime()) / 1000));
  }

  /** Atomically increments today's count and returns it — used to decide accept/reject in one round trip. */
  async incrementAndGet(venueId: string, questId: string): Promise<number> {
    const key = this.key(venueId, questId, this.today());
    const count = await this.redis.client.incr(key);
    if (count === 1) {
      await this.redis.client.expire(key, this.secondsUntilMidnightUtc());
    }
    return count;
  }

  async currentCount(venueId: string, questId: string): Promise<number> {
    const key = this.key(venueId, questId, this.today());
    const value = await this.redis.client.get(key);
    return value ? Number(value) : 0;
  }

  /** Rolls back the increment when a redemption is rejected after the counter was already bumped. */
  async decrement(venueId: string, questId: string): Promise<void> {
    const key = this.key(venueId, questId, this.today());
    await this.redis.client.decr(key);
  }
}
