import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { TokenService } from "../token.service";

export interface BusinessRequest extends Request {
  businessId: string;
}

@Injectable()
export class BusinessAuthGuard implements CanActivate {
  constructor(private readonly tokens: TokenService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const header: string | undefined = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing business session token");
    }
    try {
      const payload = this.tokens.verifyBusinessToken(header.slice("Bearer ".length));
      req.businessId = payload.businessId;
      return true;
    } catch {
      throw new UnauthorizedException("Invalid or expired business session");
    }
  }
}
