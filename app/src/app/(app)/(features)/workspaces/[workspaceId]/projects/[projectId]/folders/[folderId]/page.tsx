'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { FileText, Plus } from 'lucide-react';
import { Topbar } from '@/components/layout/topbar';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api/client';

type Document = {
  id: string;
  title: string;
  updatedAt: string;
  currentVersion?: { name: string };
};

export default function FolderPage({
  params,
}: {
  params: Promise<{ workspaceId: string; projectId: string; folderId: string }>;
}) {
  const { folderId } = use(params);
  const router = useRouter();

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents', folderId],
    queryFn: () => api.get<Document[]>(`folders/${folderId}/documents`),
  });

  return (
    <>
      <Topbar
        title="Documentos"
        actions={
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1.5" />
            Nuevo documento
          </Button>
        }
      />
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading && (
          <div className="space-y-2 max-w-2xl">
            {[1, 2, 3].map((i) => <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />)}
          </div>
        )}
        {!isLoading && documents.length === 0 && (
          <EmptyState
            icon={FileText}
            title="Esta carpeta está vacía"
            description="Creá un nuevo documento o importá uno existente."
            action={{ label: 'Crear documento', onClick: () => {} }}
          />
        )}
        {!isLoading && documents.length > 0 && (
          <ul className="space-y-2 max-w-2xl">
            {documents.map((doc) => (
              <li key={doc.id}>
                <button
                  onClick={() => router.push(`/documents/${doc.id}/editor`)}
                  className="w-full flex items-center gap-3 rounded-lg border p-3.5 text-left hover:bg-muted/50 transition-colors"
                >
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{doc.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Modificado {new Date(doc.updatedAt).toLocaleDateString('es')}
                    </p>
                  </div>
                  {doc.currentVersion && (
                    <Badge variant="secondary" className="shrink-0 text-xs">
                      {doc.currentVersion.name}
                    </Badge>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
