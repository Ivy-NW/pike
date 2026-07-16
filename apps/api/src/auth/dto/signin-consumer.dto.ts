import { IsString, MinLength } from "class-validator";

export class SigninConsumerDto {
  /** Username or email — resolved to a single account server-side. */
  @IsString()
  @MinLength(1)
  identifier!: string;

  @IsString()
  @MinLength(1)
  password!: string;
}
