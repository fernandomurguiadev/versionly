'use client';

import { useState } from 'react';
import { Cloud, CloudOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DriveFilePicker } from './drive-file-picker';
import { useDriveStatus } from '@/lib/hooks/use-drive';

type DriveImportButtonProps = {
  docId: string;
  workspaceId: string;
};

export function DriveImportButton({ docId, workspaceId }: DriveImportButtonProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const { data: status, isLoading } = useDriveStatus(workspaceId);

  if (isLoading) return null;

  if (!status?.connected) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        title="Conectá Google Drive desde Configuración → Cuentas conectadas para habilitar esta función."
      >
        <CloudOff className="h-4 w-4 mr-1.5" />
        Importar desde Drive
      </Button>
    );
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
        <Cloud className="h-4 w-4 mr-1.5" />
        Importar desde Drive
      </Button>
      <DriveFilePicker
        docId={docId}
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
      />
    </>
  );
}
