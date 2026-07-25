import { AttestationHashService, type AttestationLeafInput } from "./attestation-hash.service";

describe("AttestationHashService", () => {
  const hashService = new AttestationHashService();

  const baseInput: AttestationLeafInput = {
    redemptionId: "11111111-1111-1111-1111-111111111111",
    markerId: "marker-1",
    venueId: "venue-1",
    questId: "quest-1",
    sessionId: "session-1",
    userAgent: "Mozilla/5.0 (test)",
    ipHash: "deadbeef",
    createdAt: new Date("2026-07-25T00:00:00.000Z"),
  };

  describe("computeLeafHash", () => {
    it("is deterministic for identical input", () => {
      const a = hashService.computeLeafHash(baseInput);
      const b = hashService.computeLeafHash({ ...baseInput });
      expect(a).toBe(b);
    });

    it("produces a 32-byte hex hash", () => {
      const hash = hashService.computeLeafHash(baseInput);
      expect(hash).toMatch(/^0x[0-9a-f]{64}$/);
    });

    it.each([
      ["redemptionId", { redemptionId: "other-id" }],
      ["markerId", { markerId: "other-marker" }],
      ["venueId", { venueId: "other-venue" }],
      ["questId", { questId: "other-quest" }],
      ["sessionId", { sessionId: "other-session" }],
      ["userAgent", { userAgent: "other-agent" }],
      ["ipHash", { ipHash: "other-hash" }],
      ["createdAt", { createdAt: new Date("2026-07-26T00:00:00.000Z") }],
    ])("changes when %s changes", (_field, patch) => {
      const changed = hashService.computeLeafHash({ ...baseInput, ...patch });
      const original = hashService.computeLeafHash(baseInput);
      expect(changed).not.toBe(original);
    });

    it("does not leak raw input substrings in the hash output", () => {
      const hash = hashService.computeLeafHash(baseInput);
      expect(hash).not.toContain("marker-1");
      expect(hash).not.toContain("deadbeef");
    });
  });

  describe("Merkle tree", () => {
    function leavesFor(count: number): `0x${string}`[] {
      return Array.from({ length: count }, (_, i) =>
        hashService.computeLeafHash({ ...baseInput, redemptionId: `id-${i}` }),
      );
    }

    it("verifies every real leaf against its batch root", () => {
      const leaves = leavesFor(4);
      const tree = hashService.buildMerkleTree(leaves);
      const root = hashService.getRoot(tree);

      for (const leaf of leaves) {
        const proof = hashService.getProof(tree, leaf);
        expect(hashService.verifyProof(leaf, proof, root)).toBe(true);
      }
    });

    it("rejects a tampered leaf", () => {
      const leaves = leavesFor(3);
      const tree = hashService.buildMerkleTree(leaves);
      const root = hashService.getRoot(tree);
      const proof = hashService.getProof(tree, leaves[0] as `0x${string}`);

      const tamperedLeaf = hashService.computeLeafHash({ ...baseInput, redemptionId: "tampered" });
      expect(hashService.verifyProof(tamperedLeaf, proof, root)).toBe(false);
    });

    it("rejects a tampered proof step", () => {
      const leaves = leavesFor(3);
      const tree = hashService.buildMerkleTree(leaves);
      const root = hashService.getRoot(tree);
      const proof = hashService.getProof(tree, leaves[0] as `0x${string}`);
      const tamperedProof = proof.map((step, idx) =>
        idx === 0 ? { ...step, data: hashService.computeLeafHash({ ...baseInput, redemptionId: "tampered" }) } : step,
      );

      expect(hashService.verifyProof(leaves[0] as `0x${string}`, tamperedProof, root)).toBe(false);
    });

    it("handles a single-leaf batch", () => {
      const [leaf] = leavesFor(1);
      const tree = hashService.buildMerkleTree([leaf as `0x${string}`]);
      const root = hashService.getRoot(tree);
      const proof = hashService.getProof(tree, leaf as `0x${string}`);
      expect(hashService.verifyProof(leaf as `0x${string}`, proof, root)).toBe(true);
    });

    it("throws when building a tree from an empty leaf set", () => {
      expect(() => hashService.buildMerkleTree([])).toThrow();
    });
  });
});
