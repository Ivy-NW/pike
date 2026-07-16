import { Module } from "@nestjs/common";
import { MarkersController } from "./markers.controller";
import { MarkersService } from "./markers.service";
import { MarkerCompileService } from "./marker-compile.service";
import { QuestsModule } from "../quests/quests.module";

@Module({
  imports: [QuestsModule],
  controllers: [MarkersController],
  providers: [MarkersService, MarkerCompileService],
  exports: [MarkersService],
})
export class MarkersModule {}
