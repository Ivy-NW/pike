import { Global, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { PasswordService } from "./password.service";
import { TokenService } from "./token.service";
import { FirebaseAdminService } from "./firebase-admin.service";
import { BusinessAuthGuard } from "./guards/business-auth.guard";
import { AdminAuthGuard } from "./guards/admin-auth.guard";
import { ConsumerAuthGuard } from "./guards/consumer-auth.guard";

/**
 * Global so BusinessAuthGuard/AdminAuthGuard/ConsumerAuthGuard can be used with
 * `@UseGuards(...)` from any feature module without re-importing AuthModule everywhere.
 */
@Global()
@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordService,
    TokenService,
    FirebaseAdminService,
    BusinessAuthGuard,
    AdminAuthGuard,
    ConsumerAuthGuard,
  ],
  exports: [
    AuthService,
    PasswordService,
    TokenService,
    FirebaseAdminService,
    BusinessAuthGuard,
    AdminAuthGuard,
    ConsumerAuthGuard,
  ],
})
export class AuthModule {}
