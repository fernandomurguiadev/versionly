'use client';

import { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Typography from '@tiptap/extension-typography';
import CharacterCount from '@tiptap/extension-character-count';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Image from '@tiptap/extension-image';
import Focus from '@tiptap/extension-focus';
import { EditorToolbar } from './editor-toolbar';
import { useSaveDraft } from '@/lib/hooks/use-documents';

const AUTOSAVE_DELAY = 1500;

type DocumentEditorProps = {
  docId: string;
  initialContent?: Record<string, unknown>;
  readOnly?: boolean;
};

export function DocumentEditor({ docId, initialContent, readOnly = false }: DocumentEditorProps) {
  const saveDraft = useSaveDraft(docId);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didInit = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4] } }),
      Placeholder.configure({ placeholder: 'Empezá a escribir…' }),
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'editor-link' } }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Typography,
      CharacterCount,
      Superscript,
      Subscript,
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      Image.configure({ HTMLAttributes: { class: 'editor-image' } }),
      Focus.configure({ className: 'has-focus', mode: 'all' }),
    ],
    content: initialContent ?? { type: 'doc', content: [{ type: 'paragraph' }] },
    editable: !readOnly,
    editorProps: {
      attributes: { class: 'editor-content focus:outline-none' },
    },
    onUpdate: ({ editor: e }) => {
      if (readOnly) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        saveDraft.mutate(e.getJSON() as Record<string, unknown>);
      }, AUTOSAVE_DELAY);
    },
  });

  // Set initial content only once after mount
  useEffect(() => {
    if (editor && initialContent && !didInit.current && !editor.isDestroyed) {
      editor.commands.setContent(initialContent);
      didInit.current = true;
    }
  }, [editor, initialContent]);

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  const charCount = editor?.storage.characterCount;

  if (!editor) return null;

  return (
    <div className="flex flex-col h-full">
      {!readOnly && <EditorToolbar editor={editor} />}

      <div className="flex-1 overflow-y-auto bg-zinc-100">
        <div className="mx-auto my-8 w-full max-w-[816px]">
          {/* Paper shadow */}
          <div className="rounded-sm bg-white shadow-[0_1px_3px_rgba(0,0,0,0.12),0_4px_20px_rgba(0,0,0,0.08)] min-h-[1056px] px-[96px] py-[96px]">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>

      {/* Status bar */}
      {!readOnly && (
        <div className="flex items-center justify-between border-t border-zinc-200 bg-white px-4 py-1.5">
          <div className="flex items-center gap-4 text-xs text-zinc-400">
            <span>{charCount?.words() ?? 0} palabras</span>
            <span>{charCount?.characters() ?? 0} caracteres</span>
          </div>
          <span className="text-xs text-zinc-400">
            {saveDraft.isPending ? 'Guardando…' : saveDraft.isSuccess ? '✓ Guardado' : ''}
          </span>
        </div>
      )}
    </div>
  );
}
