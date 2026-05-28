'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api/client';

const STEPS = ['workspace', 'project', 'folder', 'start'] as const;
type Step = typeof STEPS[number];

const nameSchema = z.object({ name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres') });
type NameInput = z.infer<typeof nameSchema>;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('workspace');
  const [workspaceId, setWorkspaceId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<NameInput>({
    resolver: zodResolver(nameSchema),
  });

  const stepIndex = STEPS.indexOf(step);

  const LABELS: Record<Step, { title: string; description: string; placeholder: string }> = {
    workspace: { title: 'Crear tu workspace', description: 'El workspace es tu espacio de trabajo principal.', placeholder: 'Mi empresa' },
    project:   { title: 'Crear un proyecto', description: 'Los proyectos organizan tus documentos.', placeholder: 'Primer proyecto' },
    folder:    { title: 'Crear una carpeta', description: 'Las carpetas agrupan documentos relacionados.', placeholder: 'Documentos generales' },
    start:     { title: '¡Todo listo!', description: 'Tu espacio de trabajo está configurado.', placeholder: '' },
  };

  const current = LABELS[step];

  async function onSubmit({ name }: NameInput) {
    setLoading(true);
    try {
      if (step === 'workspace') {
        const ws = await api.post<{ id: string }>('workspaces', { name });
        setWorkspaceId(ws.id);
        setStep('project');
      } else if (step === 'project') {
        const proj = await api.post<{ id: string }>(`workspaces/${workspaceId}/projects`, { name });
        setProjectId(proj.id);
        setStep('folder');
      } else if (step === 'folder') {
        await api.post(`workspaces/${workspaceId}/projects/${projectId}/folders`, { name });
        setStep('start');
      }
      reset();
    } finally {
      setLoading(false);
    }
  }

  if (step === 'start') {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-sm text-center">
          <CardHeader>
            <CardTitle className="text-2xl">¡Todo listo!</CardTitle>
            <CardDescription>Tu espacio de trabajo está configurado. Ahora podés crear tu primer documento.</CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button onClick={() => router.push(`/workspaces/${workspaceId}`)}>
              Ir a mi workspace
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-4">
        <div className="flex justify-center gap-1.5">
          {STEPS.slice(0, 3).map((s, i) => (
            <div key={s} className={`h-1.5 w-8 rounded-full ${i <= stepIndex ? 'bg-primary' : 'bg-muted'}`} />
          ))}
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{current.title}</CardTitle>
            <CardDescription>{current.description}</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <CardContent>
              <div className="space-y-1.5">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" placeholder={current.placeholder} {...register('name')} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              {step === 'folder' && (
                <Button type="button" variant="ghost" onClick={() => setStep('start')}>
                  Omitir
                </Button>
              )}
              <Button type="submit" className="ml-auto" disabled={loading}>
                {loading ? 'Creando…' : 'Continuar'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
