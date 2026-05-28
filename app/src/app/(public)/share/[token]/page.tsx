import { notFound } from 'next/navigation';

const API_URL = process.env.API_URL ?? 'http://localhost:3000';

export default async function SharedDocumentPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const res = await fetch(`${API_URL}/api/v1/shares/${token}`, {
    cache: 'no-store',
  });

  if (!res.ok) notFound();

  const { data } = await res.json();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <span className="text-sm font-medium">Versionly</span>
        <span className="text-xs text-muted-foreground">Vista de solo lectura</span>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-2">{data?.document?.title ?? 'Documento'}</h1>
        {data?.version && (
          <p className="text-sm text-muted-foreground mb-6">
            Versión: <span className="font-medium">{data.version.name}</span>
          </p>
        )}
        <div className="prose prose-sm max-w-none">
          <p className="text-muted-foreground">Contenido del documento — renderizado próximamente.</p>
        </div>
      </main>
    </div>
  );
}
