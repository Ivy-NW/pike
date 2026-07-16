import { IsEmail, IsIn } from "class-validator";

export class JoinWaitlistDto {
  @IsEmail()
  email!: string;

  @IsIn(["consumer", "business"])
  audience!: "consumer" | "business";
}
