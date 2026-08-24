import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createPublicClient, createWalletClient, http, keccak256, toHex, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { avalanche, avalancheFuji } from "viem/chains";
import { pikeAchievementsAbi, pikeRewardVouchersAbi } from "./token-contracts.abi";

/**
 * Phase C — on-chain interaction with PikeAchievements and PikeRewardVouchers.
 *
 * Reuses the same service-wallet pattern as AttestationChainService (FR-T9: backend-held,
 * never exposed to any client, dashboard user, or venue owner). The open question from
 * PRD section 12 — do token contracts share the attestation wallet or use a separate key —
 * is answered here: separate keys by default (different env vars), but they can point to
 * the same key if desired (blast radius vs. simplicity tradeoff).
 */
@Injectable()
export class TokenChainService implements OnModuleInit {
  private readonly logger = new Logger(TokenChainService.name);
  private publicClient?: ReturnType<typeof createPublicClient>;
  private walletClient?: ReturnType<typeof createWalletClient>;
  private achievementsAddress?: Hex;
  private vouchersAddress?: Hex;
  private chainId?: number;
  private enabled = false;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const rpcUrl = this.config.get<string>("AVALANCHE_RPC_URL");
    const chainIdRaw = this.config.get<string>("AVALANCHE_CHAIN_ID");
    const privateKey = this.config.get<string>("TOKEN_WALLET_PRIVATE_KEY");
    const achievementsAddress = this.config.get<string>("PIKE_ACHIEVEMENTS_ADDRESS");
    const vouchersAddress = this.config.get<string>("PIKE_REWARD_VOUCHERS_ADDRESS");

    if (!rpcUrl || !chainIdRaw || !privateKey || !achievementsAddress || !vouchersAddress) {
      this.logger.warn(
        "Token layer env vars not fully configured — minting/burning will fail until " +
          "AVALANCHE_RPC_URL, AVALANCHE_CHAIN_ID, TOKEN_WALLET_PRIVATE_KEY, " +
          "PIKE_ACHIEVEMENTS_ADDRESS, and PIKE_REWARD_VOUCHERS_ADDRESS are all set.",
      );
      return;
    }

    this.chainId = Number(chainIdRaw);
    const chain = this.chainId === avalanche.id ? avalanche : avalancheFuji;
    const account = privateKeyToAccount(privateKey as Hex);

    this.achievementsAddress = achievementsAddress as Hex;
    this.vouchersAddress = vouchersAddress as Hex;
    this.publicClient = createPublicClient({ chain, transport: http(rpcUrl) });
    this.walletClient = createWalletClient({ account, chain, transport: http(rpcUrl) });
    this.enabled = true;

    this.logger.log(
      `Token chain service initialized (chain ${this.chainId}, achievements ${this.achievementsAddress}, vouchers ${this.vouchersAddress})`,
    );
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  /** Check if a user holds a specific achievement (balance 0 or 1). */
  async hasAchievement(holder: Hex, tokenId: number): Promise<boolean> {
    if (!this.publicClient || !this.achievementsAddress) return false;
    const balance = (await this.publicClient.readContract({
      address: this.achievementsAddress,
      abi: pikeAchievementsAbi,
      functionName: "balanceOf",
      args: [holder, BigInt(tokenId)],
    })) as bigint;
    return balance > 0n;
  }

  /** Mint achievements in batch. Returns transaction hash. */
  async mintAchievementsBatch(holders: Hex[], tokenIds: number[]): Promise<Hex> {
    if (!this.walletClient || !this.achievementsAddress) {
      throw new Error("Token chain service not initialized");
    }

    const hash = await this.walletClient.writeContract({
      address: this.achievementsAddress,
      abi: pikeAchievementsAbi,
      functionName: "mintBatch",
      args: [holders, tokenIds.map(BigInt)],
    } as any);

    return hash;
  }

  /** Check if a voucher was issued for a redemption (by redemptionRef hash). */
  async isVoucherIssued(redemptionId: string): Promise<boolean> {
    if (!this.publicClient || !this.vouchersAddress) return false;
    const redemptionRef = keccak256(toHex(redemptionId));
    const result = (await this.publicClient.readContract({
      address: this.vouchersAddress,
      abi: pikeRewardVouchersAbi,
      functionName: "issued",
      args: [redemptionRef],
    })) as boolean;
    return result;
  }

  /** Check if a voucher was redeemed. */
  async isVoucherRedeemed(redemptionId: string): Promise<boolean> {
    if (!this.publicClient || !this.vouchersAddress) return false;
    const redemptionRef = keccak256(toHex(redemptionId));
    const result = (await this.publicClient.readContract({
      address: this.vouchersAddress,
      abi: pikeRewardVouchersAbi,
      functionName: "redeemed",
      args: [redemptionRef],
    })) as boolean;
    return result;
  }

  /** Issue vouchers in batch. Returns transaction hash. */
  async issueVouchersBatch(holders: Hex[], rewardIds: number[], redemptionIds: string[]): Promise<Hex> {
    if (!this.walletClient || !this.vouchersAddress) {
      throw new Error("Token chain service not initialized");
    }

    const redemptionRefs = redemptionIds.map((id) => keccak256(toHex(id)));

    const hash = await this.walletClient.writeContract({
      address: this.vouchersAddress,
      abi: pikeRewardVouchersAbi,
      functionName: "issueBatch",
      args: [holders, rewardIds.map(BigInt), redemptionRefs],
    } as any);

    return hash;
  }

  /** Redeem (burn) vouchers in batch. Returns transaction hash. */
  async redeemVouchersBatch(holders: Hex[], rewardIds: number[], redemptionIds: string[]): Promise<Hex> {
    if (!this.walletClient || !this.vouchersAddress) {
      throw new Error("Token chain service not initialized");
    }

    const redemptionRefs = redemptionIds.map((id) => keccak256(toHex(id)));

    const hash = await this.walletClient.writeContract({
      address: this.vouchersAddress,
      abi: pikeRewardVouchersAbi,
      functionName: "redeemBatch",
      args: [holders, rewardIds.map(BigInt), redemptionRefs],
    } as any);

    return hash;
  }

  /** Wait for a transaction to be mined and return receipt. */
  async waitForTransaction(hash: Hex) {
    if (!this.publicClient) throw new Error("Public client not initialized");
    return await this.publicClient.waitForTransactionReceipt({ hash });
  }
}
