import { Injectable } from "@nestjs/common";
import { createTokenAuthGuard } from "./token-auth.guard";
import type { AdminTokenPayload } from "../token.service";

@Injectable()
export class AdminAuthGuard extends createTokenAuthGuard<AdminTokenPayload>({
  verify: (tokens, token) => tokens.verifyAdminToken(token),
  requestKeys: { adminId: "adminId", adminRole: "adminRole" },
  missingTokenMessage: "Missing admin session token",
  invalidTokenMessage: "Invalid or expired admin session",
}) {}
