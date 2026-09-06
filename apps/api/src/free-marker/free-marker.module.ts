import { Module } from "@nestjs/common";
import { FreeMarkerController } from "./free-marker.controller";
import { FreeMarkerService } from "./free-marker.service";

@Module({
  controllers: [FreeMarkerController],
  providers: [FreeMarkerService],
  exports: [FreeMarkerService],
})
export class FreeMarkerModule {}
