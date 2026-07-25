import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";

export interface AttestationRuntimeConfig {
  batchWindowMs: number;
  batchCountThreshold: number;
  maxRetries: number;
}

const CACHE_TTL_MS = 30_000;
const CONFIG_ROW_ID = 1;

/**
 * FR-A3: batch window/threshold are admin-editable at runtime (no deploy needed) — backed
 * by the single-row AttestationConfig table, not env vars. Env vars only seed that row's
 * initial values (see scripts/seed-attestation-config.ts) and serve as a local-dev fallback
 * if the row is somehow missing.
 */
@Injectable()
export class AttestationConfigService {
  private cached: AttestationRuntimeConfig | null = null;
  private cachedAt = 0;

  constructor(
    private readonly prisma: PrismaService,
    private readonly env: ConfigService,
  ) {}

  private envDefaults(): AttestationRuntimeConfig {
    return {
      batchWindowMs: Number(this.env.get("ATTESTATION_BATCH_WINDOW_MS") ?? 300_000),
      batchCountThreshold: Number(this.env.get("ATTESTATION_BATCH_COUNT_THRESHOLD") ?? 500),
      maxRetries: Number(this.env.get("ATTESTATION_MAX_RETRIES") ?? 5),
    };
  }

  async getConfig(): Promise<AttestationRuntimeConfig> {
    const now = Date.now();
    if (this.cached && now - this.cachedAt < CACHE_TTL_MS) {
      return this.cached;
    }

    const row = await this.prisma.attestationConfig.findUnique({ where: { id: CONFIG_ROW_ID } });
    const config = row
      ? { batchWindowMs: row.batchWindowMs, batchCountThreshold: row.batchCountThreshold, maxRetries: row.maxRetries }
      : this.envDefaults();

    this.cached = config;
    this.cachedAt = now;
    return config;
  }

  async updateConfig(
    patch: Partial<Pick<AttestationRuntimeConfig, "batchWindowMs" | "batchCountThreshold" | "maxRetries">>,
  ): Promise<AttestationRuntimeConfig> {
    const defaults = this.envDefaults();
    const row = await this.prisma.attestationConfig.upsert({
      where: { id: CONFIG_ROW_ID },
      update: patch,
      create: { id: CONFIG_ROW_ID, ...defaults, ...patch },
    });

    this.cached = { batchWindowMs: row.batchWindowMs, batchCountThreshold: row.batchCountThreshold, maxRetries: row.maxRetries };
    this.cachedAt = Date.now();
    return this.cached;
  }
}
