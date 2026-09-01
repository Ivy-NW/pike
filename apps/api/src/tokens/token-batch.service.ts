import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import type { Hex } from "viem";
import { PrismaService } from "../prisma/prisma.service";
import { TokenQueueService } from "./token-queue.service";
import { TokenWalletService } from "./token-wallet.service";
import { TokenChainService } from "./token-chain.service";

/**
 * Phase C — orchestrates token mint/burn batch cycles.
 *
 * Follows the same pattern as AttestationBatchService: drain queue → filter for actual
 * work needed (check on-chain state) → submit batch → persist tx hash → retry on failure.
 *
 * Three separate batch types run independently:
 * - Achievement mints (badges, level milestones, macro-quest completions)
 * - Voucher issues (redemptions reaching `claimed`)
 * - Voucher burns (redemptions marked as redeemed)
 *
 * Idempotency: the contracts handle it (PikeAchievements.mint returns false if already held,
 * PikeRewardVouchers.issue checks `issued` mapping), so a retry after an ambiguous failure
 * is safe and doesn't double-issue.
 */
@Injectable()
export class TokenBatchService {
  private readonly logger = new Logger(TokenBatchService.name);
  private readonly BATCH_SIZE = 100; // Max entries per batch transaction

  constructor(
    private readonly prisma: PrismaService,
    private readonly queue: TokenQueueService,
    private readonly wallet: TokenWalletService,
    private readonly chain: TokenChainService,
  ) {}

  /** Scheduled: run achievement mint batch every 5 minutes. */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async scheduledAchievementMintBatch() {
    if (!this.wallet.isEnabled() || !this.chain.isEnabled()) return;
    await this.runAchievementMintBatch();
  }

  /** Scheduled: run voucher issue batch every 5 minutes. */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async scheduledVoucherIssueBatch() {
    if (!this.wallet.isEnabled() || !this.chain.isEnabled()) return;
    await this.runVoucherIssueBatch();
  }

  /** Scheduled: run voucher burn batch every 5 minutes. */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async scheduledVoucherBurnBatch() {
    if (!this.wallet.isEnabled() || !this.chain.isEnabled()) return;
    await this.runVoucherBurnBatch();
  }

  /** Drain achievement mint queue and submit to chain. */
  async runAchievementMintBatch(): Promise<void> {
    try {
      const allIntents = await this.queue.drain(this.BATCH_SIZE);
      const intents = allIntents.filter((i) => i.op === "mintAchievement") as Array<{
        op: "mintAchievement";
        userId: string;
        achievementId: number;
      }>;
      if (intents.length === 0) return;

      this.logger.log(`Processing ${intents.length} achievement mint intents`);

      // Derive addresses for all users
      const userIds = [...new Set(intents.map((i) => i.userId))];
      const addressMap = this.wallet.deriveAddresses(userIds);

      // Filter to only mints that are actually needed (balance check)
      const needed: Array<{ holder: Hex; tokenId: number; userId: string }> = [];
      for (const { userId, achievementId } of intents) {
        const holder = addressMap.get(userId);
        if (!holder) {
          this.logger.warn(`Failed to derive address for user ${userId}`);
          continue;
        }

        const hasIt = await this.chain.hasAchievement(holder, achievementId);
        if (!hasIt) {
          needed.push({ holder, tokenId: achievementId, userId });
        }
      }

      if (needed.length === 0) {
        this.logger.log("All achievements already minted (idempotent retry)");
        return;
      }

      // Submit batch transaction
      const holders = needed.map((n) => n.holder);
      const tokenIds = needed.map((n) => n.tokenId);

const txHash = await this.chain.mintAchievementsBatch(holders, tokenIds);
      this.logger.log(`Achievement mint batch submitted: ${txHash} (${needed.length} entries)`);

      // Wait for confirmation
      await this.chain.waitForTransaction(txHash);
      this.logger.log(`Achievement mint batch confirmed: ${txHash}`);

      // TODO: persist txHash to database (new UserAchievementMint table, similar to attestation pattern)
      // For now, just log success
    } catch (err: any) {
      this.logger.error(`Achievement mint batch failed: ${err?.message ?? err}`);
      // Intents stay in queue (drained but not committed) — will retry on next cycle
    }
  }

