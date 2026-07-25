import { AttestationBatchService } from "./attestation-batch.service";
import { AttestationHashService } from "./attestation-hash.service";

describe("AttestationBatchService", () => {
  const hash = new AttestationHashService();
  let prisma: any;
  let redis: any;
  let queue: any;
  let config: any;
  let chain: any;
  let service: AttestationBatchService;

  const leafInputFor = (id: string) => ({
    redemptionId: id,
    markerId: "marker-1",
    venueId: "venue-1",
    questId: "quest-1",
    sessionId: `session-${id}`,
    userAgent: "ua",
    ipHash: "iphash",
    createdAt: new Date("2026-07-25T00:00:00.000Z"),
  });

  const makeRedemption = (id: string) => ({
    id,
    markerId: "marker-1",
    venueId: "venue-1",
    questId: "quest-1",
    sessionId: `session-${id}`,
    userAgent: "ua",
    ipHash: "iphash",
    createdAt: new Date("2026-07-25T00:00:00.000Z"),
    attestationHash: hash.computeLeafHash(leafInputFor(id)),
  });

  beforeEach(() => {
    prisma = {
      attestationBatch: {
        create: jest.fn(),
        update: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        findMany: jest.fn(),
      },
      redemption: {
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        update: jest.fn((args: any) => Promise.resolve(args.data)),
        findMany: jest.fn(),
      },
      $transaction: jest.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
    };

    redis = {
      client: {
        set: jest.fn().mockResolvedValue("OK"),
        eval: jest.fn().mockResolvedValue(1),
      },
    };

    queue = { dequeueBatch: jest.fn(), enqueue: jest.fn() };
    config = { getConfig: jest.fn().mockResolvedValue({ batchWindowMs: 300_000, batchCountThreshold: 10, maxRetries: 3 }) };
    chain = { submitRoot: jest.fn(), getReceipt: jest.fn(), chainIdForBatch: 43113 };

    service = new AttestationBatchService(prisma, redis, queue, config, hash, chain);
  });

  it("runs a full successful cycle: drains, persists membership, submits once, confirms, backfills proofs", async () => {
    const members = [makeRedemption("id-1"), makeRedemption("id-2")];
    queue.dequeueBatch.mockResolvedValue(members.map((m) => m.id));

    let storedBatch: any;
    prisma.attestationBatch.create.mockImplementation((args: any) => {
      storedBatch = { ...args.data, retryCount: 0 };
      return Promise.resolve(storedBatch);
    });
    prisma.attestationBatch.update.mockImplementation((args: any) => {
      storedBatch = { ...storedBatch, ...args.data };
      return Promise.resolve(storedBatch);
    });
    prisma.attestationBatch.findUniqueOrThrow.mockImplementation(() => Promise.resolve(storedBatch));
    prisma.redemption.findMany.mockResolvedValue(members);

    chain.submitRoot.mockResolvedValue("0xnewtx");
    chain.getReceipt.mockResolvedValue({ gasUsed: 21_000n, effectiveGasPrice: 25_000_000_000n });

    await service.runBatchCycle("count");

    expect(chain.submitRoot).toHaveBeenCalledTimes(1);
    expect(storedBatch.status).toBe("confirmed");
    expect(storedBatch.merkleRoot).toMatch(/^0x[0-9a-f]{64}$/);

    const proofUpdates = prisma.redemption.update.mock.calls.map(([args]: any) => args);
    expect(proofUpdates).toHaveLength(2);
    for (const call of proofUpdates) {
      expect(call.data.attestationStatus).toBe("confirmed");
      expect(call.data.merkleProof).toBeDefined();
    }
  });

  it("marks the batch failed and increments retryCount when the chain submit throws, without confirming members", async () => {
    const members = [makeRedemption("id-1")];
    queue.dequeueBatch.mockResolvedValue(members.map((m) => m.id));

    let storedBatch: any;
    prisma.attestationBatch.create.mockImplementation((args: any) => {
      storedBatch = { ...args.data, retryCount: 0 };
      return Promise.resolve(storedBatch);
    });
    prisma.attestationBatch.update.mockImplementation((args: any) => {
      const data = { ...args.data };
      if (data.retryCount && typeof data.retryCount === "object" && "increment" in data.retryCount) {
        data.retryCount = storedBatch.retryCount + data.retryCount.increment;
      }
      storedBatch = { ...storedBatch, ...data };
      return Promise.resolve(storedBatch);
    });
    prisma.attestationBatch.findUniqueOrThrow.mockImplementation(() => Promise.resolve(storedBatch));
    prisma.redemption.findMany.mockResolvedValue(members);

    chain.submitRoot.mockRejectedValue(new Error("RPC unreachable"));

    await service.runBatchCycle("count");

    expect(storedBatch.status).toBe("failed");
    expect(storedBatch.retryCount).toBe(1);
    expect(prisma.redemption.update).not.toHaveBeenCalled();
    // Below maxRetries (3) — the individual completion records stay "batched", not "failed",
    // so a single transient RPC hiccup doesn't make a reviewer think a record is stuck.
    expect(prisma.redemption.updateMany).not.toHaveBeenCalledWith(
      expect.objectContaining({ data: { attestationStatus: "failed" } }),
    );
  });

  it("retryFailedBatches polls for a receipt instead of resubmitting when txHash already exists", async () => {
    const members = [makeRedemption("id-1")];
    const existingBatch = {
      id: "batch-1",
      txHash: "0xexisting",
      status: "failed",
      retryCount: 1,
      updatedAt: new Date(Date.now() - 10 * 60_000),
      merkleRoot: null,
    };

    prisma.attestationBatch.findMany.mockResolvedValue([existingBatch]);
    prisma.attestationBatch.findUniqueOrThrow.mockResolvedValue(existingBatch);
    prisma.redemption.findMany.mockResolvedValue(members);
    prisma.attestationBatch.update.mockImplementation((args: any) => Promise.resolve({ ...existingBatch, ...args.data }));

    chain.getReceipt.mockResolvedValue({ gasUsed: 21_000n, effectiveGasPrice: 25_000_000_000n });

    await service.retryFailedBatches();

    expect(chain.submitRoot).not.toHaveBeenCalled();
    expect(chain.getReceipt).toHaveBeenCalledWith("0xexisting");
  });

  it("does nothing when the queue is empty (no-op, not an error)", async () => {
    queue.dequeueBatch.mockResolvedValue([]);

    await expect(service.runBatchCycle("time")).resolves.toBeUndefined();
    expect(prisma.attestationBatch.create).not.toHaveBeenCalled();
    expect(chain.submitRoot).not.toHaveBeenCalled();
  });
});
