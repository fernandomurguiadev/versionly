export class DiffResponseDto {
  versionA: Record<string, unknown>;
  versionB: Record<string, unknown>;
  summary: { added: number; removed: number; modified: number; unchanged: number };
  changes: Array<{
    type: 'equal' | 'insert' | 'delete' | 'replace';
    nodeType: string;
    level: number | null;
    a: string | null;
    b: string | null;
  }>;
}
