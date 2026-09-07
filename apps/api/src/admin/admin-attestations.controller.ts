import { Body, Controller, Get, Param, Patch, Req, UseGuards } from "@nestjs/common";
import { AdminAuthGuard } from "../auth/guards/admin-auth.guard";
import { SuperAdminGuard } from "../auth/guards/super-admin.guard";
import { AttestationVerifyService } from "../attestation/attestation-verify.service";
import { AttestationConfigService } from "../attestation/attestation-config.service";
import { AdminAuditLogService } from "./admin-audit-log.service";
import { UpdateAttestationConfigDto } from "./dto/update-attestation-config.dto";

/**
 * On-chain attestation addendum, FR-A5: the concrete "who owns fraud review" answer — a
 * tool, not just a database the reviewer has to trust. Same guard pattern as
 * AdminController (every route requires the admin's own JWT).
 */
@Controller("admin/attestations")
@UseGuards(AdminAuthGuard)
export class AdminAttestationsController {
  constructor(
    private readonly verify: AttestationVerifyService,
    private readonly config: AttestationConfigService,
    private readonly auditLog: AdminAuditLogService,
  ) {}

  /** Pastes a completion id, gets back the stored hash, proof, on-chain root, and a pass/fail match. */
  @Get(":redemptionId/verify")
  verifyRedemption(@Param("redemptionId") redemptionId: string) {
    return this.verify.verify(redemptionId);
  }

  /** FR-A3: current batch window/threshold — the runtime knob, not the env-var seed value. */
  @Get("config")
  getConfig() {
    return this.config.getConfig();
  }

  /** Changes production attestation batch timing — restricted to super admins, logged. */
  @Patch("config")
  @UseGuards(SuperAdminGuard)
  async updateConfig(@Req() req: any, @Body() dto: UpdateAttestationConfigDto) {
    const config = await this.config.updateConfig(dto);
    await this.auditLog.record(req.adminId, "attestation-config.update", "attestation-config", undefined, dto as any);
    return config;
  }
}
