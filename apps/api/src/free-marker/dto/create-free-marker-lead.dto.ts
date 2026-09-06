import { IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class CreateFreeMarkerLeadDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  venueName!: string;

  @IsString()
  @Matches(/^\+?[0-9\s-]{9,18}$/)
  whatsapp!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  neighbourhood?: string;
}
