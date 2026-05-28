'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { api } from '@/lib/api/client';
import { Button } from '@/components/ui/button';

type Workspace = { id: string; name: string };

export default function WorkspacesPage() {
  const router = useRouter();
  const { data: workspaces = [], isLoading } = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => api.get<Workspace[]>('workspaces'),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Cargando workspaces…</p>
      </div>
    );
  }

  if (workspaces.length === 0) {
    router.push('/onboarding');
    return null;
  }

  if (workspaces.length === 1) {
    router.push(`/workspaces/${workspaces[0].id}`);
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-4">
        <div>
          <h1 className="text-xl font-semibold">Seleccioná un workspace</h1>
          <p className="text-sm text-muted-foreground mt-1">¿A cuál querés acceder?</p>
        </div>
        <ul className="space-y-2">
          {workspaces.map((ws) => (
            <li key={ws.id}>
              <button
                onClick={() => router.push(`/workspaces/${ws.id}`)}
                className="w-full rounded-lg border p-3.5 text-left text-sm font-medium hover:bg-muted/50 transition-colors"
              >
                {ws.name}
              </button>
            </li>
          ))}
        </ul>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push('/onboarding')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Crear workspace nuevo
        </Button>
      </div>
    </div>
  );
}
