import { Injectable, NotFoundException } from "@nestjs/common";
import type { FavoriteVenueItem } from "@pike/shared-types";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Phase 3 — FR-6: the venues this user has favorited, newest first. */
  async list(userId: string): Promise<FavoriteVenueItem[]> {
    const favorites = await this.prisma.favoriteVenue.findMany({
      where: { userId },
      include: { venue: { select: { id: true, name: true, venueType: true } } },
      orderBy: { createdAt: "desc" },
    });
    return favorites.map((f) => ({
      id: f.venue.id,
      name: f.venue.name,
      venueType: f.venue.venueType,
      favoritedAt: f.createdAt.toISOString(),
    }));
  }

  /** Idempotent — favoriting an already-favorited venue is a no-op (unique userId+venueId). */
  async add(userId: string, venueId: string): Promise<void> {
    const venue = await this.prisma.venue.findUnique({ where: { id: venueId }, select: { id: true } });
    if (!venue) throw new NotFoundException("Venue not found");
    await this.prisma.favoriteVenue.upsert({
      where: { userId_venueId: { userId, venueId } },
      update: {},
      create: { userId, venueId },
    });
  }

  /** Idempotent — unfavoriting a venue that isn't favorited is a no-op. */
  async remove(userId: string, venueId: string): Promise<void> {
    await this.prisma.favoriteVenue.deleteMany({ where: { userId, venueId } });
  }
}
