import { api } from './client';

export type DocumentVersion = {
  id: string;
  name: string;
  comment: string | null;
  createdBy: string | null;
  isCurrent: boolean;
  source: 'manual' | 'import' | 'merge';
  createdAt: string;
};

export type Draft = {
  id: string;
  documentId: string;
  content: Record<string, unknown>;
  updatedAt: string;
};

export const documentsApi = {
  getDraft: (docId: string) =>
    api.get<Draft>(`documents/${docId}/draft`),

  saveDraft: (docId: string, content: Record<string, unknown>) =>
    api.put<Draft>(`documents/${docId}/draft`, { content }),

  getVersions: (docId: string) =>
    api.get<DocumentVersion[]>(`documents/${docId}/versions`),

  saveVersion: (docId: string, data: { name: string; comment?: string; markAsCurrent?: boolean }) =>
    api.post<DocumentVersion>(`documents/${docId}/versions`, data),

  setCurrentVersion: (docId: string, versionId: string) =>
    api.patch<DocumentVersion>(`documents/${docId}/versions/${versionId}/set-current`, {}),

  compareVersions: (docId: string, fromId: string, toId: string) =>
    api.get<{ diff: string }>(`documents/${docId}/diff?fromVersionId=${fromId}&toVersionId=${toId}`),
};
