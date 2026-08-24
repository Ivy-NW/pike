// Mock expo-server-sdk before importing the service
jest.mock("expo-server-sdk", () => {
  return {
    Expo: jest.fn().mockImplementation(() => ({
      chunkPushNotifications: jest.fn((messages) => [messages]),
      sendPushNotificationsAsync: jest.fn().mockResolvedValue([]),
    })),
    ExpoPushMessage: {},
    ExpoPushTicket: {},
  };
});

import { NotificationsService } from "./notifications.service";

// Config with no VAPID keys -> web push disabled (stub/log mode), which is what we unit-test.
const stubConfig = { get: () => undefined } as any;

describe("NotificationsService", () => {
  it("registers a device token via upsert (unique token reassigns owner)", async () => {
    const upsert = jest.fn().mockResolvedValue({});
    const svc = new NotificationsService({ pushToken: { upsert } } as any, stubConfig);

    await svc.registerToken("me", "expo-tok-1");

    expect(upsert).toHaveBeenCalledWith({
      where: { token: "expo-tok-1" },
      update: { userId: "me" },
      create: { userId: "me", token: "expo-tok-1" },
    });
  });

  it("send is a no-op when the user has no registered devices", async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const svc = new NotificationsService({ pushToken: { findMany } } as any, stubConfig);

    await expect(svc.send("me", { title: "t", body: "b" })).resolves.toBeUndefined();
  });

  it("notifies every favoriter of a venue when a new quest publishes", async () => {
    const favFindMany = jest.fn().mockResolvedValue([{ userId: "u1" }, { userId: "u2" }]);
    const tokenFindMany = jest.fn().mockResolvedValue([]); // send() resolves tokens per user
    const svc = new NotificationsService(
      { favoriteVenue: { findMany: favFindMany }, pushToken: { findMany: tokenFindMany } } as any,
      stubConfig,
    );

    await svc.notifyNewQuestAtVenue("v1", "Aquarium", "Find the Kraken");

    expect(favFindMany).toHaveBeenCalledWith({ where: { venueId: "v1" }, select: { userId: true } });
    expect(tokenFindMany).toHaveBeenCalledTimes(2); // one send() per favoriter
  });

  it("selects streak-at-risk users by UTC day boundaries (completed yesterday, not today)", async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const svc = new NotificationsService({ user: { findMany } } as any, stubConfig);

    await svc.findUsersWithStreakAtRisk(new Date("2026-07-27T15:30:00.000Z"));

    expect(findMany).toHaveBeenCalledWith({
      where: {
        currentStreak: { gt: 0 },
        lastQuestCompletedAt: {
          gte: new Date("2026-07-26T00:00:00.000Z"),
          lt: new Date("2026-07-27T00:00:00.000Z"),
        },
      },
      select: { id: true, currentStreak: true },
    });
  });
});
