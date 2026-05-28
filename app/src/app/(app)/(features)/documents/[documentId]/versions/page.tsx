import { Topbar } from '@/components/layout/topbar';

export default async function VersionsPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  await params;
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Topbar title="Historial de versiones" />
      <div className="flex-1 overflow-y-auto p-6">
        <p className="text-muted-foreground text-sm">Historial de versiones — próximamente.</p>
      </div>
    </div>
  );
}
