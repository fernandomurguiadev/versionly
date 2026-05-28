import { IsBase64, IsString, MaxLength } from 'class-validator';

export class UploadAssetDto {
  @IsString()
  @MaxLength(255)
  filename: string;

  @IsString()
  @MaxLength(100)
  mimeType: string;

  @IsBase64()
  contentBase64: string;
}
