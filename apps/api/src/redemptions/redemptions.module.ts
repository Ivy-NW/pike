import { Module } from "@nestjs/common";
import { RedemptionsController } from "./redemptions.controller";
import { RedemptionsService } from "./redemptions.service";
import { MarkersModule } from "../markers/markers.module";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [MarkersModule, UsersModule],
  controllers: [RedemptionsController],
  providers: [RedemptionsService],
  exports: [RedemptionsService],
})
export class RedemptionsModule {}
