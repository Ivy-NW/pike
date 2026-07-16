import { IsString, MinLength } from "class-validator";

export class CreateRedemptionDto {
  @IsString()
  @MinLength(1)
  markerId!: string;

  @IsString()
  @MinLength(1)
  sessionId!: string;
}
