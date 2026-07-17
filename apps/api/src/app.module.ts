import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
  ],
})
export class AppModule {}
