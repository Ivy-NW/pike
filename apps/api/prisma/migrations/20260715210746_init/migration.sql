-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('unverified', 'verified');

-- CreateEnum
CREATE TYPE "QuestStatus" AS ENUM ('draft', 'live', 'paused');

-- CreateEnum
CREATE TYPE "RewardTier" AS ENUM ('low_stakes', 'high_value');

-- CreateEnum
CREATE TYPE "RewardType" AS ENUM ('discount', 'merch', 'vip_pass', 'free_item');

-- CreateEnum
CREATE TYPE "ClaimMethod" AS ENUM ('phone', 'social');

-- CreateEnum
CREATE TYPE "RedemptionStatus" AS ENUM ('claimed', 'flagged', 'rejected');

-- CreateEnum
CREATE TYPE "MarkerStatus" AS ENUM ('pending_compile', 'ready', 'failed');

-- CreateTable
CREATE TABLE "businesses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "emailVerificationToken" TEXT,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'unverified',
    "stripeCustomerId" TEXT,
    "stripePaymentMethodId" TEXT,
    "createdByAdmin" BOOLEAN NOT NULL DEFAULT false,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "suspended" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "businesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venues" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "venueType" TEXT NOT NULL,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "venues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quests" (
    "id" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "theme" TEXT NOT NULL,
    "rewardType" "RewardType" NOT NULL,
    "rewardTier" "RewardTier" NOT NULL DEFAULT 'low_stakes',
    "rewardDescription" TEXT NOT NULL,
    "maxRedemptionsPerDay" INTEGER NOT NULL DEFAULT 50,
    "expiresAt" TIMESTAMP(3),
    "status" "QuestStatus" NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "markers" (
    "id" TEXT NOT NULL,
    "questId" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "sourceImageUrl" TEXT NOT NULL,
    "compiledTargetUrl" TEXT,
    "printAssetUrl" TEXT,
    "qrFallbackUrl" TEXT NOT NULL,
    "status" "MarkerStatus" NOT NULL DEFAULT 'pending_compile',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "markers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "redemptions" (
    "id" TEXT NOT NULL,
    "markerId" TEXT NOT NULL,
    "questId" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "userId" TEXT,
    "claimMethod" "ClaimMethod",
    "status" "RedemptionStatus" NOT NULL DEFAULT 'claimed',
    "sessionId" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "flagReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "redemptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "firebaseUid" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "displayName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "businesses_email_key" ON "businesses"("email");

-- CreateIndex
CREATE UNIQUE INDEX "businesses_emailVerificationToken_key" ON "businesses"("emailVerificationToken");

-- CreateIndex
CREATE INDEX "venues_businessId_idx" ON "venues"("businessId");

-- CreateIndex
CREATE INDEX "quests_venueId_idx" ON "quests"("venueId");

-- CreateIndex
CREATE INDEX "markers_questId_idx" ON "markers"("questId");

-- CreateIndex
CREATE INDEX "markers_venueId_idx" ON "markers"("venueId");

-- CreateIndex
CREATE INDEX "redemptions_questId_createdAt_idx" ON "redemptions"("questId", "createdAt");

-- CreateIndex
CREATE INDEX "redemptions_venueId_questId_createdAt_idx" ON "redemptions"("venueId", "questId", "createdAt");

-- CreateIndex
CREATE INDEX "redemptions_sessionId_idx" ON "redemptions"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "users_firebaseUid_key" ON "users"("firebaseUid");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- AddForeignKey
ALTER TABLE "venues" ADD CONSTRAINT "venues_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quests" ADD CONSTRAINT "quests_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "venues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "markers" ADD CONSTRAINT "markers_questId_fkey" FOREIGN KEY ("questId") REFERENCES "quests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "markers" ADD CONSTRAINT "markers_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "venues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "redemptions" ADD CONSTRAINT "redemptions_markerId_fkey" FOREIGN KEY ("markerId") REFERENCES "markers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "redemptions" ADD CONSTRAINT "redemptions_questId_fkey" FOREIGN KEY ("questId") REFERENCES "quests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "redemptions" ADD CONSTRAINT "redemptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
