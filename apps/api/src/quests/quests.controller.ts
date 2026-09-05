import { Body, Controller, ForbiddenException, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { BusinessAuthGuard } from "../auth/guards/business-auth.guard";
import { VenuesService } from "../venues/venues.service";
import { BusinessesService } from "../businesses/businesses.service";
import { QuestsService } from "./quests.service";
import { CreateQuestDto } from "./dto/create-quest.dto";
import { UpdateQuestDto } from "./dto/update-quest.dto";

@Controller()
export class QuestsController {
  constructor(
    private readonly quests: QuestsService,
    private readonly venues: VenuesService,
    private readonly businesses: BusinessesService,
  ) {}

  @Post("venues/:venueId/quests")
  @UseGuards(BusinessAuthGuard)
  async create(@Req() req: any, @Param("venueId") venueId: string, @Body() dto: CreateQuestDto) {
    await this.venues.findOwnedOrThrow(venueId, req.businessId);
    return this.quests.create(venueId, dto);
  }

  @Get("venues/:venueId/quests")
  @UseGuards(BusinessAuthGuard)
  async listForVenue(@Req() req: any, @Param("venueId") venueId: string) {
    await this.venues.findOwnedOrThrow(venueId, req.businessId);
    return this.quests.listForVenue(venueId);
  }

  @Get("quests/:questId")
  @UseGuards(BusinessAuthGuard)
  async getOne(@Req() req: any, @Param("questId") questId: string) {
    return this.quests.findOwnedOrThrow(questId, req.businessId);
  }

  /**
   * The payment gate lives here, not on a separate settings page — an unverified business
   * gets a clear, actionable error the dashboard renders as an inline "add a payment method"
   * step without losing the in-progress quest (PRD section 12 / the dashboard scope note).
   */
  @Post("quests/:questId/publish")
  @UseGuards(BusinessAuthGuard)
  async publish(@Req() req: any, @Param("questId") questId: string) {
    const business = await this.businesses.findByIdOrThrow(req.businessId);
    if (business.paymentStatus !== "verified") {
      throw new ForbiddenException({
        statusCode: 403,
        message: "Add a payment method to activate this quest",
        code: "payment_required_to_publish",
      });
    }
    return this.quests.publish(questId, req.businessId);
  }

  /** Reward-inventory edits (description, tier, cap, expiry) from the rewards page. */
  @Patch("quests/:questId")
  @UseGuards(BusinessAuthGuard)
  async update(@Req() req: any, @Param("questId") questId: string, @Body() dto: UpdateQuestDto) {
    return this.quests.update(questId, req.businessId, dto);
  }

  /** Takes a live reward out of circulation; scans are refused server-side while paused. */
  @Post("quests/:questId/pause")
  @UseGuards(BusinessAuthGuard)
  async pause(@Req() req: any, @Param("questId") questId: string) {
    return this.quests.pause(questId, req.businessId);
  }

  /**
   * Putting a reward back into circulation clears the same payment gate as publish — a
   * business whose card lapsed while paused must fix it before scans start counting again.
   */
  @Post("quests/:questId/resume")
  @UseGuards(BusinessAuthGuard)
  async resume(@Req() req: any, @Param("questId") questId: string) {
    const business = await this.businesses.findByIdOrThrow(req.businessId);
    if (business.paymentStatus !== "verified") {
      throw new ForbiddenException({
        statusCode: 403,
        message: "Add a payment method to resume this quest",
        code: "payment_required_to_publish",
      });
    }
    return this.quests.resume(questId, req.businessId);
  }

  /** Redemption counts + remaining cap for this quest — real numbers, since caps depend on them. */
  @Get("quests/:questId/stats")
  @UseGuards(BusinessAuthGuard)
  async stats(@Req() req: any, @Param("questId") questId: string) {
    return this.quests.stats(questId, req.businessId);
  }
}
