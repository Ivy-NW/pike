import { IsIn } from "class-validator";

export class ClaimRewardDto {
  @IsIn(["webar", "app"])
  channel!: "webar" | "app";
}
