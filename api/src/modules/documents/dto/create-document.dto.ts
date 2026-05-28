import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateDocumentDto {
  @IsString()
  @MinLength(2)
  @MaxLength(500)
  title: string;
}
