import { Module } from "@nestjs/common";
import { QuestsController } from "./quests.controller";
import { QuestsService } from "./quests.service";
import { VenuesModule } from "../venues/venues.module";
import { BusinessesModule } from "../businesses/businesses.module";

@Module({
  imports: [VenuesModule, BusinessesModule],
  controllers: [QuestsController],
  providers: [QuestsService],
  exports: [QuestsService],
})
export class QuestsModule {}
