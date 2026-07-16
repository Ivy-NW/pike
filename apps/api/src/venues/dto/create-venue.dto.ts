import { IsOptional, IsString, MinLength } from "class-validator";

export class CreateVenueDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  @MinLength(1)
  venueType!: string;

  @IsOptional()
  @IsString()
  address?: string;
}
