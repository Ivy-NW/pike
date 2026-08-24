import { Module } from "@nestjs/common";
import { TokensModule } from "../tokens/tokens.module";
import { GamificationService } from "./gamification.service";

@Module({
  imports: [TokensModule],
  providers: [GamificationService],
  exports: [GamificationService],
})
export class GamificationModule {}
