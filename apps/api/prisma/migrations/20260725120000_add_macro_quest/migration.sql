-- CreateEnum
CREATE TYPE "MacroQuestStatus" AS ENUM ('draft', 'live', 'ended');

-- CreateTable
CREATE TABLE "macro_quests" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requiredVenues" INTEGER NOT NULL,
    "rewardType" "RewardType" NOT NULL,
    "rewardDescription" TEXT NOT NULL,
    "rewardTier" "RewardTier" NOT NULL DEFAULT 'high_value',
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "status" "MacroQuestStatus" NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "macro_quests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "macro_quest_venues" (
    "id" TEXT NOT NULL,
    "macroQuestId" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,

    CONSTRAINT "macro_quest_venues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "macro_quest_completions" (
    "id" TEXT NOT NULL,
    "macroQuestId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "macro_quest_completions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "macro_quests_status_idx" ON "macro_quests"("status");

-- CreateIndex
CREATE INDEX "macro_quest_venues_macroQuestId_idx" ON "macro_quest_venues"("macroQuestId");

-- CreateIndex
CREATE UNIQUE INDEX "macro_quest_venues_macroQuestId_venueId_key" ON "macro_quest_venues"("macroQuestId", "venueId");

-- CreateIndex
CREATE INDEX "macro_quest_completions_userId_idx" ON "macro_quest_completions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "macro_quest_completions_macroQuestId_userId_key" ON "macro_quest_completions"("macroQuestId", "userId");

-- AddForeignKey
ALTER TABLE "macro_quest_venues" ADD CONSTRAINT "macro_quest_venues_macroQuestId_fkey" FOREIGN KEY ("macroQuestId") REFERENCES "macro_quests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "macro_quest_venues" ADD CONSTRAINT "macro_quest_venues_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "venues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "macro_quest_completions" ADD CONSTRAINT "macro_quest_completions_macroQuestId_fkey" FOREIGN KEY ("macroQuestId") REFERENCES "macro_quests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "macro_quest_completions" ADD CONSTRAINT "macro_quest_completions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
