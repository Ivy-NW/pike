import { Body, Controller, Get, Ip, Param, Post, Headers } from "@nestjs/common";
import { RedemptionsService } from "./redemptions.service";
import { CreateRedemptionDto } from "./dto/create-redemption.dto";
import { ClaimRewardDto } from "./dto/claim-reward.dto";

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

  /** Claiming only ever asks for phone/social (FR-12) — never a full account at this step. */
  @Post(":id/claim")
  claim(@Param("id") id: string, @Body() dto: ClaimRewardDto) {
    return this.redemptions.claim(id, dto);
  }
}
