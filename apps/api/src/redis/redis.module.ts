import { Global, Module } from "@nestjs/common";
import { RedisService } from "./redis.service";
import { RedemptionCapService } from "./redemption-cap.service";

@Global()
@Module({
  providers: [RedisService, RedemptionCapService],
  exports: [RedisService, RedemptionCapService],
})
export class RedisModule {}
