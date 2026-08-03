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
  // OpenZeppelin's ERC1155 pulls in Arrays.sol, which uses the `mcopy` opcode (EIP-5656) and
  // therefore needs a Cancun-capable compiler — 0.8.25+. Avalanche C-Chain has supported those
  // opcodes since the Durango upgrade, so targeting cancun is safe on both Fuji and mainnet.
  //
  // AttestationRegistry is pinned to its original 0.8.24/shanghai settings: it is already
  // deployed (Fuji 0x86124ef07500b269449c953967516a1f75fd0323) and recompiling it under a
  // different compiler would produce bytecode that no longer matches the deployed contract,
  // breaking source verification for no benefit.
  solidity: {
    compilers: [{ version: "0.8.28", settings: { evmVersion: "cancun" } }],
    overrides: {
      "contracts/AttestationRegistry.sol": { version: "0.8.24", settings: {} },
    },
  },
  networks: {
    avalancheFuji: {
      url: process.env.AVALANCHE_RPC_URL ?? "https://api.avax-test.network/ext/bc/C/rpc",
      chainId: 43113,
      accounts: deployerAccounts,
      // Avalanche C-Chain caps a block at 15M gas. Hardhat otherwise falls back to its own
      // 30M default, which the RPC rejects outright with "exceeds block gas limit" before the
      // transaction is ever broadcast. Unused gas is refunded, so this is a ceiling, not a spend
      // — the ERC1155 deployments land around 2-3M.
      gas: 8_000_000,
    },
    avalanche: {
      url: process.env.AVALANCHE_MAINNET_RPC_URL ?? "https://api.avax.network/ext/bc/C/rpc",
      chainId: 43114,
      accounts: deployerAccounts,
      gas: 8_000_000,
    },
  },
};

export default config;
