import { VersionSource } from '@prisma/client';

export class VersionListItemDto {
  id: string;
  documentId: string;
  name: string;
  comment: string | null;
  source: VersionSource;
  isCurrent: boolean;
  createdBy: { id: string; fullName: string | null } | null;
  basedOnVersionId: string | null;
  createdAt: Date;
}
