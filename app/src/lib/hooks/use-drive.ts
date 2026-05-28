'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { driveApi } from '@/lib/api/drive';

export function useDriveStatus(workspaceId: string | undefined) {
  return useQuery({
    queryKey: ['drive-status', workspaceId],
    queryFn: () => driveApi.getStatus(workspaceId!),
    enabled: !!workspaceId,
    staleTime: 60 * 1000,
  });
}

export function useConnectDrive(workspaceId: string) {
  return useMutation({
    mutationFn: async () => {
      const { url } = await driveApi.getAuthorizeUrl(workspaceId);
      window.location.href = url;
    },
  });
}

export function useRevokeDrive(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => driveApi.revoke(workspaceId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['drive-status', workspaceId] }),
  });
}

export function useDriveFiles(query?: string, pageToken?: string) {
  return useQuery({
    queryKey: ['drive-files', query, pageToken],
    queryFn: () => driveApi.listFiles(query, pageToken),
    staleTime: 30 * 1000,
  });
}

export function useImportFromDrive(docId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ driveFileId, versionName }: { driveFileId: string; versionName: string }) =>
      driveApi.importFile(docId, driveFileId, versionName),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['versions', docId] }),
  });
}
