import { IsString, MinLength } from "class-validator";

export class CreateMarkerDto {
  @IsString()
  @MinLength(1)
  sourceImageBase64!: string;
}
