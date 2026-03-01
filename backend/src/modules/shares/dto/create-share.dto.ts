import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { ShareMode } from '@prisma/client';

export class CreateShareDto {
  @IsEnum(ShareMode)
  mode: ShareMode;

  @IsOptional()
  @IsBoolean()
  allowHistory?: boolean;

  @IsOptional()
  @IsString()
  versionId?: string;
}
