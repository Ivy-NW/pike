import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { BusinessAuthGuard } from "../auth/guards/business-auth.guard";
import { RewardsService } from "./rewards.service";

@Controller("businesses")
export class RewardsController {
  constructor(private readonly rewards: RewardsService) {}

  /** Reward inventory across every venue this business owns (PRD section 12 dashboard scope). */
  @Get("me/rewards")
  @UseGuards(BusinessAuthGuard)
  async listMine(@Req() req: any) {
    return this.rewards.listForBusiness(req.businessId);
  }
}
