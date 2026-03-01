import { ShareMode } from '@prisma/client';

export class PublicDocumentResponseDto {
  documentTitle: string;
  versionName: string;
  versionContent: Record<string, unknown>;
  allowHistory: boolean;
  mode: ShareMode;
}
