import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class DocumentMemberDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsBoolean()
  canViewHistory: boolean;
}
