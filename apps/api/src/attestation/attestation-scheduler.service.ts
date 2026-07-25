import { Injectable, Logger } from "@nestjs/common";
import { Interval } from "@nestjs/schedule";
import { AttestationQueueService } from "./attestation-queue.service";
import { AttestationConfigService } from "./attestation-config.service";
import { AttestationBatchService } from "./attestation-batch.service";

/**
 * FR-A3: the batch window is runtime-configurable, which is why this uses a fixed-cadence
 * @Interval that re-reads the window each tick rather than @Cron (whose schedule is fixed at
 * decoration time and can't react to an admin-edited window without a redeploy).
 */
@Injectable()
export class AttestationSchedulerService {
  private readonly logger = new Logger(AttestationSchedulerService.name);
  private oldestQueuedAt: number | null = null;

  constructor(
    private readonly queue: AttestationQueueService,
    private readonly config: AttestationConfigService,
    private readonly batch: AttestationBatchService,
  ) {}

  @Interval(15_000)
  async checkCountTrigger(): Promise<void> {
    const length = await this.queue.queueLength();
    if (length === 0) {
      this.oldestQueuedAt = null;
      return;
    }
    if (this.oldestQueuedAt === null) this.oldestQueuedAt = Date.now();

    const cfg = await this.config.getConfig();
    if (length >= cfg.batchCountThreshold) {
      await this.runSafely(() => this.batch.runBatchCycle("count"));
    }
  }

  @Interval(30_000)
  async checkTimeTrigger(): Promise<void> {
    if (this.oldestQueuedAt === null) return;

    const cfg = await this.config.getConfig();
    if (Date.now() - this.oldestQueuedAt >= cfg.batchWindowMs) {
      await this.runSafely(() => this.batch.runBatchCycle("time"));
    }
  }

  @Interval(5 * 60_000)
  async retrySweep(): Promise<void> {
    await this.runSafely(() => this.batch.retryFailedBatches());
  }

  @Interval(10 * 60_000)
  async reconciliationSweep(): Promise<void> {
    await this.runSafely(() => this.batch.reconciliationSweep());
  }

  private async runSafely(fn: () => Promise<void>): Promise<void> {
    try {
      await fn();
    } catch (err) {
      this.logger.error("Attestation scheduler tick failed", (err as Error).stack);
    }
  }
}
