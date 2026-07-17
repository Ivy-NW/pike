import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { WaitlistAudience } from "@prisma/client";

@Injectable()
export class WaitlistService {
  constructor(private readonly prisma: PrismaService) {}

  async join(email: string, audience: WaitlistAudience) {
    await this.prisma.waitlistSignup.upsert({
      where: { email },
      update: { audience },
      create: { email, audience },
    });
    return { ok: true as const };
  }
}
