import { IsIn, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class ClaimIdentityDto {
  @IsIn(["phone", "social"])
  method!: "phone" | "social";

  @IsString()
  firebaseIdToken!: string;
}

export class ClaimRewardDto {
  @ValidateNested()
  @Type(() => ClaimIdentityDto)
  identity!: ClaimIdentityDto;

  @IsIn(["webar", "app"])
  channel!: "webar" | "app";
}
