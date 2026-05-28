'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api/client';
import { useAuthStore, type AuthUser } from '@/lib/stores/auth.store';
import type { LoginInput, RegisterInput } from '@/lib/schemas/auth.schema';

type AuthResponse = { user: AuthUser };

export function useCurrentUser() {
  const setUser = useAuthStore((s) => s.setUser);

  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const data = await api.get<AuthUser>('users/me');
      setUser(data);
      return data;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  const router = useRouter();

  return useMutation({
    mutationFn: (input: LoginInput) =>
      api.post<AuthResponse>('auth/login', input),
    onSuccess: ({ user }) => {
      setUser(user);
      queryClient.setQueryData(['auth', 'me'], user);
      router.push('/workspaces');
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  const router = useRouter();

  return useMutation({
    mutationFn: ({ confirmPassword: _, ...input }: RegisterInput) =>
      api.post<AuthResponse>('auth/register', input),
    onSuccess: ({ user }) => {
      setUser(user);
      queryClient.setQueryData(['auth', 'me'], user);
      router.push('/verify-email');
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  const router = useRouter();

  return useMutation({
    mutationFn: () => api.post('auth/logout'),
    onSuccess: () => {
      setUser(null);
      queryClient.clear();
      router.push('/login');
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (input: { email: string }) =>
      api.post('auth/forgot-password', input),
  });
}

export function useResetPassword() {
  const router = useRouter();
  return useMutation({
    mutationFn: (input: { token: string; newPassword: string }) =>
      api.post('auth/reset-password', input),
    onSuccess: () => router.push('/login'),
  });
}
