import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { PaymentsService } from "../payments/payments.service";

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
    return this.prisma.business.create({
      data: {
        name,
        email,
        createdByAdmin: true,
        emailVerified: true, // admin-created accounts skip the self-serve email-verification loop
        paymentStatus: comp ? "verified" : "unverified",
      },
    });
  }

  async adminMarkVerified(businessId: string) {
    await this.findByIdOrThrow(businessId);
    return this.prisma.business.update({
      where: { id: businessId },
      data: { paymentStatus: "verified" },
    });
  }

  async adminSuspend(businessId: string, suspended: boolean) {
    await this.findByIdOrThrow(businessId);
    return this.prisma.business.update({ where: { id: businessId }, data: { suspended } });
  }

  async listAll() {
    return this.prisma.business.findMany({ orderBy: { createdAt: "desc" } });
  }
}
