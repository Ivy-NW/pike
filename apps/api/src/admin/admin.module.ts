import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { BusinessesModule } from "../businesses/businesses.module";
import { VenuesModule } from "../venues/venues.module";
import { QuestsModule } from "../quests/quests.module";
import { AdminGateModule } from "../admin-gate/admin-gate.module";

@Module({
  imports: [BusinessesModule, VenuesModule, QuestsModule, AdminGateModule],
  controllers: [AdminController],
})
export class AdminModule {}
