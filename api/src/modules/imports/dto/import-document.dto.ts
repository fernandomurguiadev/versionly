import { IsBase64, IsOptional, IsString, MaxLength } from 'class-validator';

export class ImportDocumentDto {
  @IsString()
  @MaxLength(255)
  filename: string;

  @IsString()
  @MaxLength(100)
  mimeType: string;

  @IsBase64()
  contentBase64: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  title?: string;
}
