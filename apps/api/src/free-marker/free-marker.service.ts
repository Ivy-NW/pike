import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class FreeMarkerService {
  constructor(private readonly prisma: PrismaService) {}

  async create(name: string, venueName: string, whatsapp: string, neighbourhood?: string) {
    await this.prisma.freeMarkerLead.create({
      data: { name, venueName, whatsapp, neighbourhood: neighbourhood || null },
    });
    return { ok: true as const };
  }

  listAll() {
    return this.prisma.freeMarkerLead.findMany({ orderBy: { createdAt: "desc" } });
  }
}
