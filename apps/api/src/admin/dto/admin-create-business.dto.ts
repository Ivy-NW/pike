import { IsBoolean, IsEmail, IsString, MinLength } from "class-validator";

export class AdminCreateBusinessDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsEmail()
  email!: string;

  @IsBoolean()
  comp!: boolean;
}
