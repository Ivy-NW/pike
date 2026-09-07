import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";

/**
 * Runs after AdminAuthGuard (which sets req.adminRole) — gates the handful of admin
 * actions with real platform-wide/financial consequence (suspending a business, editing
 * on-chain attestation batch config) behind the super_admin tier instead of any admin.
 */
@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    if (req.adminRole !== "super_admin") {
      throw new ForbiddenException("This action requires a super admin account");
    }
    return true;
  }
}
