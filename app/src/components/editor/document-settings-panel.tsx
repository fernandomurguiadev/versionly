'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Settings2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  settingsApi,
  DEFAULT_SETTINGS,
  FONT_OPTIONS,
  type DocumentSettings,
  type FontFamily,
  type FontSize,
  type LineHeight,
  type PageWidth,
} from '@/lib/api/documents-settings';

type Props = { docId: string };

function useDocSettings(docId: string) {
  const qc = useQueryClient();

  const { data: settings = DEFAULT_SETTINGS } = useQuery({
    queryKey: ['doc-settings', docId],
    queryFn: () => settingsApi.get(docId),
    staleTime: Infinity,
  });

  const mutation = useMutation({
    mutationFn: (patch: Partial<DocumentSettings>) => settingsApi.update(docId, patch),
    onSuccess: (updated) => qc.setQueryData(['doc-settings', docId], updated),
  });

  return { settings, update: mutation.mutate };
}

function Opt<T extends string | number>({
  label, value, current, onChange,
}: { label: string; value: T; current: T; onChange: (v: T) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={cn(
        'flex items-center justify-between rounded-md border px-3 py-1.5 text-xs transition-colors w-full',
        current === value
          ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-600'
          : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300',
      )}
    >
      <span>{label}</span>
      {current === value && <Check className="h-3 w-3 shrink-0" />}
    </button>
  );
}

export function DocumentSettingsPanel({ docId }: Props) {
  const [open, setOpen] = useState(false);
  const { settings, update } = useDocSettings(docId);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title="Configuración del documento"
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded transition-colors',
          open
            ? 'bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100'
            : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-zinc-700',
        )}
      >
        <Settings2 className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute top-full right-0 z-50 mt-1 w-64 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 shadow-xl space-y-4">
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
            Estilo del documento
          </p>

          {/* Font family */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Fuente</p>
            <div className="space-y-1">
              {FONT_OPTIONS.map(({ value, label }) => (
                <Opt
                  key={value}
                  label={label}
                  value={value}
                  current={settings.fontFamily}
                  onChange={(v) => update({ fontFamily: v as FontFamily })}
                />
              ))}
            </div>
          </div>

          {/* Font size */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Tamaño de texto</p>
            <div className="flex gap-1">
              {(['10pt', '11pt', '12pt'] as FontSize[]).map((s) => (
                <Opt
                  key={s}
                  label={s}
                  value={s}
                  current={settings.fontSize}
                  onChange={(v) => update({ fontSize: v as FontSize })}
                />
              ))}
            </div>
          </div>

          {/* Line height */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Interlineado</p>
            <div className="flex gap-1">
              {([1.5, 1.75, 2.0] as LineHeight[]).map((lh) => (
                <Opt
                  key={lh}
                  label={lh === 1.5 ? 'Simple' : lh === 1.75 ? 'Normal' : 'Doble'}
                  value={lh}
                  current={settings.lineHeight}
                  onChange={(v) => update({ lineHeight: v as LineHeight })}
                />
              ))}
            </div>
          </div>

          {/* Page width */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Ancho de página</p>
            <div className="space-y-1">
              {([
                { value: 'compact',  label: 'Compacto (600px)' },
                { value: 'standard', label: 'Estándar (816px)' },
                { value: 'wide',     label: 'Ancho (1080px)' },
              ] as { value: PageWidth; label: string }[]).map(({ value, label }) => (
                <Opt
                  key={value}
                  label={label}
                  value={value}
                  current={settings.pageWidth}
                  onChange={(v) => update({ pageWidth: v as PageWidth })}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
