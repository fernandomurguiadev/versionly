import { api } from './client';

export type DriveStatus = {
  connected: boolean;
  email?: string;
  connectedAt?: string;
};

export type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  size?: number;
};

export type DriveFileList = {
  files: DriveFile[];
  nextPageToken?: string;
};

export const driveApi = {
  getStatus: (workspaceId: string) =>
    api.get<DriveStatus>(`workspaces/${workspaceId}/drive-status`),

  getAuthorizeUrl: (workspaceId: string) =>
    api.get<{ url: string }>(`integrations/google-drive/authorize?workspaceId=${workspaceId}`),

  revoke: (workspaceId: string) =>
    api.delete<{ revoked: boolean }>(`integrations/google-drive/revoke?workspaceId=${workspaceId}`),

  listFiles: (query?: string, pageToken?: string) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (pageToken) params.set('pageToken', pageToken);
    return api.get<DriveFileList>(`integrations/google-drive/files?${params}`);
  },

  importFile: (docId: string, driveFileId: string, versionName: string) =>
    api.post(`documents/${docId}/imports/google-drive`, { driveFileId, versionName }),
};
