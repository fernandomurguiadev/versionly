export class DraftResponseDto {
  id: string;
  documentId: string;
  content: Record<string, unknown>;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}
