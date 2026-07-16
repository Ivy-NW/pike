import { IsEmail, IsString } from "class-validator";

export class LoginBusinessDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}
