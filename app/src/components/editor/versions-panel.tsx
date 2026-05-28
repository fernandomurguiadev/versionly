'use client';

import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useVersions, useSetCurrentVersion } from '@/lib/hooks/use-documents';
import { EmptyState } from '@/components/shared/empty-state';
import type { DocumentVersion } from '@/lib/api/documents';

type VersionsPanelProps = {
  docId: string;
  onCompare?: (versionId: string) => void;
};

export function VersionsPanel({ docId, onCompare }: VersionsPanelProps) {
  const { data: versions = [], isLoading } = useVersions(docId);
  const setCurrent = useSetCurrentVersion(docId);

  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        {[1, 2].map((i) => <div key={i} className="h-16 rounded bg-muted animate-pulse" />)}
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <EmptyState
        title="Sin versiones guardadas"
        description="Guardá una versión para crear un punto de restauración."
      />
    );
  }

  return (
    <div className="divide-y">
      {versions.map((v: DocumentVersion) => (
        <div key={v.id} className="p-3 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{v.name}</p>
              {v.comment && (
                <p className="text-xs text-muted-foreground truncate">{v.comment}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(v.createdAt), { locale: es, addSuffix: true })}
              </p>
            </div>
            {v.isCurrent && (
              <Badge variant="secondary" className="text-xs shrink-0 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Actual
              </Badge>
            )}
          </div>
          <div className="flex gap-1.5">
            {!v.isCurrent && (
              <Button
                size="sm"
                variant="outline"
                className="h-6 text-xs px-2"
                disabled={setCurrent.isPending}
                onClick={() => setCurrent.mutate(v.id)}
              >
                Marcar actual
              </Button>
            )}
            {onCompare && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 text-xs px-2"
                onClick={() => onCompare(v.id)}
              >
                Comparar
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
