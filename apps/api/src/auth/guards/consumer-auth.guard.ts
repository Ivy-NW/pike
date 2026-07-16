import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { FirebaseAdminService } from "../firebase-admin.service";

/** Verifies the Firebase ID token presented at claim time — this IS the consumer identity (FR-1). */
@Injectable()
export class ConsumerAuthGuard implements CanActivate {
  constructor(private readonly firebase: FirebaseAdminService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const header: string | undefined = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing identity token");
    }
    req.consumer = await this.firebase.verifyIdToken(header.slice("Bearer ".length));
    return true;
  }
}
