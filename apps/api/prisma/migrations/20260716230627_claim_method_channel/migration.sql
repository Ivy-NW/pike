-- AlterEnum
BEGIN;
CREATE TYPE "ClaimMethod_new" AS ENUM ('webar', 'app');
ALTER TABLE "redemptions" ALTER COLUMN "claimMethod" TYPE "ClaimMethod_new" USING ("claimMethod"::text::"ClaimMethod_new");
ALTER TYPE "ClaimMethod" RENAME TO "ClaimMethod_old";
ALTER TYPE "ClaimMethod_new" RENAME TO "ClaimMethod";
DROP TYPE "ClaimMethod_old";
COMMIT;

