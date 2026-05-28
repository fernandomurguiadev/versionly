'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth.store';

export default function VerifyEmailPage() {
  const user = useAuthStore((s) => s.user);
  const [resent, setResent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleResend() {
    if (!user?.email) return;
    setLoading(true);
    try {
      await api.post('auth/resend-verification', { email: user.email });
      setResent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="text-center">
      <CardHeader>
        <CardTitle className="text-2xl">Verificá tu email</CardTitle>
        <CardDescription>
          Te enviamos un link de confirmación a{' '}
          <span className="font-medium text-foreground">{user?.email ?? 'tu correo'}</span>.
          Revisá tu bandeja de entrada.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          El link expira en 24 horas. Si no lo encontrás, revisá la carpeta de spam.
        </p>
      </CardContent>
      <CardFooter className="justify-center">
        {resent ? (
          <p className="text-sm text-muted-foreground">✓ Email reenviado</p>
        ) : (
          <Button variant="outline" onClick={handleResend} disabled={loading}>
            {loading ? 'Enviando…' : 'Reenviar email de verificación'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
