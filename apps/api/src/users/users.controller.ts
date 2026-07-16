import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { ConsumerAuthGuard } from "../auth/guards/consumer-auth.guard";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get("me")
  @UseGuards(ConsumerAuthGuard)
  async me(@Req() req: any) {
    return this.users.findOrCreateByFirebase(req.consumer);
  }

  /** FR-3: reward wallet — every reward claimed across every WebAR quest this user has done. */
  @Get("me/wallet")
  @UseGuards(ConsumerAuthGuard)
  async wallet(@Req() req: any) {
    const user = await this.users.findOrCreateByFirebase(req.consumer);
    return this.users.wallet(user.id);
  }

  @Get("me/quests")
  @UseGuards(ConsumerAuthGuard)
  async quests(@Req() req: any) {
    const user = await this.users.findOrCreateByFirebase(req.consumer);
    return this.users.questList(user.id);
  }
}
