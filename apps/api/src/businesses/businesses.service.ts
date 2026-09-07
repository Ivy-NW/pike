import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { PaymentsService } from "../payments/payments.service";
import { paginate } from "../common/pagination.dto";

export interface TrendDay {
  day: Date;
  total: number;
  claimed: number;
  flagged: number;
  rejected: number;
}

export interface VenueTotal {
  venueId: string;
  venueName: string;
  total: number;
}

function omitSensitive<
  T extends {
    passwordHash: string | null;
    emailVerificationToken: string | null;
    passwordResetToken: string | null;
    passwordResetExpiresAt: Date | null;
  },
>(business: T) {
  const { passwordHash: _passwordHash, emailVerificationToken: _evt, passwordResetToken: _prt, passwordResetExpiresAt: _prea, ...rest } = business;
  return rest;
}

@Injectable()
export class BusinessesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly payments: PaymentsService,
  ) {}

  async findByIdOrThrow(id: string) {
    const business = await this.prisma.business.findUnique({ where: { id } });
    if (!business) throw new NotFoundException("Business not found");
    return business;
  }

  /** Public-facing view of a business's own profile — never leaks credential/token fields to the dashboard. */
  async getPublicProfile(businessId: string) {
    return omitSensitive(await this.findByIdOrThrow(businessId));
  }

  async updateProfile(businessId: string, patch: { name?: string; phone?: string; address?: string }) {
    await this.findByIdOrThrow(businessId);
    const updated = await this.prisma.business.update({ where: { id: businessId }, data: patch });
    return omitSensitive(updated);
  }

  /** Daily redemption counts + per-venue totals, scoped to this business, for the analytics trend chart.
   * `questId` narrows the day-bucketed series to one quest (for the quest-detail sparkline) without
   * affecting the venue breakdown, which stays business-wide. */
  async redemptionTrends(businessId: string, days: number, questId?: string) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const questFilter = questId ? Prisma.sql`AND r."questId" = ${questId}` : Prisma.empty;

    const [dayRows, venueRows] = await Promise.all([
      this.prisma.$queryRaw<TrendDay[]>(Prisma.sql`
        SELECT
          date_trunc('day', r."createdAt") AS day,
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE r.status = 'claimed')::int AS claimed,
          COUNT(*) FILTER (WHERE r.status = 'flagged')::int AS flagged,
          COUNT(*) FILTER (WHERE r.status = 'rejected')::int AS rejected
        FROM redemptions r
        JOIN venues v ON v.id = r."venueId"
        WHERE v."businessId" = ${businessId} AND r."createdAt" >= ${since} ${questFilter}
        GROUP BY day
        ORDER BY day ASC
      `),
      this.prisma.$queryRaw<VenueTotal[]>(Prisma.sql`
        SELECT v.id AS "venueId", v.name AS "venueName", COUNT(*)::int AS total
        FROM redemptions r
        JOIN venues v ON v.id = r."venueId"
        WHERE v."businessId" = ${businessId} AND r."createdAt" >= ${since}
        GROUP BY v.id, v.name
        ORDER BY total DESC
      `),
    ]);

    return {
      days: dayRows.map((row) => ({
        date: row.day.toISOString().slice(0, 10),
        total: row.total,
        claimed: row.claimed,
        flagged: row.flagged,
        rejected: row.rejected,
      })),
      byVenue: venueRows,
    };
  }

  /** Called inline from the quest-publish flow when a business has no payment method on file yet. */
  async attachPaymentMethod(businessId: string, stripePaymentMethodId: string) {
    const business = await this.findByIdOrThrow(businessId);
    const stripeCustomerId = await this.payments.attachPaymentMethod(business, stripePaymentMethodId);

    return this.prisma.business.update({
      where: { id: businessId },
      data: {
        stripeCustomerId,
        stripePaymentMethodId,
        paymentStatus: "verified",
      },
    });
  }

  /** Sales-assisted / partner onboarding — a secondary path alongside self-registration (PRD section 12). */
  async adminCreate(name: string, email: string, comp: boolean) {
    const business = await this.prisma.business.create({
      data: {
        name,
        email,
        createdByAdmin: true,
        emailVerified: true, // admin-created accounts skip the self-serve email-verification loop
        paymentStatus: comp ? "verified" : "unverified",
      },
    });
    return omitSensitive(business);
  }

  async adminMarkVerified(businessId: string) {
    await this.findByIdOrThrow(businessId);
    const business = await this.prisma.business.update({
      where: { id: businessId },
      data: { paymentStatus: "verified" },
    });
    return omitSensitive(business);
  }

  async adminSuspend(businessId: string, suspended: boolean) {
    await this.findByIdOrThrow(businessId);
    const business = await this.prisma.business.update({ where: { id: businessId }, data: { suspended } });
    return omitSensitive(business);
  }

  async listAll({ cursor, limit }: { cursor?: string; limit?: number }) {
    const page = await paginate(
      (args) => this.prisma.business.findMany({ ...args, orderBy: { createdAt: "desc" } }),
      { cursor, limit },
      25,
    );
    return { ...page, items: page.items.map(omitSensitive) };
  }
}
