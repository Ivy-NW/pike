import { Module } from "@nestjs/common";
import { AdminGateController } from "./admin-gate.controller";
import { AdminGateService } from "./admin-gate.service";

@Module({
  controllers: [AdminGateController],
  providers: [AdminGateService],
  exports: [AdminGateService],
})
export class AdminGateModule {}
