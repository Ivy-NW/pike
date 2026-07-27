import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { ConsumerAuthGuard } from "../auth/guards/consumer-auth.guard";
import { MacroQuestService } from "./macro-quest.service";

@Controller("users/me")
export class MacroQuestController {
  constructor(private readonly macroQuest: MacroQuestService) {}

  /** Phase 3 — FR-5: the live macro-quest + this user's progress (null if none is live). */
  @Get("macro-quest")
  @UseGuards(ConsumerAuthGuard)
  async myMacroQuest(@Req() req: any) {
    return this.macroQuest.progressForUser(req.userId);
  }
}
