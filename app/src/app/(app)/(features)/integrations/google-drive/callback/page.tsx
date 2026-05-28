import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

const API_URL = process.env.API_URL ?? 'http://localhost:3000';

export default async function DriveCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; state?: string; error?: string }>;
}) {
  const { code, state, error } = await searchParams;

  if (error || !code) {
    redirect('/workspaces?drive=error');
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  const res = await fetch(
    `${API_URL}/api/v1/integrations/google-drive/callback?code=${code}&state=${state ?? ''}`,
    {
      method: 'GET',
      headers: accessToken ? { authorization: `Bearer ${accessToken}` } : {},
    },
  );

  if (!res.ok) {
    redirect('/workspaces?drive=error');
  }

  const workspaceId = state ?? '';
  redirect(`/workspaces/${workspaceId}/settings/connected-accounts?drive=connected`);
}
