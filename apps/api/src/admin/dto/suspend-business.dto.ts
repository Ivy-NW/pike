import { IsBoolean } from "class-validator";

export class SuspendBusinessDto {
  @IsBoolean()
  suspended!: boolean;
}
