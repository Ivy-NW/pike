import { Module } from "@nestjs/common";
import { AttestationHashService } from "./attestation-hash.service";
import { AttestationQueueService } from "./attestation-queue.service";
import { AttestationConfigService } from "./attestation-config.service";
import { AttestationChainService } from "./attestation-chain.service";
import { AttestationBatchService } from "./attestation-batch.service";
import { AttestationSchedulerService } from "./attestation-scheduler.service";
import { AttestationVerifyService } from "./attestation-verify.service";

@Module({
  providers: [
    AttestationHashService,
    AttestationQueueService,
    AttestationConfigService,
    AttestationChainService,
    AttestationBatchService,
    AttestationSchedulerService,
    AttestationVerifyService,
  ],
  exports: [AttestationHashService, AttestationQueueService, AttestationVerifyService, AttestationConfigService],
})
export class AttestationModule {}
