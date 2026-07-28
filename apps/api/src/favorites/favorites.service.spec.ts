import { NotFoundException } from "@nestjs/common";
import { FavoritesService } from "./favorites.service";

describe("FavoritesService", () => {
  it("lists favorited venues newest first, flattened to venue shape", async () => {
    const prisma = {
      favoriteVenue: {
        findMany: jest.fn().mockResolvedValue([
          { createdAt: new Date("2026-07-20T00:00:00.000Z"), venue: { id: "v1", name: "Aquarium", venueType: "aquarium" } },
        ]),
      },
    } as any;

    const res = await new FavoritesService(prisma).list("me");

    expect(res).toEqual([{ id: "v1", name: "Aquarium", venueType: "aquarium", favoritedAt: "2026-07-20T00:00:00.000Z" }]);
  });

  it("adds idempotently via upsert once the venue is confirmed to exist", async () => {
    const upsert = jest.fn().mockResolvedValue({});
    const prisma = {
      venue: { findUnique: jest.fn().mockResolvedValue({ id: "v1" }) },
      favoriteVenue: { upsert },
    } as any;

    await new FavoritesService(prisma).add("me", "v1");

    expect(upsert).toHaveBeenCalledWith({
      where: { userId_venueId: { userId: "me", venueId: "v1" } },
      update: {},
      create: { userId: "me", venueId: "v1" },
    });
  });

  it("rejects favoriting a venue that does not exist", async () => {
    const upsert = jest.fn();
    const prisma = {
      venue: { findUnique: jest.fn().mockResolvedValue(null) },
      favoriteVenue: { upsert },
    } as any;

    await expect(new FavoritesService(prisma).add("me", "ghost")).rejects.toBeInstanceOf(NotFoundException);
    expect(upsert).not.toHaveBeenCalled();
  });

  it("removes idempotently (deleteMany never errors on a missing favorite)", async () => {
    const deleteMany = jest.fn().mockResolvedValue({ count: 0 });
    const prisma = { favoriteVenue: { deleteMany } } as any;

    await new FavoritesService(prisma).remove("me", "v1");

    expect(deleteMany).toHaveBeenCalledWith({ where: { userId: "me", venueId: "v1" } });
  });
});
