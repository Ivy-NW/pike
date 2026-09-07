import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { paginate } from "../common/pagination.dto";

@Injectable()
export class VenuesService {
  constructor(private readonly prisma: PrismaService) {}

  create(businessId: string, name: string, venueType: string, address?: string) {
    return this.prisma.venue.create({ data: { businessId, name, venueType, address } });
  }

  listForBusiness(businessId: string) {
    return this.prisma.venue.findMany({ where: { businessId }, orderBy: { createdAt: "desc" } });
  }

  listAll({ cursor, limit }: { cursor?: string; limit?: number }) {
    return paginate(
      (args) => this.prisma.venue.findMany({ ...args, orderBy: { createdAt: "desc" } }),
      { cursor, limit },
      100,
    );
  }

  async findOwnedOrThrow(venueId: string, businessId: string) {
    const venue = await this.prisma.venue.findUnique({ where: { id: venueId } });
    if (!venue) throw new NotFoundException("Venue not found");
    if (venue.businessId !== businessId) {
      throw new ForbiddenException("This venue does not belong to your business");
    }
    return venue;
  }
}
