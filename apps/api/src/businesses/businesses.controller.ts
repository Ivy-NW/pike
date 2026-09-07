import { Body, Controller, Get, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { BusinessAuthGuard } from "../auth/guards/business-auth.guard";
import { BusinessesService } from "./businesses.service";
import { AttachPaymentMethodDto } from "./dto/attach-payment-method.dto";
import { UpdateBusinessDto } from "./dto/update-business.dto";

@Controller("businesses")
export class BusinessesController {
  constructor(private readonly businesses: BusinessesService) {}

  @Get("me")
  @UseGuards(BusinessAuthGuard)
  async me(@Req() req: any) {
    return this.businesses.getPublicProfile(req.businessId);
  }

  /**
   * Can be called standalone from account settings, or inline mid-quest-creation
   * when publish is blocked on payment_status (see quests.controller publish endpoint).
   */
  @Post("me/payment-method")
  @UseGuards(BusinessAuthGuard)
  async attachPaymentMethod(@Req() req: any, @Body() dto: AttachPaymentMethodDto) {
    const business = await this.businesses.attachPaymentMethod(
      req.businessId,
      dto.stripePaymentMethodId,
    );
    return { paymentStatus: business.paymentStatus };
  }

  @Patch("me")
  @UseGuards(BusinessAuthGuard)
  async updateProfile(@Req() req: any, @Body() dto: UpdateBusinessDto) {
    return this.businesses.updateProfile(req.businessId, dto);
  }

  @Get("me/analytics/trends")
  @UseGuards(BusinessAuthGuard)
  async analyticsTrends(@Req() req: any, @Query("days") days?: string, @Query("questId") questId?: string) {
    const parsed = Number(days);
    const rangeDays = parsed === 30 ? 30 : 7;
    return this.businesses.redemptionTrends(req.businessId, rangeDays, questId);
  }
}
