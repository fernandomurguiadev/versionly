import { Sidebar } from '@/components/layout/sidebar';

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar workspaceId={workspaceId} />
      <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  );
}
