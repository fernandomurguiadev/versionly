import { Topbar } from '@/components/layout/topbar';
import { WorkspaceHome } from './workspace-home';

export default async function WorkspaceHomePage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;

  return (
    <>
      <Topbar title="Inicio" />
      <div className="flex-1 overflow-y-auto p-6">
        <WorkspaceHome workspaceId={workspaceId} />
      </div>
    </>
  );
}
