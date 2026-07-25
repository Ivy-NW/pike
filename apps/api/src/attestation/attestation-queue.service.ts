import { Injectable } from "@nestjs/common";
import { RedisService } from "../redis/redis.service";

const QUEUE_KEY = "attestation:pending";

/**
 * A pure trigger queue, not a second copy of data — only redemption ids are queued. The
 * hash itself is already durable in Postgres by the time it's enqueued (RedemptionsService
 * writes it synchronously), so if Redis drops an id, nothing is lost: the reconciliation
 * sweep in AttestationBatchService finds it from Postgres and re-enqueues it.
 */
@Injectable()
export class AttestationQueueService {
  constructor(private readonly redis: RedisService) {}

  async enqueue(redemptionId: string): Promise<void> {
    await this.redis.client.rpush(QUEUE_KEY, redemptionId);
  }

  async queueLength(): Promise<number> {
    return this.redis.client.llen(QUEUE_KEY);
  }

  /** Atomic multi-pop (Redis 6.2+ count-form LPOP) — safe against a concurrent drain. */
  async dequeueBatch(maxCount: number): Promise<string[]> {
    if (maxCount <= 0) return [];
    const popped = await this.redis.client.lpop(QUEUE_KEY, maxCount);
    return popped ?? [];
  }
}
