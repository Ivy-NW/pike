import { createHash, timingSafeEqual } from "node:crypto";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { RedisService } from "../redis/redis.service";

const MAX_ATTEMPTS_PER_HOUR = 5;

/**
 * The admin code gate: an obscurity layer that decides who ever sees the admin login form,
 * NOT a replacement for AdminAuthGuard's real email/password auth. Rate-limited and logged
 * server-side, same "never trust the client" discipline as RedemptionCapService.
 */
@Injectable()
export class AdminGateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  private hashIp(ip: string): string {
    return createHash("sha256").update(ip).digest("hex");
  }

  private rateLimitKey(ipHash: string): string {
    const hourBucket = new Date().toISOString().slice(0, 13);
    return `admin-gate:${ipHash}:${hourBucket}`;
  }

  /** Constant-time comparison via fixed-length digests, so a wrong-length guess can't short-circuit. */
  private matchesCode(code: string): boolean {
    const expected = process.env.ADMIN_GATE_CODE;
    if (!expected) return false;
    const submitted = createHash("sha256").update(code).digest();
    const target = createHash("sha256").update(expected).digest();
    return timingSafeEqual(submitted, target);
  }

  async verify(code: string, ip: string, userAgent: string): Promise<boolean> {
    const ipHash = this.hashIp(ip);
    const key = this.rateLimitKey(ipHash);
    const attempts = await this.redis.client.incr(key);
    if (attempts === 1) {
      await this.redis.client.expire(key, 3600);
    }
    if (attempts > MAX_ATTEMPTS_PER_HOUR) {
      throw new HttpException("Too many attempts, try again later", HttpStatus.TOO_MANY_REQUESTS);
    }

    const success = this.matchesCode(code);
    await this.prisma.adminGateAttempt.create({ data: { ipHash, userAgent, success } });
    return success;
  }

  /** Surfaced to admins via AdminController -- repeated failures are a signal worth reviewing. */
  listAttempts(success?: boolean) {
    return this.prisma.adminGateAttempt.findMany({
      where: success === undefined ? undefined : { success },
      orderBy: { createdAt: "desc" },
      take: 500,
    });
  }
}
