import { Controller, Delete, Get, HttpCode, Param, Put, Req, UseGuards } from "@nestjs/common";
import { ConsumerAuthGuard } from "../auth/guards/consumer-auth.guard";
import { FavoritesService } from "./favorites.service";

/** Phase 3 — FR-6: a consumer's favorited venues (drives the Profile list + future push triggers). */
@Controller("users/me/favorites")
@UseGuards(ConsumerAuthGuard)
export class FavoritesController {
  constructor(private readonly favorites: FavoritesService) {}

  @Get()
  async list(@Req() req: any) {
    return this.favorites.list(req.userId);
  }

  @Put(":venueId")
  @HttpCode(204)
  async add(@Req() req: any, @Param("venueId") venueId: string) {
    await this.favorites.add(req.userId, venueId);
  }

  @Delete(":venueId")
  @HttpCode(204)
  async remove(@Req() req: any, @Param("venueId") venueId: string) {
    await this.favorites.remove(req.userId, venueId);
  }
}
