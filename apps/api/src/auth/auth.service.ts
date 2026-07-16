import { ConflictException, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { randomBytes } from "node:crypto";
import { PrismaService } from "../prisma/prisma.service";
import { PasswordService } from "./password.service";
import { TokenService } from "./token.service";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly passwords: PasswordService,
    private readonly tokens: TokenService,
  ) {}

  async registerBusiness(name: string, email: string, password: string) {
    const existing = await this.prisma.business.findUnique({ where: { email } });
    if (existing) throw new ConflictException("An account with this email already exists");

    const passwordHash = await this.passwords.hash(password);
    const emailVerificationToken = randomBytes(24).toString("hex");

    const business = await this.prisma.business.create({
      data: { name, email, passwordHash, emailVerificationToken },
    });

    // TODO(credentials): send this via a transactional email provider instead of logging it.
    this.logger.log(
      `Email verification link for ${email}: /verify-email?token=${emailVerificationToken}`,
    );

    return business;
  }

  async verifyBusinessEmail(token: string) {
    const business = await this.prisma.business.findUnique({
      where: { emailVerificationToken: token },
    });
    if (!business) throw new UnauthorizedException("Invalid or expired verification link");

    return this.prisma.business.update({
      where: { id: business.id },
      data: { emailVerified: true, emailVerificationToken: null },
    });
  }

  async loginBusiness(email: string, password: string) {
    const business = await this.prisma.business.findUnique({ where: { email } });
    if (!business?.passwordHash || !(await this.passwords.compare(password, business.passwordHash))) {
      throw new UnauthorizedException("Invalid email or password");
    }
    if (business.suspended) throw new UnauthorizedException("This account has been suspended");
    if (!business.emailVerified) {
      throw new UnauthorizedException("Please verify your email before logging in");
    }

    return { business, token: this.tokens.signBusinessToken(business.id) };
  }

  async loginAdmin(email: string, password: string) {
    const admin = await this.prisma.admin.findUnique({ where: { email } });
    if (!admin || !(await this.passwords.compare(password, admin.passwordHash))) {
      throw new UnauthorizedException("Invalid email or password");
    }
    return { admin, token: this.tokens.signAdminToken(admin.id) };
  }
}
