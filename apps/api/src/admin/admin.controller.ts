import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { AdminAuthGuard } from "../auth/guards/admin-auth.guard";
import { BusinessesService } from "../businesses/businesses.service";
import { VenuesService } from "../venues/venues.service";
import { QuestsService } from "../quests/quests.service";
import { PrismaService } from "../prisma/prisma.service";
import { AdminGateService } from "../admin-gate/admin-gate.service";
import { AdminCreateBusinessDto } from "./dto/admin-create-business.dto";
import { SuspendBusinessDto } from "./dto/suspend-business.dto";

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
  ) {}

  /** Sales-assisted onboarding — secondary path alongside business self-registration. */
  @Post("businesses")
  createBusiness(@Body() dto: AdminCreateBusinessDto) {
    return this.businesses.adminCreate(dto.name, dto.email, dto.comp);
  }

  @Get("businesses")
  listBusinesses() {
    return this.businesses.listAll();
  }

  /** Comping a partner: mark verified without a card on file. */
  @Post("businesses/:id/verify")
  verifyBusiness(@Param("id") id: string) {
    return this.businesses.adminMarkVerified(id);
  }

  @Post("businesses/:id/suspend")
  suspendBusiness(@Param("id") id: string, @Body() dto: SuspendBusinessDto) {
    return this.businesses.adminSuspend(id, dto.suspended);
  }

  @Get("venues")
  listVenues() {
    return this.venues.listAll();
  }

  @Get("quests")
  listQuests() {
    return this.quests.listAll();
  }

  /** Platform-wide redemptions; ?status=flagged surfaces FR-13's anti-gaming signal for review. */
  @Get("redemptions")
  listRedemptions(@Query("status") status?: "claimed" | "flagged" | "rejected") {
    return this.prisma.redemption.findMany({
      where: status ? { status } : undefined,
      include: { quest: true, marker: { include: { venue: true } } },
      orderBy: { createdAt: "desc" },
      take: 500,
    });
  }

  /** Landing-page admin code gate attempts (?success=false to see just the failures). */
  @Get("admin-gate-attempts")
  listAdminGateAttempts(@Query("success") success?: "true" | "false") {
    return this.adminGate.listAttempts(success === undefined ? undefined : success === "true");
  }
}
