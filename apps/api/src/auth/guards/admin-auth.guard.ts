import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { TokenService } from "../token.service";

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(private readonly tokens: TokenService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const header: string | undefined = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing admin session token");
    }
    try {
      const payload = this.tokens.verifyAdminToken(header.slice("Bearer ".length));
      req.adminId = payload.adminId;
      return true;
    } catch {
      throw new UnauthorizedException("Invalid or expired admin session");
    }
  }
}
