import hre from "hardhat";

async function main() {
  const [deployer] = await hre.viem.getWalletClients();
  if (!deployer) {
    throw new Error("No deployer account configured — set ATTESTATION_WALLET_PRIVATE_KEY in .env");
  }

  const registry = await hre.viem.deployContract("AttestationRegistry", [deployer.account.address]);

  console.log(`AttestationRegistry deployed to ${registry.address}`);
  console.log(`Owner (service wallet): ${deployer.account.address}`);
  console.log(`Set ATTESTATION_CONTRACT_ADDRESS="${registry.address}" in your .env`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
