import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { paginate } from "../common/pagination.dto";

@Injectable()
export class AdminAuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  record(adminId: string, action: string, targetType?: string, targetId?: string, metadata?: object) {
    return this.prisma.adminAuditLog.create({
      data: { adminId, action, targetType, targetId, metadata: metadata as any },
    });
  }

  list(page: { cursor?: string; limit?: number }) {
    return paginate(
      (args) =>
        this.prisma.adminAuditLog.findMany({
          ...args,
          orderBy: { createdAt: "desc" },
          include: { admin: { select: { email: true } } },
        }),
      page,
      50,
    );
  }
}
