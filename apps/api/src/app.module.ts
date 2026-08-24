import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { PrismaModule } from "./prisma/prisma.module";
import { RedisModule } from "./redis/redis.module";
import { AuthModule } from "./auth/auth.module";
import { BusinessesModule } from "./businesses/businesses.module";
import { VenuesModule } from "./venues/venues.module";
import { QuestsModule } from "./quests/quests.module";
import { MarkersModule } from "./markers/markers.module";
import { RedemptionsModule } from "./redemptions/redemptions.module";
import { UsersModule } from "./users/users.module";
import { AdminModule } from "./admin/admin.module";
import { PaymentsModule } from "./payments/payments.module";
import { GamificationModule } from "./gamification/gamification.module";
import { AdminGateModule } from "./admin-gate/admin-gate.module";
import { WaitlistModule } from "./waitlist/waitlist.module";
import { AttestationModule } from "./attestation/attestation.module";
import { LeaderboardModule } from "./leaderboard/leaderboard.module";
import { MacroQuestModule } from "./macro-quest/macro-quest.module";
import { FavoritesModule } from "./favorites/favorites.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { TokensModule } from "./tokens/tokens.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    RedisModule,
    AuthModule,
    BusinessesModule,
    VenuesModule,
    QuestsModule,
    MarkersModule,
    RedemptionsModule,
    UsersModule,
    AdminModule,
    PaymentsModule,
    GamificationModule,
    AdminGateModule,
    WaitlistModule,
    AttestationModule,
    TokensModule,
    LeaderboardModule,
    MacroQuestModule,
    FavoritesModule,
    NotificationsModule,
  ],
})
export class AppModule {}
