import { Body, Controller, Get, Ip, Param, Post, Headers, Req, UseGuards } from "@nestjs/common";
import { RedemptionsService } from "./redemptions.service";
import { CreateRedemptionDto } from "./dto/create-redemption.dto";
import { ClaimRewardDto } from "./dto/claim-reward.dto";
import { ConsumerAuthGuard } from "../auth/guards/consumer-auth.guard";

@Controller("redemptions")
export class RedemptionsController {
  constructor(private readonly redemptions: RedemptionsService) {}

  /** Lets the reward-reveal screen survive a refresh without re-scanning. */
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.redemptions.findOrThrow(id);
  }

  /** Public, unauthenticated — called the instant the AR engine recognizes the marker (FR-8, FR-9). */
  @Post()
  create(
    @Body() dto: CreateRedemptionDto,
    @Ip() ip: string,
    @Headers("user-agent") userAgent: string,
  ) {
    return this.redemptions.create(dto.markerId, dto.sessionId, userAgent ?? "unknown", ip);
  }

  /** Claim requires a signed-in PIKE account (FR-12) — sign up/in first, then claim with that token. */
  @Post(":id/claim")
  @UseGuards(ConsumerAuthGuard)
  claim(@Param("id") id: string, @Body() dto: ClaimRewardDto, @Req() req: any) {
    return this.redemptions.claim(id, req.userId, dto.channel);
  }
}
