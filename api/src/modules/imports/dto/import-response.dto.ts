export class ImportResponseDto {
  documentId: string;
  versionId: string;
  warnings: Record<string, unknown>[];
}
