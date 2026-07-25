import { MacroQuestService } from "./macro-quest.service";

const liveMacroQuest = (requiredVenues: number) => ({
  id: "mq1",
  name: "City Explorer",
  description: "Visit partner venues",
  requiredVenues,
  rewardType: "vip_pass",
  rewardDescription: "VIP pass",
  rewardTier: "high_value",
  startsAt: new Date("2026-07-01T00:00:00.000Z"),
  endsAt: new Date("2026-07-31T23:59:59.000Z"),
  venues: [
    { venueId: "v1", venue: { id: "v1", name: "A" } },
    { venueId: "v2", venue: { id: "v2", name: "B" } },
    { venueId: "v3", venue: { id: "v3", name: "C" } },
  ],
});

const makePrisma = (overrides: any) => ({
  macroQuest: { findFirst: jest.fn().mockResolvedValue(overrides.mq ?? null) },
  redemption: { findMany: jest.fn().mockResolvedValue(overrides.visited ?? []) },
  macroQuestCompletion: {
    findUnique: jest.fn().mockResolvedValue(overrides.existing ?? null),
    upsert: jest.fn().mockResolvedValue(overrides.upserted ?? { completedAt: new Date("2026-07-15T00:00:00.000Z") }),
  },
});

describe("MacroQuestService.progressForUser", () => {
  it("returns null when no macro-quest is live", async () => {
    const prisma = makePrisma({ mq: null }) as any;
    expect(await new MacroQuestService(prisma).progressForUser("me")).toBeNull();
  });

  it("derives visited venues and records the completion when the threshold is met", async () => {
    const prisma = makePrisma({
      mq: liveMacroQuest(2),
      visited: [{ venueId: "v1" }, { venueId: "v2" }],
    }) as any;
    const res = await new MacroQuestService(prisma).progressForUser("me");

    expect(res!.visitedCount).toBe(2);
    expect(res!.completed).toBe(true);
    expect(res!.completedAt).toBe("2026-07-15T00:00:00.000Z");
    expect(res!.venues).toEqual([
      { id: "v1", name: "A", visited: true },
      { id: "v2", name: "B", visited: true },
      { id: "v3", name: "C", visited: false },
    ]);
    expect(prisma.macroQuestCompletion.upsert).toHaveBeenCalled();
  });

  it("does not complete or record when below the threshold", async () => {
    const prisma = makePrisma({ mq: liveMacroQuest(3), visited: [{ venueId: "v1" }] }) as any;
    const res = await new MacroQuestService(prisma).progressForUser("me");

    expect(res!.visitedCount).toBe(1);
    expect(res!.completed).toBe(false);
    expect(res!.completedAt).toBeNull();
    expect(prisma.macroQuestCompletion.upsert).not.toHaveBeenCalled();
  });

  it("stays completed idempotently once recorded, without re-awarding", async () => {
    const prisma = makePrisma({
      mq: liveMacroQuest(2),
      visited: [], // even with no current visits, an existing completion is terminal
      existing: { completedAt: new Date("2026-07-10T00:00:00.000Z") },
    }) as any;
    const res = await new MacroQuestService(prisma).progressForUser("me");

    expect(res!.completed).toBe(true);
    expect(res!.completedAt).toBe("2026-07-10T00:00:00.000Z");
    expect(prisma.macroQuestCompletion.upsert).not.toHaveBeenCalled();
  });
});
