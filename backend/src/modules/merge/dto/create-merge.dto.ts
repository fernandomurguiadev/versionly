import { IsBoolean, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateMergeDto {
  @IsObject()
  content: Record<string, unknown>;

  @IsString()
  mergeFromA: string;

  @IsString()
  mergeFromB: string;

  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsBoolean()
  markAsCurrent?: boolean;
}
