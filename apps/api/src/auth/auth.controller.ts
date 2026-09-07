import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterBusinessDto } from "./dto/register-business.dto";
import { LoginBusinessDto } from "./dto/login-business.dto";
import { LoginAdminDto } from "./dto/login-admin.dto";
import { VerifyEmailDto } from "./dto/verify-email.dto";
import { ResendVerificationDto } from "./dto/resend-verification.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { SignupConsumerDto } from "./dto/signup-consumer.dto";
import { SigninConsumerDto } from "./dto/signin-consumer.dto";

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

  @Post("business/resend-verification")
  async resendBusinessVerification(@Body() dto: ResendVerificationDto) {
    return this.auth.resendBusinessVerification(dto.email);
  }

  @Post("business/forgot-password")
  async forgotBusinessPassword(@Body() dto: ForgotPasswordDto) {
    return this.auth.forgotBusinessPassword(dto.email);
  }

  @Post("business/reset-password")
  async resetBusinessPassword(@Body() dto: ResetPasswordDto) {
    return this.auth.resetBusinessPassword(dto.token, dto.password);
  }

  /** No self-registration for admins — first account is seeded via scripts/seed-admin.ts. */
  @Post("admin/login")
  async loginAdmin(@Body() dto: LoginAdminDto) {
    const { admin, token } = await this.auth.loginAdmin(dto.email, dto.password);
    return { admin, token };
  }

  @Post("admin/forgot-password")
  async forgotAdminPassword(@Body() dto: ForgotPasswordDto) {
    return this.auth.forgotAdminPassword(dto.email);
  }

  @Post("admin/reset-password")
  async resetAdminPassword(@Body() dto: ResetPasswordDto) {
    return this.auth.resetAdminPassword(dto.token, dto.password);
  }

  /** Consumer accounts (WebAR claim + app) — our own auth, not a third-party identity provider. */
  @Post("consumer/signup")
  async signupConsumer(@Body() dto: SignupConsumerDto) {
    const { user, token } = await this.auth.signupConsumer(dto.phone, dto.username, dto.name, dto.email, dto.password);
    return { user, token };
  }

  @Post("consumer/signin")
  async signinConsumer(@Body() dto: SigninConsumerDto) {
    const { user, token } = await this.auth.signinConsumer(dto.identifier, dto.password);
    return { user, token };
  }
}
