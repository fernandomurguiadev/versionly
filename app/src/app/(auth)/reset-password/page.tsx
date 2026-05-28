'use client';

import { use } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/schemas/auth.schema';
import { useResetPassword } from '@/lib/hooks/use-auth';
import { ApiError } from '@/lib/api/client';

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = use(searchParams);

  if (!token) redirect('/invalid-token');

  const resetPassword = useResetPassword();
  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Nueva contraseña</CardTitle>
        <CardDescription>Elegí una nueva contraseña para tu cuenta.</CardDescription>
      </CardHeader>
      <form
        onSubmit={handleSubmit(({ token: t, newPassword }) =>
          resetPassword.mutate({ token: t, newPassword }),
        )}
        noValidate
      >
        <CardContent className="space-y-4">
          {resetPassword.error instanceof ApiError && (
            <p className="text-sm text-destructive">{resetPassword.error.message}</p>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="newPassword">Nueva contraseña</Label>
            <Input id="newPassword" type="password" autoComplete="new-password" {...register('newPassword')} />
            {errors.newPassword && <p className="text-xs text-destructive">{errors.newPassword.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
            <Input id="confirmPassword" type="password" autoComplete="new-password" {...register('confirmPassword')} />
            {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={resetPassword.isPending}>
            {resetPassword.isPending ? 'Guardando…' : 'Guardar nueva contraseña'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
