-- CreateEnum
CREATE TYPE "AttestationStatus" AS ENUM ('pending', 'queued', 'batched', 'confirmed', 'failed');

-- CreateEnum
CREATE TYPE "BatchStatus" AS ENUM ('building', 'submitting', 'confirmed', 'failed');

-- AlterTable
ALTER TABLE "redemptions" ADD COLUMN     "attestationBatchId" TEXT,
ADD COLUMN     "attestationHash" TEXT,
ADD COLUMN     "attestationStatus" "AttestationStatus" NOT NULL DEFAULT 'pending',
ADD COLUMN     "merkleLeafIndex" INTEGER,
ADD COLUMN     "merkleProof" JSONB;

-- CreateTable
CREATE TABLE "attestation_batches" (
    "id" TEXT NOT NULL,
    "status" "BatchStatus" NOT NULL DEFAULT 'building',
    "merkleRoot" TEXT,
    "itemCount" INTEGER NOT NULL,
    "txHash" TEXT,
    "chainId" INTEGER,
    "gasUsed" BIGINT,
    "gasCostWei" BIGINT,
    "windowStartAt" TIMESTAMP(3) NOT NULL,
    "windowEndAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "confirmedAt" TIMESTAMP(3),
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attestation_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attestation_config" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "batchWindowMs" INTEGER NOT NULL,
    "batchCountThreshold" INTEGER NOT NULL,
    "maxRetries" INTEGER NOT NULL DEFAULT 5,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attestation_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "attestation_batches_txHash_key" ON "attestation_batches"("txHash");

-- CreateIndex
CREATE INDEX "attestation_batches_status_idx" ON "attestation_batches"("status");

-- CreateIndex
CREATE INDEX "redemptions_attestationStatus_idx" ON "redemptions"("attestationStatus");

-- CreateIndex
CREATE INDEX "redemptions_attestationBatchId_idx" ON "redemptions"("attestationBatchId");

-- AddForeignKey
ALTER TABLE "redemptions" ADD CONSTRAINT "redemptions_attestationBatchId_fkey" FOREIGN KEY ("attestationBatchId") REFERENCES "attestation_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

