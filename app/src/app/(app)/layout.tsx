import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  if (!cookieStore.get('access_token')) redirect('/login');
  return <>{children}</>;
}
