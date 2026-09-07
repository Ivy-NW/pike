/**
 * Seeds the first admin account. Admins have no self-registration UI on purpose
 * (PRD section 12) — this script is the only way the first admin gets created.
 * Run with: npm run seed:admin --workspace apps/api
 */
import "reflect-metadata";
import * as bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

async function main() {
  const prisma = new PrismaClient();
  const email = process.env.ADMIN_SEED_EMAIL;
  const password = process.env.ADMIN_SEED_PASSWORD;

  if (!email || !password) {
    throw new Error("Set ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD (see .env.example) before seeding.");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // The seeded account is always super_admin: there must be at least one account
  // able to perform the platform's highest-consequence actions (suspend a business,
  // edit attestation batch config). Further admins are created as plain "admin" role
  // and can be promoted by an existing super_admin.
  const admin = await prisma.admin.upsert({
    where: { email },
    update: { passwordHash, role: "super_admin" },
    create: { email, passwordHash, role: "super_admin" },
  });

  // eslint-disable-next-line no-console
  console.log(`Seeded admin: ${admin.email} (${admin.role})`);
  await prisma.$disconnect();
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
