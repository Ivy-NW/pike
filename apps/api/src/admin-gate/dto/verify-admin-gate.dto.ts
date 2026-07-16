import { IsString, MaxLength, MinLength } from "class-validator";

export class VerifyAdminGateDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  code!: string;
}
