import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createPublicClient, createWalletClient, http, parseEventLogs, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { avalanche, avalancheFuji } from "viem/chains";
import { attestationRegistryAbi } from "./attestation-registry.abi";

/**
 * Service-wallet-only chain access (FR-A7: never exposed to any client, dashboard user, or
 * venue owner) — viem over ethers/thirdweb since there's no user-facing wallet UX to build,
 * and viem's built-in Avalanche chain defs + keccak256 (shared with AttestationHashService)
 * keep the dependency surface small.
 */
@Injectable()
export class AttestationChainService implements OnModuleInit {
  private readonly logger = new Logger(AttestationChainService.name);
  private publicClient?: ReturnType<typeof createPublicClient>;
  private walletClient?: ReturnType<typeof createWalletClient>;
  private contractAddress?: Hex;
  private chainId?: number;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const rpcUrl = this.config.get<string>("AVALANCHE_RPC_URL");
    const chainIdRaw = this.config.get<string>("AVALANCHE_CHAIN_ID");
    const privateKey = this.config.get<string>("ATTESTATION_WALLET_PRIVATE_KEY");
    const contractAddress = this.config.get<string>("ATTESTATION_CONTRACT_ADDRESS");

    if (!rpcUrl || !chainIdRaw || !privateKey || !contractAddress) {
      this.logger.warn(
        "Avalanche attestation env vars are not fully configured — on-chain writes will fail " +
          "until AVALANCHE_RPC_URL, AVALANCHE_CHAIN_ID, ATTESTATION_WALLET_PRIVATE_KEY, and " +
          "ATTESTATION_CONTRACT_ADDRESS are all set.",
      );
      return;
    }

    this.chainId = Number(chainIdRaw);
    const chain = this.chainId === avalanche.id ? avalanche : avalancheFuji;
    const account = privateKeyToAccount(privateKey as Hex);
    this.contractAddress = contractAddress as Hex;

    this.publicClient = createPublicClient({ chain, transport: http(rpcUrl) });
    this.walletClient = createWalletClient({ account, chain, transport: http(rpcUrl) });
  }

  get chainIdForBatch(): number | undefined {
    return this.chainId;
  }

  private requirePublicClient() {
    if (!this.publicClient) throw new Error("Attestation chain client is not configured — check Avalanche env vars.");
    return this.publicClient;
  }

  private requireWalletClient() {
    if (!this.walletClient || !this.contractAddress) {
      throw new Error("Attestation chain client is not configured — check Avalanche env vars.");
    }
    return { walletClient: this.walletClient, contractAddress: this.contractAddress };
  }

  async submitRoot(root: Hex, itemCount: number): Promise<Hex> {
    const { walletClient, contractAddress } = this.requireWalletClient();
    return walletClient.writeContract({
      address: contractAddress,
      abi: attestationRegistryAbi,
      functionName: "submitRoot",
      args: [root, BigInt(itemCount)],
      chain: walletClient.chain,
      account: walletClient.account ?? null,
    });
  }

  /** Waits for the batch tx to confirm — acceptable to block here since this already runs
   * off the visitor-facing critical path (Avalanche has sub-second finality per the PRD). */
  async getReceipt(txHash: Hex) {
    return this.requirePublicClient().waitForTransactionReceipt({ hash: txHash });
  }

  /** Reads the *live on-chain* root for a batch's tx — used by FR-A5 verification to cross-
   * check against what's cached in Postgres, catching the case where the DB's own copy of
   * the root (not just the completion hash) was tampered with. */
  async readRootFromChain(txHash: Hex): Promise<Hex> {
    const receipt = await this.requirePublicClient().getTransactionReceipt({ hash: txHash });
    const [event] = parseEventLogs({ abi: attestationRegistryAbi, logs: receipt.logs, eventName: "RootSubmitted" });
    if (!event) throw new Error(`No RootSubmitted event found in tx ${txHash}`);
    return event.args.root;
  }
}
