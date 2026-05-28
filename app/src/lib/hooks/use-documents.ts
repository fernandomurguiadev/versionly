'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '@/lib/api/documents';

export function useDraft(docId: string) {
  return useQuery({
    queryKey: ['draft', docId],
    queryFn: () => documentsApi.getDraft(docId),
    staleTime: 0,
  });
}

export function useSaveDraft(docId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: Record<string, unknown>) => documentsApi.saveDraft(docId, content),
    onSuccess: (data) => qc.setQueryData(['draft', docId], data),
  });
}

export function useVersions(docId: string) {
  return useQuery({
    queryKey: ['versions', docId],
    queryFn: () => documentsApi.getVersions(docId),
  });
}

export function useSaveVersion(docId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; comment?: string; markAsCurrent?: boolean }) =>
      documentsApi.saveVersion(docId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['versions', docId] }),
  });
}

export function useSetCurrentVersion(docId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (versionId: string) => documentsApi.setCurrentVersion(docId, versionId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['versions', docId] }),
  });
}
