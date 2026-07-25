import { IsInt, IsOptional, Min } from "class-validator";

/** FR-A3: batch window/threshold, editable without a deploy — see AttestationConfigService. */
export class UpdateAttestationConfigDto {
  @IsOptional()
  @IsInt()
  @Min(1000)
  batchWindowMs?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  batchCountThreshold?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxRetries?: number;
}
