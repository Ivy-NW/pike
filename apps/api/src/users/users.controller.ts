import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { ConsumerAuthGuard } from "../auth/guards/consumer-auth.guard";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly users: UsersService) {}

  /** Identity + FR-2's XP/level/streak/badges (Phase 2). */
  @Get("me")
  @UseGuards(ConsumerAuthGuard)
  async me(@Req() req: any) {
    return this.users.profile(req.userId);
  }

  /** FR-3: reward wallet — every reward claimed across every WebAR quest this user has done. */
  @Get("me/wallet")
  @UseGuards(ConsumerAuthGuard)
  async wallet(@Req() req: any) {
    return this.users.wallet(req.userId);
  }

  @Get("me/quests")
  @UseGuards(ConsumerAuthGuard)
  async quests(@Req() req: any) {
    return this.users.questList(req.userId);
  }
}
