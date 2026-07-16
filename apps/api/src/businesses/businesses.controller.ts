import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { BusinessAuthGuard } from "../auth/guards/business-auth.guard";
import { BusinessesService } from "./businesses.service";
import { AttachPaymentMethodDto } from "./dto/attach-payment-method.dto";

@Controller("businesses")
export class BusinessesController {
  constructor(private readonly businesses: BusinessesService) {}

  @Get("me")
  @UseGuards(BusinessAuthGuard)
  async me(@Req() req: any) {
    return this.businesses.findByIdOrThrow(req.businessId);
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
}
