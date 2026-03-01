import { DocumentRole } from '@prisma/client';

export class DocumentResponseDto {
  id: string;
  folderId: string;
  title: string;
  createdBy: string | null;
  currentVersion: {
    id: string;
    name: string;
    createdBy: { id: string; fullName: string | null } | null;
    createdAt: Date;
  } | null;
  activeLinksCount: number;
  userRole: DocumentRole;
  createdAt: Date;
  updatedAt: Date;
}
