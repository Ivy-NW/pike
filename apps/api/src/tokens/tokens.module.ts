import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { RedisModule } from "../redis/redis.module";
import { TokenWalletService } from "./token-wallet.service";
import { TokenQueueService } from "./token-queue.service";
import { TokenChainService } from "./token-chain.service";
import { TokenBatchService } from "./token-batch.service";
import { ReconciliationService } from "./reconciliation.service";

@Module({
  imports: [PrismaModule, RedisModule],
  providers: [TokenWalletService, TokenQueueService, TokenChainService, TokenBatchService, ReconciliationService],
  exports: [TokenQueueService, TokenWalletService, ReconciliationService],
})
export class TokensModule {}
