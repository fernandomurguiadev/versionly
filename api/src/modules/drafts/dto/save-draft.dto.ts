import { IsObject } from 'class-validator';

export class SaveDraftDto {
  @IsObject()
  content: Record<string, unknown>;
}
