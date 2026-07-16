import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterBusinessDto } from "./dto/register-business.dto";
import { LoginBusinessDto } from "./dto/login-business.dto";
import { LoginAdminDto } from "./dto/login-admin.dto";
import { VerifyEmailDto } from "./dto/verify-email.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  /** Self-registration — the primary path into the Business Dashboard (PRD 8.3 / section 12). */
  @Post("business/register")
  async registerBusiness(@Body() dto: RegisterBusinessDto) {
    const business = await this.auth.registerBusiness(dto.name, dto.email, dto.password);
    return { business };
  }

  @Post("business/verify-email")
  async verifyBusinessEmail(@Body() dto: VerifyEmailDto) {
    const business = await this.auth.verifyBusinessEmail(dto.token);
    return { business };
  }

  @Post("business/login")
  async loginBusiness(@Body() dto: LoginBusinessDto) {
    const { business, token } = await this.auth.loginBusiness(dto.email, dto.password);
    return { business, token };
  }

  /** No self-registration for admins — first account is seeded via scripts/seed-admin.ts. */
  @Post("admin/login")
  async loginAdmin(@Body() dto: LoginAdminDto) {
    const { admin, token } = await this.auth.loginAdmin(dto.email, dto.password);
    return { admin, token };
  }
}
