/**
 * Seeds the single AttestationConfig row (id=1) from env vars. FR-A3: the batch
 * window/threshold are meant to be admin-editable at runtime after this — env vars only
 * seed the initial values, they are not read again once this row exists.
 * Run with: npm run seed:attestation-config --workspace apps/api
 */
import "reflect-metadata";
import { PrismaClient } from "@prisma/client";

async function main() {
  const prisma = new PrismaClient();

  const batchWindowMs = Number(process.env.ATTESTATION_BATCH_WINDOW_MS ?? 300_000);
  const batchCountThreshold = Number(process.env.ATTESTATION_BATCH_COUNT_THRESHOLD ?? 500);
  const maxRetries = Number(process.env.ATTESTATION_MAX_RETRIES ?? 5);

  const config = await prisma.attestationConfig.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, batchWindowMs, batchCountThreshold, maxRetries },
  });

  // eslint-disable-next-line no-console
  console.log(`Attestation config ready: ${JSON.stringify(config)}`);
  await prisma.$disconnect();
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
