'use client';

import { use } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Topbar } from '@/components/layout/topbar';
import { api } from '@/lib/api/client';
import { useVersions } from '@/lib/hooks/use-documents';

type DiffResult = { diff: string; fromVersion: { name: string }; toVersion: { name: string } };

export default function DiffPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = use(params);
  const searchParams = useSearchParams();
  const compareWith = searchParams.get('compareWith');

  const { data: versions = [] } = useVersions(documentId);
  const currentVersion = versions.find((v) => v.isCurrent);

  const { data: diff, isLoading } = useQuery({
    queryKey: ['diff', documentId, currentVersion?.id, compareWith],
    queryFn: () =>
      api.get<DiffResult>(
        `documents/${documentId}/diff?fromVersionId=${compareWith}&toVersionId=${currentVersion?.id}`,
      ),
    enabled: !!compareWith && !!currentVersion?.id,
  });

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Topbar title="Comparación de versiones" />
      <div className="flex-1 overflow-y-auto p-6">
        {!compareWith && (
          <p className="text-sm text-muted-foreground">
            Seleccioná dos versiones desde el editor para comparar.
          </p>
        )}
        {isLoading && (
          <div className="space-y-2 max-w-3xl">
            {[1, 2, 3].map((i) => <div key={i} className="h-6 rounded bg-muted animate-pulse" />)}
          </div>
        )}
        {diff && (
          <div className="max-w-3xl space-y-4">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="px-2 py-0.5 bg-red-50 text-red-700 rounded text-xs font-mono">
                {diff.fromVersion.name}
              </span>
              <span>→</span>
              <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs font-mono">
                {diff.toVersion.name}
              </span>
            </div>
            <pre
              className="text-sm font-mono whitespace-pre-wrap rounded-lg border bg-muted/30 p-4 overflow-x-auto"
              dangerouslySetInnerHTML={undefined}
            >
              {diff.diff}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
