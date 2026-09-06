-- CreateTable
CREATE TABLE "free_marker_leads" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "venueName" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "neighbourhood" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "free_marker_leads_pkey" PRIMARY KEY ("id")
);
