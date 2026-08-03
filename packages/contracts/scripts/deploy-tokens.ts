import hre from "hardhat";

/**
 * Deploys the soulbound token layer (docs/PIKE_token_layer_PRD.md phase B, ADR 0007):
 * PikeAchievements (gamification mechanics) and PikeRewardVouchers (tokenized incentives).
 *
 * Kept separate from scripts/deploy.ts so redeploying the token layer can never accidentally
 * redeploy AttestationRegistry — that one is already live and its address is referenced by
 * every attested redemption's stored proof.
 *
 * Both contracts are owned by the deploying service wallet: only the backend ever mints or
 * burns (FR-T9). Run with:
 *   npm run deploy:tokens:fuji --workspace packages/contracts
 */

/** Metadata base URIs. ERC-1155 substitutes {id} client-side; no PII is served from either. */
const ACHIEVEMENTS_URI = process.env.ACHIEVEMENTS_METADATA_URI ?? "https://api.pike.app/achievements/{id}.json";
const VOUCHERS_URI = process.env.VOUCHERS_METADATA_URI ?? "https://api.pike.app/vouchers/{id}.json";

async function main() {
  const [deployer] = await hre.viem.getWalletClients();
  if (!deployer) {
    throw new Error("No deployer account configured — set ATTESTATION_WALLET_PRIVATE_KEY in .env");
  }

  const achievements = await hre.viem.deployContract("PikeAchievements", [
    deployer.account.address,
    ACHIEVEMENTS_URI,
  ]);
  const vouchers = await hre.viem.deployContract("PikeRewardVouchers", [
    deployer.account.address,
    VOUCHERS_URI,
  ]);

  console.log(`PikeAchievements   deployed to ${achievements.address}`);
  console.log(`PikeRewardVouchers deployed to ${vouchers.address}`);
  console.log(`Owner (service wallet): ${deployer.account.address}`);
  console.log("");
  console.log("Add to your .env:");
  console.log(`ACHIEVEMENTS_CONTRACT_ADDRESS="${achievements.address}"`);
  console.log(`REWARD_VOUCHERS_CONTRACT_ADDRESS="${vouchers.address}"`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
