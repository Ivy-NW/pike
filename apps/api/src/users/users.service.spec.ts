import { UsersService } from "./users.service";

describe("UsersService.deleteAccount", () => {
  it("anonymizes redemptions and deletes the user in one transaction", async () => {
    const updateMany = jest.fn().mockReturnValue("updateMany-op");
    const deleteMany = jest.fn();
    const del = jest.fn().mockReturnValue("delete-op");
    const $transaction = jest.fn().mockResolvedValue([]);
    const prisma = {
      redemption: { updateMany, deleteMany },
      user: { delete: del },
      $transaction,
    } as any;
    const service = new UsersService(prisma, {} as any);

    await service.deleteAccount("user-1");

    // De-identifies completion records (null userId) rather than deleting them...
    expect(updateMany).toHaveBeenCalledWith({ where: { userId: "user-1" }, data: { userId: null } });
    // ...so the FR-13 audit trail and on-chain attestation hashes survive account deletion.
    expect(deleteMany).not.toHaveBeenCalled();
    // Deletes the user (XP/streak inline, badges via cascade).
    expect(del).toHaveBeenCalledWith({ where: { id: "user-1" } });
    // Both operations run atomically in one transaction.
    expect($transaction).toHaveBeenCalledWith(["updateMany-op", "delete-op"]);
  });
});

describe("UsersService.wallet", () => {
  it("merges single-quest and macro-quest rewards, newest first", async () => {
    const prisma = {
      redemption: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: "r1",
            createdAt: new Date("2026-07-10T00:00:00.000Z"),
            quest: { id: "q1", name: "Find the Kraken", rewardType: "discount", rewardDescription: "10% off", expiresAt: null },
            marker: { venue: { id: "v1", name: "Aquarium" } },
          },
        ]),
      },
      macroQuestCompletion: {
        findMany: jest.fn().mockResolvedValue([
          {
            macroQuestId: "mq1",
            completedAt: new Date("2026-07-20T00:00:00.000Z"),
            macroQuest: { name: "Deep Dive", rewardType: "vip_pass", rewardTier: "high_value", rewardDescription: "VIP tour" },
          },
        ]),
      },
    } as any;
    const wallet = await new UsersService(prisma, {} as any).wallet("me");

    // Macro-quest completion (07-20) sorts ahead of the quest reward (07-10).
    expect(wallet.map((w) => w.kind)).toEqual(["macro-quest", "quest"]);
    expect(wallet[0]).toMatchObject({ kind: "macro-quest", macroQuestId: "mq1", rewardDescription: "VIP tour", isExpired: false });
    expect(wallet[1]).toMatchObject({ kind: "quest", redemptionId: "r1" });
  });
});
