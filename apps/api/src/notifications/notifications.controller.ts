import { BadRequestException, Body, Controller, HttpCode, Post, Req, UseGuards } from "@nestjs/common";
import type { RegisterPushTokenRequest } from "@pike/shared-types";
import { ConsumerAuthGuard } from "../auth/guards/consumer-auth.guard";
import { NotificationsService } from "./notifications.service";

@Controller("users/me")
@UseGuards(ConsumerAuthGuard)
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  /** FR-6: register this device's Expo/FCM push token. */
  @Post("push-token")
  @HttpCode(204)
  async registerToken(@Req() req: any, @Body() body: RegisterPushTokenRequest) {
    if (!body?.token) throw new BadRequestException("token is required");
    await this.notifications.registerToken(req.userId, body.token);
  }
}
