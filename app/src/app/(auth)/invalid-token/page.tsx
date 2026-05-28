import Link from 'next/link';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function InvalidTokenPage() {
  return (
    <Card className="text-center">
      <CardHeader>
        <CardTitle className="text-2xl">Link inválido o expirado</CardTitle>
        <CardDescription>
          Este link ya fue usado o expiró. Los links de verificación y recuperación tienen un tiempo
          de vida limitado.
        </CardDescription>
      </CardHeader>
      <CardFooter className="justify-center gap-3">
        <Link href="/forgot-password">
          <Button variant="outline">Solicitar nuevo link</Button>
        </Link>
        <Link href="/login">
          <Button>Ir al inicio de sesión</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
