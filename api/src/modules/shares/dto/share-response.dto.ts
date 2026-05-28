import { ShareMode } from '@prisma/client';

export class ShareResponseDto {
  id: string;
  token: string;
  url: string;
  mode: ShareMode;
  allowHistory: boolean;
  versionId: string | null;
  createdBy: { id: string; fullName: string | null } | null;
  createdAt: Date;
  revokedAt: Date | null;
}
