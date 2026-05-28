export class ConflictResponseDto {
  basedOnVersionId: string;
  versions: Array<{
    id: string;
    name: string;
    createdAt: Date;
    createdBy: { id: string; fullName: string | null } | null;
  }>;
}
