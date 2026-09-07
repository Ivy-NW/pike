import { Injectable } from "@nestjs/common";
import { createTokenAuthGuard } from "./token-auth.guard";
import type { ConsumerTokenPayload } from "../token.service";

export interface ConsumerRequest extends Request {
  userId: string;
}

/** Verifies our own consumer JWT (issued at signup/signin) — this IS the consumer identity (FR-1). */
@Injectable()
export class ConsumerAuthGuard extends createTokenAuthGuard<ConsumerTokenPayload>({
  verify: (tokens, token) => tokens.verifyConsumerToken(token),
  requestKeys: { userId: "userId" },
  missingTokenMessage: "Missing identity token",
  invalidTokenMessage: "Invalid or expired identity token",
}) {}
