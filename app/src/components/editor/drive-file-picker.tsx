'use client';

import { useState } from 'react';
import { Search, FileText, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useDriveFiles, useImportFromDrive } from '@/lib/hooks/use-drive';
import type { DriveFile } from '@/lib/api/drive';

type DriveFilePickerProps = {
  docId: string;
  open: boolean;
  onClose: () => void;
};

export function DriveFilePicker({ docId, open, onClose }: DriveFilePickerProps) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<DriveFile | null>(null);
  const [versionName, setVersionName] = useState('');

  const { data, isLoading } = useDriveFiles(query || undefined);
  const importFile = useImportFromDrive(docId);

  async function handleImport() {
    if (!selected || !versionName.trim()) return;
    await importFile.mutateAsync({ driveFileId: selected.id, versionName: versionName.trim() });
    onClose();
    setSelected(null);
    setVersionName('');
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen: boolean) => { if (!isOpen) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Importar desde Google Drive</DialogTitle>
          <DialogDescription>
            Seleccioná un archivo de Drive para importarlo como nueva versión del documento.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Buscar archivos…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="border rounded-md overflow-hidden max-h-56 overflow-y-auto">
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}
            {!isLoading && (!data?.files || data.files.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No se encontraron archivos.
              </p>
            )}
            {data?.files?.map((file) => (
              <button
                key={file.id}
                onClick={() => setSelected(file)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-muted/50 transition-colors border-b last:border-0 ${
                  selected?.id === file.id ? 'bg-muted' : ''
                }`}
              >
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(file.modifiedTime).toLocaleDateString('es')}
                  </p>
                </div>
                {selected?.id === file.id && (
                  <span className="text-xs text-primary font-medium shrink-0">Seleccionado</span>
                )}
              </button>
            ))}
          </div>

          {selected && (
            <div className="space-y-1.5">
              <Label htmlFor="versionName">Nombre de versión *</Label>
              <Input
                id="versionName"
                placeholder={`Importado desde ${selected.name}`}
                value={versionName}
                onChange={(e) => setVersionName(e.target.value)}
              />
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button
              onClick={handleImport}
              disabled={!selected || !versionName.trim() || importFile.isPending}
            >
              {importFile.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Importando…</>
              ) : 'Importar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
