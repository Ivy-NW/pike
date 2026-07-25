import { Module } from "@nestjs/common";
import { GamificationModule } from "../gamification/gamification.module";
import { LeaderboardController } from "./leaderboard.controller";
import { LeaderboardService } from "./leaderboard.service";

@Module({
  imports: [GamificationModule],
  controllers: [LeaderboardController],
  providers: [LeaderboardService],
})
export class LeaderboardModule {}
