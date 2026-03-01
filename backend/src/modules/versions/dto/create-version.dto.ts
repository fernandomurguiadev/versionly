import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateVersionDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsString()
  basedOnVersionId?: string;

  @IsOptional()
  @IsBoolean()
  markAsCurrent?: boolean;
}
