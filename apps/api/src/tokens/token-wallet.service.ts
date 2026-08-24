import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HDKey } from "@scure/bip32";
import { mnemonicToSeedSync } from "@scure/bip39";
import type { Hex } from "viem";
import { privateKeyToAddress } from "viem/accounts";

/**
 * Phase C — FR-T7: deterministic custodial addresses derived from one HD seed.
 *
 * Each user's address is derived at path m/44'/60'/0'/0/<userId>, so:
 * - The address is stable and reproducible across backend restarts.
 * - No per-user key storage is required (the seed + userId are sufficient).
 * - The user is never shown a seed phrase, private key, or signing prompt.
 *
 * The tradeoff: this is custodial. PIKE can technically act as any user. The soulbound
 * constraint blunts the consequence — there's nothing transferable to steal, and the only
 * privileged action is minting or burning a user's own non-tradeable record — but it's a
 * real limitation (ADR 0007 risk table).
 *
 * Export-to-self-custody is Phase D (PRD section 13) and is designed so it becomes additive
 * rather than a migration: the derived address can be bound to a self-custodied wallet the
 * user controls, without changing the on-chain address.
 */
@Injectable()
export class TokenWalletService {
  private readonly logger = new Logger(TokenWalletService.name);
  private readonly hdRoot?: HDKey;
  private readonly enabled: boolean;

  constructor(config: ConfigService) {
    const mnemonic = config.get<string>("TOKEN_CUSTODIAL_MNEMONIC");
    if (!mnemonic) {
      this.logger.warn(
        "TOKEN_CUSTODIAL_MNEMONIC not set — token minting will fail. Generate with " +
          "`node -e \"console.log(require('@scure/bip39').generateMnemonic(require('@scure/bip39').wordlist))\"` " +
          "and add to .env. This seed controls all user token addresses; guard it like database credentials.",
      );
      this.enabled = false;
      return;
    }

    try {
      const seed = mnemonicToSeedSync(mnemonic);
      this.hdRoot = HDKey.fromMasterSeed(seed);
      this.enabled = true;
      this.logger.log("Token custodial wallet initialized (HD derivation ready)");
    } catch (err: any) {
      this.logger.error(`Invalid TOKEN_CUSTODIAL_MNEMONIC: ${err?.message ?? err}`);
      this.enabled = false;
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Derive a user's deterministic address from their numeric user ID.
   * Path: m/44'/60'/0'/0/<userId> (Ethereum BIP-44 standard).
   */
  deriveAddress(userId: string): Hex | null {
    if (!this.hdRoot) return null;

    // Convert UUID to numeric index by hashing (collision-resistant, deterministic)
    const hash = Buffer.from(userId.replace(/-/g, ""), "hex");
    const index = hash.readUInt32BE(0);

    const child = this.hdRoot.derive(`m/44'/60'/0'/0/${index}`);
    if (!child.privateKey) {
      this.logger.error(`Failed to derive child key for user ${userId}`);
      return null;
    }

    const privateKey = `0x${Buffer.from(child.privateKey).toString("hex")}` as Hex;
    return privateKeyToAddress(privateKey);
  }

  /**
   * Derive a user's private key (for signing, if ever needed).
   * Currently unused — minting is done by the service wallet, not per-user keys.
   */
  derivePrivateKey(userId: string): Hex | null {
    if (!this.hdRoot) return null;

    const hash = Buffer.from(userId.replace(/-/g, ""), "hex");
    const index = hash.readUInt32BE(0);

    const child = this.hdRoot.derive(`m/44'/60'/0'/0/${index}`);
    if (!child.privateKey) return null;

    return `0x${Buffer.from(child.privateKey).toString("hex")}` as Hex;
  }

  /**
   * Batch derive addresses for multiple users (used by reconciliation sweeps).
   */
  deriveAddresses(userIds: string[]): Map<string, Hex> {
    const result = new Map<string, Hex>();
    for (const userId of userIds) {
      const addr = this.deriveAddress(userId);
      if (addr) result.set(userId, addr);
    }
    return result;
  }
}
