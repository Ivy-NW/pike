import { LeaderboardService } from "./leaderboard.service";

const gamification = { levelInfo: (xp: number) => ({ level: Math.floor(xp / 100) + 1, xpIntoLevel: 0, xpForNextLevel: 100 }) } as any;

describe("LeaderboardService", () => {
  describe("global", () => {
    it("ranks the top users by XP and flags the caller's row", async () => {
      const prisma = {
        user: {
          findMany: jest.fn().mockResolvedValue([
            { id: "u1", username: "alice", xp: 300 },
            { id: "me", username: "bob", xp: 150 },
          ]),
        },
      } as any;
      const service = new LeaderboardService(prisma, gamification);

      const res = await service.global("me");

      expect(res.scope).toBe("global");
      expect(res.entries.map((e) => [e.rank, e.userId, e.score])).toEqual([
        [1, "u1", 300],
        [2, "me", 150],
      ]);
      expect(res.entries[1]!.isMe).toBe(true);
      expect(res.entries[1]!.level).toBe(2); // 150 XP -> level 2
      // Caller was in the top-N, so `me` mirrors that row without an extra lookup.
      expect(res.me?.rank).toBe(2);
    });

    it("computes the caller's standing when they fall outside the top-N", async () => {
      const prisma = {
        user: {
          findMany: jest.fn().mockResolvedValue([{ id: "u1", username: "alice", xp: 900 }]),
          findUnique: jest.fn().mockResolvedValue({ username: "bob", xp: 40 }),
          count: jest.fn().mockResolvedValue(7), // 7 users strictly ahead
        },
      } as any;
      const service = new LeaderboardService(prisma, gamification);

      const res = await service.global("me");

      expect(res.entries.find((e) => e.isMe)).toBeUndefined();
      expect(res.me).toMatchObject({ rank: 8, userId: "me", score: 40, isMe: true });
    });
  });

  describe("venue", () => {
    it("ranks users by completion count regardless of groupBy order", async () => {
      const prisma = {
        redemption: {
          groupBy: jest.fn().mockResolvedValue([
            { userId: "me", _count: { _all: 1 } },
            { userId: "u1", _count: { _all: 5 } },
            { userId: "u2", _count: { _all: 3 } },
          ]),
        },
        user: {
          findMany: jest.fn().mockResolvedValue([
            { id: "me", username: "bob", xp: 100 },
            { id: "u1", username: "alice", xp: 500 },
            { id: "u2", username: "carol", xp: 250 },
          ]),
        },
      } as any;
      const service = new LeaderboardService(prisma, gamification);

      const res = await service.venue("me", "venue-1");

      expect(res.scope).toBe("venue");
      expect(res.venueId).toBe("venue-1");
      // Sorted by completion count desc, with sequential ranks.
      expect(res.entries.map((e) => [e.rank, e.userId, e.score])).toEqual([
        [1, "u1", 5],
        [2, "u2", 3],
        [3, "me", 1],
      ]);
      expect(res.me).toMatchObject({ rank: 3, userId: "me", score: 1, isMe: true });
    });
  });
});
