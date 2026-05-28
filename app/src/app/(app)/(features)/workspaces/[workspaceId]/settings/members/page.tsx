'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Topbar } from '@/components/layout/topbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { api } from '@/lib/api/client';

type Member = {
  id: string;
  role: 'admin' | 'editor' | 'viewer';
  user: { id: string; email: string; fullName: string | null };
};

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  editor: 'Editor',
  viewer: 'Viewer',
};

export default function MembersPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = use(params);
  const { data: members = [], isLoading } = useQuery({
    queryKey: ['members', workspaceId],
    queryFn: () => api.get<Member[]>(`workspaces/${workspaceId}/members`),
  });

  return (
    <>
      <Topbar
        title="Miembros"
        actions={<Button size="sm">Invitar miembro</Button>}
      />
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading && (
          <div className="space-y-2 max-w-2xl">
            {[1, 2].map((i) => <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />)}
          </div>
        )}
        {!isLoading && (
          <ul className="space-y-2 max-w-2xl">
            {members.map((m) => {
              const initials = (m.user.fullName ?? m.user.email)
                .split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
              return (
                <li
                  key={m.id}
                  className="flex items-center gap-3 rounded-lg border p-3.5"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {m.user.fullName ?? m.user.email}
                    </p>
                    {m.user.fullName && (
                      <p className="text-xs text-muted-foreground truncate">{m.user.email}</p>
                    )}
                  </div>
                  <Badge variant={m.role === 'admin' ? 'default' : 'secondary'}>
                    {ROLE_LABELS[m.role]}
                  </Badge>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
