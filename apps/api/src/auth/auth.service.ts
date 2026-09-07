import { ConflictException, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { randomBytes } from "node:crypto";
import { PrismaService } from "../prisma/prisma.service";
import { PasswordService } from "./password.service";
import { TokenService } from "./token.service";

const SENSITIVE_KEYS = ["passwordHash", "emailVerificationToken", "passwordResetToken", "passwordResetExpiresAt"] as const;

/** Strips password/token fields shared across Business and Admin before a record ever reaches a response body. */
function omitPasswordHash<T extends { passwordHash: string | null }>(entity: T): Omit<T, (typeof SENSITIVE_KEYS)[number]> {
  const clean = { ...entity };
  for (const key of SENSITIVE_KEYS) delete (clean as any)[key];
  return clean;
}

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

    return omitPasswordHash(business);
  }

  async verifyBusinessEmail(token: string) {
    const business = await this.prisma.business.findUnique({
      where: { emailVerificationToken: token },
    });
    if (!business) throw new UnauthorizedException("Invalid or expired verification link");

    const updated = await this.prisma.business.update({
      where: { id: business.id },
      data: { emailVerified: true, emailVerificationToken: null },
    });
    return omitPasswordHash(updated);
  }

  async resendBusinessVerification(email: string) {
    const business = await this.prisma.business.findUnique({ where: { email } });
    // Don't leak whether an account exists, or reveal already-verified accounts either.
    if (!business || business.emailVerified) return { ok: true };

    const emailVerificationToken = randomBytes(24).toString("hex");
    await this.prisma.business.update({ where: { id: business.id }, data: { emailVerificationToken } });

    // TODO(credentials): send this via a transactional email provider instead of logging it.
    this.logger.log(`Email verification link for ${email}: /verify-email?token=${emailVerificationToken}`);
    return { ok: true };
  }

  async forgotBusinessPassword(email: string) {
    const business = await this.prisma.business.findUnique({ where: { email } });
    // Always respond the same way so this endpoint can't be used to enumerate accounts.
    if (!business) return { ok: true };

    const passwordResetToken = randomBytes(24).toString("hex");
    const passwordResetExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await this.prisma.business.update({
      where: { id: business.id },
      data: { passwordResetToken, passwordResetExpiresAt },
    });

    // TODO(credentials): send this via a transactional email provider instead of logging it.
    this.logger.log(`Password reset link for ${email}: /reset-password?token=${passwordResetToken}`);
    return { ok: true };
  }

  async resetBusinessPassword(token: string, password: string) {
    const business = await this.prisma.business.findUnique({ where: { passwordResetToken: token } });
    if (!business || !business.passwordResetExpiresAt || business.passwordResetExpiresAt < new Date()) {
      throw new UnauthorizedException("Invalid or expired reset link");
    }

    const passwordHash = await this.passwords.hash(password);
    await this.prisma.business.update({
      where: { id: business.id },
      data: { passwordHash, passwordResetToken: null, passwordResetExpiresAt: null },
    });
    return { ok: true };
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

    return { business: omitPasswordHash(business), token: this.tokens.signBusinessToken(business.id) };
  }

  async loginAdmin(email: string, password: string) {
    const admin = await this.prisma.admin.findUnique({ where: { email } });
    if (!admin || !(await this.passwords.compare(password, admin.passwordHash))) {
      throw new UnauthorizedException("Invalid email or password");
    }
    return { admin: omitPasswordHash(admin), token: this.tokens.signAdminToken(admin.id, admin.role) };
  }

  async forgotAdminPassword(email: string) {
    const admin = await this.prisma.admin.findUnique({ where: { email } });
    // Always respond the same way so this endpoint can't be used to enumerate accounts.
    if (!admin) return { ok: true };

    const passwordResetToken = randomBytes(24).toString("hex");
    const passwordResetExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await this.prisma.admin.update({
      where: { id: admin.id },
      data: { passwordResetToken, passwordResetExpiresAt },
    });

    // TODO(credentials): send this via a transactional email provider instead of logging it.
    this.logger.log(`Admin password reset link for ${email}: /reset-password?token=${passwordResetToken}`);
    return { ok: true };
  }

  async resetAdminPassword(token: string, password: string) {
    const admin = await this.prisma.admin.findUnique({ where: { passwordResetToken: token } });
    if (!admin || !admin.passwordResetExpiresAt || admin.passwordResetExpiresAt < new Date()) {
      throw new UnauthorizedException("Invalid or expired reset link");
    }

    const passwordHash = await this.passwords.hash(password);
    await this.prisma.admin.update({
      where: { id: admin.id },
      data: { passwordHash, passwordResetToken: null, passwordResetExpiresAt: null },
    });
    return { ok: true };
  }

  async signupConsumer(phone: string, username: string, name: string, email: string, password: string) {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ phone }, { username }, { email }] },
    });
    if (existing) {
      throw new ConflictException("An account with this phone number, username, or email already exists");
    }

    const passwordHash = await this.passwords.hash(password);
    const user = await this.prisma.user.create({
      data: { phone, username, name, email, passwordHash },
    });

    return { user: omitPasswordHash(user), token: this.tokens.signConsumerToken(user.id) };
  }

  async signinConsumer(identifier: string, password: string) {
    const cleanIdentifier = identifier.trim();
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: { equals: cleanIdentifier, mode: "insensitive" } },
          { email: { equals: cleanIdentifier, mode: "insensitive" } },
        ],
      },
    });
    if (!user || !(await this.passwords.compare(password, user.passwordHash))) {
      throw new UnauthorizedException("Invalid username/email or password");
    }

    return { user: omitPasswordHash(user), token: this.tokens.signConsumerToken(user.id) };
  }
}