  /** Drain voucher issue queue and submit to chain. */
  async runVoucherIssueBatch(): Promise<void> {
    try {
      const allIntents = await this.queue.drain(this.BATCH_SIZE);
      const intents = allIntents.filter((i) => i.op === "mintVoucher") as Array<{
        op: "mintVoucher";
        userId: string;
        rewardId: number;
        redemptionId: string;
      }>;
      if (intents.length === 0) return;

      this.logger.log(`Processing ${intents.length} voucher issue intents`);

      const userIds = [...new Set(intents.map((i) => i.userId))];
      const addressMap = this.wallet.deriveAddresses(userIds);

      const needed: Array<{ holder: Hex; rewardId: number; redemptionId: string }> = [];
      for (const { userId, rewardId, redemptionId } of intents) {
        const holder = addressMap.get(userId);
        if (!holder) {
          this.logger.warn(`Failed to derive address for user ${userId}`);
          continue;
        }

        const issued = await this.chain.isVoucherIssued(redemptionId);
        if (!issued) {
          needed.push({ holder, rewardId, redemptionId });
        }
      }

      if (needed.length === 0) {
        this.logger.log("All vouchers already issued (idempotent retry)");
        return;
      }

      const holders = needed.map((n) => n.holder);
      const rewardIds = needed.map((n) => n.rewardId);
      const redemptionIds = needed.map((n) => n.redemptionId);

      const txHash = await this.chain.issueVouchersBatch(holders, rewardIds, redemptionIds);
      this.logger.log(`Voucher issue batch submitted: ${txHash} (${needed.length} entries)`);

      await this.chain.waitForTransaction(txHash);
      this.logger.log(`Voucher issue batch confirmed: ${txHash}`);

      // Persist txHash to redemption rows
      await this.prisma.redemption.updateMany({
        where: { id: { in: redemptionIds } },
        data: { voucherIssueTxHash: txHash },
      });
    } catch (err: any) {
      this.logger.error(`Voucher issue batch failed: ${err?.message ?? err}`);
    }
  }

  /** Drain voucher burn queue and submit to chain. */
  async runVoucherBurnBatch(): Promise<void> {
    try {
      const allIntents = await this.queue.drain(this.BATCH_SIZE);
      const intents = allIntents.filter((i) => i.op === "burnVoucher") as Array<{
        op: "burnVoucher";
        userId: string;
        rewardId: number;
        redemptionId: string;
      }>;
      if (intents.length === 0) return;

      this.logger.log(`Processing ${intents.length} voucher burn intents`);

      const userIds = [...new Set(intents.map((i) => i.userId))];
      const addressMap = this.wallet.deriveAddresses(userIds);

      const needed: Array<{ holder: Hex; rewardId: number; redemptionId: string }> = [];
      for (const { userId, rewardId, redemptionId } of intents) {
        const holder = addressMap.get(userId);
        if (!holder) {
          this.logger.warn(`Failed to derive address for user ${userId}`);
          continue;
        }

        const redeemed = await this.chain.isVoucherRedeemed(redemptionId);
        if (!redeemed) {
          needed.push({ holder, rewardId, redemptionId });
        }
      }

      if (needed.length === 0) {
        this.logger.log("All vouchers already burned (idempotent retry)");
        return;
      }

      const holders = needed.map((n) => n.holder);
      const rewardIds = needed.map((n) => n.rewardId);
      const redemptionIds = needed.map((n) => n.redemptionId);

      const txHash = await this.chain.redeemVouchersBatch(holders, rewardIds, redemptionIds);
      this.logger.log(`Voucher burn batch submitted: ${txHash} (${needed.length} entries)`);

      await this.chain.waitForTransaction(txHash);
      this.logger.log(`Voucher burn batch confirmed: ${txHash}`);

      // Persist txHash to redemption rows
      await this.prisma.redemption.updateMany({
        where: { id: { in: redemptionIds } },
        data: { voucherBurnTxHash: txHash },
      });
    } catch (err: any) {
      this.logger.error(`Voucher burn batch failed: ${err?.message ?? err}`);
    }
  }
}
