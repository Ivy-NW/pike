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
