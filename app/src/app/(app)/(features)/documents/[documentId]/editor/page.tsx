'use client';

import { use, useState } from 'react';
import { ChevronLeft, Share2, Clock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DocumentEditor } from '@/components/editor/document-editor';
import { VersionsPanel } from '@/components/editor/versions-panel';
import { SaveVersionDialog } from '@/components/editor/save-version-dialog';
import { useDraft } from '@/lib/hooks/use-documents';

export default function EditorPage({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = use(params);
  const [saveOpen, setSaveOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const { data: draft } = useDraft(documentId);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-100">
      {/* Top chrome — minimal, like Drive */}
      <header className="flex h-12 shrink-0 items-center gap-2 border-b border-zinc-200 bg-white px-3">
        <Link href="javascript:history.back()" className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 transition-colors">
          <ChevronLeft className="h-4 w-4" />
        </Link>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-zinc-600 h-8"
            onClick={() => setPanelOpen((p) => !p)}
          >
            <Clock className="h-3.5 w-3.5" />
            <span className="text-xs">Versiones</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-zinc-600 h-8"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span className="text-xs">Compartir</span>
          </Button>
          <Button
            size="sm"
            className="h-8 bg-blue-600 hover:bg-blue-700 text-white text-xs px-4"
            onClick={() => setSaveOpen(true)}
          >
            Guardar versión
          </Button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <DocumentEditor
            docId={documentId}
            initialContent={draft?.content}
          />
        </div>

        {/* Versions panel */}
        {panelOpen && (
          <aside className="w-72 shrink-0 border-l border-zinc-200 bg-white flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Historial de versiones
              </p>
            </div>
            <div className="flex-1 overflow-y-auto">
              <VersionsPanel
                docId={documentId}
                onCompare={(vId) => {
                  window.location.href = `/documents/${documentId}/diff?compareWith=${vId}`;
                }}
              />
            </div>
          </aside>
        )}
      </div>

      <SaveVersionDialog
        docId={documentId}
        open={saveOpen}
        onClose={() => setSaveOpen(false)}
      />
    </div>
  );
}
