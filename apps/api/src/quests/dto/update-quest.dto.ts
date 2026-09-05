import { IsIn, IsInt, IsISO8601, IsOptional, IsString, Min, MinLength, ValidateIf } from "class-validator";
import { REWARD_TIERS, REWARD_TYPES } from "./create-quest.dto";

/**
 * Every field optional — the rewards page patches one cell at a time. Fields left
 * undefined are untouched; `expiresAt: null` is the explicit "no expiry" signal, which is
 * why it needs ValidateIf rather than IsOptional alone (IsOptional would also skip a
 * malformed non-null value it happens to see as absent).
 */
export class UpdateQuestDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  theme?: string;

  @IsOptional()
  @IsIn(REWARD_TYPES)
  rewardType?: (typeof REWARD_TYPES)[number];

  @IsOptional()
  @IsIn(REWARD_TIERS)
  rewardTier?: (typeof REWARD_TIERS)[number];

  @IsOptional()
  @IsString()
  @MinLength(1)
  rewardDescription?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxRedemptionsPerDay?: number;

  @ValidateIf((o) => o.expiresAt !== null && o.expiresAt !== undefined)
  @IsISO8601()
  expiresAt?: string | null;
}
