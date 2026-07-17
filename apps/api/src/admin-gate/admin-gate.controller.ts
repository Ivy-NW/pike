import { Body, Controller, Headers, Ip, Post } from "@nestjs/common";
import { AdminGateService } from "./admin-gate.service";
import { VerifyAdminGateDto } from "./dto/verify-admin-gate.dto";

/** Public, unauthenticated -- an obscurity gate in front of the real admin login, not the login itself. */
@Controller("admin-gate")
export class AdminGateController {
  constructor(private readonly adminGate: AdminGateService) {}

  @Post("verify")
  async verify(
    @Body() dto: VerifyAdminGateDto,
    @Ip() ip: string,
    @Headers("user-agent") userAgent: string,
  ) {
    const valid = await this.adminGate.verify(dto.code, ip, userAgent ?? "unknown");
    return { valid };
  }
}
