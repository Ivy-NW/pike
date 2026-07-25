/**
 * Seeds a small, known Phase 2 demo dataset for testing the authenticated in-app scan
 * (progress.md "Next Work"): one business + venue, one LIVE quest, one READY marker, and
 * one consumer user in a clean "about to earn their first XP" state.
 *
 * "Unclaimed redemption" here means the ready-to-claim state, not a pre-created claim row:
 * the demo user has NOT claimed the quest, so scanning the marker creates the redemption and
 * awards the first 50 XP (ADR 0005). Each run resets that state (clears the demo user's
 * redemptions/badges and zeroes XP/streaks) so the scan flow is repeatable.
 *
 * Idempotent: fixed IDs are upserted, so re-running updates the same rows. The marker ID is
 * printed at the end — open /scan/<markerId> in the app to test.
 *
 * Run with: npm run seed:phase2 --workspace apps/api
 * Optional overrides: DEMO_USER_EMAIL, DEMO_USER_PASSWORD, DEMO_USER_USERNAME, DEMO_USER_PHONE.
 */
import "reflect-metadata";
import * as bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

// Fixed IDs so the dataset is stable and re-runnable (the marker ID is what the app routes to).
const BUSINESS_ID = "00000000-0000-4000-a000-000000000001";
const VENUE_ID = "00000000-0000-4000-a000-000000000002";
const QUEST_ID = "00000000-0000-4000-a000-000000000003";
const MARKER_ID = "00000000-0000-4000-a000-000000000004";
const USER_ID = "00000000-0000-4000-a000-000000000005";
// Phase 3 — FR-5: two more venues + a macro-quest spanning all three.
const VENUE2_ID = "00000000-0000-4000-a000-000000000006";
const VENUE3_ID = "00000000-0000-4000-a000-000000000007";
const MACRO_QUEST_ID = "00000000-0000-4000-a000-000000000008";

async function main() {
  const prisma = new PrismaClient();

  const email = process.env.DEMO_USER_EMAIL ?? "demo@pike.test";
  const password = process.env.DEMO_USER_PASSWORD ?? "pike1234";
  const username = process.env.DEMO_USER_USERNAME ?? "demoexplorer";
  const phone = process.env.DEMO_USER_PHONE ?? "+15550000001";
  const passwordHash = await bcrypt.hash(password, 10);

  // Business is payment-verified so a live quest is consistent with the publish gate (FR-11).
  await prisma.business.upsert({
    where: { id: BUSINESS_ID },
    update: {},
    create: {
      id: BUSINESS_ID,
      name: "Demo Aquarium",
      email: "owner@demo-aquarium.test",
      paymentStatus: "verified",
      emailVerified: true,
    },
  });

  await prisma.venue.upsert({
    where: { id: VENUE_ID },
    update: {},
    create: {
      id: VENUE_ID,
      businessId: BUSINESS_ID,
      name: "Demo Aquarium — Main Hall",
      venueType: "aquarium",
      address: "1 Harbor Way",
    },
  });

  // Two more participating venues for the macro-quest (no quests/markers needed — the macro-quest
  // counts any non-rejected redemption at these venues).
  for (const [id, name, type] of [
    [VENUE2_ID, "Demo Aquarium — Tide Pools", "aquarium"],
    [VENUE3_ID, "Demo Aquarium — Shark Reef", "aquarium"],
  ] as const) {
    await prisma.venue.upsert({
      where: { id },
      update: {},
      create: { id, businessId: BUSINESS_ID, name, venueType: type },
    });
  }

  // Live macro-quest: visit 2 of the 3 venues within a wide window to unlock the top reward.
  const now = Date.now();
  await prisma.macroQuest.upsert({
    where: { id: MACRO_QUEST_ID },
    update: { status: "live" },
    create: {
      id: MACRO_QUEST_ID,
      name: "Deep Dive Challenge",
      description: "Visit 2 of our 3 exhibits this month to unlock the VIP reward.",
      requiredVenues: 2,
      rewardType: "vip_pass",
      rewardTier: "high_value",
      rewardDescription: "VIP behind-the-scenes aquarium tour",
      startsAt: new Date(now - 30 * 24 * 60 * 60 * 1000),
      endsAt: new Date(now + 30 * 24 * 60 * 60 * 1000),
      status: "live",
    },
  });
  for (const venueId of [VENUE_ID, VENUE2_ID, VENUE3_ID]) {
    await prisma.macroQuestVenue.upsert({
      where: { macroQuestId_venueId: { macroQuestId: MACRO_QUEST_ID, venueId } },
      update: {},
      create: { macroQuestId: MACRO_QUEST_ID, venueId },
    });
  }

  await prisma.quest.upsert({
    where: { id: QUEST_ID },
    update: { status: "live" },
    create: {
      id: QUEST_ID,
      venueId: VENUE_ID,
      name: "Find the Kraken",
      theme: "pirate",
      rewardType: "discount",
      rewardTier: "low_stakes",
      rewardDescription: "10% off at the gift shop",
      maxRedemptionsPerDay: 50,
      status: "live",
    },
  });

  // Marker must be "ready" to surface in the app quest list (UsersService.questList filters on it).
  // 8th Wall compile output is stubbed in dev (ADR 0004) — sourceImageUrl/qrFallbackUrl are enough.
  await prisma.marker.upsert({
    where: { id: MARKER_ID },
    update: { status: "ready" },
    create: {
      id: MARKER_ID,
      questId: QUEST_ID,
      venueId: VENUE_ID,
      sourceImageUrl: "https://placehold.co/600x600/png?text=Kraken+Marker",
      qrFallbackUrl: `http://localhost:5173/scan/${MARKER_ID}`,
      status: "ready",
    },
  });

  await prisma.user.upsert({
    where: { id: USER_ID },
    update: { username, name: "Demo Explorer", email, phone, passwordHash },
    create: {
      id: USER_ID,
      username,
      name: "Demo Explorer",
      email,
      phone,
      passwordHash,
    },
  });

  // Reset the demo user to a pristine "first claim" state so the scan test is repeatable:
  // drop any prior redemptions on this marker + this user's badges, and zero XP/streaks.
  await prisma.redemption.deleteMany({ where: { OR: [{ markerId: MARKER_ID }, { userId: USER_ID }] } });
  await prisma.userBadge.deleteMany({ where: { userId: USER_ID } });
  await prisma.macroQuestCompletion.deleteMany({ where: { userId: USER_ID } });
  await prisma.user.update({
    where: { id: USER_ID },
    data: { xp: 0, currentStreak: 0, longestStreak: 0, lastQuestCompletedAt: null },
  });

  // eslint-disable-next-line no-console
  console.log(
    [
      "Seeded Phase 2 demo dataset:",
      `  business : Demo Aquarium (${BUSINESS_ID})`,
      `  venue    : Demo Aquarium — Main Hall (${VENUE_ID})`,
      `  quest    : Find the Kraken [live] (${QUEST_ID})`,
      `  marker   : ready (${MARKER_ID})`,
      `  macro    : Deep Dive Challenge [live] — visit 2 of 3 venues (${MACRO_QUEST_ID})`,
      `  user     : ${email} / ${password}  (username: ${username})`,
      "",
      `Test the in-app scan by opening: /scan/${MARKER_ID}`,
      "The macro-quest progresses as the demo user completes quests at the 3 seeded venues.",
    ].join("\n"),
  );

  await prisma.$disconnect();
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
