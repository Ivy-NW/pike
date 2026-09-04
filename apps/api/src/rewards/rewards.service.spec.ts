import { RewardsService } from "./rewards.service";

const quest = (over: Record<string, any> = {}) => ({
  id: "q1",
  name: "Happy Hour Hunt",
  status: "live",
  venueId: "v1",
  venue: { id: "v1", name: "Asili" },
  rewardType: "discount",
  rewardTier: "low_stakes",
  rewardDescription: "Free martini",
  maxRedemptionsPerDay: 50,
  expiresAt: null,
  ...over,
});

const makePrisma = (quests: any[], grouped: any[] = []) =>
  ({
    quest: { findMany: jest.fn().mockResolvedValue(quests) },
    redemption: { groupBy: jest.fn().mockResolvedValue(grouped) },
  }) as any;

describe("RewardsService", () => {
  it("returns an empty inventory without touching redemptions or Redis", async () => {
    const prisma = makePrisma([]);
    const caps = { currentCount: jest.fn() } as any;

    const res = await new RewardsService(prisma, caps).listForBusiness("b1");

    expect(res.rewards).toEqual([]);
    expect(res.summary).toEqual({ totalRewards: 0, liveRewards: 0, redeemedToday: 0, capToday: 0, totalClaimed: 0 });
    expect(prisma.redemption.groupBy).not.toHaveBeenCalled();
    expect(caps.currentCount).not.toHaveBeenCalled();
  });

  it("folds grouped status counts into per-reward totals", async () => {
    const prisma = makePrisma(
      [quest()],
      [
        { questId: "q1", status: "claimed", _count: { _all: 7 } },
        { questId: "q1", status: "flagged", _count: { _all: 2 } },
        { questId: "q1", status: "rejected", _count: { _all: 1 } },
      ],
    );
    const caps = { currentCount: jest.fn().mockResolvedValue(4) } as any;

    const { rewards } = await new RewardsService(prisma, caps).listForBusiness("b1");

    expect(rewards[0]!).toMatchObject({
      questId: "q1",
      venueName: "Asili",
      claimed: 7,
      flagged: 2,
      rejected: 1,
      totalRedemptions: 10,
      redeemedToday: 4,
      capRemainingToday: 46,
    });
  });

  it("scopes the query to the caller's business and reads the cap counter per venue+quest", async () => {
    const prisma = makePrisma([quest()]);
    const caps = { currentCount: jest.fn().mockResolvedValue(0) } as any;

    await new RewardsService(prisma, caps).listForBusiness("b1");

    expect(prisma.quest.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { venue: { businessId: "b1" } } }),
    );
    expect(caps.currentCount).toHaveBeenCalledWith("v1", "q1");
  });

  it("degrades today's counts to null instead of failing when Redis is unreachable", async () => {
    const prisma = makePrisma([quest()], [{ questId: "q1", status: "claimed", _count: { _all: 3 } }]);
    const caps = { currentCount: jest.fn().mockRejectedValue(new Error("ECONNREFUSED")) } as any;

    const res = await new RewardsService(prisma, caps).listForBusiness("b1");

    expect(res.rewards[0]!.redeemedToday).toBeNull();
    expect(res.rewards[0]!.capRemainingToday).toBeNull();
    expect(res.summary.redeemedToday).toBeNull();
    // Postgres-derived numbers survive a dead cache.
    expect(res.rewards[0]!.claimed).toBe(3);
    expect(res.summary.totalClaimed).toBe(3);
  });

  it("counts only live rewards toward today's cap headroom, but all of them toward usage", async () => {
    const prisma = makePrisma([
      quest({ id: "q1", status: "live", maxRedemptionsPerDay: 50 }),
      quest({ id: "q2", status: "paused", maxRedemptionsPerDay: 25 }),
      quest({ id: "q3", status: "draft", maxRedemptionsPerDay: 10 }),
    ]);
    // q2 was paused at noon, having already burned 6 of today's redemptions.
    const caps = { currentCount: jest.fn().mockResolvedValueOnce(4).mockResolvedValueOnce(6).mockResolvedValueOnce(0) } as any;

    const { summary } = await new RewardsService(prisma, caps).listForBusiness("b1");

    expect(summary).toEqual({
      totalRewards: 3,
      liveRewards: 1,
      redeemedToday: 10,
      capToday: 50,
      totalClaimed: 0,
    });
  });

  it("marks a past expiry as expired and serializes the date", async () => {
    const prisma = makePrisma([quest({ expiresAt: new Date("2020-01-01T00:00:00.000Z") })]);
    const caps = { currentCount: jest.fn().mockResolvedValue(0) } as any;

    const { rewards } = await new RewardsService(prisma, caps).listForBusiness("b1");

    expect(rewards[0]!.expired).toBe(true);
    expect(rewards[0]!.expiresAt).toBe("2020-01-01T00:00:00.000Z");
  });
});
