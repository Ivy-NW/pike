-- CreateEnum
CREATE TYPE "WaitlistAudience" AS ENUM ('consumer', 'business');

-- CreateTable
CREATE TABLE "admin_gate_attempts" (
    "id" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_gate_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "waitlist_signups" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "audience" "WaitlistAudience" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "waitlist_signups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "admin_gate_attempts_ipHash_createdAt_idx" ON "admin_gate_attempts"("ipHash", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "waitlist_signups_email_key" ON "waitlist_signups"("email");
