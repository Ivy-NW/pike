import { AttestationVerifyService } from "./attestation-verify.service";
import { AttestationHashService } from "./attestation-hash.service";

describe("AttestationVerifyService", () => {
  const hash = new AttestationHashService();

  const leafInput = {
    redemptionId: "redemption-1",
    markerId: "marker-1",
    venueId: "venue-1",
    questId: "quest-1",
    sessionId: "session-1",
    userAgent: "ua",
    ipHash: "iphash",
    createdAt: new Date("2026-07-25T00:00:00.000Z"),
  };

  function buildFixture() {
    const ownLeaf = hash.computeLeafHash(leafInput);
    const otherLeaf = hash.computeLeafHash({ ...leafInput, redemptionId: "redemption-2" });
    const tree = hash.buildMerkleTree([ownLeaf, otherLeaf]);
    const root = hash.getRoot(tree);
    const proof = hash.getProof(tree, ownLeaf);

    const redemption = {
      id: leafInput.redemptionId,
      markerId: leafInput.markerId,
      venueId: leafInput.venueId,
      questId: leafInput.questId,
      sessionId: leafInput.sessionId,
      userAgent: leafInput.userAgent,
      ipHash: leafInput.ipHash,
      createdAt: leafInput.createdAt,
      attestationStatus: "confirmed",
      attestationHash: ownLeaf,
      merkleProof: proof,
      attestationBatch: { merkleRoot: root, txHash: "0xtx" },
    };

    return { redemption, root };
  }

  function makeService(redemption: unknown, onChainRoot: string) {
    const prisma = { redemption: { findUnique: jest.fn().mockResolvedValue(redemption) } };
    const chain = { readRootFromChain: jest.fn().mockResolvedValue(onChainRoot) };
    const service = new AttestationVerifyService(prisma as any, hash, chain as any);
    return { service, prisma, chain };
  }

  it("matches when hash, proof, and on-chain root are all consistent", async () => {
    const { redemption, root } = buildFixture();
    const { service } = makeService(redemption, root);

    const result = await service.verify(redemption.id);

    expect(result.match).toBe(true);
    expect(result.storedHash).toBe(result.recomputedHash);
    expect(result.onChainRoot).toBe(result.storedRoot);
  });

  it("does not match when the stored hash was tampered with (completion record altered)", async () => {
    const { redemption, root } = buildFixture();
    redemption.attestationHash = hash.computeLeafHash({ ...leafInput, redemptionId: "tampered" });
    const { service } = makeService(redemption, root);

    const result = await service.verify(redemption.id);

    expect(result.match).toBe(false);
    expect(result.storedHash).not.toBe(result.recomputedHash);
  });

  it("does not match when the on-chain root differs from Postgres's stored root (DB-level tampering)", async () => {
    const { redemption } = buildFixture();
    const decoyTree = hash.buildMerkleTree([
      hash.computeLeafHash({ ...leafInput, redemptionId: "x" }),
      hash.computeLeafHash({ ...leafInput, redemptionId: "y" }),
    ]);
    const differentRoot = hash.getRoot(decoyTree);
    const { service } = makeService(redemption, differentRoot);

    const result = await service.verify(redemption.id);

    expect(result.match).toBe(false);
    expect(result.onChainRoot).not.toBe(result.storedRoot);
  });

  it("returns match:null and skips the on-chain check when attestation isn't confirmed yet", async () => {
    const { redemption } = buildFixture();
    redemption.attestationStatus = "batched";
    const { service, chain } = makeService(redemption, "0xunused");

    const result = await service.verify(redemption.id);

    expect(result.match).toBeNull();
    expect(result.onChainRoot).toBeNull();
    expect(chain.readRootFromChain).not.toHaveBeenCalled();
  });

  it("throws NotFoundException when the redemption does not exist", async () => {
    const prisma = { redemption: { findUnique: jest.fn().mockResolvedValue(null) } };
    const chain = { readRootFromChain: jest.fn() };
    const service = new AttestationVerifyService(prisma as any, hash, chain as any);

    await expect(service.verify("missing-id")).rejects.toThrow();
  });
});
