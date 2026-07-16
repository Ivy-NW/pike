import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { TokenService } from "../token.service";

export interface ConsumerRequest extends Request {
  userId: string;
}

/** Verifies our own consumer JWT (issued at signup/signin) — this IS the consumer identity (FR-1). */
@Injectable()
export class ConsumerAuthGuard implements CanActivate {
  constructor(private readonly tokens: TokenService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const header: string | undefined = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing identity token");
    }
    try {
      const payload = this.tokens.verifyConsumerToken(header.slice("Bearer ".length));
      req.userId = payload.userId;
      return true;
    } catch {
      throw new UnauthorizedException("Invalid or expired identity token");
    }
  }
}
