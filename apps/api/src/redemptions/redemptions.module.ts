import { Module } from "@nestjs/common";
import { RedemptionsController } from "./redemptions.controller";
import { RedemptionsService } from "./redemptions.service";
import { MarkersModule } from "../markers/markers.module";
import { GamificationModule } from "../gamification/gamification.module";

@Module({
  imports: [MarkersModule, GamificationModule],
  controllers: [RedemptionsController],
  providers: [RedemptionsService],
  exports: [RedemptionsService],
})
export class RedemptionsModule {}
