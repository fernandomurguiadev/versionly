'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Topbar } from '@/components/layout/topbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api/client';

type Workspace = { id: string; name: string };

export default function WorkspaceSettingsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = use(params);
  const { data: workspace } = useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: () => api.get<Workspace>(`workspaces/${workspaceId}`),
  });

  return (
    <>
      <Topbar title="Configuración del workspace" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>General</CardTitle>
            <CardDescription>Nombre y configuración básica del workspace.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Nombre</p>
              <p className="text-sm font-medium">{workspace?.name ?? '—'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Miembros</CardTitle>
            <CardDescription>Gestioná quién tiene acceso a este workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/workspaces/${workspaceId}/settings/members`}>
              <Button variant="outline" size="sm">Ver miembros</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Zona de peligro</CardTitle>
            <CardDescription>Estas acciones son irreversibles.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" size="sm" disabled>
              Eliminar workspace
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
