import { IsString } from 'class-validator';

export class MoveDocumentDto {
  @IsString()
  folderId: string;
}
