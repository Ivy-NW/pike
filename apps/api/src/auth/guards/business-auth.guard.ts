import { Injectable } from "@nestjs/common";
import { createTokenAuthGuard } from "./token-auth.guard";
import type { BusinessTokenPayload } from "../token.service";

export interface BusinessRequest extends Request {
  businessId: string;
}

@Injectable()
export class BusinessAuthGuard extends createTokenAuthGuard<BusinessTokenPayload>({
  verify: (tokens, token) => tokens.verifyBusinessToken(token),
  requestKeys: { businessId: "businessId" },
  missingTokenMessage: "Missing business session token",
  invalidTokenMessage: "Invalid or expired business session",
}) {}
