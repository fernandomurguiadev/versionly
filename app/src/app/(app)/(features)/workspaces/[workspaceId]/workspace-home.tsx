'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { FolderOpen } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';
import { api } from '@/lib/api/client';

type Project = { id: string; name: string };

export function WorkspaceHome({ workspaceId }: { workspaceId: string }) {
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects', workspaceId],
    queryFn: () => api.get<Project[]>(`workspaces/${workspaceId}/projects`),
  });

  if (isLoading) {
    return (
      <div className="space-y-2 max-w-2xl">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <EmptyState
        icon={FolderOpen}
        title="Este workspace no tiene proyectos"
        description="Creá tu primer proyecto para empezar a organizar tus documentos."
        action={{ label: 'Crear proyecto', onClick: () => {} }}
      />
    );
  }

  return (
    <div className="max-w-2xl space-y-2">
      <h2 className="text-sm font-medium text-muted-foreground mb-3">Proyectos</h2>
      {projects.map((project) => (
        <Link
          key={project.id}
          href={`/workspaces/${workspaceId}/projects/${project.id}`}
          className="flex items-center gap-3 rounded-lg border p-3.5 hover:bg-muted/50 transition-colors"
        >
          <FolderOpen className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{project.name}</span>
        </Link>
      ))}
    </div>
  );
}
