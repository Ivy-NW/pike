import { randomUUID } from "node:crypto";
import { Injectable, Logger } from "@nestjs/common";
import type { Prisma, Redemption } from "@prisma/client";
import type { Hex } from "viem";
import { PrismaService } from "../prisma/prisma.service";
import { RedisService } from "../redis/redis.service";
import { AttestationQueueService } from "./attestation-queue.service";
import { AttestationConfigService } from "./attestation-config.service";
import { AttestationHashService, type MerkleProofStep } from "./attestation-hash.service";
import { AttestationChainService } from "./attestation-chain.service";

const LOCK_KEY = "attestation:batch:lock";
const LOCK_TTL_MS = 5 * 60_000;
const RELEASE_LOCK_SCRIPT = `
  if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
  else
    return 0
  end
`;

interface BatchProof {
  redemptionId: string;
  leafIndex: number;
  proof: MerkleProofStep[];
}

/**
 * Orchestrates one batch cycle: drain -> persist membership durably -> build Merkle tree ->
 * submit root on-chain -> confirm -> backfill proofs. FR-A6's core guarantee — never lose a
 * queued hash, never block the core redemption flow, never double-submit on retry — comes
 * from persisting batch membership to Postgres *before* any chain call (step 3 below), and
 * from always deriving the tree deterministically from that membership (`ORDER BY id ASC`)
 * so a retry rebuilds the identical root rather than a different one.
 */
