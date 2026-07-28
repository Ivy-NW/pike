-- CreateTable
CREATE TABLE "favorite_venues" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_venues_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "favorite_venues_userId_idx" ON "favorite_venues"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "favorite_venues_userId_venueId_key" ON "favorite_venues"("userId", "venueId");

-- AddForeignKey
ALTER TABLE "favorite_venues" ADD CONSTRAINT "favorite_venues_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_venues" ADD CONSTRAINT "favorite_venues_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "venues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

