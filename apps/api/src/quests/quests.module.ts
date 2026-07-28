import { Module } from "@nestjs/common";
import { QuestsController } from "./quests.controller";
import { QuestsService } from "./quests.service";
import { VenuesModule } from "../venues/venues.module";
import { BusinessesModule } from "../businesses/businesses.module";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [VenuesModule, BusinessesModule, NotificationsModule],
  controllers: [QuestsController],
  providers: [QuestsService],
  exports: [QuestsService],
})
export class QuestsModule {}