@Injectable()
export class AttestationBatchService {
  private readonly logger = new Logger(AttestationBatchService.name);
  private running = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly queue: AttestationQueueService,
    private readonly config: AttestationConfigService,
    private readonly hash: AttestationHashService,
    private readonly chain: AttestationChainService,
  ) {}

  async runBatchCycle(trigger: "count" | "time"): Promise<void> {
    if (this.running) return;

    const lockToken = randomUUID();
    const acquired = await this.redis.client.set(LOCK_KEY, lockToken, "PX", LOCK_TTL_MS, "NX");
    if (!acquired) return;

    this.running = true;
    try {
      const cfg = await this.config.getConfig();
      const ids = await this.queue.dequeueBatch(cfg.batchCountThreshold);
      if (ids.length === 0) return;

      this.logger.log(`Draining ${ids.length} completion(s) into a new attestation batch (trigger=${trigger})`);
      const batchId = randomUUID();
      const now = new Date();

      await this.prisma.$transaction([
        this.prisma.attestationBatch.create({
          data: { id: batchId, itemCount: ids.length, windowStartAt: now, windowEndAt: now },
        }),
        this.prisma.redemption.updateMany({
          where: { id: { in: ids } },
          data: { attestationBatchId: batchId, attestationStatus: "batched" },
        }),
      ]);

      await this.buildAndSubmit(batchId);
    } finally {
      await this.releaseLock(lockToken);
      this.running = false;
    }
  }

  /** ~5 min cron. If a batch's tx was already submitted, this polls for its receipt again
   * before ever rebuilding/resubmitting — the original tx may simply not have confirmed yet. */
  async retryFailedBatches(): Promise<void> {
    const cfg = await this.config.getConfig();
    const candidates = await this.prisma.attestationBatch.findMany({
      where: { status: "failed", retryCount: { lt: cfg.maxRetries } },
    });

    for (const batch of candidates) {
      const backoffMs = Math.min(2 ** batch.retryCount, 64) * 60_000;
      if (Date.now() - batch.updatedAt.getTime() < backoffMs) continue;

      this.logger.log(`Retrying attestation batch ${batch.id} (attempt ${batch.retryCount + 1}/${cfg.maxRetries})`);
      await this.buildAndSubmit(batch.id);
    }
  }

  /** ~10 min cron. Safety net for the rare case a Redis RPUSH silently failed after the hash
   * was already durably written to Postgres — re-enqueues anything that fell through. */
  async reconciliationSweep(): Promise<void> {
    const cutoff = new Date(Date.now() - 5 * 60_000);
    const orphaned = await this.prisma.redemption.findMany({
      where: { attestationHash: { not: null }, attestationBatchId: null, createdAt: { lt: cutoff } },
      select: { id: true },
      take: 1000,
    });
    if (orphaned.length === 0) return;

    this.logger.warn(`Reconciliation sweep re-enqueuing ${orphaned.length} redemption(s) dropped from the attestation queue`);
    for (const { id } of orphaned) {
      await this.queue.enqueue(id);
    }
  }

  private async buildAndSubmit(batchId: string): Promise<void> {
    const batch = await this.prisma.attestationBatch.findUniqueOrThrow({ where: { id: batchId } });
    const members = await this.prisma.redemption.findMany({
      where: { attestationBatchId: batchId },
      orderBy: { id: "asc" },
    });

    try {
      const { root, proofs } = this.buildTree(members);
      let txHash = batch.txHash as Hex | null;

      if (!txHash) {
        await this.prisma.attestationBatch.update({
          where: { id: batchId },
          data: { merkleRoot: root, status: "submitting" },
        });
        txHash = await this.chain.submitRoot(root, members.length);
        await this.prisma.attestationBatch.update({
          where: { id: batchId },
          data: { txHash, chainId: this.chain.chainIdForBatch, submittedAt: new Date() },
        });
      }

      const receipt = await this.chain.getReceipt(txHash);
      await this.finalizeConfirmedBatch(batchId, receipt, proofs);
    } catch (err) {
      await this.markBatchFailed(batchId, err as Error);
    }
  }

  private buildTree(members: Redemption[]): { root: Hex; proofs: BatchProof[] } {
    const leaves = members.map((member) => {
      if (!member.attestationHash) {
        throw new Error(`Redemption ${member.id} is missing its attestationHash — cannot attest`);
      }
      return member.attestationHash as Hex;
    });

    const tree = this.hash.buildMerkleTree(leaves);
    const root = this.hash.getRoot(tree);
    const proofs = members.map((member, leafIndex) => ({
      redemptionId: member.id,
      leafIndex,
      proof: this.hash.getProof(tree, leaves[leafIndex] as Hex),
    }));

    return { root, proofs };
  }

  private async finalizeConfirmedBatch(
    batchId: string,
    receipt: { gasUsed: bigint; effectiveGasPrice: bigint },
    proofs: BatchProof[],
  ): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.attestationBatch.update({
        where: { id: batchId },
        data: {
          status: "confirmed",
          confirmedAt: new Date(),
          gasUsed: receipt.gasUsed,
          gasCostWei: receipt.gasUsed * receipt.effectiveGasPrice,
        },
      }),
      ...proofs.map(({ redemptionId, proof, leafIndex }) =>
        this.prisma.redemption.update({
          where: { id: redemptionId },
          data: {
            attestationStatus: "confirmed",
            merkleProof: proof as unknown as Prisma.InputJsonValue,
            merkleLeafIndex: leafIndex,
          },
        }),
      ),
    ]);
  }

  private async markBatchFailed(batchId: string, err: Error): Promise<void> {
    this.logger.error(`Attestation batch ${batchId} failed: ${err.message}`);
    const cfg = await this.config.getConfig();
    const updated = await this.prisma.attestationBatch.update({
      where: { id: batchId },
      data: { status: "failed", retryCount: { increment: 1 }, lastError: err.message },
    });

    // Only surface as "failed" on the completion record once retries are exhausted — a
    // single transient RPC hiccup shouldn't make a fraud reviewer think a record is stuck.
    if (updated.retryCount >= cfg.maxRetries) {
      await this.prisma.redemption.updateMany({
        where: { attestationBatchId: batchId },
        data: { attestationStatus: "failed" },
      });
    }
  }

  private async releaseLock(token: string): Promise<void> {
    await this.redis.client.eval(RELEASE_LOCK_SCRIPT, 1, LOCK_KEY, token);
  }
}
