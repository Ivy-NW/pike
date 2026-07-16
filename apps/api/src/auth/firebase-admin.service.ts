import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as admin from "firebase-admin";

export interface DecodedConsumerToken {
  firebaseUid: string;
  phone: string | null;
  email: string | null;
  displayName: string | null;
}

/**
 * Wraps Firebase Auth verification for consumer identity (FR-1: phone/social claim,
 * shared between the WebAR unauthenticated flow and the app).
 *
 * TODO(credentials): set FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY
 * in .env once a Firebase project exists. Until then, and only outside production,
 * this falls back to a dev stub that trusts an unsigned debug payload so the rest of the
 * claim/redemption flow can be built and tested end-to-end.
 */
@Injectable()
export class FirebaseAdminService {
  private readonly logger = new Logger(FirebaseAdminService.name);
  private app: admin.app.App | null = null;

  constructor(private readonly config: ConfigService) {
    const projectId = config.get<string>("FIREBASE_PROJECT_ID");
    const clientEmail = config.get<string>("FIREBASE_CLIENT_EMAIL");
    const privateKey = config.get<string>("FIREBASE_PRIVATE_KEY");

    if (projectId && clientEmail && privateKey) {
      this.app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: FirebaseAdminService.normalizePrivateKey(privateKey),
        }),
      });
    } else {
      this.logger.warn(
        "Firebase Admin not configured (missing env vars) — using dev-only token stub. " +
          "TODO(credentials): wire a real Firebase project before shipping.",
      );
    }
  }

  /**
   * Service-account private keys are commonly pasted into .env with the PEM header/footer
   * stripped (whatever copied the "private_key" JSON field value lost the surrounding
   * markers). Re-wrap it so admin.credential.cert() gets a valid PEM regardless of how
   * it arrived — a raw JWT parse error here is otherwise a very confusing failure mode.
   */
  private static normalizePrivateKey(raw: string): string {
    const unescaped = raw.replace(/\\n/g, "\n").trim();
    if (unescaped.includes("BEGIN PRIVATE KEY")) return unescaped;
    const body = unescaped.replace(/\n/g, "");
    return `-----BEGIN PRIVATE KEY-----\n${body}\n-----END PRIVATE KEY-----\n`;
  }

  async verifyIdToken(idToken: string): Promise<DecodedConsumerToken> {
    if (this.app) {
      try {
        const decoded = await admin.auth(this.app).verifyIdToken(idToken);
        return {
          firebaseUid: decoded.uid,
          phone: decoded.phone_number ?? null,
          email: decoded.email ?? null,
          displayName: (decoded.name as string | undefined) ?? null,
        };
      } catch {
        throw new UnauthorizedException("Invalid or expired identity token");
      }
    }

    // Dev-only stub: expects a JSON-encoded payload instead of a real Firebase JWT.
    // Never reachable when FIREBASE_* env vars are set, so this can't accidentally ship live.
    if (this.config.get<string>("NODE_ENV") === "production") {
      throw new UnauthorizedException("Identity verification unavailable");
    }
    try {
      const payload = JSON.parse(Buffer.from(idToken, "base64").toString("utf-8"));
      if (!payload.firebaseUid) throw new Error("missing firebaseUid");
      return {
        firebaseUid: payload.firebaseUid,
        phone: payload.phone ?? null,
        email: payload.email ?? null,
        displayName: payload.displayName ?? null,
      };
    } catch {
      throw new UnauthorizedException("Invalid dev identity token (base64 JSON expected)");
    }
  }
}
