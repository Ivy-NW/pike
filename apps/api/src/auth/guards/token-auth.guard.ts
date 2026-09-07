import { CanActivate, ExecutionContext, Inject, Injectable, Type, UnauthorizedException } from "@nestjs/common";
import { TokenService } from "../token.service";

/**
 * Business, admin, and consumer sessions are deliberately separate JWTs, secrets, and
 * payload shapes (see TokenService) — this factory only removes the boilerplate of
 * checking the header and catching a failed verify, it does not make the three guards
 * interchangeable. `requestKeys` copies fields from the verified payload onto the
 * request object (e.g. `{ adminId: "adminId", adminRole: "adminRole" }`).
 */
export function createTokenAuthGuard<TPayload extends object>(options: {
  verify: (tokens: TokenService, token: string) => TPayload;
  requestKeys: Partial<Record<keyof TPayload, string>>;
  missingTokenMessage: string;
  invalidTokenMessage: string;
}): Type<CanActivate> {
  @Injectable()
  class TokenAuthGuard implements CanActivate {
    constructor(@Inject(TokenService) private readonly tokens: TokenService) {}

    canActivate(context: ExecutionContext): boolean {
      const req = context.switchToHttp().getRequest();
      const header: string | undefined = req.headers.authorization;
      if (!header?.startsWith("Bearer ")) {
        throw new UnauthorizedException(options.missingTokenMessage);
      }
      try {
        const payload = options.verify(this.tokens, header.slice("Bearer ".length));
        for (const [payloadKey, requestKey] of Object.entries(options.requestKeys)) {
          req[requestKey as string] = (payload as any)[payloadKey];
        }
        return true;
      } catch {
        throw new UnauthorizedException(options.invalidTokenMessage);
      }
    }
  }

  return TokenAuthGuard;
}
