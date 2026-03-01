export type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export type DocumentDetail = {
  id: string;
  folderId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  currentVersion: {
    id: string;
    name: string;
    createdBy: { id: string; fullName: string | null } | null;
    createdAt: string;
  } | null;
  activeLinksCount: number;
  userRole: string;
};

export type VersionItem = {
  id: string;
  name: string;
  createdAt: string;
  isCurrent: boolean;
  createdBy: { id: string; fullName: string | null } | null;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
};

export type DocumentContentResponse = {
  documentId: string;
  currentVersion: {
    id: string;
    name: string;
    createdBy: { id: string; fullName: string | null } | null;
    createdAt: string;
  } | null;
  content: Record<string, unknown>;
};

export type DraftResponse = {
  id: string;
  documentId: string;
  content: Record<string, unknown>;
  updatedAt?: string;
} | null;

export type FolderDetail = {
  id: string;
  projectId: string;
  name: string;
};

export type ProjectDetail = {
  id: string;
  workspaceId: string;
  name: string;
};

export type WorkspaceDetail = {
  id: string;
  name: string;
};

export type DiffSummary = { added: number; removed: number; modified: number; unchanged: number };

export type DiffChange = {
  type: 'equal' | 'insert' | 'delete' | 'replace';
  nodeType: string;
  level: number | null;
  a: string | null;
  b: string | null;
};
