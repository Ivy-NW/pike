import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { AdminAuthGuard } from "../auth/guards/admin-auth.guard";
import { SuperAdminGuard } from "../auth/guards/super-admin.guard";
import { BusinessesService } from "../businesses/businesses.service";
import { VenuesService } from "../venues/venues.service";
import { QuestsService } from "../quests/quests.service";
import { PrismaService } from "../prisma/prisma.service";
import { AdminGateService } from "../admin-gate/admin-gate.service";
import { FreeMarkerService } from "../free-marker/free-marker.service";
import { AdminAuditLogService } from "./admin-audit-log.service";
import { AdminCreateBusinessDto } from "./dto/admin-create-business.dto";
import { SuspendBusinessDto } from "./dto/suspend-business.dto";
import { PaginationQueryDto, paginate } from "../common/pagination.dto";

/** Every route here requires the admin's own JWT — never the consumer or business session tokens. */
@Controller("admin")
@UseGuards(AdminAuthGuard)
export class AdminController {
  constructor(
    private readonly businesses: BusinessesService,
    private readonly venues: VenuesService,
    private readonly quests: QuestsService,
    private readonly prisma: PrismaService,
    private readonly adminGate: AdminGateService,
    private readonly freeMarker: FreeMarkerService,
    private readonly auditLog: AdminAuditLogService,
  ) {}

  /** Sales-assisted onboarding — secondary path alongside business self-registration. */
  @Post("businesses")
  async createBusiness(@Req() req: any, @Body() dto: AdminCreateBusinessDto) {
    const business = await this.businesses.adminCreate(dto.name, dto.email, dto.comp);
    await this.auditLog.record(req.adminId, "business.create", "business", business.id, { name: dto.name, email: dto.email, comp: dto.comp });
    return business;
  }

  @Get("businesses")
  listBusinesses(@Query() query: PaginationQueryDto) {
    return this.businesses.listAll(query);
  }

  /** Comping a partner: mark verified without a card on file. */
  @Post("businesses/:id/verify")
  async verifyBusiness(@Req() req: any, @Param("id") id: string) {
    const business = await this.businesses.adminMarkVerified(id);
    await this.auditLog.record(req.adminId, "business.verify", "business", id);
    return business;
  }

  /** Suspending a partner is a platform-wide, revenue-affecting action — restricted to super admins. */
  @Post("businesses/:id/suspend")
  @UseGuards(SuperAdminGuard)
  async suspendBusiness(@Req() req: any, @Param("id") id: string, @Body() dto: SuspendBusinessDto) {
    const business = await this.businesses.adminSuspend(id, dto.suspended);
    await this.auditLog.record(req.adminId, dto.suspended ? "business.suspend" : "business.unsuspend", "business", id);
    return business;
  }

  /** Exact platform-wide counts for the overview page — the list endpoints below are now
   * cursor-paginated, so they can no longer double as a total-count source. */
  @Get("stats")
  async getStats() {
    const [businesses, venues, activeQuests, flaggedRedemptions] = await Promise.all([
      this.prisma.business.count(),
      this.prisma.venue.count(),
      this.prisma.quest.count({ where: { status: "live" } }),
      this.prisma.redemption.count({ where: { status: "flagged" } }),
    ]);
    return { businesses, venues, activeQuests, flaggedRedemptions };
  }

  @Get("venues")
  listVenues(@Query() query: PaginationQueryDto) {
    return this.venues.listAll(query);
  }

  @Get("quests")
  listQuests(@Query() query: PaginationQueryDto) {
    return this.quests.listAll(query);
  }

  /** Platform-wide redemptions; ?status=flagged surfaces FR-13's anti-gaming signal for review. */
  @Get("redemptions")
  listRedemptions(@Query("status") status: "claimed" | "flagged" | "rejected" | undefined, @Query() query: PaginationQueryDto) {
    return paginate(
      (args) =>
        this.prisma.redemption.findMany({
          ...args,
          where: status ? { status } : undefined,
          include: { quest: true, marker: { include: { venue: true } } },
          orderBy: { createdAt: "desc" },
        }),
      query,
      50,
    );
  }

  /** Landing-page admin code gate attempts (?success=false to see just the failures). */
  @Get("admin-gate-attempts")
  listAdminGateAttempts(@Query("success") success: "true" | "false" | undefined, @Query() query: PaginationQueryDto) {
    return this.adminGate.listAttempts(success === undefined ? undefined : success === "true", query);
  }

  /** Leads from the venue landing page's "start a quest" free-marker request form. */
  @Get("free-marker-leads")
  listFreeMarkerLeads() {
    return this.freeMarker.listAll();
  }

  /** Who did what: verify/suspend/create-business and attestation-config edits. */
  @Get("audit-log")
  listAuditLog(@Query() query: PaginationQueryDto) {
    return this.auditLog.list(query);
  }
}
