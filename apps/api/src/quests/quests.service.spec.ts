import { ForbiddenException } from "@nestjs/common";
import { QuestsService } from "./quests.service";

const makeService = (quest: any, update = jest.fn().mockResolvedValue({})) => {
  const prisma = {
    quest: { findUnique: jest.fn().mockResolvedValue(quest), update },
  } as any;
  const notifications = { notifyNewQuestAtVenue: jest.fn().mockResolvedValue(undefined) } as any;
  const service = new QuestsService(prisma, {} as any, notifications);
  return { service, prisma, update, notifications };
};

const owned = (over: Record<string, any> = {}) => ({
  id: "q1",
  venueId: "v1",
  status: "live",
  venue: { businessId: "b1", name: "Asili" },
  markers: [{ status: "ready" }],
  ...over,
});

describe("QuestsService reward management", () => {
  describe("update", () => {
    it("writes only the fields present in the payload", async () => {
      const { service, update } = makeService(owned());

      await service.update("q1", "b1", { maxRedemptionsPerDay: 25 });

      expect(update).toHaveBeenCalledWith({ where: { id: "q1" }, data: { maxRedemptionsPerDay: 25 } });
    });

    it("treats an explicit null expiry as 'clear it', not as absent", async () => {
      const { service, update } = makeService(owned());

      await service.update("q1", "b1", { expiresAt: null });

      expect(update).toHaveBeenCalledWith({ where: { id: "q1" }, data: { expiresAt: null } });
    });

    it("parses an ISO expiry into a Date", async () => {
      const { service, update } = makeService(owned());

      await service.update("q1", "b1", { expiresAt: "2026-12-31T23:59:00.000Z" });

      expect(update).toHaveBeenCalledWith({
        where: { id: "q1" },
        data: { expiresAt: new Date("2026-12-31T23:59:00.000Z") },
      });
    });

    it("refuses to edit a quest belonging to another business", async () => {
      const { service, update } = makeService(owned({ venue: { businessId: "someone-else" } }));

      await expect(service.update("q1", "b1", { rewardDescription: "Free drinks" })).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      expect(update).not.toHaveBeenCalled();
    });
  });

  describe("pause", () => {
    it("moves a live quest to paused", async () => {
      const { service, update } = makeService(owned({ status: "live" }));

      await service.pause("q1", "b1");

      expect(update).toHaveBeenCalledWith({ where: { id: "q1" }, data: { status: "paused" } });
    });

    it("rejects pausing a quest that was never live", async () => {
      const { service, update } = makeService(owned({ status: "draft" }));

      await expect(service.pause("q1", "b1")).rejects.toBeInstanceOf(ForbiddenException);
      expect(update).not.toHaveBeenCalled();
    });
  });

  describe("resume", () => {
    it("moves a paused quest back to live", async () => {
      const { service, update } = makeService(owned({ status: "paused" }));

      await service.resume("q1", "b1");

      expect(update).toHaveBeenCalledWith({ where: { id: "q1" }, data: { status: "live" } });
    });

    it("does not re-notify favoriters — a resume is not a new quest", async () => {
      const { service, notifications } = makeService(owned({ status: "paused" }));

      await service.resume("q1", "b1");

      expect(notifications.notifyNewQuestAtVenue).not.toHaveBeenCalled();
    });

    it("refuses to resume without a compiled marker, matching the publish gate", async () => {
      const { service, update } = makeService(owned({ status: "paused", markers: [{ status: "pending_compile" }] }));

      await expect(service.resume("q1", "b1")).rejects.toBeInstanceOf(ForbiddenException);
      expect(update).not.toHaveBeenCalled();
    });

    it("rejects resuming a quest that is already live", async () => {
      const { service, update } = makeService(owned({ status: "live" }));

      await expect(service.resume("q1", "b1")).rejects.toBeInstanceOf(ForbiddenException);
      expect(update).not.toHaveBeenCalled();
    });
  });
});
