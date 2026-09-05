import { IsIn, IsInt, IsISO8601, IsOptional, IsString, Min, MinLength } from "class-validator";

/** Shared with UpdateQuestDto so the two endpoints can never drift on what a valid reward is. */
export const REWARD_TYPES = ["discount", "merch", "vip_pass", "free_item"] as const;
export const REWARD_TIERS = ["low_stakes", "high_value"] as const;

export class CreateQuestDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  @MinLength(1)
  theme!: string;

  @IsIn(REWARD_TYPES)
  rewardType!: (typeof REWARD_TYPES)[number];

  @IsIn(REWARD_TIERS)
  rewardTier!: (typeof REWARD_TIERS)[number];

  @IsString()
  @MinLength(1)
  rewardDescription!: string;

  @IsInt()
  @Min(1)
  maxRedemptionsPerDay!: number;

  @IsOptional()
  @IsISO8601()
  expiresAt?: string;
}
