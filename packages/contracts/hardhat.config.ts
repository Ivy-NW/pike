import path from "node:path";
import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import * as dotenv from "dotenv";

// apps/api/.env — the same file @nestjs/config reads at runtime (ConfigModule.forRoot()
// resolves .env relative to process.cwd(), and the API always runs with apps/api as its
// cwd via the workspace scripts) — kept as one shared source of the wallet key/RPC URLs
// rather than a second, contracts-only env file.
dotenv.config({ path: path.join(__dirname, "../../apps/api/.env") });

const DEPLOYER_PRIVATE_KEY = process.env.ATTESTATION_WALLET_PRIVATE_KEY;
const deployerAccounts = DEPLOYER_PRIVATE_KEY ? [DEPLOYER_PRIVATE_KEY] : [];

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    avalancheFuji: {
      url: process.env.AVALANCHE_RPC_URL ?? "https://api.avax-test.network/ext/bc/C/rpc",
      chainId: 43113,
      accounts: deployerAccounts,
    },
    avalanche: {
      url: process.env.AVALANCHE_MAINNET_RPC_URL ?? "https://api.avax.network/ext/bc/C/rpc",
      chainId: 43114,
      accounts: deployerAccounts,
    },
  },
};

export default config;
