'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSaveVersion } from '@/lib/hooks/use-documents';

const schema = z.object({
  name: z.string().min(1, 'El nombre de versión es requerido'),
  comment: z.string().optional(),
  markAsCurrent: z.boolean(),
});

type FormInput = z.infer<typeof schema>;

type SaveVersionDialogProps = {
  docId: string;
  open: boolean;
  onClose: () => void;
};

export function SaveVersionDialog({ docId, open, onClose }: SaveVersionDialogProps) {
  const saveVersion = useSaveVersion(docId);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', comment: '', markAsCurrent: false },
  });

  function handleClose() {
    reset();
    onClose();
  }

  async function onSubmit(data: FormInput) {
    await saveVersion.mutateAsync(data);
    handleClose();
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen: boolean) => { if (!isOpen) handleClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Guardar versión</DialogTitle>
          <DialogDescription>
            Las versiones guardadas son inmutables. Dale un nombre descriptivo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nombre de versión *</Label>
            <Input id="name" placeholder="v1.0 — Primera entrega" {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="comment">Comentario (opcional)</Label>
            <Input id="comment" placeholder="¿Qué cambió en esta versión?" {...register('comment')} />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="markAsCurrent"
              type="checkbox"
              className="h-4 w-4 rounded border"
              {...register('markAsCurrent')}
            />
            <Label htmlFor="markAsCurrent" className="font-normal cursor-pointer">
              Marcar como Versión Actual al guardar
            </Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
            <Button type="submit" disabled={saveVersion.isPending}>
              {saveVersion.isPending ? 'Guardando…' : 'Guardar versión'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
