import { Controller, Get, Param, Req, UseGuards } from "@nestjs/common";
import { ConsumerAuthGuard } from "../auth/guards/consumer-auth.guard";
import { LeaderboardService } from "./leaderboard.service";

/** Phase 3 — FR-7: reputational leaderboards. Authenticated so each response can mark the caller's own row. */
@Controller("leaderboard")
export class LeaderboardController {
  constructor(private readonly leaderboard: LeaderboardService) {}

  @Get("global")
  @UseGuards(ConsumerAuthGuard)
  async global(@Req() req: any) {
    return this.leaderboard.global(req.userId);
  }

  @Get("venue/:venueId")
  @UseGuards(ConsumerAuthGuard)
  async venue(@Req() req: any, @Param("venueId") venueId: string) {
    return this.leaderboard.venue(req.userId, venueId);
  }
}
