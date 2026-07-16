import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

export interface BusinessTokenPayload {
  businessId: string;
  role: "business";
}

export interface AdminTokenPayload {
  adminId: string;
  role: "admin";
}

/** Business and admin sessions are deliberately separate JWTs, secrets, and payload shapes — never interchangeable. */
@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  signBusinessToken(businessId: string): string {
    const payload: BusinessTokenPayload = { businessId, role: "business" };
    return this.jwt.sign(payload, {
      secret: this.config.get<string>("BUSINESS_JWT_SECRET"),
      expiresIn: "7d",
    });
  }

  verifyBusinessToken(token: string): BusinessTokenPayload {
    return this.jwt.verify<BusinessTokenPayload>(token, {
      secret: this.config.get<string>("BUSINESS_JWT_SECRET"),
    });
  }

  signAdminToken(adminId: string): string {
    const payload: AdminTokenPayload = { adminId, role: "admin" };
    return this.jwt.sign(payload, {
      secret: this.config.get<string>("ADMIN_JWT_SECRET"),
      expiresIn: "12h",
    });
  }

  verifyAdminToken(token: string): AdminTokenPayload {
    return this.jwt.verify<AdminTokenPayload>(token, {
      secret: this.config.get<string>("ADMIN_JWT_SECRET"),
    });
  }
}
