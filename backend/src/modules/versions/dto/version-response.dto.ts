import { VersionSource } from '@prisma/client';

export class VersionResponseDto {
  id: string;
  documentId: string;
  name: string;
  comment: string | null;
  source: VersionSource;
  isCurrent: boolean;
  createdBy: { id: string; fullName: string | null } | null;
  basedOnVersionId: string | null;
  mergeFromA: string | null;
  mergeFromB: string | null;
  importWarnings: Record<string, unknown>[] | null;
  content: Record<string, unknown>;
  createdAt: Date;
}
