import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { AdminAttestationsController } from "./admin-attestations.controller";
import { BusinessesModule } from "../businesses/businesses.module";
import { VenuesModule } from "../venues/venues.module";
import { QuestsModule } from "../quests/quests.module";
import { AdminGateModule } from "../admin-gate/admin-gate.module";
import { AttestationModule } from "../attestation/attestation.module";
import { FreeMarkerModule } from "../free-marker/free-marker.module";

@Module({
  imports: [BusinessesModule, VenuesModule, QuestsModule, AdminGateModule, AttestationModule, FreeMarkerModule],
  controllers: [AdminController, AdminAttestationsController],
})
export class AdminModule {}
