import { Injectable } from "@nestjs/common";
import { keccak256, type Hex } from "viem";
import { MerkleTree } from "merkletreejs";

/** FR-A2: no PII or raw location — only marker/venue/quest ID, session signal, and timestamp. */
export interface AttestationLeafInput {
  redemptionId: string;
  markerId: string;
  venueId: string;
  questId: string;
  sessionId: string;
  userAgent: string;
  ipHash: string;
  createdAt: Date;
}

export interface MerkleProofStep {
  position: "left" | "right";
  data: Hex;
}

function keccakBuffer(data: Buffer): Buffer {
  return Buffer.from(keccak256(new Uint8Array(data), "bytes"));
}

function hexToBuffer(hex: Hex): Buffer {
  return Buffer.from(hex.slice(2), "hex");
}

function bufferToHex(buf: Buffer): Hex {
  return `0x${buf.toString("hex")}`;
}

@Injectable()
export class AttestationHashService {
  /**
   * The row's own id is included alongside FR-A2's listed fields purely to guarantee leaf
   * uniqueness rather than assume it (see PRD addendum decision on hash inputs) — it carries
   * no privacy-sensitive information beyond what's already in the redemption record.
   */
  computeLeafHash(input: AttestationLeafInput): Hex {
    const canonical = JSON.stringify({
      redemptionId: input.redemptionId,
      markerId: input.markerId,
      venueId: input.venueId,
      questId: input.questId,
      sessionId: input.sessionId,
      userAgent: input.userAgent,
      ipHash: input.ipHash,
      createdAt: input.createdAt.toISOString(),
    });
    return keccak256(new TextEncoder().encode(canonical));
  }

  /** OpenZeppelin-compatible convention (sortPairs) so proofs stay verifiable against a
   * standard on-chain MerkleProof.verify implementation if one is ever added. */
  buildMerkleTree(leafHexes: Hex[]): MerkleTree {
    if (leafHexes.length === 0) {
      throw new Error("Cannot build a Merkle tree from an empty leaf set");
    }
    const leaves = leafHexes.map(hexToBuffer);
    return new MerkleTree(leaves, keccakBuffer, { sortPairs: true });
  }

  getRoot(tree: MerkleTree): Hex {
    return bufferToHex(tree.getRoot());
  }

  getProof(tree: MerkleTree, leafHex: Hex): MerkleProofStep[] {
    return tree.getProof(hexToBuffer(leafHex)).map((step) => ({
      position: step.position,
      data: bufferToHex(step.data),
    }));
  }

  /** Verifies independently of any live tree instance — all that's needed is the leaf,
   * its stored proof, and the root to check against (what FR-A5 verification uses). */
  verifyProof(leafHex: Hex, proof: MerkleProofStep[], rootHex: Hex): boolean {
    const verifier = new MerkleTree([], keccakBuffer, { sortPairs: true });
    const proofBuffers = proof.map((step) => ({ position: step.position, data: hexToBuffer(step.data) }));
    return verifier.verify(proofBuffers, hexToBuffer(leafHex), hexToBuffer(rootHex));
  }
}
