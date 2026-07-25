import { Injectable, NotFoundException } from "@nestjs/common";
import type { Hex } from "viem";
import { PrismaService } from "../prisma/prisma.service";
import { AttestationHashService, type MerkleProofStep } from "./attestation-hash.service";
import { AttestationChainService } from "./attestation-chain.service";

export interface VerificationResult {
  redemptionId: string;
  status: string;
  storedHash: string | null;
  recomputedHash: string | null;
  merkleProof: MerkleProofStep[] | null;
  storedRoot: string | null;
  onChainRoot: string | null;
  txHash: string | null;
  match: boolean | null;
  checkedAt: string;
}

/**
 * FR-A5: the concrete answer to "who owns fraud review" — gives a reviewer a pass/fail check
 * against the chain instead of a database they just have to trust. Three independent checks,
 * each catching a different layer of possible tampering:
 *   1. recomputed hash vs stored hash   -> was the completion record itself altered?
 *   2. stored proof vs stored root      -> was the proof altered?
 *   3. stored root vs live on-chain root -> was Postgres's own copy of the root altered?
 */
@Injectable()
export class AttestationVerifyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hash: AttestationHashService,
    private readonly chain: AttestationChainService,
  ) {}

  async verify(redemptionId: string): Promise<VerificationResult> {
    const redemption = await this.prisma.redemption.findUnique({
      where: { id: redemptionId },
      include: { attestationBatch: true },
    });
    if (!redemption) throw new NotFoundException("Redemption not found");

    const checkedAt = new Date().toISOString();

    if (redemption.attestationStatus !== "confirmed" || !redemption.attestationBatch) {
      return {
        redemptionId,
        status: redemption.attestationStatus,
        storedHash: redemption.attestationHash,
        recomputedHash: null,
        merkleProof: null,
        storedRoot: null,
        onChainRoot: null,
        txHash: null,
        match: null,
        checkedAt,
      };
    }

    const batch = redemption.attestationBatch;
    const storedHash = redemption.attestationHash as Hex;
    const recomputedHash = this.hash.computeLeafHash({
      redemptionId: redemption.id,
      markerId: redemption.markerId,
      venueId: redemption.venueId,
      questId: redemption.questId,
      sessionId: redemption.sessionId,
      userAgent: redemption.userAgent,
      ipHash: redemption.ipHash,
      createdAt: redemption.createdAt,
    });

    const storedRoot = batch.merkleRoot as Hex;
    const proof = redemption.merkleProof as unknown as MerkleProofStep[];
    const onChainRoot = batch.txHash ? await this.chain.readRootFromChain(batch.txHash as Hex) : null;

    const hashMatches = recomputedHash === storedHash;
    const proofMatches = Boolean(proof) && this.hash.verifyProof(storedHash, proof, storedRoot);
    const rootMatches = onChainRoot !== null && onChainRoot === storedRoot;

    return {
      redemptionId,
      status: redemption.attestationStatus,
      storedHash,
      recomputedHash,
      merkleProof: proof ?? null,
      storedRoot,
      onChainRoot,
      txHash: batch.txHash,
      match: hashMatches && proofMatches && rootMatches,
      checkedAt,
    };
  }
}
